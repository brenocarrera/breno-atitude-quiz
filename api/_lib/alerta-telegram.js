// Avisa o grupo da Executiva no Telegram quando algo falha de verdade no quiz
// ou no Arquivo Alfa/Mike (tracking de tempos/cliques). Nunca lança erro:
// se o aviso falhar, só loga — não pode quebrar o fluxo do quiz.
async function avisarErroMikeAlfa(origem, detalhe) {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_GROUP_CHAT_ID;
    if (!token || !chatId) {
        console.error('[alerta-telegram] TELEGRAM_BOT_TOKEN/TELEGRAM_GROUP_CHAT_ID ausentes, nao avisei:', origem, detalhe);
        return;
    }
    const texto = `⚠️ Erro no Mike Alfa (quiz): ${origem}\n${detalhe}`.slice(0, 4000);
    try {
        await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({ chat_id: chatId, text: texto }),
        });
    } catch (err) {
        console.error('[alerta-telegram] falha ao enviar aviso:', err);
    }
}

module.exports = { avisarErroMikeAlfa };
