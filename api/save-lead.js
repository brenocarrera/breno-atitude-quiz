const { avisarTelegram } = require('./_telegram');

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
        if (!res.ok) {
            console.error('[arquivo_alfa] PATCH falhou:', res.status, await res.text());
            if (res.status >= 400 && res.status < 500 && NOVAS_COLUNAS.some(k => k in corpo)) {
                const sem = {};
                for (const k in campos) if (!NOVAS_COLUNAS.includes(k)) sem[k] = campos[k];
                return upsertArquivoAlfa(url, serviceKey, alfaId, sem);
            }
            return alfaId;
        }
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
    if (!res.ok) {
        console.error('[arquivo_alfa] INSERT falhou:', res.status, await res.text());
        if (res.status >= 400 && res.status < 500 && NOVAS_COLUNAS.some(k => k in corpo)) {
            const sem = {};
            for (const k in campos) if (!NOVAS_COLUNAS.includes(k)) sem[k] = campos[k];
            return upsertArquivoAlfa(url, serviceKey, null, sem);
        }
        return null;
    }
    const rows = await res.json();
    return (rows && rows[0]) ? rows[0].id : null;
}

// ── Rastreador de passos do quiz: colunas novas do arquivo_alfa + o que o servidor descobre sozinho ──
const NOVAS_COLUNAS = ['quiz_versao', 'ultima_etapa', 'concluiu_quiz', 'temperamento_pixel', 'temperamento_decidido_na_pergunta', 'navegador_nome', 'navegador_versao', 'navegador_tipo', 'ip_visitante', 'local_pais', 'local_estado', 'local_cidade', 'local_bairro', 'local_precisao', 'local_latitude', 'local_longitude', 'impressao_digital', 'quiz_contexto'];

function texto(v, max) { return (typeof v === 'string' && v) ? v.slice(0, max) : undefined; }

function camposDoRastro(req, gps) {
    const b = req.body || {};
    const h = req.headers || {};
    const nav = (b.navegador && typeof b.navegador === 'object') ? b.navegador : {};
    let ctx;
    try { if (b.quizContexto && typeof b.quizContexto === 'object' && JSON.stringify(b.quizContexto).length <= 8000) ctx = b.quizContexto; } catch (e) { /* contexto grande demais: ignora */ }
    const decod = v => { try { return v ? decodeURIComponent(String(v)) : undefined; } catch (e) { return texto(String(v), 80); } };
    const campos = {
        quiz_versao: texto(b.quizVersao, 20),
        ultima_etapa: texto(b.ultimaEtapa, 40),
        concluiu_quiz: typeof b.concluiuQuiz === 'boolean' ? b.concluiuQuiz : undefined,
        temperamento_pixel: ['NT', 'NF', 'SJ', 'SP'].includes(b.temperamentoPixel) ? b.temperamentoPixel : undefined,
        temperamento_decidido_na_pergunta: Number.isInteger(b.temperamentoNaPergunta) ? b.temperamentoNaPergunta : undefined,
        navegador_nome: texto(nav.nome, 60),
        navegador_versao: texto(nav.versao, 30),
        navegador_tipo: texto(nav.tipo, 30),
        impressao_digital: texto(b.impressaoDigital, 60),
        quiz_contexto: ctx,
        ip_visitante: texto(String(h['x-forwarded-for'] || h['x-real-ip'] || '').split(',')[0].trim(), 60),
        local_pais: texto(h['x-vercel-ip-country'], 4),
        local_estado: texto(h['x-vercel-ip-country-region'], 10),
        local_cidade: decod(h['x-vercel-ip-city']),
        local_precisao: h['x-vercel-ip-country'] ? 'ip' : undefined,
        dispositivo_modelo: texto(b.dispositivoModelo, 80),
        dispositivo_sistema_operacional: texto(b.dispositivoSistema, 60),
    };
    // Se o GPS já foi salvo antes, a localização do IP não pode sobrescrevê-lo.
    if (b.temGps && !gps) ['local_pais', 'local_estado', 'local_cidade', 'local_precisao'].forEach(k => { delete campos[k]; });
    if (gps) Object.assign(campos, gps);
    return campos;
}

// GPS (só quando a pessoa permitiu): descobre cidade e bairro pelo endereço (OpenStreetMap).
async function geocodificarGps(gps) {
    const lat = Number(gps && gps.latitude), lon = Number(gps && gps.longitude);
    if (!Number.isFinite(lat) || !Number.isFinite(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180) return null;
    const base = { local_latitude: lat, local_longitude: lon, local_precisao: 'gps' };
    try {
        const ctrl = new AbortController();
        const t = setTimeout(() => ctrl.abort(), 4000);
        const r = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&addressdetails=1&zoom=18&accept-language=pt-BR&lat=${lat}&lon=${lon}`, { headers: { 'User-Agent': 'oxy-quiz/1.0 (breno-atitude.com)' }, signal: ctrl.signal });
        clearTimeout(t);
        if (r.ok) {
            const a = (await r.json()).address || {};
            const iso = String(a['ISO3166-2-lvl4'] || '');
            return Object.assign(base, {
                local_bairro: texto(a.suburb || a.neighbourhood || a.city_district || a.quarter, 80),
                local_cidade: texto(a.city || a.town || a.village || a.municipality, 80),
                local_estado: iso.startsWith('BR-') ? iso.slice(3) : texto(a.state, 40),
                local_pais: texto(String(a.country_code || '').toUpperCase(), 4),
            });
        }
    } catch (e) { /* sem bairro: guarda só as coordenadas */ }
    return base;
}

// Cada passo fechado do quiz vira 1 linha em arquivo_alfa_eventos (tipo passo_quiz).
async function inserirPassos(url, serviceKey, alfaId, passos) {
    if (!url || !serviceKey || !alfaId || !Array.isArray(passos) || !passos.length) return 0;
    const linhas = passos.slice(0, 60)
        .filter(p => p && typeof p === 'object' && typeof p.tela === 'string' && JSON.stringify(p).length <= 2000)
        .map(p => ({ arquivo_alfa_id: alfaId, tipo_evento: 'passo_quiz', metadata: p }));
    if (!linhas.length) return 0;
    try {
        const r = await fetch(`${url}/rest/v1/arquivo_alfa_eventos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'apikey': serviceKey, 'Authorization': `Bearer ${serviceKey}`, 'Prefer': 'return=minimal' },
            body: JSON.stringify(linhas),
        });
        if (!r.ok) { console.error('[arquivo_alfa_eventos] passos recusados:', r.status); return 0; }
        return linhas.length;
    } catch (e) { console.error('[arquivo_alfa_eventos] erro ao gravar passos'); return 0; }
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

// Grava o lead CONFERINDO a resposta do banco; se o banco recusar, tenta de novo uma vez.
async function gravarLeadComConferencia(url, key, linha) {
    let ultimo = { ok: false, status: 0, erro: '' };
    for (let tentativa = 1; tentativa <= 2; tentativa++) {
        try {
            const r = await fetch(`${url}/rest/v1/leads`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': key,
                    'Authorization': `Bearer ${key}`,
                    'Prefer': 'return=minimal',
                },
                body: JSON.stringify(linha),
            });
            if (r.ok) return { ok: true, tentativa };
            ultimo = { ok: false, status: r.status, erro: (await r.text()).slice(0, 200) };
        } catch (e) {
            ultimo = { ok: false, status: 0, erro: String((e && e.message) || e).slice(0, 200) };
        }
        if (tentativa === 1) await new Promise(res => setTimeout(res, 800));
    }
    console.error('[save-lead] lead NÃO foi salvo:', ultimo.status, ultimo.erro);
    return ultimo;
}

// Se o lead não foi salvo: registra no BigData (evento lead_nao_salvo) e avisa no Telegram com o contato,
// para o lead não se perder.
async function avisarLeadNaoSalvo(url, key, { nome, email, whatsapp, sessionId, status, erro }) {
    try {
        await fetch(`${url}/rest/v1/funil_eventos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'apikey': key, 'Authorization': `Bearer ${key}`, 'Prefer': 'return=minimal' },
            body: JSON.stringify(sessionId ? { tipo: 'lead_nao_salvo', session_id: String(sessionId).slice(0, 80) } : { tipo: 'lead_nao_salvo' }),
        });
    } catch (e) { /* o aviso no Telegram abaixo ainda sai */ }
    await avisarTelegram([
        '🚨 QUIZ: um lead NÃO foi salvo no banco',
        'Nome: ' + (nome || '-'),
        'E-mail: ' + (email || '-'),
        'WhatsApp: ' + (whatsapp || '-'),
        'Motivo: resposta ' + status + ' ' + String(erro || '').slice(0, 150),
    ].join('\n'));
}

module.exports = async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const url = process.env.SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const cookieAlfaId = getCookieValue(req.headers.cookie, 'oxy_alfa_id');

    // Chamada leve disparada em chooseOffer() (quiz.html) pra fechar a fase "raiox", e
    // progressivamente durante o quiz (a cada pergunta/fase, via pick()/fecharFase()) —
    // não toca em leads/oxyreport. Também cria o arquivo_alfa cedo (se ainda não existir,
    // ex: quem entra direto no quiz sem passar por land) e devolve o id pro front-end
    // reusar nas próximas chamadas progressivas, em vez de criar um registro novo a cada vez.
    if (req.body && req.body.soAtualizarAlfa) {
        const alfaIdRecebido = req.body.alfaId || cookieAlfaId;
        let alfaId = alfaIdRecebido || null;
        let gpsSalvo = false;
        try {
            const gps = req.body.gps ? await geocodificarGps(req.body.gps) : null;
            gpsSalvo = !!gps;
            alfaId = await upsertArquivoAlfa(url, serviceKey, alfaIdRecebido, {
                ...camposDoRastro(req, gps),
                tempos_fase: req.body.temposFase || undefined,
                tempos_perguntas: req.body.temposPerguntas || undefined,
                respostas_quiz: req.body.respostasQuiz || undefined,
                utm: req.body.utm || undefined,
                scroll_maximo_freereport_percentual: (typeof req.body.scrollMaximoFreereportPercentual === 'number')
                    ? req.body.scrollMaximoFreereportPercentual
                    : undefined,
            });
            await inserirPassos(url, serviceKey, alfaId, req.body.passosFechados);
            if (alfaId && alfaId !== alfaIdRecebido) {
                const doisAnos = 60 * 60 * 24 * 365 * 2;
                res.setHeader('Set-Cookie', `oxy_alfa_id=${alfaId}; Max-Age=${doisAnos}; Path=/; Domain=.breno-atitude.com; Secure; SameSite=Lax`);
            }
        } catch (err) {
            console.error('[save-lead] Falha ao atualizar arquivo_alfa (progressivo):', err);
        }
        return res.status(200).json({ ok: true, alfaId, gpsSalvo });
    }

    const { nome, idade, altura, peso, profissao, email, whatsapp, arquetipo, mbtiTipo, adicas, diagnostico, bios, apps, cidade, signo, ultimoDate, duracaoQuiz, respostasQuiz, temposPerguntas, temposFase, velocidadeCarregamentoQuizMs, tempoAteEmailSegundos, utm } = req.body;
    const dispositivo = parseDispositivo(req.headers['user-agent']);

    const key = process.env.SUPABASE_ANON_KEY;

    // Se Supabase não estiver configurado, retorna ok silenciosamente
    if (!url || !key) return res.status(200).json({ ok: true });

    const bioVazia = !(Array.isArray(bios) && bios.length); // IA falhou: salva o lead SEM bio inventada
    const linhaLead = {
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
                bios:        bioVazia ? null : bios,
                apps:        apps        || null,
                cidade:      cidade      || null,
                signo:       signo       || null,
                ultimo_date: ultimoDate  || null,
                dispositivo,
                duracao_quiz_segundos: duracaoQuiz || null,
                created_at: new Date().toISOString(),
    };
    const gravado = await gravarLeadComConferencia(url, key, linhaLead);
    const leadSalvo = !!gravado.ok;
    if (!leadSalvo) {
        // Nunca bloqueia o resultado do quiz, mas avisa para o lead não se perder
        await avisarLeadNaoSalvo(url, key, { nome, email, whatsapp, sessionId: req.body.sessionId, status: gravado.status, erro: gravado.erro });
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
            utm: utm || undefined,
            ...camposDoRastro(req),
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
        await gravarOxyreport(url, email, { arquetipo, mbtiTipo, adicas, diagnostico, bios: bioVazia ? null : bios });
    } catch (err) {
        console.error('[save-lead] Falha ao gravar oxyreport:', err);
        // Nunca bloqueia o resultado do quiz
    }

    return res.status(200).json({ ok: true, alfaId, leadSalvo });
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
