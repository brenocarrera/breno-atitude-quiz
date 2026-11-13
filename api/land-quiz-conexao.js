// Registra quando alguem conecta ou desconecta uma land a um quiz no Quizz Builder (tabela land_quiz_conexoes, lida pelo Mike Alfa).
// A tabela e fechada: so grava com a chave de servico, que fica aqui no servidor e nunca vai para o navegador.
const TIPOS_VALIDOS = ['land_quiz_conectou', 'land_quiz_desconectou'];
// So o Quizz Builder rodando no computador do Breno pode chamar esta rota.
const ORIGENS_OK = ['http://127.0.0.1:8769', 'http://localhost:8769', 'null'];

function texto(v) {
    return (typeof v === 'string' && v) ? v.slice(0, 200) : null;
}

module.exports = async function handler(req, res) {
    const origem = (req.headers && req.headers.origin) || '';
    if (ORIGENS_OK.includes(origem)) {
        res.setHeader('Access-Control-Allow-Origin', origem);
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
        res.setHeader('Vary', 'Origin');
    }
    if (req.method === 'OPTIONS') return res.status(200).json({ ok: true });
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    if (!ORIGENS_OK.includes(origem)) return res.status(403).json({ error: 'origem nao permitida' });

    const { tipo_evento, land_versao, quiz_versao, land_alfa_id, metadata } = req.body || {};
    if (!TIPOS_VALIDOS.includes(tipo_evento)) return res.status(400).json({ error: 'tipo invalido' });

    const url = process.env.SUPABASE_URL;
    const chave = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !chave) {
        console.error('[land-quiz-conexao] faltou SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY');
        return res.status(500).json({ error: 'servidor sem acesso ao banco' });
    }

    const linha = {
        tipo_evento,
        land_versao: texto(land_versao),
        quiz_versao: texto(quiz_versao),
        land_alfa_id: texto(land_alfa_id),
        metadata: (metadata && typeof metadata === 'object' && JSON.stringify(metadata).length <= 2000) ? metadata : {},
    };

    try {
        const r = await fetch(`${url}/rest/v1/land_quiz_conexoes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'apikey': chave, 'Authorization': `Bearer ${chave}`, 'Prefer': 'return=minimal' },
            body: JSON.stringify(linha),
        });
        if (!r.ok) {
            console.error('[land-quiz-conexao] banco recusou', r.status);
            return res.status(502).json({ error: 'banco recusou' });
        }
    } catch (err) {
        console.error('[land-quiz-conexao] erro', err);
        return res.status(502).json({ error: 'falha ao gravar' });
    }
    return res.status(200).json({ ok: true });
};
