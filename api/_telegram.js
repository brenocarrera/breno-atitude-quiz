// Aviso no Telegram (usa o bot que o Breno já tem).
// Variáveis que precisam existir na Vercel (projeto do quiz):
//   TELEGRAM_BOT_TOKEN       - o token do bot
//   TELEGRAM_GROUP_CHAT_ID   - o id do grupo que recebe os avisos
//   TELEGRAM_ALERT_THREAD_ID - (opcional) o número do tópico dentro do grupo
// Se as variáveis não existirem, o aviso é só registrado no log da Vercel (nunca quebra o quiz).
// O arquivo começa com "_" para a Vercel não tratá-lo como uma rota pública.
'use strict';

async function avisarTelegram(texto) {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chat = process.env.TELEGRAM_GROUP_CHAT_ID;
    if (!token || !chat) {
        console.error('[telegram] TELEGRAM_BOT_TOKEN / TELEGRAM_GROUP_CHAT_ID não configurados; aviso NÃO enviado:', String(texto).slice(0, 300));
        return false;
    }
    try {
        const corpo = { chat_id: chat, text: String(texto).slice(0, 3500) };
        if (process.env.TELEGRAM_ALERT_THREAD_ID) corpo.message_thread_id = Number(process.env.TELEGRAM_ALERT_THREAD_ID);
        const r = await fetch('https://api.telegram.org/bot' + token + '/sendMessage', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(corpo),
        });
        if (!r.ok) { console.error('[telegram] o Telegram recusou o aviso (resposta ' + r.status + ')'); return false; }
        return true;
    } catch (e) {
        console.error('[telegram] erro ao enviar aviso');
        return false;
    }
}

module.exports = { avisarTelegram };
