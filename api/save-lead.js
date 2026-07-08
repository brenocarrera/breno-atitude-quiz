module.exports = async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { nome, idade, altura, peso, profissao, email, whatsapp, arquetipo } = req.body;

    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_ANON_KEY;

    // Se Supabase não estiver configurado, retorna ok silenciosamente
    if (!url || !key) return res.status(200).json({ ok: true });

    try {
        await fetch(`${url}/rest/v1/leads`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': key,
                'Authorization': `Bearer ${key}`,
                'Prefer': 'return=minimal',
            },
            body: JSON.stringify({
                nome,
                idade:    idade    ? parseInt(idade)    : null,
                altura:   altura   ? parseInt(altura)   : null,
                peso:     peso     ? parseInt(peso)     : null,
                profissao,
                email,
                whatsapp,
                arquetipo,
                created_at: new Date().toISOString(),
            }),
        });
    } catch (err) {
        console.error('Supabase error:', err);
        // Nunca bloqueia o resultado do quiz
    }

    // Ativa trial de 5 dias no OxyBoard/OxyMessage para todo mundo que completa o quiz
    try {
        await ativarTrialOxy(url, email, nome);
    } catch (err) {
        console.error('[save-lead] Falha ao ativar trial em usuarios:', err);
        // Nunca bloqueia o resultado do quiz
    }

    return res.status(200).json({ ok: true });
};

async function ativarTrialOxy(url, email, nome) {
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !serviceKey || !email) return;

    const emailNorm = email.toLowerCase().trim();
    const headers = {
        'Content-Type': 'application/json',
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`,
    };

    const selectRes = await fetch(
        `${url}/rest/v1/usuarios?email=eq.${encodeURIComponent(emailNorm)}&select=plano,plano_expira_em,trial_usado_em`,
        { headers }
    );
    const existing = await selectRes.json();
    const row = Array.isArray(existing) ? existing[0] : null;

    if (row && row.trial_usado_em) {
        console.log('[save-lead] trial já utilizado anteriormente para este email:', emailNorm);
        return; // trial é único por email, para sempre — não concede de novo
    }

    if (row) {
        const planoPago = row.plano === 'basico' || row.plano === 'premium';
        const expiraFuturo = row.plano_expira_em && new Date(row.plano_expira_em) > new Date();
        if (planoPago && expiraFuturo) return; // já tem plano pago ativo, não sobrescreve
    }

    const agora = new Date().toISOString();
    const planoExpira = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString();

    await fetch(`${url}/rest/v1/usuarios?on_conflict=email`, {
        method: 'POST',
        headers: { ...headers, 'Prefer': 'resolution=merge-duplicates,return=minimal' },
        body: JSON.stringify({
            email: emailNorm,
            nome: nome || emailNorm,
            plano: 'basico',
            plano_expira_em: planoExpira,
            ativo: true,
            trial_usado_em: agora,
        }),
    });
}
