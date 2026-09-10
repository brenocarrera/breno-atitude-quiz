const TIPOS_VALIDOS = ['page_view', 'email_fornecido', 'freereport_gerado'];

module.exports = async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { tipo } = req.body || {};
    if (!TIPOS_VALIDOS.includes(tipo)) return res.status(400).json({ error: 'tipo invalido' });

    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_ANON_KEY;

    // Se Supabase não estiver configurado, retorna ok silenciosamente (mesmo padrão do save-lead.js)
    if (!url || !key) return res.status(200).json({ ok: true });

    try {
        await fetch(`${url}/rest/v1/funil_eventos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': key,
                'Authorization': `Bearer ${key}`,
                'Prefer': 'return=minimal',
            },
            body: JSON.stringify({ tipo }),
        });
    } catch (err) {
        console.error('[track-evento] Supabase error:', err);
        // Nunca bloqueia quem chamou
    }

    return res.status(200).json({ ok: true });
};
