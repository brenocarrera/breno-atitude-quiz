// Checagens do quiz que ficam no ar. Usado por três coisas:
//   - testar-quiz.js (antes de publicar)      -> carregarBancoELogicaDoHtml()
//   - verificar-no-ar.js (rodar à mão)         -> checarNoAr()
//   - api/verificar-no-ar.js (agendado na Vercel) -> checarNoAr()
// O arquivo começa com "_" para a Vercel não tratá-lo como uma rota pública.
'use strict';
const vm = require('vm');

const PIXEL_FIXO = '2027250401407462';

// Blocos de código escritos direto dentro do HTML (os que não carregam arquivo externo)
function blocosInline(html) {
    const lista = [];
    const re = /<script(\s[^>]*)?>([\s\S]*?)<\/script>/gi;
    let m;
    while ((m = re.exec(html))) {
        const attrs = m[1] || '';
        if (/\bsrc\s*=/.test(attrs)) continue;
        if (/\btype\s*=\s*["']?(?!text\/javascript)/i.test(attrs)) continue;
        lista.push(m[2]);
    }
    return lista;
}

// Extrai do quiz.html o banco de perguntas e o cálculo (que ficam EMBUTIDOS no HTML) e devolve { QL, banco }
function carregarBancoELogicaDoHtml(html) {
    const blocos = blocosInline(html);
    const bancoTxt = blocos.find(b => /var\s+BANCO_PERGUNTAS\s*=/.test(b));
    const logicaTxt = blocos.find(b => /global\.QuizLogic\s*=\s*\{/.test(b));
    if (!bancoTxt) throw new Error('o banco de perguntas não está embutido no quiz.html');
    if (!logicaTxt) throw new Error('o cálculo (QuizLogic) não está embutido no quiz.html');
    const ctx = { window: {}, console };
    ctx.global = ctx.window;
    vm.createContext(ctx);
    vm.runInContext(bancoTxt, ctx, { filename: 'banco-embutido' });
    vm.runInContext(logicaTxt, ctx, { filename: 'logica-embutida' });
    const QL = ctx.window.QuizLogic || ctx.QuizLogic;
    if (!QL || typeof QL.sortearPerguntas !== 'function') throw new Error('QuizLogic não ficou disponível');
    if (!Array.isArray(ctx.BANCO_PERGUNTAS)) throw new Error('BANCO_PERGUNTAS não ficou disponível');
    return { QL, banco: ctx.BANCO_PERGUNTAS };
}

// Confere o quiz publicado em "base" (ex.: https://oxy-quizz.breno-atitude.com).
// Devolve { itens: [{ nome, ok, msg }], falhou } — só lê, não grava nada.
async function checarNoAr(base) {
    const itens = [];
    const ok = (nome, msg) => itens.push({ nome, ok: true, msg });
    const falha = (nome, msg) => itens.push({ nome, ok: false, msg });
    let html = '';
    try {
        const ctrl = new AbortController();
        const t = setTimeout(() => ctrl.abort(), 15000);
        const r = await fetch(base.replace(/\/$/, '') + '/quiz.html?v=' + Date.now(), { signal: ctrl.signal });
        clearTimeout(t);
        if (r.status !== 200) { falha('a página do quiz abre', 'respondeu ' + r.status + ' em vez de abrir normal'); return { itens, falhou: true }; }
        html = await r.text();
        ok('a página do quiz abre normal', html.length + ' caracteres');
    } catch (e) {
        falha('a página do quiz abre', 'não consegui acessar: ' + String((e && e.message) || e));
        return { itens, falhou: true };
    }

    ['sortearPerguntas', PIXEL_FIXO, 'PIXEL_TEMPERAMENTO', 'ArmazemSeguro', 's-falha', 'pedirBiosComTentativas'].forEach(marca => {
        html.includes(marca) ? ok('a página contém "' + marca + '"') : falha('a página contém "' + marca + '"', 'NÃO encontrei');
    });
    html.includes('src="/banco-perguntas.js"') ? falha('sem arquivos separados', 'a página ainda depende do arquivo banco-perguntas.js') : ok('sem arquivos separados (tudo dentro da página)');

    try {
        blocosInline(html).forEach((b, i) => new vm.Script(b, { filename: 'bloco-' + (i + 1) }));
        ok('o código da página não tem erro de escrita');
        const { QL, banco } = carregarBancoELogicaDoHtml(html);
        banco.length >= 60 ? ok('banco de perguntas', banco.length + ' perguntas') : falha('banco de perguntas', 'poucas perguntas: ' + banco.length);
        let erros = 0;
        for (let i = 0; i < 300; i++) {
            const qs = QL.sortearPerguntas(3, 2);
            const ordemOk = qs.slice(0, 9).every((q, j) => q._eixo === ['SN', 'TF', 'JP'][j % 3])
                && qs.slice(9, 12).every(q => q._eixo === 'EI') && qs.slice(12).every(q => q._tipo === 'adicas');
            if (qs.length !== 24 || new Set(qs.map(q => q.q)).size !== 24 || !ordemOk) erros++;
        }
        erros === 0 ? ok('300 sorteios do que está no ar: 24 perguntas, sem repetição, MBTI primeiro') : falha('sorteio', erros + ' de 300 sorteios saíram errados');
        const r = QL.calcularScores(['E', 'S', 'T', 'J', 'E', 'S', 'T', 'J', 'E', 'S', 'T', 'J'].map(a => ({ a })));
        r.mbtiTipo === 'ESTJ' && QL.temperamentoPorLetras('ESTJ') === 'SJ' ? ok('cálculo do MBTI e do temperamento funciona') : falha('cálculo', 'MBTI deu ' + r.mbtiTipo);
    } catch (e) {
        falha('código do quiz no ar', String((e && e.message) || e));
    }
    return { itens, falhou: itens.some(i => !i.ok) };
}

module.exports = { blocosInline, carregarBancoELogicaDoHtml, checarNoAr, PIXEL_FIXO };
