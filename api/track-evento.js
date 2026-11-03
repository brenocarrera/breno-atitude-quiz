const { avisarTelegram } = require('./_telegram');

// Eventos do funil gravados no BigData (tabela funil_eventos). Os 4 últimos são os avisos de problema/saúde do quiz.
const TIPOS_VALIDOS = ['page_view', 'email_fornecido', 'freereport_gerado', 'quiz_iniciou', 'quiz_erro', 'lead_nao_salvo', 'bio_falhou'];
// Estes tipos também mandam aviso no Telegram.
const TIPOS_COM_AVISO = {
    quiz_erro: '⚠️ QUIZ: erro na página',
    lead_nao_salvo: '🚨 QUIZ: lead NÃO foi salvo',
    bio_falhou: '⚠️ QUIZ: a IA não gerou o diagnóstico (lead salvo sem bio)',
};
const AVISOS_POR_10_MIN = 5; // depois disso o aviso é silenciado por 10 minutos para não encher o grupo

async function gravar(url, key, linha) {
    return fetch(`${url}/rest/v1/funil_eventos`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'apikey': key,
            'Authorization': `Bearer ${key}`,
            'Prefer': 'return=minimal',
        },
        body: JSON.stringify(linha),
    });
}

// Quantos eventos deste tipo já foram gravados nos últimos 10 minutos (precisa da chave de serviço; se não houver, devolve null).
async function contarRecentes(url, tipo) {
    const chave = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!chave) return null;
    try {
        const desde = new Date(Date.now() - 10 * 60 * 1000).toISOString();
        const r = await fetch(`${url}/rest/v1/funil_eventos?tipo=eq.${encodeURIComponent(tipo)}&criado_em=gte.${encodeURIComponent(desde)}&select=id`, {
            headers: { 'apikey': chave, 'Authorization': `Bearer ${chave}`, 'Prefer': 'count=exact', 'Range': '0-0' },
        });
        const total = Number(String(r.headers.get('content-range') || '').split('/')[1]);
        return Number.isFinite(total) ? total : null;
    } catch (e) {
        return null;
    }
}

module.exports = async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { tipo, sessionId, detalhe } = req.body || {};
    if (!TIPOS_VALIDOS.includes(tipo)) return res.status(400).json({ error: 'tipo invalido' });

    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_ANON_KEY;

    // Se Supabase não estiver configurado, retorna ok silenciosamente (mesmo padrão do save-lead.js)
    if (!url || !key) return res.status(200).json({ ok: true });

    const sessao = (typeof sessionId === 'string' && sessionId) ? sessionId.slice(0, 80) : null;

    try {
        let r = await gravar(url, key, sessao ? { tipo, session_id: sessao } : { tipo });
        // Se o banco recusar com o id da sessão, grava só o tipo (nunca perde o evento por causa do id).
        if (!r.ok && sessao) r = await gravar(url, key, { tipo });
        if (!r.ok) console.error('[track-evento] banco recusou o evento', tipo, r.status);
    } catch (err) {
        console.error('[track-evento] Supabase error:', err);
        // Nunca bloqueia quem chamou
    }

    // Aviso no Telegram para os eventos de problema (com limite para não encher o grupo)
    if (TIPOS_COM_AVISO[tipo]) {
        try {
            const total = await contarRecentes(url, tipo);
            if (total === null || total <= AVISOS_POR_10_MIN) {
                const linhas = [TIPOS_COM_AVISO[tipo], 'Visita: ' + (sessao || 'sem id'), 'Detalhe: ' + String(detalhe || '-').slice(0, 300), 'Quando: ' + new Date().toISOString()];
                await avisarTelegram(linhas.join('\n'));
            } else if (total === AVISOS_POR_10_MIN + 1) {
                await avisarTelegram('🔕 QUIZ: muitos avisos de "' + tipo + '" em 10 minutos. Vou silenciar os próximos por 10 minutos — confira o BigData (funil_eventos).');
            }
        } catch (e) {
            console.error('[track-evento] falha ao avisar no Telegram');
        }
    }

    return res.status(200).json({ ok: true });
};
