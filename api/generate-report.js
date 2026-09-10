const Anthropic = require('@anthropic-ai/sdk');
const fs = require('fs');
const path = require('path');

const client = new Anthropic({ apiKey: (process.env.ANTHROPIC_API_KEY || '').trim() });

function loadVaults() {
    const base = path.join(__dirname, '..', 'vault');
    const read = (name) => {
        const p = path.join(base, name);
        return fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : '';
    };
    return {
        core:      read('VAULT-CORE.md'),
        mbti:      read('VAULT-MBTI.md'),
        relatorio: read('VAULT-RELATORIO.md'),
    };
}

module.exports = async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    // Recebe os scores JA calculados pelo quiz-logic.js (uma fonte so da verdade)
    const { mbtiTipo = '', adicas = {}, archetype = '', nome = '' } = req.body;
    if (!mbtiTipo || !Object.keys(adicas).length) {
        return res.status(400).json({ error: 'Scores nao fornecidos.' });
    }

    const { core, mbti, relatorio } = loadVaults();
    const systemPrompt = [core, mbti, relatorio].filter(Boolean).join('\n\n---\n\n');

    const userMsg = `Gere o relatorio do quiz para:
NOME: ${nome || 'voce'}
ARQUETIPO: ${archetype}
MBTI_TIPO: ${mbtiTipo}
ADICAS_SCORES: ${JSON.stringify(adicas, null, 2)}
Siga exatamente o formato do VAULT-RELATORIO: [PERFIL] -> [RAIO-X] -> [O BLOQUEIO] -> [O PROXIMO PASSO] -> [CHAMADA].
Nenhuma secao extra. Nenhum texto fora dos blocos.`;

    try {
        const message = await client.messages.create({
            model: 'claude-haiku-4-5-20251001',
            max_tokens: 1700,
            system: systemPrompt,
            messages: [{ role: 'user', content: userMsg }],
        });
        const relatorioGerado = message.content[0].text || '';
        return res.status(200).json({ relatorio: relatorioGerado, mbti: mbtiTipo, adicas });
    } catch (err) {
        console.error('generate-report error:', err);
        return res.status(500).json({ error: 'Erro ao gerar relatorio.' });
    }
};
