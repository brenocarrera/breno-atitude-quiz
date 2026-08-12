module.exports = async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { email, whatsapp } = req.body || {};

    const url = process.env.SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    // Sem config ou sem dados: retorna ok silenciosamente (nunca bloqueia o WhatsApp)
    if (!url || !serviceKey || !email || !whatsapp) return res.status(200).json({ ok: true });

    try {
        // Atualiza o(s) lead(s) desse email com o telefone informado.
        // Usa service_role porque a policy anon so permite INSERT (nao UPDATE).
        await fetch(`${url}/rest/v1/leads?email=eq.${encodeURIComponent(String(email).trim())}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'apikey': serviceKey,
                'Authorization': `Bearer ${serviceKey}`,
                'Prefer': 'return=minimal',
            },
            body: JSON.stringify({ whatsapp }),
        });
    } catch (err) {
        console.error('[update-whatsapp] erro:', err);
    }

    return res.status(200).json({ ok: true });
};
