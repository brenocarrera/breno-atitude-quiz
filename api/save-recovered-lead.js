module.exports = async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { email, device_flag } = req.body;

    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_ANON_KEY;

    // Se Supabase não estiver configurado, retorna ok silenciosamente
    if (!url || !key) return res.status(200).json({ ok: true });

    try {
        await fetch(`${url}/rest/v1/quiz_recovered_leads`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': key,
                'Authorization': `Bearer ${key}`,
                'Prefer': 'return=minimal',
            },
            body: JSON.stringify({
                email,
                device_flag,
                created_at: new Date().toISOString(),
            }),
        });
        return res.status(200).json({ ok: true });
    } catch (err) {
        console.error('Supabase error:', err);
        return res.status(200).json({ ok: true }); // Nunca bloqueia o quiz
    }
};
