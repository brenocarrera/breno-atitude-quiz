const crypto = require('crypto');

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
    if (!url || !serviceKey || !email) {
        console.error('[ativarTrialOxy] abortado - faltando:', { url: !!url, serviceKey: !!serviceKey, email: !!email });
        return;
    }

    const emailNorm = email.toLowerCase().trim();
    const headers = {
        'Content-Type': 'application/json',
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`,
    };

    const selectRes = await fetch(
        `${url}/rest/v1/usuarios?email=eq.${encodeURIComponent(emailNorm)}&select=plano,plano_expira_em,trial_usado_em,auth_user_id`,
        { headers }
    );
    if (!selectRes.ok) {
        const errBody = await selectRes.text();
        console.error('[ativarTrialOxy] SELECT falhou:', selectRes.status, errBody);
        return;
    }
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

    let authUserId = row && row.auth_user_id ? row.auth_user_id : null;
    let senha = null;

    if (!authUserId) {
        senha = gerarSenha();
        authUserId = await criarContaAuth(url, serviceKey, emailNorm, senha);
        if (!authUserId) return; // erro já logado em criarContaAuth; sem auth_user_id o upsert quebra (coluna NOT NULL)
    }

    const agora = new Date().toISOString();
    const planoExpira = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString();

    const upsertRes = await fetch(`${url}/rest/v1/usuarios?on_conflict=email`, {
        method: 'POST',
        headers: { ...headers, 'Prefer': 'resolution=merge-duplicates,return=minimal' },
        body: JSON.stringify({
            email: emailNorm,
            auth_user_id: authUserId,
            nome: nome || emailNorm,
            plano: 'basico',
            plano_expira_em: planoExpira,
            ativo: true,
            trial_usado_em: agora,
        }),
    });
    if (!upsertRes.ok) {
        const errBody = await upsertRes.text();
        console.error('[ativarTrialOxy] UPSERT falhou:', upsertRes.status, errBody);
        return;
    }

    if (senha) {
        try {
            await enviarEmailTrial(emailNorm, nome, senha);
        } catch (err) {
            console.error('[ativarTrialOxy] Falha ao enviar email de trial:', err);
        }
    }
}

function gerarSenha() {
    return crypto.randomBytes(6).toString('hex');
}

async function criarContaAuth(url, serviceKey, email, senha) {
    const authRes = await fetch(`${url}/auth/v1/admin/users`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'apikey': serviceKey,
            'Authorization': `Bearer ${serviceKey}`,
        },
        body: JSON.stringify({ email, password: senha, email_confirm: true }),
    });
    const authData = await authRes.json();
    if (!authRes.ok) {
        console.error('[ativarTrialOxy] Erro ao criar Auth user:', authRes.status, authData);
        return null;
    }
    return authData.id;
}

async function enviarEmailTrial(email, nome, senha) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
        console.error('[ativarTrialOxy] RESEND_API_KEY ausente - email de trial nao enviado');
        return;
    }
    const from = process.env.EMAIL_FROM || 'Oxy Message <onboarding@resend.dev>';
    const base = process.env.APP_BASE_URL || 'https://oxy-message.vercel.app';
    const html = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><style>
body{font-family:Arial,sans-serif;background:#f3f4f6;padding:40px 20px}
.box{max-width:520px;margin:0 auto;background:#fff;border-radius:12px;padding:36px;box-shadow:0 4px 12px rgba(0,0,0,.08)}
h2{color:#111;margin:0 0 12px}p{color:#374151;font-size:15px;line-height:1.6;margin:8px 0}
.senha{font-size:24px;font-weight:700;letter-spacing:4px;color:#c9a227;text-align:center;padding:14px;background:#fafafa;border-radius:8px;margin:20px 0;font-family:monospace}
.btn{display:inline-block;background:#c9a227;color:#000;border-radius:10px;padding:14px 28px;text-decoration:none;font-weight:700;font-size:15px}
.info{color:#6b7280;font-size:13px;margin-top:20px;border-top:1px solid #e5e7eb;padding-top:16px}
</style></head><body><div class="box">
<h2>🎁 Seu teste grátis de 5 dias está liberado!</h2>
<p>Olá${nome ? ', <strong>' + nome + '</strong>' : ''}! Você completou o quiz e ganhou 5 dias grátis de acesso ao Oxy-Message.</p>
<p><strong>Email de acesso:</strong> ${email}</p>
<p><strong>Senha de acesso:</strong></p>
<div class="senha">${senha}</div>
<p>Guarde esta senha. Você pode alterá-la a qualquer momento clicando em <strong>"Esqueci minha senha"</strong> na tela de login.</p>
<div style="text-align:center;margin:24px 0"><a href="${base}" class="btn">Acessar o Oxy-Message →</a></div>
<p class="info">Seu teste grátis vale por 5 dias. Depois disso, é só assinar um plano para continuar usando.</p>
</div></body></html>`;

    const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            from,
            to: email,
            subject: '🎁 Seu teste grátis de 5 dias no Oxy-Message está liberado!',
            html,
        }),
    });
    if (!res.ok) {
        const errBody = await res.text();
        console.error('[ativarTrialOxy] Falha ao enviar email de trial:', res.status, errBody);
    }
}
