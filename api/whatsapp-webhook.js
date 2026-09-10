const GRAPH_URL = `https://graph.facebook.com/v25.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;

const MSG_NAO_ENCONTRADO_ID =
    'Não encontramos um pedido de relatório nessa mensagem. Volte ao quiz e clique no botão "Receber grátis" pra receber sua análise em PDF.';
const MSG_SEM_PDF =
    'Não encontramos seu relatório ainda. Ele pode estar sendo gerado — tente novamente em alguns segundos, ou volte ao quiz.';

module.exports = async function handler(req, res) {
    // Verificação do webhook exigida pela Meta na hora de configurar
    if (req.method === 'GET') {
        const mode = req.query['hub.mode'];
        const token = req.query['hub.verify_token'];
        const challenge = req.query['hub.challenge'];
        if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
            res.status(200).send(challenge); // texto puro, nao JSON
            return;
        }
        res.status(403).end();
        return;
    }

    if (req.method !== 'POST') {
        res.status(405).end();
        return;
    }

    // A Meta espera resposta rapida do webhook — confirma recebimento ja, processa depois.
    // No runtime Node da Vercel a function so termina de verdade quando esta promise
    // resolver, entao o processamento abaixo continua rodando normalmente.
    res.status(200).json({ received: true });

    try {
        await processarMensagem(req.body);
    } catch (err) {
        console.error('[whatsapp-webhook] erro no processamento:', err);
    }
};

async function processarMensagem(body) {
    const value = body?.entry?.[0]?.changes?.[0]?.value;
    const msg = value?.messages?.[0];
    if (!msg) return; // eventos de status (sent/delivered/read) nao tem "messages" - ignora

    const from = msg.from; // wa_id de quem mandou (numero real, com codigo do pais, sem "+")
    const texto = msg.type === 'text' ? (msg.text?.body || '') : '';

    const match = texto.match(/ID:([0-9]+)/);
    if (!match) {
        await enviarTexto(from, MSG_NAO_ENCONTRADO_ID);
        return;
    }
    const telefoneId = match[1];

    const url = process.env.SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !serviceKey) {
        console.error('[whatsapp-webhook] Config Supabase ausente.');
        return;
    }

    // Mesmo criterio de api/gerar-pdf-relatorio.js: linha mais recente daquele telefone
    let lead = null;
    try {
        const leadRes = await fetch(
            `${url}/rest/v1/leads?whatsapp=eq.${encodeURIComponent(telefoneId)}&select=id,pdf_url,whatsapp&order=created_at.desc&limit=1`,
            { headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` } }
        );
        const rows = await leadRes.json();
        lead = Array.isArray(rows) && rows[0] ? rows[0] : null;
    } catch (err) {
        console.error('[whatsapp-webhook] erro ao buscar lead:', err);
    }

    if (!lead || !lead.pdf_url) {
        await enviarTexto(from, MSG_SEM_PDF);
        return;
    }

    // Confirma o numero real de quem mandou a mensagem (pode diferir do que foi digitado no site)
    if (lead.whatsapp !== from) {
        try {
            await fetch(`${url}/rest/v1/leads?id=eq.${lead.id}`, {
                method: 'PATCH',
                headers: {
                    apikey: serviceKey,
                    Authorization: `Bearer ${serviceKey}`,
                    'Content-Type': 'application/json',
                    Prefer: 'return=minimal',
                },
                body: JSON.stringify({ whatsapp: from }),
            });
        } catch (err) {
            console.error('[whatsapp-webhook] erro ao atualizar whatsapp do lead:', err);
        }
    }

    await enviarDocumento(from, lead.pdf_url);
}

async function chamarWhatsappAPI(payload) {
    try {
        const res = await fetch(GRAPH_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
            },
            body: JSON.stringify(payload),
        });
        if (!res.ok) {
            const errBody = await res.text();
            // Token de teste da Meta expira em ~24h — falha de auth aqui e esperada depois desse prazo.
            console.error('[whatsapp-webhook] Meta API erro:', res.status, errBody);
        }
    } catch (err) {
        console.error('[whatsapp-webhook] falha ao chamar Meta API:', err);
    }
}

function enviarTexto(to, texto) {
    return chamarWhatsappAPI({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to,
        type: 'text',
        text: { body: texto },
    });
}

function enviarDocumento(to, pdfUrl) {
    return chamarWhatsappAPI({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to,
        type: 'document',
        document: { link: pdfUrl, filename: 'Meu-Relatorio-Jogo-do-Texto.pdf' },
    });
}
