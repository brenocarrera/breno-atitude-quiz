const crypto = require('crypto');

// Produção — só lá as env vars do Supabase existem no escopo certo (Preview não tem
// SUPABASE_URL/SUPABASE_ANON_KEY, só Production; ver memória do projeto).
const REPORT_BASE_URL = 'https://breno-atitude-quiz.vercel.app';
const BUCKET = 'free-reports';

function normalizeWhatsapp(raw) {
    const digits = String(raw || '').replace(/\D/g, '');
    if (!digits) return null;
    return digits.startsWith('55') ? digits : ('55' + digits);
}

module.exports = async function handler(req, res) {
    if (req.method !== 'POST' && req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const raw = (req.method === 'GET' ? req.query.tel : (req.body || {}).tel) || '';
    const fullPhone = normalizeWhatsapp(raw);
    if (!fullPhone) return res.status(400).json({ error: 'tel invalido' });

    const url = process.env.SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !serviceKey) return res.status(500).json({ error: 'Config Supabase ausente.' });

    // 1. Confirma que o lead existe e pega o id da linha mais recente (mesmo criterio do /api/meu-relatorio)
    let leadId;
    try {
        const leadRes = await fetch(
            `${url}/rest/v1/leads?whatsapp=eq.${encodeURIComponent(fullPhone)}&select=id&order=created_at.desc&limit=1`,
            { headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` } }
        );
        const rows = await leadRes.json();
        leadId = Array.isArray(rows) && rows[0] ? rows[0].id : null;
    } catch (err) {
        console.error('[gerar-pdf-relatorio] erro ao buscar lead:', err);
        return res.status(500).json({ error: 'Erro ao buscar lead.' });
    }
    if (!leadId) return res.status(404).json({ error: 'lead_not_found' });

    // 2. Renderiza /meu-relatorio com Puppeteer e captura o PDF
    let browser;
    let pdfBuffer;
    try {
        // @sparticuz/chromium e puppeteer-core sao publicados como ESM puro (package.json "type":"module") —
        // require() direto quebra em runtime CommonJS, precisa de import() dinamico.
        const { default: chromium } = await import('@sparticuz/chromium');
        const { default: puppeteer } = await import('puppeteer-core');

        browser = await puppeteer.launch({
            args: chromium.args,
            executablePath: await chromium.executablePath(),
            headless: chromium.headless,
        });
        const page = await browser.newPage();
        await page.setViewport({ width: 800, height: 1200 });
        await page.goto(`${REPORT_BASE_URL}/meu-relatorio?tel=${fullPhone}`, {
            waitUntil: 'networkidle0',
            timeout: 30000,
        });

        // Espera o relatório ficar visivel OU a mensagem de erro aparecer (nunca gera PDF de estado vazio)
        await page.waitForFunction(() => {
            const rep = document.getElementById('s-report');
            const msg = document.getElementById('lookup-msg');
            return (rep && rep.style.display === 'block') || (msg && msg.textContent.trim().length > 0);
        }, { timeout: 15000 });

        const found = await page.evaluate(() => document.getElementById('s-report').style.display === 'block');
        if (!found) {
            const msgText = await page.evaluate(() => document.getElementById('lookup-msg').textContent);
            throw new Error('lead_not_found_on_render: ' + msgText);
        }

        pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
    } catch (err) {
        console.error('[gerar-pdf-relatorio] erro no Puppeteer:', err);
        return res.status(500).json({ error: 'Erro ao gerar PDF.', detail: err.message });
    } finally {
        if (browser) await browser.close();
    }

    // 3. Upload pro Supabase Storage — nome do arquivo nao expoe o telefone em texto puro
    //    nem permite adivinhar o PDF de outro lead so pelo id (bucket e publico).
    const hash = crypto.createHash('sha256').update(fullPhone).digest('hex').slice(0, 24);
    const fileName = `report-${leadId}-${hash}.pdf`;
    try {
        const uploadRes = await fetch(`${url}/storage/v1/object/${BUCKET}/${fileName}`, {
            method: 'POST',
            headers: {
                apikey: serviceKey,
                Authorization: `Bearer ${serviceKey}`,
                'Content-Type': 'application/pdf',
                'x-upsert': 'true', // regenerar o mesmo lead sobrescreve, nao acumula lixo
            },
            body: pdfBuffer,
        });
        if (!uploadRes.ok) {
            const errBody = await uploadRes.text();
            console.error('[gerar-pdf-relatorio] upload falhou:', uploadRes.status, errBody);
            return res.status(500).json({ error: 'Erro ao subir PDF.' });
        }
    } catch (err) {
        console.error('[gerar-pdf-relatorio] erro no upload:', err);
        return res.status(500).json({ error: 'Erro ao subir PDF.' });
    }

    // PDF confirmado gerado e salvo com sucesso — só aqui, não em qualquer tentativa.
    fetch(`${REPORT_BASE_URL}/api/track-evento`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tipo: 'freereport_gerado' }),
    }).catch(() => {});

    const pdfUrl = `${url}/storage/v1/object/public/${BUCKET}/${fileName}`;

    // 4. Salva a URL na linha exata do lead (por id, nao por telefone — evita atualizar retries antigos)
    try {
        await fetch(`${url}/rest/v1/leads?id=eq.${leadId}`, {
            method: 'PATCH',
            headers: {
                apikey: serviceKey,
                Authorization: `Bearer ${serviceKey}`,
                'Content-Type': 'application/json',
                Prefer: 'return=minimal',
            },
            body: JSON.stringify({ pdf_url: pdfUrl }),
        });
    } catch (err) {
        console.error('[gerar-pdf-relatorio] erro ao salvar pdf_url:', err);
        // nao bloqueia a resposta - o PDF ja existe no Storage mesmo que esse PATCH falhe
    }

    return res.status(200).json({ ok: true, pdf_url: pdfUrl });
};
