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

// Converte array de respostas brutas em scores ADICAS e tipo MBTI
// Esperado: array de objetos { eixo, polo } vindos do front
// eixo: 'E'|'I'|'S'|'N'|'T'|'F'|'J'|'P'
//       'aventureiro'|'nao_aventureiro'|'divertido'|... etc.
function calcularResultados(respostas) {
    const mbtiCount = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };
    const adicas    = { aventureiro: 0, divertido: 0, inteligente: 0, confiavel: 0, ambicioso: 0, sexual: 0 };

    for (const r of respostas) {
        const a = r.a || r.polo || '';
        // MBTI
        if (mbtiCount[a] !== undefined) {
            mbtiCount[a]++;
        }
        // ADICAS positivos
        if (adicas[a] !== undefined) {
            adicas[a]++;
        }
        // ADICAS negativos são ignorados (score é contagem de respostas positivas)
    }

    const mbtiTipo =
        (mbtiCount.E >= mbtiCount.I ? 'E' : 'I') +
        (mbtiCount.S >= mbtiCount.N ? 'S' : 'N') +
        (mbtiCount.T >= mbtiCount.F ? 'T' : 'F') +
        (mbtiCount.J >= mbtiCount.P ? 'J' : 'P');

    return { mbtiTipo, adicas };
}

module.exports = async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { respostas = [], nome = '' } = req.body;

    if (!respostas.length) {
        return res.status(400).json({ error: 'Respostas não fornecidas.' });
    }

    const { mbtiTipo, adicas } = calcularResultados(respostas);
    const { core, mbti, relatorio } = loadVaults();

    const systemPrompt = [core, mbti, relatorio]
        .filter(Boolean)
        .join('\n\n---\n\n');

    const userMsg = `Gere o relatório do quiz para:

NOME: ${nome || 'você'}
MBTI_TIPO: ${mbtiTipo}
ADICAS_SCORES: ${JSON.stringify(adicas, null, 2)}

Siga exatamente o formato do VAULT-RELATORIO: [PERFIL] → [RAIO-X] → [O BLOQUEIO] → [O PRÓXIMO PASSO] → [CHAMADA].
Nenhuma seção extra. Nenhum texto fora dos blocos.`;

    try {
        const message = await client.messages.create({
            model: 'claude-haiku-4-5-20251001',
            max_tokens: 900,
            system: systemPrompt,
            messages: [{ role: 'user', content: userMsg }],
        });

        const relatorioGerado = message.content[0].text || '';

        return res.status(200).json({
            relatorio: relatorioGerado,
            mbti: mbtiTipo,
            adicas,
        });
    } catch (err) {
        console.error('generate-report error:', err);
        return res.status(500).json({ error: 'Erro ao gerar relatório.' });
    }
};
