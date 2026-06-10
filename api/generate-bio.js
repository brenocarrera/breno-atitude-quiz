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

/**
 * Extrai o diagnóstico (antes do separador @@@ / da 1ª BIO).
 * Tolera com ou sem o rótulo "DIAGNOSTICO:" e limpa markdown residual.
 */
function parseDiagnostico(raw) {
    let txt = (raw || '').trim();
    // Pega tudo até o separador @@@ ou até o primeiro "BIO:"
    const corte = txt.search(/@@@|BIO\s*\d*\s*:|ELA_VE\s*:|ELA_SENTE\s*:|FECHO\s*:/i);
    let diag = corte > -1 ? txt.slice(0, corte) : '';
    diag = diag
        .replace(/^#+\s.*$/gm, '')               // remove títulos markdown
        .replace(/^-{3,}\s*$/gm, '')             // remove linhas ---
        .replace(/^\s*DIAGNOSTICO\s*:?/im, '')   // remove o rótulo (início de linha)
        .trim();
    return diag;
}

/**
 * Extrai os campos da ANALISE (ELA_VE / ELA_SENTE / FECHO).
 * Tolera ausencia: retorna {} e o front-end mantem o texto padrao.
 */
function parseAnalise(txt) {
    const t = (txt || '').trim();
    if (!t) return {};
    const out = { ela_ve: '', ela_sente: '', fecho: '', melhor_versao: '', ponto1: '', ponto2: '', ponto3: '', ponto4: '', ponto5: '',
                  cia_funcao: '', cia_avaliacao: '', cia_diagnostico: '', fbi_diagnostico: '', fbi_recomendacao: '', abertura: '' };
    const mapa = { ELA_VE: 'ela_ve', ELA_SENTE: 'ela_sente', FECHO: 'fecho',
                   MELHOR: 'melhor_versao', PONTO_A: 'ponto1', PONTO_B: 'ponto2', PONTO_C: 'ponto3', PONTO_D: 'ponto4', PONTO_E: 'ponto5',
                   CIA_FUNCAO: 'cia_funcao', CIA_AVALIACAO: 'cia_avaliacao', CIA_DIAGNOSTICO: 'cia_diagnostico',
                   FBI_DIAGNOSTICO: 'fbi_diagnostico', FBI_RECOMENDACAO: 'fbi_recomendacao', ABERTURA: 'abertura' };
    let atual = null;
    for (const linha of t.split('\n')) {
        const m = linha.match(/^\s*([A-Z_]{3,})\s*:\s*(.*)$/);
        if (m && mapa[m[1].toUpperCase()]) {
            atual = mapa[m[1].toUpperCase()];
            out[atual] = m[2].trim();
        } else if (atual) {
            // continuacao do campo anterior (texto multi-linha)
            out[atual] += (out[atual] ? ' ' : '') + linha.trim();
        }
    }
    for (const k in out) out[k] = out[k].replace(/[#*]/g, '').trim();
    return out;
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

Com base no VAULT-CORE (especialmente §2 — 5 Estruturas de Bio), no VAULT-MBTI (perfil ${mbtiTipo}) e nos traços ADICAS acima, gere: PRIMEIRO um bloco com o DIAGNÓSTICO seguido das 3 linhas ELA_VE / ELA_SENTE / FECHO; depois a linha @@@; depois as 3 BIOS.

1. DIAGNÓSTICO (máximo ~130 palavras, no tom do Breno do VAULT-CORE: direto, masculino, prático, sem rodeio):
   Baseado no tipo MBTI ${mbtiTipo}, nos traços fortes (${tracosFort}), no traço fraco (${tracosFraco}) e no arquétipo. Texto corrido em 3 partes encadeadas:
   (a) o PADRÃO DOMINANTE do cara no jogo (como ele age na sedução);
   (b) a MAIOR FORÇA dele;
   (c) a ARMADILHA / ponto cego que trava ele no contexto de sedução.
   Use o contexto (profissão/idade/apps) só para CALIBRAR — NUNCA cite dados crus (idade, cidade, altura, signo).

2. Gere 3 bios para Tinder. Cada bio deve:
   - Usar o contexto acima apenas para CALIBRAR o tom — jamais escrever idade, cidade, altura ou signo literalmente na bio
   - Ter no máximo 3 linhas
   - Amplificar os traços mais fortes (${tracosFort}) do perfil deste usuário
   - Variar a estrutura: use estruturas diferentes do §2 para cada uma
   - Ser específica — sem clichês (adoro viajar, apaixonado por, amante de)
   - Sem emojis

3. Para cada bio, indique em 1 linha curta: "Estrutura usada" e "Por que funciona"

4. ANÁLISE personalizada — as 3 linhas ELA_VE, ELA_SENTE e FECHO vêm LOGO APÓS o diagnóstico, no MESMO primeiro bloco, ANTES do @@@ (3 frases curtas, tom do Breno, calibradas pelo MBTI ${mbtiTipo} + traços fortes (${tracosFort}) + traço fraco (${tracosFraco}) + arquétipo — NUNCA cite dados crus):
   - ELA_VE: em 1 parágrafo (~100 palavras), o que as mensagens dele irradiam HOJE (como ela o percebe agora).
   - ELA_SENTE: em 1 parágrafo (~100 palavras), o que ela sente ao ler as mensagens dele hoje (por que falta urgência de encontro).
   - FECHO: 1 frase de virada, motivadora e específica do perfil dele (o que ele tem que 90% não têm, e o que falta é habilidade que se aprende).
   - MELHOR: 1 parágrafo (~100 palavras) sobre a MELHOR versão que ela poderia ver nele (o potencial desbloqueado do perfil ${mbtiTipo}).
   - PONTO_A a PONTO_E: 5 pontos de ajuste na comunicação, ESPECÍFICOS do perfil. Cada linha no formato exato "Título curto || o problema em 1 frase || o ajuste prático em 1 frase" — use || como separador das 3 partes.
   - CIA_FUNCAO: 1 linha — a função/papel que a CIA daria a esse perfil (ex: Analista de Inteligência, Operações de Campo, Recrutador), coerente com o MBTI ${mbtiTipo}.
   - CIA_AVALIACAO: ~100 palavras, tom de dossiê — avaliação do perfil numa "operação de campo de sedução": pontos fortes + a limitação central.
   - CIA_DIAGNOSTICO: ~80 palavras — diagnóstico operacional + a melhor função/treinamento que faltaria.
   - FBI_DIAGNOSTICO: ~100 palavras — leitura da Friendship Formula (Proximidade/Frequência/Duração/Intensidade) PARA esse perfil: o que ele constrói demais, o que falta, e o resultado com ela.
   - FBI_RECOMENDACAO: ~60 palavras — módulo de treinamento recomendado pro perfil.
   - ABERTURA: 1 primeira mensagem (abridor) pronta pra ele copiar e colar num match novo, calibrada pro perfil — leitura fria + pressuposição, sem elogio à aparência, sem "oi". 1 a 2 frases.

REGRAS DE FORMATO (obrigatórias):
- NÃO escreva título, cabeçalho ou markdown (nada de "#", "---").
- Comece a resposta DIRETO em "DIAGNOSTICO:".
- Separe o diagnóstico das bios com uma linha contendo apenas: @@@
- Não numere as bios. Separe cada uma das 3 bios com uma linha contendo apenas: |||

Use EXATAMENTE este formato (as linhas ELA_VE/ELA_SENTE/FECHO sao OBRIGATORIAS e vem ANTES do @@@):
DIAGNOSTICO: [texto corrido de até ~130 palavras]
ELA_VE: [~100 palavras]
ELA_SENTE: [~100 palavras]
FECHO: [1 frase]
MELHOR: [~100 palavras]
PONTO_A: [Título || problema || ajuste]
PONTO_B: [Título || problema || ajuste]
PONTO_C: [Título || problema || ajuste]
PONTO_D: [Título || problema || ajuste]
PONTO_E: [Título || problema || ajuste]
CIA_FUNCAO: [1 linha]
CIA_AVALIACAO: [~100 palavras]
CIA_DIAGNOSTICO: [~80 palavras]
FBI_DIAGNOSTICO: [~100 palavras]
FBI_RECOMENDACAO: [~60 palavras]
ABERTURA: [1-2 frases, abridor pronto]
@@@
BIO: [texto da bio]
ESTRUTURA: [nome da estrutura do §2]
MOTIVO: [1 frase curta]
|||
(repita o bloco BIO/ESTRUTURA/MOTIVO/||| exatamente 3 vezes)`;

    try {
        const message = await client.messages.create({
            model: 'claude-haiku-4-5-20251001',
            max_tokens: 3400,
            system: systemPrompt,
            messages: [{ role: 'user', content: userMsg }],
        });

        const raw = message.content[0].text || '';
        // Estrutura: [DIAGNOSTICO + ELA_VE/ELA_SENTE/FECHO] @@@ [3 BIOS]
        const partes = raw.split('@@@');
        const primeiro = partes[0] || '';
        const biosTxt  = partes.length > 1 ? partes.slice(1).join('@@@') : raw;
        const bios = parseBios(biosTxt);
        const diagnostico = parseDiagnostico(primeiro);
        // analise vem do primeiro bloco; se falhar, varre o texto todo (robustez)
        let analise = parseAnalise(primeiro);
        if (!analise.ela_ve && !analise.ela_sente && !analise.fecho) analise = parseAnalise(raw);

        if (bios.length < 3) {
            console.error('parse incompleto: apenas', bios.length, 'bio(s) extraídas.');
            return res.status(500).json({ error: 'incomplete_response', bios_found: bios.length });
        }

        return res.status(200).json({ bios: bios.slice(0, 3), diagnostico, analise, perfil_adicas: mapping.perfil });
    } catch (err) {
        console.error('API error:', err);
        return res.status(500).json({ error: err.message || 'api_error' });
    }
};
