const Anthropic = require('@anthropic-ai/sdk');
const fs = require('fs');
const path = require('path');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Mapa arquétipo → perfil ADICAS composto
const ADICAS_MAP = {
    niceguy:    { perfil: 'DI', secoes: ['§31.5', '§31.8', '§34'] },
    alfa:       { perfil: 'AC', secoes: ['§31.3', '§31.4', '§33'] },
    provocador: { perfil: 'DS', secoes: ['§31.2', '§31.6', '§32'] },
    direto:     { perfil: 'CA', secoes: ['§31.3', '§37'] },
};

function loadVault() {
    const corePath = path.join(__dirname, '..', 'vault', 'VAULT-CORE.md');
    const exPath   = path.join(__dirname, '..', 'vault', 'VAULT-EXEMPLOS.md');
    const core = fs.existsSync(corePath) ? fs.readFileSync(corePath, 'utf8') : '';
    const exemplos = fs.existsSync(exPath) ? fs.readFileSync(exPath, 'utf8') : '';
    return { core, exemplos };
}

// Extrai até 3 blocos de exemplos relevantes por seção
function getExemplos(exemplos, secoes) {
    const blocos = exemplos.split(/^## EX-\d+\./m).filter(Boolean);
    const selecionados = [];
    for (const bloco of blocos) {
        if (selecionados.length >= 3) break;
        // Inclui EX-1 (aberturas) e EX-6 (elogios) sempre para bios
        if (bloco.includes('ABERT') || bloco.includes('ELOGIO') || bloco.includes('BIO') || bloco.includes('MENSAGENS INFALÍVEIS')) {
            selecionados.push(bloco.trim());
        }
    }
    return selecionados.join('\n\n---\n\n');
}

module.exports = async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { archetype, userData } = req.body;
    const { profissao = '', idade = '', altura = '' } = userData || {};

    const mapping = ADICAS_MAP[archetype] || ADICAS_MAP.direto;
    const { core, exemplos } = loadVault();
    const fewShot = getExemplos(exemplos, mapping.secoes);

    const systemPrompt = core
        ? `${core}\n\n---\n\nEXEMPLOS DE REFERÊNCIA (few-shot):\n${fewShot}`
        : 'Você cria bios masculinas para Tinder que geram atração genuína. Máximo 3 linhas, sem clichês, sem emojis.';

    const userMsg = `Perfil ADICAS do usuário: ${mapping.perfil}
Profissão: ${profissao}
Idade: ${idade} anos
Altura: ${altura} cm

Com base no VAULT-CORE (especialmente §2 — 5 Estruturas de Bio) e no perfil ADICAS ${mapping.perfil}:

1. Gere 3 bios para Tinder. Cada bio deve:
   - Usar profissão e idade do usuário
   - Ter no máximo 3 linhas
   - Refletir o perfil ${mapping.perfil} (traços dominantes do framework ADICAS)
   - Variar a estrutura: use estruturas diferentes do §2 para cada uma
   - Ser específica — sem clichês (adoro viajar, apaixonado por, amante de)
   - Sem emojis

2. Para cada bio, indique em 1 linha curta: "Estrutura usada" e "Por que funciona"

Formato de resposta — repita exatamente este padrão 3 vezes:
BIO: [texto da bio]
ESTRUTURA: [nome da estrutura do §2]
MOTIVO: [1 frase curta]
|||`;

    try {
        const message = await client.messages.create({
            model: 'claude-haiku-4-5-20251001',
            max_tokens: 800,
            system: systemPrompt,
            messages: [{ role: 'user', content: userMsg }],
        });

        const raw = message.content[0].text || '';
        const blocos = raw.split('|||').map(b => b.trim()).filter(Boolean).slice(0, 3);

        const bios = blocos.map(b => {
            const bioMatch = b.match(/BIO:\s*(.+?)(?=ESTRUTURA:|$)/s);
            const estruturaMatch = b.match(/ESTRUTURA:\s*(.+?)(?=MOTIVO:|$)/s);
            const motivoMatch = b.match(/MOTIVO:\s*(.+)/s);
            return {
                bio: bioMatch ? bioMatch[1].trim() : b,
                estrutura: estruturaMatch ? estruturaMatch[1].trim() : '',
                motivo: motivoMatch ? motivoMatch[1].trim() : '',
            };
        });

        while (bios.length < 3) bios.push({ bio: `${profissao}, ${idade} anos. Conversa real primeiro.`, estrutura: '', motivo: '' });

        return res.status(200).json({ bios, perfil_adicas: mapping.perfil });
    } catch (err) {
        console.error('API error:', err);
        const fallback = { bio: `${profissao}, ${idade} anos. Conversa real primeiro.`, estrutura: '', motivo: '' };
        return res.status(200).json({ bios: [fallback, fallback, fallback], perfil_adicas: mapping.perfil });
    }
};
