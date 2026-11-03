// verificar-no-ar.js - confere o quiz que está PUBLICADO (no ar). Só lê, não grava nada.
// Uso:  node verificar-no-ar.js                                  (confere https://oxy-quizz.breno-atitude.com)
//       node verificar-no-ar.js https://outro-endereco.vercel.app
// Termina com código 1 se alguma checagem falhar. A mesma checagem roda sozinha 1x por dia na Vercel
// (api/verificar-no-ar.js) e avisa no Telegram se falhar.
'use strict';
const { checarNoAr } = require('./api/_checar-quiz');

const BASE = process.argv[2] || 'https://oxy-quizz.breno-atitude.com';
checarNoAr(BASE).then(r => {
    console.log('\nCONFERINDO O QUIZ NO AR: ' + BASE + '\n');
    r.itens.forEach(i => console.log((i.ok ? '  OK      ' : '  FALHOU  ') + i.nome + (i.msg ? '  (' + i.msg + ')' : '')));
    console.log('\n' + (r.falhou ? 'RESULTADO: há problema no quiz que está no ar' : 'RESULTADO: o quiz no ar está certo') + '\n');
    process.exit(r.falhou ? 1 : 0);
});
