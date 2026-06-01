const Anthropic = require('@anthropic-ai/sdk');
const fs = require('fs');
const path = require('path');

const client = new Anthropic({ apiKey: (process.env.ANTHROPIC_API_KEY || '').trim() });

// Mapa fase → seções prioritárias do VAULT
const FASE_SECOES = {
    abridor:    ['§31', 'EX-1', 'EX-10', 'EX-16'],
    meio:       ['§4', '§21', '§28', 'EX-11', 'EX-13'],
    fechamento: ['§6', '§33', '§37', 'EX-4', 'EX-8'],
};

// Mapa perfil ADICAS → instruções de personalização
const ADICAS_INSTRUCOES = {
    DI: 'Priorize humor leve (D) e leituras de personalidade/duplo sentido (I). Evite abordagem sexual prematura.',
    AC: 'Priorize sinais de valor (A) e comunicação direta com frame sólido (C). Sem rodeios.',
    DS: 'Priorize humor e morde-e-assopra (D) com tensão sexual calibrada (S). Tom provocativo mas leve.',
    CA: 'Priorize frame direto (C) e menções de ambição/conquistas (A). Comunicação assertiva.',
    default: 'Use o framework ADICAS para calibrar o tom. Seja específico e diferente.',
};

function loadVault() {
    const corePath = path.join(__dirname, '..', 'vault', 'VAULT-CORE.md');
    const exPath   = path.join(__dirname, '..', 'vault', 'VAULT-EXEMPLOS.md');
    const core = fs.existsSync(corePath) ? fs.readFileSync(corePath, 'utf8') : '';
    const exemplos = fs.existsSync(exPath) ? fs.readFileSync(exPath, 'utf8') : '';
    return { core, exemplos };
}

// Extrai blocos de exemplos relevantes por palavras-chave das seções
function getExemplosRelevantes(exemplos, tags) {
    const blocos = exemplos.split(/(?=^## EX-\d+\.)/m).filter(b => b.startsWith('## EX-'));
    const selecionados = [];
    for (const bloco of blocos) {
        if (selecionados.length >= 3) break;
        const match = tags.some(tag => bloco.toUpperCase().includes(tag.toUpperCase().replace('§', '')));
        if (match) selecionados.push(bloco.trim());
    }
    // Se não achou por tag, pega os primeiros
    if (selecionados.length === 0) {
        return blocos.slice(0, 3).join('\n\n---\n\n');
    }
    return selecionados.join('\n\n---\n\n');
}

module.exports = async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const {
        perfil_adicas = 'CA',
        fase = 'meio',          // abridor | meio | fechamento
        contexto_dela = '',     // esporte, trabalho, hobby, etc.
        tom = 'humor',          // humor | direto | provocador
        trecho_conversa = '',   // opcional: colar trecho
    } = req.body;

    const secoes = FASE_SECOES[fase] || FASE_SECOES.meio;
    const instrucaoAdicas = ADICAS_INSTRUCOES[perfil_adicas] || ADICAS_INSTRUCOES.default;
    const { core, exemplos } = loadVault();
    const fewShot = getExemplosRelevantes(exemplos, secoes);

    const systemPrompt = core
        ? `${core}\n\n---\n\nEXEMPLOS DE REFERÊNCIA (few-shot):\n${fewShot}`
        : 'Você é especialista em mensagens de sedução calibradas e autênticas.';

    const trechoBlock = trecho_conversa
        ? `\nTrecho da conversa atual:\n"""\n${trecho_conversa}\n"""\n`
        : '';

    const userMsg = `Perfil ADICAS: ${perfil_adicas}
Instrução de perfil: ${instrucaoAdicas}
Fase da conversa: ${fase}
Contexto dela: ${contexto_dela || 'não informado'}
Tom desejado: ${tom}
${trechoBlock}
Com base no VAULT-CORE (priorize seções ${secoes.join(', ')}) e no perfil ${perfil_adicas}:

Gere 1 mensagem pronta para enviar. Responda EXATAMENTE neste formato:

MENSAGEM: [a mensagem pronta para copiar e enviar]
ESTRUTURA: [nome da estrutura ou seção usada — ex: "Estrutura 8 - Pergunta Personalizada (§31.9)"]
MOTIVO: [1 linha curta explicando por que funciona]`;

    try {
        const message = await client.messages.create({
            model: 'claude-haiku-4-5-20251001',
            max_tokens: 400,
            system: systemPrompt,
            messages: [{ role: 'user', content: userMsg }],
        });

        const raw = message.content[0].text || '';
        const mensagemMatch = raw.match(/MENSAGEM:\s*(.+?)(?=ESTRUTURA:|$)/s);
        const estruturaMatch = raw.match(/ESTRUTURA:\s*(.+?)(?=MOTIVO:|$)/s);
        const motivoMatch = raw.match(/MOTIVO:\s*(.+)/s);

        return res.status(200).json({
            mensagem:  mensagemMatch  ? mensagemMatch[1].trim()  : raw.trim(),
            estrutura: estruturaMatch ? estruturaMatch[1].trim() : '',
            motivo:    motivoMatch    ? motivoMatch[1].trim()    : '',
        });
    } catch (err) {
        console.error('API error:', err);
        return res.status(500).json({ error: 'Erro ao gerar mensagem. Tente novamente.' });
    }
};
