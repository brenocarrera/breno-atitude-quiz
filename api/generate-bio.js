const Anthropic = require('@anthropic-ai/sdk');
const fs = require('fs');
const path = require('path');

const client = new Anthropic({ apiKey: (process.env.ANTHROPIC_API_KEY || '').trim() });

// Mapa arquétipo → perfil ADICAS composto
const ADICAS_MAP = {
    niceguy:    { perfil: 'DI', secoes: ['§31.5', '§31.8', '§34'] },
    alfa:       { perfil: 'AC', secoes: ['§31.3', '§31.4', '§33'] },
    provocador: { perfil: 'DS', secoes: ['§31.2', '§31.6', '§32'] },
    direto:     { perfil: 'CA', secoes: ['§31.3', '§37'] },
};

function loadVault() {
    const corePath  = path.join(__dirname, '..', 'vault', 'VAULT-CORE.md');
    const mbtiPath  = path.join(__dirname, '..', 'vault', 'VAULT-MBTI.md');
    const exPath    = path.join(__dirname, '..', 'vault', 'VAULT-EXEMPLOS.md');
    const core    = fs.existsSync(corePath)  ? fs.readFileSync(corePath,  'utf8') : '';
    const mbti    = fs.existsSync(mbtiPath)  ? fs.readFileSync(mbtiPath,  'utf8') : '';
    const exemplos= fs.existsSync(exPath)    ? fs.readFileSync(exPath,    'utf8') : '';
    return { core, mbti, exemplos };
}

/**
 * Extrai do VAULT-MBTI apenas as seções relevantes para o tipo MBTI do usuário:
 * - Os 4 eixos (seção 1) — sempre incluídos (~800 tokens)
 * - O bloco do tipo específico (ex: ### INTJ) — ~150 tokens
 * - O mapa rápido tabela (seção 3) — ~200 tokens
 * Total: ~1.150 tokens vs 4.455 do arquivo completo
 */
function getMbtiRelevante(mbti, mbtiTipo) {
    if (!mbti || !mbtiTipo) return '';
    const linhas = mbti.split('\n');
    const secoes = [];

    // Seção 1 — Os 4 eixos (sempre)
    const ini1 = linhas.findIndex(l => l.startsWith('## 1. OS 4 EIXOS'));
    const fim1 = linhas.findIndex((l, i) => i > ini1 && l.startsWith('## 2.'));
    if (ini1 !== -1 && fim1 !== -1) secoes.push(linhas.slice(ini1, fim1).join('\n'));

    // Bloco do tipo específico (ex: ### INTJ)
    const tipoTag = `### ${mbtiTipo}`;
    const iniTipo = linhas.findIndex(l => l.startsWith(tipoTag));
    if (iniTipo !== -1) {
        const fimTipo = linhas.findIndex((l, i) => i > iniTipo + 1 && l.startsWith('### '));
        const blocoTipo = linhas.slice(iniTipo, fimTipo !== -1 ? fimTipo : iniTipo + 12).join('\n');
        secoes.push(blocoTipo);
    }

    // Seção 3 — Mapa rápido (tabela)
    const ini3 = linhas.findIndex(l => l.startsWith('## 3. MAPA RÁPIDO'));
    const fim3 = linhas.findIndex((l, i) => i > ini3 && l.startsWith('## 4.'));
    if (ini3 !== -1 && fim3 !== -1) secoes.push(linhas.slice(ini3, fim3).join('\n'));

    return secoes.join('\n\n---\n\n');
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

/**
 * Parser robusto das bios geradas pela IA.
 * Tolera: separador "|||" OU blocos numerados "BIO 1:/2:/3:".
 * Remove: cabeçalhos markdown ("# ..."), linhas "---" e título antes da 1ª bio.
 */
function parseBios(raw) {
    let txt = (raw || '').trim();

    // 1) Remove tudo antes do primeiro marcador de bio (cabeçalho/título/markdown)
    const primeiroBio = txt.search(/BIO\s*\d*\s*:/i);
    if (primeiroBio > 0) txt = txt.slice(primeiroBio);

    // 2) Tenta separar por "|||"; se não houver, separa por "BIO N:" / "BIO:"
    let blocos = txt.includes('|||')
        ? txt.split('|||')
        : txt.split(/(?=BIO\s*\d*\s*:)/i);

    blocos = blocos.map(b => b.trim()).filter(Boolean);

    const bios = blocos.map(b => {
        // Aceita "BIO:", "BIO 1:" etc. como início
        const bioMatch       = b.match(/BIO\s*\d*\s*:\s*(.+?)(?=ESTRUTURA\s*:|$)/is);
        const estruturaMatch = b.match(/ESTRUTURA\s*:\s*(.+?)(?=MOTIVO\s*:|$)/is);
        const motivoMatch    = b.match(/MOTIVO\s*:\s*(.+)/is);
        let bio = bioMatch ? bioMatch[1].trim() : b;
        // Limpa resíduos markdown/título que possam ter sobrado na 1ª bio
        bio = bio.replace(/^#+\s.*$/gm, '').replace(/^-{3,}\s*$/gm, '').trim();
        return {
            bio,
            estrutura: estruturaMatch ? estruturaMatch[1].trim() : '',
            motivo:    motivoMatch    ? motivoMatch[1].trim()    : '',
        };
    }).filter(b => b.bio); // descarta blocos vazios

    return bios;
}

module.exports = async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { archetype, mbtiTipo = '', adicas = {}, userData } = req.body;
    const { nome = '', idade = '', cidade = '', altura = '', apps = [], signo = '', ultimoDate = '' } = userData || {};
    const appsTxt = Array.isArray(apps) ? apps.join(', ') : (apps || '');

    const mapping = ADICAS_MAP[archetype] || ADICAS_MAP.direto;
    const { core, mbti, exemplos } = loadVault();
    const fewShot     = getExemplos(exemplos, mapping.secoes);
    const mbtiRecorte = getMbtiRelevante(mbti, mbtiTipo); // só seções necessárias

    // Monta traços ADICAS mais fortes e mais fracos para o prompt
    const adicasEntries = Object.entries(adicas).sort((a, b) => b[1] - a[1]);
    const tracosFort  = adicasEntries.slice(0, 2).map(([k]) => k).join(' e ') || mapping.perfil;
    const tracosFraco = adicasEntries.slice(-1).map(([k]) => k).join('') || '';

    const systemPrompt = (core && mbtiRecorte)
        ? `${core}\n\n---\n\n${mbtiRecorte}\n\n---\n\nEXEMPLOS DE REFERÊNCIA (few-shot):\n${fewShot}`
        : core
            ? `${core}\n\n---\n\nEXEMPLOS DE REFERÊNCIA (few-shot):\n${fewShot}`
            : 'Você cria bios masculinas para Tinder que geram atração genuína. Máximo 3 linhas, sem clichês, sem emojis.';

    const userMsg = `CONTEXTO DO USUÁRIO (use para enriquecer o tom — NUNCA copie esses dados crus na bio):
Tipo MBTI: ${mbtiTipo || 'não identificado'}
Traços ADICAS mais fortes: ${tracosFort}
Traço ADICAS mais fraco: ${tracosFraco}
Idade: ${idade || 'n/d'}
Cidade: ${cidade || 'n/d'}
Altura: ${altura || 'n/d'}
Apps que usa: ${appsTxt || 'n/d'}
Signo: ${signo || 'n/d'}
Tempo desde o último date: ${ultimoDate || 'n/d'}

Com base no VAULT-CORE (especialmente §2 — 5 Estruturas de Bio), no VAULT-MBTI (perfil ${mbtiTipo}) e nos traços ADICAS acima:

1. Gere 3 bios para Tinder. Cada bio deve:
   - Usar o contexto acima apenas para CALIBRAR o tom — jamais escrever idade, cidade, altura ou signo literalmente na bio
   - Ter no máximo 3 linhas
   - Amplificar os traços mais fortes (${tracosFort}) do perfil deste usuário
   - Variar a estrutura: use estruturas diferentes do §2 para cada uma
   - Ser específica — sem clichês (adoro viajar, apaixonado por, amante de)
   - Sem emojis

2. Para cada bio, indique em 1 linha curta: "Estrutura usada" e "Por que funciona"

REGRAS DE FORMATO (obrigatórias):
- NÃO escreva título, cabeçalho, introdução ou markdown (nada de "#", "BIO 1:", "---").
- NÃO numere as bios.
- Comece a resposta DIRETO no primeiro "BIO:".
- Separe cada uma das 3 bios com uma linha contendo apenas: |||

Use EXATAMENTE este padrão, repetido 3 vezes:
BIO: [texto da bio]
ESTRUTURA: [nome da estrutura do §2]
MOTIVO: [1 frase curta]
|||`;

    try {
        const message = await client.messages.create({
            model: 'claude-haiku-4-5-20251001',
            max_tokens: 1400,
            system: systemPrompt,
            messages: [{ role: 'user', content: userMsg }],
        });

        const raw = message.content[0].text || '';
        const bios = parseBios(raw);

        if (bios.length < 3) {
            console.error('parse incompleto: apenas', bios.length, 'bio(s) extraídas.');
            return res.status(500).json({ error: 'incomplete_response', bios_found: bios.length });
        }

        return res.status(200).json({ bios: bios.slice(0, 3), perfil_adicas: mapping.perfil });
    } catch (err) {
        console.error('API error:', err);
        return res.status(500).json({ error: err.message || 'api_error' });
    }
};
