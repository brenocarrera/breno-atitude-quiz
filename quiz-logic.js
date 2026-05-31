// quiz-logic.js — Seleção aleatória e scoring do Quiz Breno Carrera
// Depende de: banco-perguntas.js (BANCO_PERGUNTAS deve estar carregado antes)
//
// EXPORTA (browser global):
//   QuizLogic.sortearPerguntas(nPorEixo, nPorTraco)
//   QuizLogic.calcularScores(respostas)
//   QuizLogic.montarPayload(respostas, userData)

(function (global) {
    'use strict';

    // ─────────────────────────────────────────
    // CONSTANTES
    // ─────────────────────────────────────────

    // Eixos MBTI: cada pergunta do banco tem opts com .a = polo (ex: 'E', 'I')
    const MBTI_EIXOS = [
        { eixo: 'EI', polos: ['E', 'I'] },
        { eixo: 'SN', polos: ['S', 'N'] },
        { eixo: 'TF', polos: ['T', 'F'] },
        { eixo: 'JP', polos: ['J', 'P'] },
    ];

    // Traços ADICAS positivos
    const ADICAS_TRACOS = [
        'aventureiro',
        'divertido',
        'inteligente',
        'confiavel',
        'ambicioso',
        'sexual',
    ];

    // ─────────────────────────────────────────
    // HELPERS
    // ─────────────────────────────────────────

    /** Fisher-Yates shuffle — não modifica o array original */
    function shuffle(arr) {
        const a = arr.slice();
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    }

    /** Retorna true se a pergunta pertence a um eixo MBTI específico */
    function ehMbtiEixo(pergunta, polos) {
        return pergunta.opts.every(o => polos.includes(o.a));
    }

    /** Retorna true se a pergunta pertence a um traço ADICAS específico */
    function ehAdicas(pergunta, traco) {
        return pergunta.opts.some(o => o.a === traco);
    }

    // ─────────────────────────────────────────
    // SELEÇÃO ALEATÓRIA BALANCEADA
    // ─────────────────────────────────────────

    /**
     * sortearPerguntas(nPorEixo, nPorTraco)
     *
     * Sorteia perguntas do BANCO_PERGUNTAS garantindo cobertura de
     * todos os eixos MBTI e todos os traços ADICAS.
     *
     * @param {number} nPorEixo  — quantas perguntas por eixo MBTI (padrão: 2)
     *                             total MBTI = nPorEixo × 4
     * @param {number} nPorTraco — quantas perguntas por traço ADICAS (padrão: 2)
     *                             total ADICAS = nPorTraco × 6
     *
     * Exemplo padrão: 2×4 + 2×6 = 8 + 12 = 20 perguntas por sessão
     *
     * @returns {Array} perguntas embaralhadas, cada uma com metadado .tipo e .eixo/.traco
     */
    function sortearPerguntas(nPorEixo = 2, nPorTraco = 2) {
        if (typeof BANCO_PERGUNTAS === 'undefined') {
            throw new Error('BANCO_PERGUNTAS não está carregado. Inclua banco-perguntas.js antes de quiz-logic.js.');
        }

        const selecionadas = [];

        // — MBTI: nPorEixo perguntas de cada um dos 4 eixos —
        for (const { eixo, polos } of MBTI_EIXOS) {
            const pool = BANCO_PERGUNTAS.filter(p => ehMbtiEixo(p, polos));
            const pick = shuffle(pool).slice(0, nPorEixo);
            pick.forEach(p => selecionadas.push({ ...p, _tipo: 'mbti', _eixo: eixo }));
        }

        // — ADICAS: nPorTraco perguntas de cada um dos 6 traços —
        for (const traco of ADICAS_TRACOS) {
            const pool = BANCO_PERGUNTAS.filter(p => ehAdicas(p, traco));
            const pick = shuffle(pool).slice(0, nPorTraco);
            pick.forEach(p => selecionadas.push({ ...p, _tipo: 'adicas', _traco: traco }));
        }

        // Embaralha tudo para misturar MBTI e ADICAS
        return shuffle(selecionadas);
    }

    // ─────────────────────────────────────────
    // CÁLCULO DE SCORES
    // ─────────────────────────────────────────

    /**
     * calcularScores(respostas)
     *
     * @param {Array} respostas — array de objetos { a: string } (a resposta escolhida)
     *                            onde .a é o polo/traço (ex: 'E', 'I', 'aventureiro', etc.)
     *
     * @returns {{
     *   mbtiTipo: string,          // ex: 'INTJ'
     *   mbtiContagem: object,      // { E:3, I:5, S:2, N:6, T:4, F:4, J:3, P:5 }
     *   adicas: object,            // { aventureiro:2, divertido:1, ... } (só positivos)
     *   adicasTotal: number        // total de respostas ADICAS positivas
     * }}
     */
    function calcularScores(respostas) {
        const mbti = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };
        const adicas = {
            aventureiro: 0, divertido: 0, inteligente: 0,
            confiavel: 0,   ambicioso: 0, sexual: 0,
        };

        for (const r of respostas) {
            const polo = r.a || '';
            if (polo in mbti)   mbti[polo]++;
            if (polo in adicas) adicas[polo]++;
        }

        const mbtiTipo =
            (mbti.E >= mbti.I ? 'E' : 'I') +
            (mbti.S >= mbti.N ? 'S' : 'N') +
            (mbti.T >= mbti.F ? 'T' : 'F') +
            (mbti.J >= mbti.P ? 'J' : 'P');

        const adicasTotal = Object.values(adicas).reduce((s, v) => s + v, 0);

        return { mbtiTipo, mbtiContagem: mbti, adicas, adicasTotal };
    }

    // ─────────────────────────────────────────
    // MONTAGEM DO PAYLOAD PARA /api/generate-report
    // ─────────────────────────────────────────

    /**
     * montarPayload(respostas, userData)
     *
     * Monta o objeto que o front envia para POST /api/generate-report.
     *
     * @param {Array}  respostas — mesmo array de { a: string }
     * @param {object} userData  — { nome, idade, profissao, altura, peso, email, whatsapp }
     *
     * @returns {object} corpo do POST, pronto para JSON.stringify
     */
    function montarPayload(respostas, userData) {
        return {
            respostas,
            nome: userData.nome || userData.name || '',
            userData,
        };
    }

    // ─────────────────────────────────────────
    // RELATÓRIO LOCAL (fallback sem API)
    // ─────────────────────────────────────────

    /**
     * relatorioFallback(scores)
     *
     * Retorna um texto de fallback mínimo caso a API falhe.
     * Nunca substitui o relatório real — apenas evita tela em branco.
     */
    function relatorioFallback({ mbtiTipo, adicas }) {
        const bloqueio = Object.entries(adicas)
            .sort((a, b) => a[1] - b[1])[0][0];

        const nomeBloqueio = {
            aventureiro: 'Aventureiro',
            divertido:   'Divertido',
            inteligente: 'Inteligente',
            confiavel:   'Confiável',
            ambicioso:   'Ambicioso',
            sexual:      'Sexual',
        }[bloqueio] || bloqueio;

        return `[PERFIL]\nSeu tipo: ${mbtiTipo}\n\n[O BLOQUEIO]\nSeu traço mais fraco é o ${nomeBloqueio}. Esse é o ponto que mais impacta seus resultados agora.\n\n[O PRÓXIMO PASSO]\nFoque exclusivamente nesse traço esta semana. Uma ação concreta por dia.\n\n[CHAMADA]\nO método completo para o seu perfil existe. A escolha é sua.`;
    }

    // ─────────────────────────────────────────
    // EXPORT
    // ─────────────────────────────────────────

    global.QuizLogic = {
        sortearPerguntas,
        calcularScores,
        montarPayload,
        relatorioFallback,
        // Constantes expostas para debug/testes
        MBTI_EIXOS,
        ADICAS_TRACOS,
    };

})(typeof window !== 'undefined' ? window : global);
