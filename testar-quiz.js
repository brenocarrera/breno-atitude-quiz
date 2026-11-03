// testar-quiz.js
// Roda ANTES de cada publicação (a Vercel chama este arquivo pelo "buildCommand" do vercel.json).
// Se algum teste OBRIGATÓRIO falhar, o arquivo termina com erro (código 1) e a Vercel CANCELA a
// publicação: a versão antiga continua no ar. Nada aqui usa a internet, a IA ou o banco de verdade
// (tudo é simulado), então rodar o teste não gera evento falso nem custo.
// Uso manual:  node testar-quiz.js            (testa a pasta onde o arquivo está)
//              node testar-quiz.js <pasta>    (testa outra pasta)
'use strict';
const fs = require('fs');
const vm = require('vm');
const path = require('path');
const { blocosInline, carregarBancoELogicaDoHtml } = require('./api/_checar-quiz');

const RAIZ = process.argv[2] ? path.resolve(process.argv[2]) : __dirname;

// Desenho atual do quiz. Se o desenho mudar (ex.: 5 perguntas por característica), mude aqui.
const POR_EIXO_MBTI = 3;
const POR_TRACO_ADICAS = 2;
const EIXOS = { EI: ['E', 'I'], SN: ['S', 'N'], TF: ['T', 'F'], JP: ['J', 'P'] };
const TRACOS = ['aventureiro', 'divertido', 'inteligente', 'confiavel', 'ambicioso', 'sexual'];
const PIXEL_FIXO = '2027250401407462';
const PIXEL_TEMPERAMENTO = { NT: '1803284211086923', NF: '4453266091667409', SJ: '1714652139808724', SP: '2172591689970088' };

let falhas = 0;
let avisos = 0;

function ler(arq) { return fs.readFileSync(path.join(RAIZ, arq), 'utf8'); }
function existe(arq) { return fs.existsSync(path.join(RAIZ, arq)); }
function exigir(cond, msg) { if (!cond) throw new Error(msg); }

async function teste(nome, obrigatorio, fn) {
    try {
        const extra = await fn();
        console.log('  OK      ' + nome + (extra ? '  (' + extra + ')' : ''));
    } catch (e) {
        if (obrigatorio) { falhas++; console.log('  FALHOU  ' + nome + '\n          -> ' + e.message); }
        else { avisos++; console.log('  AVISO   ' + nome + '\n          -> ' + e.message); }
    }
}

function pegarBloco(html, ini, fim) {
    const a = html.indexOf(ini), b = html.indexOf(fim);
    exigir(a >= 0 && b > a, 'trecho ' + ini + ' não encontrado no quiz.html');
    return html.slice(a, b);
}

function stubDeDocumento() {
    const stub = () => new Proxy(function () {}, { get: (t, p) => (p === Symbol.toPrimitive ? () => '' : p === 'length' ? 0 : stub()), apply: () => stub(), construct: () => stub(), set: () => true });
    return stub();
}

// Simula a página rodando num navegador. Com armazenamento bloqueado, qualquer acesso a localStorage dá erro.
function rodarScriptPrincipal(html, armazenamentoBloqueado) {
    const k = html.indexOf('function trackFunilStep');
    exigir(k > 0, 'bloco principal do quiz não encontrado');
    const codigo = html.slice(html.lastIndexOf('<script>', k) + 8, html.indexOf('</script>', k));
    const g = {
        console, setTimeout: () => 0, clearTimeout() {}, setInterval: () => 0, clearInterval() {}, URLSearchParams, JSON, Math, Date, Promise, Array, Object, String, Number, Error, RegExp,
        parseInt, parseFloat, encodeURIComponent, decodeURIComponent, fetch: () => Promise.resolve({ json: () => ({}) }),
        performance: { timeOrigin: Date.now(), getEntriesByType: () => [], now: () => 0 }, navigator: { userAgent: 'x', connection: {} },
        location: { search: '', pathname: '/', href: '', origin: 'https://teste.local', replace() {} }, addEventListener() {}, removeEventListener() {}, document: stubDeDocumento(),
        crypto: { randomUUID: () => 'u-1', getRandomValues: a => a }, PerformanceObserver: function () { this.observe = () => {}; this.disconnect = () => {}; },
        Blob: function () {}, alert() {}, Audio: function () {}, QuizLogic: {}, BANCO_PERGUNTAS: [],
    };
    g.window = g; g.self = g; g.globalThis = g;
    vm.createContext(g);
    if (armazenamentoBloqueado) vm.runInContext('Object.defineProperty(globalThis,"localStorage",{configurable:true,get(){throw new Error("armazenamento bloqueado")}})', g);
    else vm.runInContext('(function(){const m=new Map();globalThis.localStorage={getItem:k=>m.has(k)?m.get(k):null,setItem:(k,v)=>m.set(k,String(v))}})()', g);
    let erroAoCarregar = null;
    try { vm.runInContext(codigo, g); } catch (e) { erroAoCarregar = e; }
    return { g, erroAoCarregar };
}

function resFalso() {
    return { code: 200, corpo: null, cabecalhos: {}, status(c) { this.code = c; return this; }, json(o) { this.corpo = o; return this; }, setHeader(k, v) { this.cabecalhos[k] = v; } };
}

// Roda uma função com fetch/variáveis de ambiente simulados e restaura tudo no fim.
async function comAmbienteFalso(env, fetchFalso, fn) {
    const guardado = {};
    Object.keys(env).forEach(k => { guardado[k] = process.env[k]; if (env[k] === null) delete process.env[k]; else process.env[k] = env[k]; });
    const fetchOriginal = global.fetch;
    global.fetch = fetchFalso;
    const logOriginal = console.error;
    console.error = () => {};
    try { return await fn(); }
    finally {
        console.error = logOriginal;
        global.fetch = fetchOriginal;
        Object.keys(guardado).forEach(k => { if (guardado[k] === undefined) delete process.env[k]; else process.env[k] = guardado[k]; });
    }
}
const respOk = (corpo) => ({ ok: true, status: 200, headers: { get: () => null }, text: async () => '', json: async () => (corpo === undefined ? [] : corpo) });
const respErro = (status) => ({ ok: false, status, headers: { get: () => null }, text: async () => 'recusado', json: async () => ({}) });
const SEM_TELEGRAM = { TELEGRAM_BOT_TOKEN: null, TELEGRAM_GROUP_CHAT_ID: null, TELEGRAM_ALERT_THREAD_ID: null };

(async () => {
    console.log('\nTESTE DO QUIZ ANTES DE PUBLICAR  (pasta: ' + RAIZ + ')\n');

    const html = ler('quiz.html');
    let QL, banco;

    // ───── Estrutura da página ─────
    await teste('todos os blocos de código dentro do quiz.html sem erro de escrita', true, () => {
        const blocos = blocosInline(html);
        exigir(blocos.length > 0, 'nenhum bloco de código encontrado no quiz.html');
        blocos.forEach((b, i) => { try { new vm.Script(b); } catch (e) { throw new Error('bloco ' + (i + 1) + ' tem erro de escrita: ' + e.message); } });
        return blocos.length + ' blocos';
    });

    await teste('banco de perguntas e cálculo estão DENTRO do quiz.html (sem arquivos separados)', true, () => {
        exigir(!html.includes('src="/banco-perguntas.js"') && !html.includes('src="/quiz-logic.js"'), 'o quiz.html ainda pede arquivos separados');
        ({ QL, banco } = carregarBancoELogicaDoHtml(html));
        exigir(!existe('banco-perguntas.js') && !existe('quiz-logic.js'), 'os arquivos antigos (banco-perguntas.js / quiz-logic.js) ainda existem: apague para existir uma única fonte');
        return banco.length + ' perguntas embutidas';
    });

    await teste('banco de perguntas bem formado (4 opções por pergunta, etiquetas válidas)', true, () => {
        exigir(banco, 'banco não carregou');
        const validas = new Set(['E', 'I', 'S', 'N', 'T', 'F', 'J', 'P']);
        TRACOS.forEach(t => { validas.add(t); validas.add('nao_' + t); });
        banco.forEach((p, i) => {
            exigir(p && p.q && Array.isArray(p.opts) && p.opts.length === 4, 'pergunta ' + (i + 1) + ' sem 4 opções');
            p.opts.forEach(o => exigir(o && o.t && validas.has(o.a), 'pergunta ' + (i + 1) + ' tem opção com etiqueta inválida: ' + (o && o.a)));
        });
        for (const [eixo, polos] of Object.entries(EIXOS)) {
            const n = banco.filter(p => p.opts.every(o => polos.includes(o.a))).length;
            exigir(n >= POR_EIXO_MBTI, 'eixo ' + eixo + ' tem só ' + n + ' perguntas');
        }
        for (const t of TRACOS) {
            const n = banco.filter(p => p.opts.some(o => o.a === t)).length;
            exigir(n >= POR_TRACO_ADICAS, 'traço ' + t + ' tem só ' + n + ' perguntas');
        }
    });

    // ───── Sorteio, ordem, cálculo e temperamento ─────
    await teste('sorteio: 3000 quizzes com 24 perguntas, nenhuma repetida, quantidades certas por eixo e traço', true, () => {
        exigir(QL, 'cálculo não carregou');
        const total = Object.keys(EIXOS).length * POR_EIXO_MBTI + TRACOS.length * POR_TRACO_ADICAS;
        for (let i = 0; i < 3000; i++) {
            const qs = QL.sortearPerguntas(POR_EIXO_MBTI, POR_TRACO_ADICAS);
            exigir(qs.length === total, 'quiz com ' + qs.length + ' perguntas (esperado ' + total + ')');
            exigir(new Set(qs.map(q => q.q)).size === qs.length, 'pergunta repetida dentro do mesmo quiz');
            for (const eixo of Object.keys(EIXOS)) exigir(qs.filter(q => q._eixo === eixo).length === POR_EIXO_MBTI, 'eixo ' + eixo + ' com quantidade errada');
            for (const t of TRACOS) exigir(qs.filter(q => q._traco === t).length === POR_TRACO_ADICAS, 'traço ' + t + ' com quantidade errada');
        }
        return total + ' perguntas por quiz';
    });

    await teste('ordem do quiz: MBTI primeiro (9 de temperamento em rodízio, depois E/I, depois ADICAS)', true, () => {
        for (let i = 0; i < 2000; i++) {
            const qs = QL.sortearPerguntas(POR_EIXO_MBTI, POR_TRACO_ADICAS);
            qs.slice(0, 9).forEach((q, j) => exigir(q._eixo === ['SN', 'TF', 'JP'][j % 3], 'a pergunta ' + (j + 1) + ' deveria ser do eixo ' + ['SN', 'TF', 'JP'][j % 3] + ' e é ' + q._eixo));
            qs.slice(9, 12).forEach(q => exigir(q._eixo === 'EI', 'as perguntas 10 a 12 deveriam ser de E/I'));
            qs.slice(12).forEach(q => exigir(q._tipo === 'adicas', 'da 13ª em diante deveriam ser todas de ADICAS'));
        }
    });

    await teste('cálculo do MBTI e do ADICAS dá o resultado esperado', true, () => {
        const a = ['E', 'S', 'T', 'J'].flatMap(x => [x, x, x]).map(x => ({ a: x }));
        exigir(QL.calcularScores(a).mbtiTipo === 'ESTJ', 'respostas E/S/T/J deveriam dar ESTJ');
        const b = ['I', 'N', 'F', 'P'].flatMap(x => [x, x, x]).map(x => ({ a: x }));
        exigir(QL.calcularScores(b).mbtiTipo === 'INFP', 'respostas I/N/F/P deveriam dar INFP');
        const c = QL.calcularScores(['aventureiro', 'aventureiro', 'sexual', 'nao_sexual'].map(x => ({ a: x })));
        exigir(c.adicas.aventureiro === 2 && c.adicas.sexual === 1, 'contagem do ADICAS errada');
    });

    await teste('temperamento fica decidido entre a 6ª e a 9ª pergunta e bate com o MBTI final (5000 quizzes simulados)', true, () => {
        const contagem = { NT: 0, NF: 0, SJ: 0, SP: 0 };
        const N = 5000;
        for (let i = 0; i < N; i++) {
            const qs = QL.sortearPerguntas(POR_EIXO_MBTI, POR_TRACO_ADICAS);
            const resp = qs.map(q => ({ a: q.opts[Math.floor(Math.random() * 4)].a }));
            let decididoEm = null, temp = null;
            for (let j = 0; j < resp.length; j++) {
                temp = QL.temperamentoPorRespostas(resp.slice(0, j + 1));
                if (temp) { decididoEm = j + 1; break; }
            }
            exigir(decididoEm !== null && decididoEm >= 6 && decididoEm <= 9, 'temperamento decidido na pergunta ' + decididoEm + ' (esperado entre 6 e 9)');
            const final = QL.temperamentoPorLetras(QL.calcularScores(resp).mbtiTipo);
            exigir(temp === final, 'temperamento decidido cedo (' + temp + ') diferente do final (' + final + ')');
            contagem[temp]++;
        }
        Object.keys(contagem).forEach(k => exigir(contagem[k] > N * 0.15, 'temperamento ' + k + ' quase não aparece (' + contagem[k] + ' de ' + N + ')'));
        return 'NT ' + contagem.NT + ' | NF ' + contagem.NF + ' | SJ ' + contagem.SJ + ' | SP ' + contagem.SP;
    });

    // ───── Pixels ─────
    await teste('pixels do Meta: o fixo e os 4 de temperamento (NT, NF, SJ, SP) estão no quiz.html', true, () => {
        exigir(html.includes(PIXEL_FIXO), 'pixel fixo ' + PIXEL_FIXO + ' sumiu');
        for (const [temp, id] of Object.entries(PIXEL_TEMPERAMENTO)) exigir(new RegExp(temp + ": *'" + id + "'").test(html), 'pixel do temperamento ' + temp + ' (' + id + ') sumiu ou mudou');
        exigir(!html.includes('pixelMap') && !html.includes('avatarPixelFired'), 'sobrou o critério antigo de arquétipo para o pixel');
        exigir(html.includes('verificarTemperamento()'), 'o quiz não liga o pixel durante as perguntas');
    });

    await teste('quiz.html sorteia 24 perguntas e não tem plano B com perguntas antigas', true, () => {
        exigir(html.includes('QuizLogic.sortearPerguntas(' + POR_EIXO_MBTI + ', ' + POR_TRACO_ADICAS + ')'), 'a chamada do sorteio mudou (esperado ' + POR_EIXO_MBTI + ' por eixo e ' + POR_TRACO_ADICAS + ' por traço). Se mudou de propósito, atualize as constantes no topo deste arquivo');
        exigir(!/QS_FALLBACK/.test(html), 'o QS_FALLBACK (perguntas antigas) ainda existe: dá resultado ESTJ para todo mundo se for usado');
    });

    // ───── Blindagem ─────
    await teste('quiz inicia mesmo com o armazenamento do navegador bloqueado', true, () => {
        const normal = rodarScriptPrincipal(html, false);
        exigir(!normal.erroAoCarregar, 'o script principal já falha com armazenamento normal: ' + (normal.erroAoCarregar && normal.erroAoCarregar.message));
        const { g, erroAoCarregar } = rodarScriptPrincipal(html, true);
        exigir(!erroAoCarregar, 'com o armazenamento bloqueado o quiz quebra ao carregar: ' + (erroAoCarregar && erroAoCarregar.message));
        exigir(vm.runInContext('typeof PHASES', g) === 'object' && vm.runInContext('typeof startQuiz', g) === 'function', 'o quiz não carregou por inteiro');
        vm.runInContext("ArmazemSeguro.set('teste', '1')", g);
        exigir(vm.runInContext("ArmazemSeguro.get('teste')", g) === '1', 'o armazenamento de reserva (memória) não funciona');
    });

    await teste('início do quiz: tenta 3 vezes e, se não conseguir, mostra a tela de falha com o WhatsApp', true, () => {
        const bloco = pegarBloco(html, '// <<INICIO-INICIO>>', '// <<INICIO-FIM>>');
        function simular(sorteio) {
            const rastro = { telas: [], eventos: [], falhas: 0, tentativasDeSorteio: 0 };
            const g = {
                QuizLogic: { sortearPerguntas() { rastro.tentativasDeSorteio++; return sorteio(rastro.tentativasDeSorteio); } },
                show: id => rastro.telas.push(id), registrarEvento: t => rastro.eventos.push(t), mensagemDoErro: e => String(e && e.message),
                mostrarFalha: () => rastro.falhas++, setTimeout: fn => { fn(); return 0; }, Error, respostas: [], QS: [],
            };
            vm.createContext(g);
            vm.runInContext(bloco, g);
            vm.runInContext('prepararPerguntas(1)', g);
            return rastro;
        }
        const vinte4 = new Array(24).fill({ q: 'x' });
        const a = simular(n => { if (n < 3) throw new Error('falha ' + n); return vinte4; });
        exigir(a.tentativasDeSorteio === 3 && a.telas.join() === 's-p1' && a.falhas === 0 && a.eventos.includes('quiz_iniciou'), 'falhando 2 vezes e dando certo na 3ª, o quiz deveria iniciar');
        const b = simular(() => { throw new Error('sempre falha'); });
        exigir(b.tentativasDeSorteio === 3 && b.falhas === 1 && b.telas.length === 0 && b.eventos.filter(e => e === 'quiz_erro').length === 3, 'falhando sempre, deveria tentar 3 vezes e mostrar a tela de falha 1 vez');
        const c = simular(() => new Array(20).fill({ q: 'x' }));
        exigir(c.falhas === 1, 'um sorteio com número errado de perguntas deveria ser tratado como falha');
        exigir(html.includes('id="s-falha"') && html.includes("abrirWhatsAppEspecial('inicio')") && html.includes('tentarDeNovo()'), 'a tela de falha (com WhatsApp e Tentar de novo) não está no quiz.html');
        exigir(html.includes('wa.me/') && html.includes('WHATSAPP_NUMERO'), 'a ligação com o WhatsApp não está no quiz.html');
    });

    await teste('IA: limite de espera por tentativa, 3 tentativas e depois segue sem inventar bio', true, async () => {
        let bloco = pegarBloco(html, '// <<IA-INICIO>>', '// <<IA-FIM>>');
        exigir(bloco.includes('const IA_LIMITE_MS = 20000') && bloco.includes('const IA_TENTATIVAS = 3'), 'o limite de 20 segundos x 3 tentativas mudou');
        bloco = bloco.replace('const IA_LIMITE_MS = 20000', 'const IA_LIMITE_MS = 40'); // só para o teste não demorar
        async function simular(respostas) {
            const rastro = { chamadas: 0, avisos: [] };
            const g = {
                fetch: (url, opts) => {
                    const r = respostas[rastro.chamadas++];
                    if (r === 'trava') return new Promise((_, rej) => opts.signal.addEventListener('abort', () => rej(new Error('abortado'))));
                    return Promise.resolve(r);
                },
                AbortController, setTimeout, clearTimeout, JSON, Array, Error, Promise, mostrarAvisoDemora: t => rastro.avisos.push(t),
            };
            vm.createContext(g);
            vm.runInContext(bloco, g);
            rastro.resultado = await vm.runInContext('pedirBiosComTentativas({})', g);
            return rastro;
        }
        const bom = { ok: true, status: 200, json: async () => ({ bios: [1, 2, 3], diagnostico: 'd', perfil_adicas: 'CA' }) };
        const erro500 = { ok: false, status: 500, json: async () => ({ error: 'api_error' }) };
        const incompleto = { ok: true, status: 200, json: async () => ({ bios: [1, 2], diagnostico: 'd' }) };
        let r = await simular([bom]);
        exigir(r.resultado && r.chamadas === 1 && r.avisos.length === 0, 'resposta boa de primeira deveria ser usada sem avisos de demora');
        r = await simular([erro500, 'trava', bom]);
        exigir(r.resultado && r.chamadas === 3 && r.avisos.join() === '2,3', 'erro + travada + sucesso deveria dar certo na 3ª tentativa (avisos de demora 2 e 3)');
        r = await simular([erro500, incompleto, 'trava']);
        exigir(r.resultado === null && r.chamadas === 3, 'três falhas seguidas (erro, resposta incompleta, travada) deveriam devolver null depois de exatamente 3 tentativas');
        exigir(html.includes("registrarEvento('bio_falhou'") && html.includes('window.__bioFalhou = true'), 'quando a IA falha, o quiz precisa registrar bio_falhou');
        exigir(!html.includes('Conversa real primeiro'), 'ainda existe a bio genérica inventada');
    });

    await teste('tela gerando tem barra de progresso e aviso tranquilizador', true, () => {
        ['id="lprog-bar"', 'id="lprog-pct"', 'id="lprog-aviso"', 'role="progressbar"', 'iniciarBarraCarregamento()', 'finalizarBarraCarregamento()'].forEach(t => exigir(html.includes(t), 'faltou ' + t));
        exigir(/pode ficar tranquilo/.test(html), 'faltou o aviso tranquilizador');
    });

    // ───── Servidor (simulado: nada vai para a internet) ─────
    await teste('API de eventos: grava com o id da visita, tenta sem ele se o banco recusar, rejeita tipo inválido', true, async () => {
        const handler = require(path.join(RAIZ, 'api', 'track-evento.js'));
        const chamadas = [];
        const env = Object.assign({ SUPABASE_URL: 'https://banco.teste', SUPABASE_ANON_KEY: 'anon-teste', SUPABASE_SERVICE_ROLE_KEY: null }, SEM_TELEGRAM);
        await comAmbienteFalso(env, async (url, opts) => {
            chamadas.push({ url: String(url), corpo: opts && opts.body ? JSON.parse(opts.body) : null });
            return opts && opts.body && JSON.parse(opts.body).session_id ? respErro(400) : respOk();
        }, async () => {
            let res = resFalso();
            await handler({ method: 'POST', body: { tipo: 'quiz_iniciou', sessionId: 'visita-1' } }, res);
            exigir(res.code === 200, 'evento válido deveria responder 200');
            exigir(chamadas.length === 2 && chamadas[0].corpo.session_id === 'visita-1' && chamadas[1].corpo.tipo === 'quiz_iniciou' && !chamadas[1].corpo.session_id, 'deveria tentar com o id da visita e, se recusado, sem ele');
            res = resFalso();
            await handler({ method: 'POST', body: { tipo: 'tipo_inventado' } }, res);
            exigir(res.code === 400, 'tipo inválido deveria responder 400');
            for (const t of ['quiz_iniciou', 'quiz_erro', 'lead_nao_salvo', 'bio_falhou']) {
                res = resFalso();
                await handler({ method: 'POST', body: { tipo: t } }, res);
                exigir(res.code === 200, 'tipo ' + t + ' deveria ser aceito');
            }
        });
    });

    await teste('API de eventos: erro, bio_falhou e lead_nao_salvo avisam no Telegram (quiz_iniciou não)', true, async () => {
        const handler = require(path.join(RAIZ, 'api', 'track-evento.js'));
        const env = { SUPABASE_URL: 'https://banco.teste', SUPABASE_ANON_KEY: 'anon-teste', SUPABASE_SERVICE_ROLE_KEY: null, TELEGRAM_BOT_TOKEN: 'token-de-teste', TELEGRAM_GROUP_CHAT_ID: '-100123', TELEGRAM_ALERT_THREAD_ID: null };
        const telegram = [];
        await comAmbienteFalso(env, async (url, opts) => {
            if (String(url).includes('api.telegram.org')) { telegram.push(JSON.parse(opts.body)); return respOk(); }
            return respOk();
        }, async () => {
            for (const t of ['quiz_iniciou', 'quiz_erro', 'bio_falhou', 'lead_nao_salvo']) await handler({ method: 'POST', body: { tipo: t, sessionId: 'v1', detalhe: 'teste' } }, resFalso());
        });
        exigir(telegram.length === 3, 'esperado 3 avisos no Telegram (erro, bio, lead) e recebi ' + telegram.length);
        exigir(telegram.every(m => m.chat_id === '-100123' && m.text.includes('QUIZ')), 'o aviso não foi para o grupo certo ou não identifica o quiz');
    });

    await teste('API do lead: confere o banco, tenta de novo, avisa se não salvou e não inventa bio', true, async () => {
        const handler = require(path.join(RAIZ, 'api', 'save-lead.js'));
        const base = { SUPABASE_URL: 'https://banco.teste', SUPABASE_ANON_KEY: 'anon-teste', SUPABASE_SERVICE_ROLE_KEY: 'svc-teste', TELEGRAM_BOT_TOKEN: 'token-de-teste', TELEGRAM_GROUP_CHAT_ID: '-100123', TELEGRAM_ALERT_THREAD_ID: null };
        function montarFetch(statusLeads, rastro) {
            return async (url, opts) => {
                const u = String(url), metodo = (opts && opts.method) || 'GET';
                if (u.includes('api.telegram.org')) { rastro.telegram.push(JSON.parse(opts.body).text); return respOk(); }
                if (u.includes('/rest/v1/leads') && metodo === 'POST') { rastro.leads.push(JSON.parse(opts.body)); return statusLeads === 200 ? respOk() : respErro(statusLeads); }
                if (u.includes('/rest/v1/funil_eventos')) { rastro.eventos.push(JSON.parse(opts.body).tipo); return respOk(); }
                if (u.includes('/rest/v1/arquivo_alfa')) return respOk([{ id: 'alfa-1' }]);
                return respOk([]);
            };
        }
        const corpo = { nome: 'Teste', email: 'teste@exemplo.com', whatsapp: '', arquetipo: 'alfa', mbtiTipo: 'ESTJ', adicas: { sexual: 1 }, diagnostico: null, bios: [], bioFalhou: true, sessionId: 'v1' };
        // a) o banco recusa sempre: tenta 2 vezes, registra lead_nao_salvo, avisa e responde leadSalvo=false
        let rastro = { telegram: [], leads: [], eventos: [] };
        let res = resFalso();
        await comAmbienteFalso(base, montarFetch(500, rastro), () => handler({ method: 'POST', headers: {}, body: corpo }, res));
        exigir(res.code === 200 && res.corpo && res.corpo.leadSalvo === false, 'com o banco recusando, deveria responder ok mas com leadSalvo=false');
        exigir(rastro.leads.length === 2, 'deveria tentar gravar o lead 2 vezes (recebi ' + rastro.leads.length + ')');
        exigir(rastro.eventos.includes('lead_nao_salvo') && rastro.telegram.some(t => t.includes('NÃO foi salvo') && t.includes('teste@exemplo.com')), 'deveria registrar lead_nao_salvo e avisar no Telegram com o contato');
        // b) o banco aceita: grava 1 vez, sem bio inventada, sem aviso
        rastro = { telegram: [], leads: [], eventos: [] };
        res = resFalso();
        await comAmbienteFalso(base, montarFetch(200, rastro), () => handler({ method: 'POST', headers: {}, body: corpo }, res));
        exigir(res.corpo && res.corpo.leadSalvo === true && rastro.leads.length === 1, 'com o banco aceitando, deveria gravar 1 vez e responder leadSalvo=true');
        exigir(rastro.leads[0].bios === null && rastro.leads[0].diagnostico === null, 'sem bio da IA, o lead deve ir com bio e diagnóstico vazios (nada inventado)');
        exigir(rastro.telegram.length === 0, 'não deveria avisar no Telegram quando o lead foi salvo');
    });

    await teste('arquivos de publicação: vercel.json roda este teste e agenda a checagem diária', false, () => {
        if (!existe('vercel.json')) return 'sem vercel.json nesta pasta (ignorado)';
        const v = JSON.parse(ler('vercel.json'));
        exigir(v.buildCommand === 'node testar-quiz.js', 'vercel.json não roda o testar-quiz.js antes de publicar (buildCommand)');
        exigir(Array.isArray(v.crons) && v.crons.some(c => c.path === '/api/verificar-no-ar'), 'vercel.json não agenda a checagem diária (crons)');
    });

    console.log('\n' + (falhas === 0 ? 'RESULTADO: tudo certo para publicar' : 'RESULTADO: ' + falhas + ' teste(s) obrigatório(s) falharam — PUBLICAÇÃO BLOQUEADA') + (avisos ? '  |  ' + avisos + ' aviso(s)' : '') + '\n');
    process.exit(falhas === 0 ? 0 : 1);
})();
