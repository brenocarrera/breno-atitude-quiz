module.exports = async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { whatsapp } = req.body || {};
    const digits = String(whatsapp || '').replace(/\D/g, '');
    if (!digits) return res.status(400).json({ error: 'Telefone invalido.' });

    // Normaliza para o mesmo formato salvo no quiz: 55 + DDD + numero
    const fone = digits.startsWith('55') ? digits : ('55' + digits);

    const url = process.env.SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !serviceKey) return res.status(500).json({ error: 'Config ausente.' });

    try {
        // Busca por telefone. service_role porque a policy anon so permite INSERT (nao SELECT).
        // Retorna so os campos necessarios pra montar o relatorio (sem idade/peso/altura).
        const r = await fetch(
            `${url}/rest/v1/leads?whatsapp=eq.${encodeURIComponent(fone)}` +
            `&select=nome,idade,arquetipo,mbti_tipo,adicas,diagnostico,bios&order=created_at.desc&limit=1`,
            {
                headers: {
                    'apikey': serviceKey,
                    'Authorization': `Bearer ${serviceKey}`,
                },
            }
        );
        const rows = await r.json();
        const row = Array.isArray(rows) ? rows[0] : null;
        if (!row) return res.status(200).json({ found: false });
        return res.status(200).json({ found: true, ...row });
    } catch (err) {
        console.error('[meu-relatorio] erro:', err);
        return res.status(500).json({ error: 'Erro na busca.' });
    }
};
