const crypto = require('crypto');

module.exports = async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { nome, idade, altura, peso, profissao, email, whatsapp, arquetipo, mbtiTipo, adicas, diagnostico, bios } = req.body;

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
                mbti_tipo:   mbtiTipo    || null,
                adicas:      adicas      || null,
                diagnostico: diagnostico || null,
                bios:        bios        || null,
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

    // Fixa o laudo do quiz em oxyreport para o botão "OxyReport" do OxyBoard ler.
    // Roda depois de ativarTrialOxy, que garante a conta em usuarios.
    try {
        await gravarOxyreport(url, email, { arquetipo, mbtiTipo, adicas, diagnostico, bios });
    } catch (err) {
        console.error('[save-lead] Falha ao gravar oxyreport:', err);
        // Nunca bloqueia o resultado do quiz
    }

    return res.status(200).json({ ok: true });
};

async function gravarOxyreport(url, email, { arquetipo, mbtiTipo, adicas, diagnostico, bios }) {
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !serviceKey || !email) {
        console.error('[gravarOxyreport] abortado - faltando:', { url: !!url, serviceKey: !!serviceKey, email: !!email });
        return;
    }

    const emailNorm = email.toLowerCase().trim();
    const headers = {
        'Content-Type': 'application/json',
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`,
    };

    // Busca o usuario_id pelo email. Se o lead ainda não tem conta em usuarios, pula (sem erro).
    const selectRes = await fetch(
        `${url}/rest/v1/usuarios?email=eq.${encodeURIComponent(emailNorm)}&select=id`,
        { headers }
    );
    if (!selectRes.ok) {
        console.error('[gravarOxyreport] SELECT usuarios falhou:', selectRes.status, await selectRes.text());
        return;
    }
    const usuarios = await selectRes.json();
    const usuario = Array.isArray(usuarios) ? usuarios[0] : null;
    if (!usuario) {
        console.log('[gravarOxyreport] lead sem conta em usuarios, pulando:', emailNorm);
        return;
    }

    const insertRes = await fetch(`${url}/rest/v1/oxyreport`, {
        method: 'POST',
        headers: { ...headers, 'Prefer': 'return=minimal' },
        body: JSON.stringify({
            usuario_id: usuario.id,
            mbti: mbtiTipo || null,
            adicas: adicas || null,
            arquetipo: arquetipo || null,
            // Payload completo do relatório (mesmos campos que meu-relatorio.html usa)
            // para o OxyBoard renderizar idêntico ao que o cliente viu no fim do quiz.
            relatorio_json: {
                arquetipo:   arquetipo   || null,
                mbti_tipo:   mbtiTipo    || null,
                adicas:      adicas      || null,
                diagnostico: diagnostico || null,
                bios:        bios        || null,
            },
        }),
    });
    if (!insertRes.ok) {
        console.error('[gravarOxyreport] INSERT oxyreport falhou:', insertRes.status, await insertRes.text());
    }
}

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
    const contaNova = !authUserId;

    if (contaNova) {
        const senha = gerarSenha();
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

    if (contaNova) {
        try {
            await solicitarDefinicaoSenha(emailNorm);
        } catch (err) {
            console.error('[ativarTrialOxy] Falha ao solicitar definição de senha:', err);
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

async function solicitarDefinicaoSenha(email) {
    const res = await fetch('https://oxy-message.vercel.app/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
    });
    if (!res.ok) {
        const errBody = await res.text();
        console.error('[ativarTrialOxy] Falha ao solicitar definição de senha:', res.status, errBody);
    }
}
