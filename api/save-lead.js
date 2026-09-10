// ── Arquivo Alfa (Sessão 3): identifica o registro via cookie oxy_alfa_id
// (Domain=.breno-atitude.com, setado pelas lands em LANDS-ALL/arquivo-alfa.js) ──
function getCookieValue(cookieHeader, name) {
    if (!cookieHeader) return null;
    const match = cookieHeader.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
    return match ? decodeURIComponent(match[1]) : null;
}

// Atualiza o arquivo_alfa existente (via id) ou cria um novo (sem land de origem,
// para quem entra direto no quiz) com os campos passados. Retorna o id (existente ou novo).
async function upsertArquivoAlfa(url, serviceKey, alfaId, campos) {
    if (!url || !serviceKey) return alfaId || null;

    const corpo = {};
    for (const k in campos) if (campos[k] !== undefined) corpo[k] = campos[k];

    if (alfaId) {
        const res = await fetch(`${url}/rest/v1/arquivo_alfa?id=eq.${encodeURIComponent(alfaId)}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'apikey': serviceKey,
                'Authorization': `Bearer ${serviceKey}`,
                'Prefer': 'return=representation',
            },
            body: JSON.stringify(corpo),
        });
        if (!res.ok) { console.error('[arquivo_alfa] PATCH falhou:', res.status, await res.text()); return alfaId; }
        const rows = await res.json();
        if (rows && rows.length > 0) return alfaId;
        // Cookie apontava pra um id que não existe mais (ex: registro de teste apagado) —
        // cria um novo em vez de perder o dado silenciosamente.
        console.error('[arquivo_alfa] PATCH não encontrou o id do cookie, criando novo registro:', alfaId);
        return upsertArquivoAlfa(url, serviceKey, null, campos);
    }

    corpo.primeira_land = null; // entrou direto no quiz, sem passar por land
    const res = await fetch(`${url}/rest/v1/arquivo_alfa`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'apikey': serviceKey,
            'Authorization': `Bearer ${serviceKey}`,
            'Prefer': 'return=representation',
        },
        body: JSON.stringify(corpo),
    });
    if (!res.ok) { console.error('[arquivo_alfa] INSERT falhou:', res.status, await res.text()); return null; }
    const rows = await res.json();
    return (rows && rows[0]) ? rows[0].id : null;
}

function parseDispositivo(userAgent) {
    const ua = userAgent || '';
    let navegador = 'Navegador desconhecido';
    if (/Edg\//.test(ua)) navegador = 'Edge';
    else if (/OPR\//.test(ua)) navegador = 'Opera';
    else if (/Chrome\//.test(ua) && !/Chromium/.test(ua)) navegador = 'Chrome';
    else if (/Firefox\//.test(ua)) navegador = 'Firefox';
    else if (/Safari\//.test(ua) && /Version\//.test(ua)) navegador = 'Safari';

    let sistema = 'dispositivo desconhecido';
    if (/iPhone/.test(ua)) sistema = 'iPhone';
    else if (/iPad/.test(ua)) sistema = 'iPad';
    else if (/Android/.test(ua)) sistema = 'Android';
    else if (/Windows/.test(ua)) sistema = 'Windows';
    else if (/Mac OS X/.test(ua)) sistema = 'Mac';
    else if (/Linux/.test(ua)) sistema = 'Linux';

    return `${navegador} no ${sistema}`;
}

module.exports = async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const url = process.env.SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const cookieAlfaId = getCookieValue(req.headers.cookie, 'oxy_alfa_id');

    // Chamada leve disparada em chooseOffer() (quiz.html) só pra fechar a fase "raiox"
    // do arquivo_alfa (tempo relatório → saída da oferta) — não toca em leads/oxyreport.
    if (req.body && req.body.soAtualizarAlfa) {
        try {
            await upsertArquivoAlfa(url, serviceKey, req.body.alfaId || cookieAlfaId, {
                tempos_fase: req.body.temposFase || undefined,
                scroll_maximo_freereport_percentual: (typeof req.body.scrollMaximoFreereportPercentual === 'number')
                    ? req.body.scrollMaximoFreereportPercentual
                    : undefined,
            });
        } catch (err) {
            console.error('[save-lead] Falha ao atualizar arquivo_alfa (raiox):', err);
        }
        return res.status(200).json({ ok: true });
    }

    const { nome, idade, altura, peso, profissao, email, whatsapp, arquetipo, mbtiTipo, adicas, diagnostico, bios, apps, cidade, signo, ultimoDate, duracaoQuiz, respostasQuiz, temposPerguntas, temposFase, velocidadeCarregamentoQuizMs, tempoAteEmailSegundos } = req.body;
    const dispositivo = parseDispositivo(req.headers['user-agent']);

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
                altura:   altura   ? Math.round(parseFloat(String(altura).replace(',', '.').replace('m', '')) * 100) : null,
                peso:     peso     ? parseInt(peso)     : null,
                profissao,
                email,
                whatsapp,
                arquetipo,
                mbti_tipo:   mbtiTipo    || null,
                adicas:      adicas      || null,
                diagnostico: diagnostico || null,
                bios:        bios        || null,
                apps:        apps        || null,
                cidade:      cidade      || null,
                signo:       signo       || null,
                ultimo_date: ultimoDate  || null,
                dispositivo,
                duracao_quiz_segundos: duracaoQuiz || null,
                created_at: new Date().toISOString(),
            }),
        });
    } catch (err) {
        console.error('Supabase error:', err);
        // Nunca bloqueia o resultado do quiz
    }

    let alfaId = null;
    try {
        alfaId = await upsertArquivoAlfa(url, serviceKey, cookieAlfaId, {
            respostas_quiz: respostasQuiz || null,
            tempos_perguntas: temposPerguntas || null,
            tempos_fase: temposFase || null,
            velocidade_carregamento_quiz_ms: velocidadeCarregamentoQuizMs || null,
            dispositivo_user_agent: req.headers['user-agent'] || null,
            tempo_ate_email_segundos: tempoAteEmailSegundos || null,
        });
        // Seta/corrige o cookie quando o id final é diferente do que veio na requisição:
        // quem entrou direto no quiz (sem land) ainda não tinha cookie, ou o cookie
        // apontava pra um registro que não existe mais (ex: dado de teste apagado) e
        // upsertArquivoAlfa criou um novo — nos dois casos o navegador precisa do id certo,
        // mesmo formato usado em LANDS-ALL/arquivo-alfa.js, pra evitar duplicar o
        // registro caso a chamada de chooseOffer() dispare antes da resposta deste fetch.
        if (alfaId && alfaId !== cookieAlfaId) {
            const doisAnos = 60 * 60 * 24 * 365 * 2;
            res.setHeader('Set-Cookie', `oxy_alfa_id=${alfaId}; Max-Age=${doisAnos}; Path=/; Domain=.breno-atitude.com; Secure; SameSite=Lax`);
        }
    } catch (err) {
        console.error('[save-lead] Falha ao atualizar arquivo_alfa:', err);
        // Nunca bloqueia o resultado do quiz
    }

    // O quiz.html já chama /api/auth/quiz-signup em paralelo (sem esperar), então não há
    // garantia de que a conta já exista quando o código chega aqui. Espera essa chamada
    // (idempotente) antes de gravar o oxyreport, que depende do usuario_id já existir.
    // Repassa o arquivoAlfaId (Sessão 4 — Arquivo Mike) já resolvido acima, pra que o
    // usuarios criado/atualizado aqui já nasça vinculado ao arquivo_alfa da pessoa.
    try {
        await fetch('https://oxy-message.vercel.app/api/auth/quiz-signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, nome, arquivoAlfaId: alfaId }),
        });
    } catch (err) {
        console.error('[save-lead] Falha ao garantir conta via quiz-signup:', err);
    }

    try {
        await gravarOxyreport(url, email, { arquetipo, mbtiTipo, adicas, diagnostico, bios });
    } catch (err) {
        console.error('[save-lead] Falha ao gravar oxyreport:', err);
        // Nunca bloqueia o resultado do quiz
    }

    return res.status(200).json({ ok: true, alfaId });
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
