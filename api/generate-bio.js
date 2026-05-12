const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const TEMPLATES = {
    niceguy:    'Direto ao ponto: não estou aqui pra impressionar. {profissao}, {idade} anos. Se você gosta de conversa com substância e sem jogos, é por aqui.',
    alfa:       'Não estou aqui pra agradar todo mundo — e tudo bem. {profissao}, {idade} anos. Se gosta de conversa real, continuamos. Se não, sem drama.',
    provocador: 'Aviso antes: sou daqueles que faz você rir quando menos espera. {profissao}, {idade} anos. Dica: minha segunda foto conta mais que a primeira.',
    direto:     'Objetivo: conversa real que vire encontro real. {profissao}, {idade} anos, {altura}cm. Se também cansou de papo vazio, começa com uma pergunta boa.',
};

module.exports = async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { archetype, userData } = req.body;
    const { profissao = '', idade = '', altura = '' } = userData || {};

    const base = (TEMPLATES[archetype] || TEMPLATES.direto)
        .replace('{profissao}', profissao)
        .replace('{idade}', idade)
        .replace('{altura}', altura);

    try {
        const message = await client.messages.create({
            model: 'claude-haiku-4-5-20251001',
            max_tokens: 420,
            system: 'Você cria bios masculinas para Tinder que geram atração genuína. Regras: máximo 3 linhas por bio, sem clichês (adoro viajar, apaixonado por, amante de), sem emojis, linguagem natural e específica ao usuário.',
            messages: [{
                role: 'user',
                content: `Arquétipo: ${archetype}
Profissão: ${profissao}
Idade: ${idade} anos
Bio-base (template): "${base}"

Gere 3 versões de bio para Tinder usando os dados acima. Cada versão deve:
- Usar a profissão e idade do usuário
- Variar o tom: 1ª direta, 2ª levemente provocadora, 3ª gentleman/sofisticada
- Ter no máximo 3 linhas
- Ser diferente uma da outra

Retorne APENAS as 3 bios separadas por "|||". Sem numeração, sem explicação.`,
            }],
        });

        const raw = message.content[0].text || '';
        const bios = raw.split('|||').map(b => b.trim()).filter(Boolean).slice(0, 3);
        while (bios.length < 3) bios.push(base);

        return res.status(200).json({ bios });
    } catch (err) {
        console.error('API error:', err);
        return res.status(200).json({ bios: [base, base, base] });
    }
};
