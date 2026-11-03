// Checagem automática do quiz que está no ar. A Vercel chama esta rota sozinha 1 vez por dia
// (veja "crons" no vercel.json). Se algo estiver errado, avisa no Telegram. Só lê; não grava nada.
// Opcional: a variável CRON_SECRET (a Vercel manda sozinha no cabeçalho) protege a rota de chamadas de fora.
const { checarNoAr } = require('./_checar-quiz');
const { avisarTelegram } = require('./_telegram');

const URL_PUBLICA = process.env.QUIZ_URL_PUBLICA || 'https://oxy-quizz.breno-atitude.com';

module.exports = async function handler(req, res) {
    const segredo = process.env.CRON_SECRET;
    if (segredo && req.headers.authorization !== 'Bearer ' + segredo) return res.status(401).json({ error: 'nao autorizado' });

    const r = await checarNoAr(URL_PUBLICA);
    if (r.falhou) {
        const problemas = r.itens.filter(i => !i.ok).map(i => '- ' + i.nome + ': ' + (i.msg || '')).join('\n');
        await avisarTelegram('🚨 QUIZ: a checagem automática encontrou problema no quiz que está no ar (' + URL_PUBLICA + ')\n' + problemas);
    }
    return res.status(200).json({ ok: !r.falhou, itens: r.itens });
};
