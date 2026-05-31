# VAULT-EXEMPLOS-RELATORIO — Exemplos de Saída
> NÃO é system prompt. É material de validação e referência de qualidade.
> Use para: checar tom, tamanho, formato e consistência antes de subir para produção.
> Atualizar sempre que o formato do VAULT-RELATORIO mudar.

---

## COMO LER ESTES EXEMPLOS

Cada exemplo tem:
- **INPUT** — o que chega da API (MBTI + scores ADICAS + nome)
- **OUTPUT ESPERADO** — o relatório que a IA deve gerar
- **NOTA DE VALIDAÇÃO** — o que checar para confirmar que está correto

---

## EXEMPLO 1 — ENFP com Confiável baixo

### INPUT
```json
{
  "nome": "Rafael",
  "MBTI_TIPO": "ENFP",
  "ADICAS_SCORES": {
    "aventureiro": 6,
    "divertido": 7,
    "inteligente": 5,
    "confiavel": 1,
    "ambicioso": 3,
    "sexual": 5
  }
}
```

### OUTPUT ESPERADO

**[PERFIL]**
Rafael, você é um ENFP — a Faísca.

**[RAIO-X]**
Você cria química do zero. Em 20 minutos de conversa ela já está rindo, animada e querendo saber mais. Aventureiro e Divertido no nível máximo — o encontro com você é sempre uma história para contar. Isso é um ativo real. A maioria dos homens nunca vai ter essa capacidade de tornar o momento inesquecível.

O problema aparece depois. Você aquece, avança, cria a faísca — e some. Não por descaso: você está sempre em movimento, sempre no próximo projeto, na próxima pessoa, na próxima ideia. Mas ela não sabe disso. Para ela, o sumiço parece desinteresse.

Você já viveu essa cena: encontro incrível, química absurda, ela claramente interessada — e uma semana depois nada avançou. Não porque ela desistiu. Porque você não deu sequência.

**[O BLOQUEIO]**
O problema não é falta de atração. O problema é que você cria expectativa alta e entrega inconsistência. Ela se animou com a faísca — e a faísca apagou sem avisar.

**[O PRÓXIMO PASSO]**
Esta semana: no dia seguinte ao encontro, manda uma mensagem antes das 11h. Uma frase. Não explica o sumiço, não pede desculpa, não pergunta como ela está. Só retoma — como se a conversa nunca tivesse parado.

**[CHAMADA]**
Existe um método para transformar a energia que você já tem em resultados consistentes — sem perder o que te faz único. Homens com o seu perfil costumam ser os que mais surpreendem quando param de desperdiçar o próprio potencial.
Você vai continuar sendo inesquecível por uma noite — ou vai começar a ser o cara que ela não quer perder?

---

### NOTA DE VALIDAÇÃO — EXEMPLO 1
- [x] Bloqueio único: Confiável (score 1 — menor)
- [x] MBTI explica o porquê: ENFP é espontâneo por natureza, não por malícia
- [x] Tom: direto, sem condescendência, sem "jornada"
- [x] [RAIO-X] ≤ 120 palavras ✓
- [x] [PRÓXIMO PASSO] é executável esta semana, específico, sem abstração
- [x] [CHAMADA] não cita preço, não usa "compre", termina com tensão
- [x] Zero emojis, zero bullets no corpo

---

## EXEMPLO 2 — ISTJ com Sexual baixo

### INPUT
```json
{
  "nome": "Marcos",
  "MBTI_TIPO": "ISTJ",
  "ADICAS_SCORES": {
    "aventureiro": 3,
    "divertido": 4,
    "inteligente": 6,
    "confiavel": 8,
    "ambicioso": 7,
    "sexual": 1
  }
}
```

### OUTPUT ESPERADO

**[PERFIL]**
Marcos, você é um ISTJ — a Rocha.

**[RAIO-X]**
Você é o homem mais confiável que ela vai encontrar. Quando você diz que vai aparecer, você aparece. Quando você promete algo, acontece. Ela percebe isso rápido — e em mundo de homens inconsistentes, isso pesa muito. Confiável e Ambicioso no nível máximo são ativos que a maioria dos homens não tem.

O problema é que confiabilidade sem tensão cria segurança, não desejo. Ela confia em você. Respeita você. E coloca você no mesmo lugar mental que um irmão mais velho. Não por falta de qualidade — por excesso de previsibilidade.

Você já sentiu isso: ela gosta de você, gosta de sair com você, conta as coisas para você — mas quando o assunto avança para algo mais, ela recua. Não porque não te quer. Porque nunca sentiu aquela faísca que diz que tem algo além da amizade.

**[O BLOQUEIO]**
O problema não é que falta valor. O problema é que você nunca criou tensão. Ela não sabe que você a deseja — porque você nunca deixou isso claro de forma alguma.

**[O PRÓXIMO PASSO]**
Esta semana: na próxima vez que estiverem juntos, olha nos olhos dela por dois segundos a mais do que o normal. Sem desviar. Sem explicar. Sem sorrir forçado. Só segura o olhar. Vê o que acontece depois disso.

**[CHAMADA]**
O método para o seu perfil usa exatamente o que você já tem — consistência e presença — e adiciona o único elemento que falta. Não é sobre mudar quem você é. É sobre parar de esconder o que você sente.
A pergunta é simples: quantas vezes mais você vai ser o cara em quem ela confia — sem ser o cara que ela escolhe?

---

### NOTA DE VALIDAÇÃO — EXEMPLO 2
- [x] Bloqueio único: Sexual (score 1 — menor, empate com Aventureiro=3 mas Sexual tem prioridade pela regra do VAULT-RELATORIO)
- [x] MBTI explica o porquê: ISTJ é ultra-confiável por natureza — cria porto seguro, não tensão
- [x] Tom: direto, masculino, sem didatismo sobre MBTI
- [x] [RAIO-X] ≤ 120 palavras ✓
- [x] [PRÓXIMO PASSO] físico, específico, sem abstração — executável hoje
- [x] [CHAMADA] termina com pergunta que incomoda
- [x] Zero emojis, zero bullets no corpo

---

## EXEMPLO 3 — ENTJ com Divertido baixo

### INPUT
```json
{
  "nome": "Bruno",
  "MBTI_TIPO": "ENTJ",
  "ADICAS_SCORES": {
    "aventureiro": 5,
    "divertido": 2,
    "inteligente": 7,
    "confiavel": 6,
    "ambicioso": 8,
    "sexual": 5
  }
}
```

### OUTPUT ESPERADO

**[PERFIL]**
Bruno, você é um ENTJ — o Comandante.

**[RAIO-X]**
Você sabe o que quer e vai atrás. Ambicioso no nível máximo, Inteligente acima da média — quando você entra numa sala, tem presença. Ela percebe que esse homem tem direção. Isso atrai mulheres de alto valor de forma passiva, sem você precisar fazer nada explícito.

O ponto cego é que você conduz tudo como uma negociação. O encontro vira eficiente. A conversa vira produtiva. E ela vai embora respeitando você — mas sem sentir aquela leveza que faz ela querer voltar. Não porque você foi grosseiro. Porque você esqueceu que sedução não é uma meta a ser executada.

Isso já aconteceu com você: encontro ótimo na sua cabeça, ele cumpriu todos os objetivos, ela claramente gostou de conversar — e não rolou segunda vez. O encontro foi bom demais para ser lembrado como especial.

**[O BLOQUEIO]**
O problema não é falta de presença. O problema é que você nunca soltou o controle. Ela passou a noite inteira com um homem que nunca riu de si mesmo.

**[O PRÓXIMO PASSO]**
Esta semana: no próximo encontro, conte uma história onde você saiu perdendo — algo que deu errado e foi engraçado. Uma frase de autocrítica com leveza. Não para parecer humilde. Para mostrar que você não precisa ser perfeito para ser o prêmio.

**[CHAMADA]**
Existe um ajuste específico para o seu perfil que não muda nada do que você já construiu — só adiciona o elemento que transforma respeito em desejo. É menor do que parece. O impacto não é.
Você já tem tudo que atrai. Falta o que faz ela ficar.

---

### NOTA DE VALIDAÇÃO — EXEMPLO 3
- [x] Bloqueio único: Divertido (score 2 — menor)
- [x] MBTI explica o porquê: ENTJ tende a conduzir tudo como execução de meta
- [x] Tom: não diminui o usuário, parte do que ele tem de forte
- [x] [PRÓXIMO PASSO] comportamental e específico — "conte uma história onde saiu perdendo"
- [x] [CHAMADA] última linha é afirmação com tensão implícita
- [x] Nenhuma seção extra além das 5 do formato

---

## CHECKLIST DE VALIDAÇÃO GERAL

Antes de aprovar qualquer saída da IA, confirme:

| Critério | Verificar |
|---|---|
| Formato | 5 blocos na ordem certa: PERFIL → RAIO-X → BLOQUEIO → PRÓXIMO PASSO → CHAMADA |
| Bloqueio | Apenas 1 traço ADICAS identificado como problema |
| MBTI | Explica o porquê do bloqueio — não descreve o tipo genericamente |
| Tom | Masculino, direto — sem "jornada", "potencial", "autêntico", "crescimento" |
| Tamanho | RAIO-X ≤ 120 palavras; PRÓXIMO PASSO ≤ 3 linhas |
| Ação | PRÓXIMO PASSO é executável esta semana, sem abstração |
| CTA | Não cita preço, não usa "compre/adquira", termina com tensão |
| Visual | Zero emojis; zero bullets no corpo do texto |

---

*VAULT-EXEMPLOS-RELATORIO v1.0 | Validação de saída | Quiz Breno Carrera | Mai/2026*
