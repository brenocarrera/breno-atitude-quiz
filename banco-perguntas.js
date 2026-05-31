// Banco de 80 perguntas para o Quiz do Breno Carrera
// Distribuição:
// - 32 MBTI: 8 para E/I, 8 para S/N, 8 para T/F, 8 para J/P
// - 48 ADICAS: 8 para Aventureiro, 8 para Divertido, 8 para Inteligente, 8 para Confiável, 8 para Ambicioso, 8 para Sexual
// Tom: Masculino, direto, situações reais de paquera/relacionamento, sem clichês.

var BANCO_PERGUNTAS = [
    // ═══════════════════════════════════════
    // MBTI — EIXO E/I (8 perguntas)
    // ═══════════════════════════════════════
    {
        q: 'Você chega numa festa cheia onde não conhece quase ninguém além do anfitrião. Sua postura usual:',
        opts: [
            { t: 'Circulo pela festa, puxo assunto com quem parecer simpático e me apresento sem travar.', a: 'E' },
            { t: 'Fico perto do bar, faço contato visual e entro nas conversas dos grupos que já estão abertos.', a: 'E' },
            { t: 'Procuro um canto mais tranquilo, converso com o anfitrião e prefiro falar com uma pessoa de cada vez.', a: 'I' },
            { t: 'Observo o ambiente primeiro, espero alguém puxar assunto comigo ou fico no celular até me sentir confortável.', a: 'I' }
        ]
    },
    {
        q: 'No primeiro encontro, onde você se sente mais à vontade para conversar com ela?',
        opts: [
            { t: 'Um bar movimentado com música e bastante gente, onde a energia do lugar ajuda no ritmo do papo.', a: 'E' },
            { t: 'Uma mesa na calçada de uma rua movimentada, onde podemos comentar sobre as pessoas que passam.', a: 'E' },
            { t: 'Um restaurante silencioso e intimista, onde dá para ouvir cada palavra sem precisar falar alto.', a: 'I' },
            { t: 'Um parque tranquilo no fim de tarde, caminhando sem pressa e focando 100% na nossa conversa.', a: 'I' }
        ]
    },
    {
        q: 'Depois de um encontro intenso que durou a noite toda, como você se sente no dia seguinte?',
        opts: [
            { t: 'Energizado e animado para sair de novo ou encontrar amigos; a interação me deu um gás.', a: 'E' },
            { t: 'Com vontade de mandar mensagem logo de manhã e já planejar o próximo programa social.', a: 'E' },
            { t: 'Satisfeito, mas preciso de um tempo sozinho no meu canto para recarregar as energias e focar nas minhas coisas.', a: 'I' },
            { t: 'Prefiro passar o dia de boa, em silêncio, processando como foi o encontro antes de marcar qualquer outra coisa.', a: 'I' }
        ]
    },
    {
        q: 'Ela te chama para um evento de trabalho dela onde você não conhece ninguém. Você:',
        opts: [
            { t: 'Vou amarradão. Adoro conhecer gente nova e fazer networking não é problema para mim.', a: 'E' },
            { t: 'Aceito na hora, interajo com os colegas dela e ajudo a manter o clima social leve e integrado.', a: 'E' },
            { t: 'Vou para apoiar ela, mas prefiro ficar mais na minha, observando e conversando só quando falarem comigo.', a: 'I' },
            { t: 'Fico relutante. Prefiro propor que nos encontremos depois do evento para termos um momento só nosso.', a: 'I' }
        ]
    },
    {
        q: 'Uma conversa por mensagem com uma mulher está fluindo muito bem. Como você prefere continuar?',
        opts: [
            { t: 'Proponho logo uma ligação ou chamada de vídeo rápida para ver a energia dela em tempo real.', a: 'E' },
            { t: 'Mando áudios espontâneos contando histórias engraçadas e puxando ela para falar mais também.', a: 'E' },
            { t: 'Continuo nas mensagens de texto, desenvolvendo o assunto com calma antes de ir para o telefone.', a: 'I' },
            { t: 'Prefiro trocar poucas mensagens pontuais e marcar logo um encontro cara a cara, sem enrolação virtual.', a: 'I' }
        ]
    },
    {
        q: 'Em um grupo com amigos dela, você costuma se posicionar como:',
        opts: [
            { t: 'O cara que interage com todo mundo, conta histórias e assume o centro das atenções naturalmente.', a: 'E' },
            { t: 'O que puxa assunto com os amigos menos integrados para garantir que o clima fique leve.', a: 'E' },
            { t: 'O cara que fala menos, mas faz comentários cirúrgicos e presta atenção na dinâmica do grupo.', a: 'I' },
            { t: 'Aquele que fica de boa conversando com quem está mais perto, sem forçar simpatia com o grupo todo.', a: 'I' }
        ]
    },
    {
        q: 'Ela te manda: "Estou entediada em casa, o que você está fazendo?". Você responde:',
        opts: [
            { t: '"Vem pra cá, estou chamando uns amigos para tomar uma cerveja e ouvir um som aqui."', a: 'E' },
            { t: '"Vamos dar uma volta agora, comer alguma coisa ou ver o movimento na rua de um barzinho."', a: 'E' },
            { t: '"Estou assistindo a um filme legal aqui. Quer vir assistir comigo de boa?"', a: 'I' },
            { t: '"Estou lendo/trabalhando na minha. Mas se quiser bater um papo no telefone, estou livre."', a: 'I' }
        ]
    },
    {
        q: 'Como você costuma demonstrar interesse por ela em um ambiente público (ex: bar lotado)?',
        opts: [
            { t: 'Vou até a mesa dela diretamente, me apresento com confiança e inicio um papo descontraído.', a: 'E' },
            { t: 'Uso a aproximação de amigos em comum para criar uma conversa integrada entre os dois grupos.', a: 'E' },
            { t: 'Sustento o olhar de longe até ela dar um sinal claro de interesse antes de eu me aproximar.', a: 'I' },
            { t: 'Prefiro me posicionar perto dela no balcão do bar e esperar uma brecha sutil da situação para comentar algo.', a: 'I' }
        ]
    },

    // ═══════════════════════════════════════
    // MBTI — EIXO S/N (8 perguntas)
    // ═══════════════════════════════════════
    {
        q: 'Quando você tenta descobrir se ela está interessada em você num encontro, você foca em:',
        opts: [
            { t: 'Sinais claros e físicos: o toque dela em mim, a distância física, se ela sorri quando eu falo.', a: 'S' },
            { t: 'Detalhes práticos: se ela responde rápido no WhatsApp, se divide a conta, se aceita os convites sem dar desculpas.', a: 'S' },
            { t: 'A atmosfera implícita, a tensão sexual silenciosa no ar e o que ela demonstra apenas com o olhar.', a: 'N' },
            { t: 'A afinidade intelectual, o humor sarcástico compartilhado e a conexão mental além dos gestos visíveis.', a: 'N' }
        ]
    },
    {
        q: 'Ela te conta sobre um problema complexo que está tendo na família dela. Qual é sua reação imediata?',
        opts: [
            { t: 'Tento sugerir soluções práticas, objetivas e realistas para resolver o problema logo.', a: 'S' },
            { t: 'Pergunto sobre os detalhes concretos e a sequência dos fatos para entender a situação exata.', a: 'S' },
            { t: 'Tento decifrar a dinâmica emocional subjacente e o que está por trás da atitude de cada pessoa ali.', a: 'N' },
            { t: 'Mostro empatia pela situação dela e ajudo-a a enxergar o problema sob uma nova perspectiva de vida.', a: 'N' }
        ]
    },
    {
        q: 'O que te atrai mais na conversa de uma mulher logo de cara?',
        opts: [
            { t: 'Falar sobre o dia a dia, trabalho, planos práticos de viagens e coisas palpáveis que ambos gostamos.', a: 'S' },
            { t: 'O jeito direto e realista como ela se comunica, sem meias palavras ou necessidade de adivinhação.', a: 'S' },
            { t: 'A capacidade dela de entender metáforas, falar de ideias abstratas, teorias e temas profundos do mundo.', a: 'N' },
            { t: 'A criatividade dela ao criar cenários hipotéticos engraçados e brincar com ideias absurdas comigo.', a: 'N' }
        ]
    },
    {
        q: 'Vocês estão escolhendo um destino de viagem de final de semana juntos. Você prefere:',
        opts: [
            { t: 'Um destino clássico conhecido ou que tenha ótimas avaliações de conforto, logística e preço.', a: 'S' },
            { t: 'Uma praia ou serra com um roteiro bem definido de passeios práticos e restaurantes específicos.', a: 'S' },
            { t: 'Um lugar misterioso ou exótico que nenhum dos dois foi, para descobrirmos tudo no improviso.', a: 'N' },
            { t: 'Um refúgio isolado no meio do nada onde possamos conversar sobre a vida longe da correria urbana.', a: 'N' }
        ]
    },
    {
        q: 'Em relação à primeira impressão visual dela no encontro, o que você repara primeiro?',
        opts: [
            { t: 'Detalhes objetivos do visual: o corte da roupa, o perfume, se a produção combina com o local.', a: 'S' },
            { t: 'A postura física dela, a entonação da voz e a forma como ela se movimenta no ambiente.', a: 'S' },
            { t: 'A vibe geral e a energia que ela transmite — se ela parece segura, misteriosa ou ansiosa.', a: 'N' },
            { t: 'O brilho no olhar e a química subjetiva que se instala na mesa no primeiro minuto.', a: 'N' }
        ]
    },
    {
        q: 'Ela faz uma pergunta hipotética: "Se você pudesse ter qualquer superpoder por um dia, qual seria?". Você responde:',
        opts: [
            { t: 'Teletransporte ou voar, porque facilitaria muito a logística de viagens e do dia a dia corrido.', a: 'S' },
            { t: 'Invisibilidade ou ler mentes, por ser extremamente útil para negociar e resolver problemas da vida real.', a: 'S' },
            { t: 'Viajar no tempo, para decifrar enigmas históricos e analisar a evolução humana sob outra ótica.', a: 'N' },
            { t: 'Criar realidades paralelas para experimentar como as pessoas se comportariam sob novas leis da física.', a: 'N' }
        ]
    },
    {
        q: 'Quando você planeja um jantar romântico em casa, o que recebe mais a sua atenção?',
        opts: [
            { t: 'A receita exata, o ponto ideal do cozimento e a alta qualidade física dos ingredientes comprados.', a: 'S' },
            { t: 'A organização limpa da mesa, a iluminação do prato e a temperatura exata da bebida servida.', a: 'S' },
            { t: 'O clima estético geral: a playlist temática, a iluminação indireta e a história por trás do cardápio escolhido.', a: 'N' },
            { t: 'A experiência sensorial completa e como os sabores podem servir de gancho para conversas profundas.', a: 'N' }
        ]
    },
    {
        q: 'Ela comenta que gostaria de aprender algo totalmente novo na rotina dela. Você sugere:',
        opts: [
            { t: 'Um curso prático imediato: culinária, finanças aplicadas ou alguma habilidade física útil.', a: 'S' },
            { t: 'Um esporte de alta técnica (tênis, boxe, surf) onde ela consiga medir sua evolução prática.', a: 'S' },
            { t: 'Um curso de escrita, teatro ou história da arte para expandir a expressão e a mente dela.', a: 'N' },
            { t: 'Psicologia comportamental, linguagem corporal ou algo focado em decifrar a mente das pessoas.', a: 'N' }
        ]
    },

    // ═══════════════════════════════════════
    // MBTI — EIXO T/F (8 perguntas)
    // ═══════════════════════════════════════
    {
        q: 'Ela está reclamando muito sobre uma briga boba que teve com uma colega de trabalho. Você:',
        opts: [
            { t: 'Analiso a situação de forma fria e aponto quem está errada na história usando argumentos lógicos.', a: 'T' },
            { t: 'Digo que ela não deveria gastar energia mental com isso e proponho mudarmos de assunto rápido.', a: 'T' },
            { t: 'Ouço com atenção, valido os sentimentos dela e mostro que entendo o motivo de ela estar chateada.', a: 'F' },
            { t: 'Me coloco no lugar dela e foco em dar apoio emocional em vez de tentar resolver a situação para ela.', a: 'F' }
        ]
    },
    {
        q: 'O que pesa mais para você decidir se continua saindo com alguém ou não?',
        opts: [
            { t: 'A compatibilidade objetiva de rotinas, metas financeiras e se ela demonstra maturidade prática.', a: 'T' },
            { t: 'Se a relação faz sentido lógico para o meu momento de carreira e desenvolvimento pessoal atual.', a: 'T' },
            { t: 'A conexão emocional profunda, a química de pele e como me sinto confortável ao lado dela.', a: 'F' },
            { t: 'A generosidade que ela demonstra no dia a dia e a sintonia de valores humanos que compartilhamos.', a: 'F' }
        ]
    },
    {
        q: 'Ela faz um comentário sutilmente crítico sobre o seu estilo de se vestir. Como você reage internamente?',
        opts: [
            { t: 'Avalio se a crítica faz sentido prático; se fizer, anoto mentalmente; se não, descarto e ignoro.', a: 'T' },
            { t: 'Respondo racionalmente, defendendo minhas escolhas com base no conforto e na minha rotina de trabalho.', a: 'T' },
            { t: 'Fico um pouco incomodado, tentando entender a intenção dela ou se ela está perdendo a atração física.', a: 'F' },
            { t: 'Brinco com a situação para suavizar o clima, mas reflito se magoei ela com meu visual desleixado.', a: 'F' }
        ]
    },
    {
        q: 'Vocês discordam sobre um assunto polêmico (ex: valores morais ou política) durante o encontro. Você:',
        opts: [
            { t: 'Defendo minha posição com fatos e lógica firme, mesmo que isso cause um debate mais quente na mesa.', a: 'T' },
            { t: 'Exponho meus argumentos de forma clara e deixo claro que discordo dela de forma respeitosa mas inflexível.', a: 'T' },
            { t: 'Mudo de assunto suavemente para manter a harmonia do encontro e evitar tensões desnecessárias.', a: 'F' },
            { t: 'Tento entender o contexto de vida que a faz pensar assim, valorizando o sentimento dela por trás da opinião.', a: 'F' }
        ]
    },
    {
        q: 'Ela diz: "Acho que a gente não está na mesma página sobre o que quer do futuro". Você responde:',
        opts: [
            { t: '"Ok. Vamos listar onde nossas ideias divergem e analisar de forma lógica se há viabilidade."', a: 'T' },
            { t: '"Entendi. Se as nossas expectativas práticas são diferentes, o mais racional é cada um seguir seu rumo."', a: 'T' },
            { t: '"Fico chateado ao ouvir isso. Como você está se sentindo em relação a nós dois ultimamente?"', a: 'F' },
            { t: '"Nossa conexão é forte e acredito que vale mais do que regras rígidas. Quero entender o que você sente que falta."', a: 'F' }
        ]
    },
    {
        q: 'Qual é a sua postura em relação a discussões de relacionamento (DRs)?',
        opts: [
            { t: 'Acho uma perda de tempo a menos que o objetivo seja traçar um plano de ação prático e objetivo.', a: 'T' },
            { t: 'Prefiro que cada um se afaste para esfriar a cabeça e resolver os problemas com a razão, sem drama.', a: 'T' },
            { t: 'Acho fundamentais para limpar o clima e garantir que os sentimentos de ambos estejam protegidos.', a: 'F' },
            { t: 'Participo ativamente, expondo minhas vulnerabilidades e buscando entender a dor dela sem julgamento.', a: 'F' }
        ]
    },
    {
        q: 'Ela te dá um presente caro, mas que você achou visualmente feio ou sem utilidade prática. O que você faz?',
        opts: [
            { t: 'Agradeço o carinho, mas sou sincero sobre meu gosto e pergunto se podemos trocar por algo útil.', a: 'T' },
            { t: 'Aceito educadamente e tento encontrar alguma aplicação prática onde o presente funcione no meu dia.', a: 'T' },
            { t: 'Fico emocionado com a dedicação e o gasto que ela teve para me agradar, e uso mesmo sem curtir.', a: 'F' },
            { t: 'Elogio o gesto carinhoso dela e guardo com carinho, focando no valor simbólico e afetivo do presente.', a: 'F' }
        ]
    },
    {
        q: 'Ela desabafa que está exausta com o estresse do trabalho dela e cogita pedir demissão. Você:',
        opts: [
            { t: 'Ajudo ela a calcular uma reserva financeira e planejar os próximos passos de mercado racionalmente.', a: 'T' },
            { t: 'Pergunto de forma analítica quais são as alternativas práticas de carreira que ela tem no momento.', a: 'T' },
            { t: 'Digo que a saúde mental dela vem primeiro e que ela tem meu apoio emocional incondicional.', a: 'F' },
            { t: 'Escuto o desabafo completo, preparo um ambiente relaxante e ajudo ela a se desligar do estresse hoje.', a: 'F' }
        ]
    },

    // ═══════════════════════════════════════
    // MBTI — EIXO J/P (8 perguntas)
    // ═══════════════════════════════════════
    {
        q: 'Como você costuma estruturar o primeiro encontro com uma mulher?',
        opts: [
            { t: 'Defino o local exato com antecedência, reservo a mesa e programo a logística de horários.', a: 'J' },
            { t: 'Mapeio um roteiro completo: bar X para o drink inicial, restaurante Y em seguida, reduzindo imprevistos.', a: 'J' },
            { t: 'Escolho apenas a região de bares e combino de decidirmos onde entrar conforme a vibe da hora.', a: 'P' },
            { t: 'Deixo o rumo em aberto, marcando apenas um local geral de encontro e improvisando as decisões depois.', a: 'P' }
        ]
    },
    {
        q: 'Ela te manda mensagem de surpresa propondo um programa legal para daqui a uma hora. Como você reage?',
        opts: [
            { t: 'Fico desconfortável; prefiro convites planejados antes para eu conseguir organizar minhas tarefas.', a: 'J' },
            { t: 'Checo meus compromissos de trabalho do dia; se tiver qualquer pendência, recuso sem neura.', a: 'J' },
            { t: 'Acho a ideia irrecusável, me arrumo rapidamente e aceito o convite de última hora na empolgação.', a: 'P' },
            { t: 'Adoro sair da rotina e prefiro que os melhores momentos aconteçam de forma espontânea mesmo.', a: 'P' }
        ]
    },
    {
        q: 'Se o encontro de vocês atrasar porque o trânsito travou ou o restaurante escolhido está lotado, você:',
        opts: [
            { t: 'Fico estressado e impaciente por ver o planejamento de horários ir por água abaixo.', a: 'J' },
            { t: 'Mudo o foco rapidamente para o plano B que eu já tinha pré-selecionado por precaução.', a: 'J' },
            { t: 'Lido numa boa, dou risada com ela e aproveito para puxar papo no carro ou na fila de espera.', a: 'P' },
            { t: 'Vejo o atraso como parte da experiência e aproveito para mudarmos o destino de forma espontânea.', a: 'P' }
        ]
    },
    {
        q: 'Ao organizar o seu apartamento antes de receber ela pela primeira vez, você:',
        opts: [
            { t: 'Deixo o local impecável, limpando tudo no detalhe e arrumando cada objeto no seu lugar.', a: 'J' },
            { t: 'Sigo um checklist de limpeza rápido para garantir ordem visual em todos os cômodos principais.', a: 'J' },
            { t: 'Dou apenas uma geral rápida de organização nos pontos mais visíveis, sem obsessão por poeira.', a: 'P' },
            { t: 'Limpo o essencial de forma descontraída na hora que ela manda mensagem avisando que está saindo.', a: 'P' }
        ]
    },
    {
        q: 'Como você gerencia suas metas profissionais e pessoais no médio e longo prazo?',
        opts: [
            { t: 'Tenho metas e prazos bem definidos de carreira, investimentos e estilo de vida, e sigo o plano.', a: 'J' },
            { t: 'Prefiro tomar decisões estruturais cedo para ter segurança, previsibilidade e estabilidade na vida.', a: 'J' },
            { t: 'Mantenho meus planos abertos e flexíveis, me adaptando conforme novas oportunidades surgem.', a: 'P' },
            { t: 'Prefiro focar em viver bem o presente e deixar que minhas metas futuras tomem rumo organicamente.', a: 'P' }
        ]
    },
    {
        q: 'Ela te convida para passar um feriado na praia, mas avisa que não reservou hotel nem planejou nada. Você:',
        opts: [
            { t: 'Só vou se fecharmos a hospedagem com antecedência; viajar sem saber onde vai dormir não é meu perfil.', a: 'J' },
            { t: 'Assumo a liderança e faço uma busca rápida em sites de reservas para garantir nosso hotel antes de sair.', a: 'J' },
            { t: 'Coloco as malas no carro, pego a estrada e decido onde hospedar quando chegarmos perto da praia.', a: 'P' },
            { t: 'Acho a ideia de improvisar um acampamento ou achar um canto na sorte muito empolgante e divertida.', a: 'P' }
        ]
    },
    {
        q: 'Você prometeu ligar para ela em um dia específico da semana combinado anteriormente. Como você age?',
        opts: [
            { t: 'Coloco um aviso no celular ou anoto na agenda para ligar pontualmente no horário combinado.', a: 'J' },
            { t: 'Cumpro o combinado de forma disciplinada, pois levo a palavra dada muito a sério.', a: 'J' },
            { t: 'Ligo no momento que der vontade durante o dia de forma livre, sem me prender a horários rígidos.', a: 'P' },
            { t: 'Se o dia estiver corrido, deixo para o dia seguinte de boa ou mando um texto improvisado de última hora.', a: 'P' }
        ]
    },
    {
        q: 'Ela cancela o encontro de vocês poucas horas antes do combinado por cansaço. Você:',
        opts: [
            { t: 'Fico incomodado por perder o espaço reservado na agenda e tento logo definir uma nova data exata.', a: 'J' },
            { t: 'Aproveito para adiantar minhas tarefas profissionais ou arrumações pendentes que estavam paradas.', a: 'J' },
            { t: 'Fico tranquilo e uso a folga de surpresa para descansar, ler ou fazer algo que aparecer na hora.', a: 'P' },
            { t: 'Mando: "Tudo bem, nos vemos depois" e deixo para remarcar nos próximos dias de forma natural.', a: 'P' }
        ]
    },

    // ═══════════════════════════════════════
    // ADICAS — AVENTUREIRO (8 perguntas)
    // ═══════════════════════════════════════
    {
        q: 'Qual é o seu final de semana ideal para programar com uma mulher que está conhecendo?',
        opts: [
            { t: 'Pegar a estrada sem destino exato, fazer uma trilha longa na mata e tomar banho de cachoeira.', a: 'aventureiro' },
            { t: 'Praticar algum esporte de aventura ou conhecer um lugar que dê frio na barriga e adrenalina.', a: 'aventureiro' },
            { t: 'Ficar no conforto de casa maratonando séries excelentes e pedindo comida de qualidade.', a: 'nao_aventureiro' },
            { t: 'Preparar um jantar calmo no meu apartamento, conversar com música boa e relaxar de verdade.', a: 'nao_aventureiro' }
        ]
    },
    {
        q: 'Num restaurante exótico com sabores incomuns e receitas exóticas de outros países, você:',
        opts: [
            { t: 'Escolho o prato mais diferente e picante do cardápio logo para ter uma nova experiência sensorial.', a: 'aventureiro' },
            { t: 'Proponho dividirmos duas opções estranhas do menu para testarmos novos gostos juntos na curiosidade.', a: 'aventureiro' },
            { t: 'Prefiro pedir um prato conhecido e seguro para garantir que a nossa refeição seja agradável.', a: 'nao_aventureiro' },
            { t: 'Analiso o menu com cautela e escolho a opção clássica e garantida indicada pelo garçom.', a: 'nao_aventureiro' }
        ]
    },
    {
        q: 'Ela te chama para ir a uma festa alternativa de última hora em um bairro que você nunca frequentou. Você:',
        opts: [
            { t: 'Aceito na hora. Gosto do mistério de explorar locais desconhecidos e viver momentos espontâneos.', a: 'aventureiro' },
            { t: 'Me arrumo rápido e vou com a mente aberta para conhecer novos ambientes e pessoas diferentes.', a: 'aventureiro' },
            { t: 'Agradeço o convite, mas recuso; prefiro ir aos bares e baladas que já frequento e conheço a qualidade.', a: 'nao_aventureiro' },
            { t: 'Sugiro irmos ao nosso local preferido de costume para garantir que a noite de encontro seja divertida.', a: 'nao_aventureiro' }
        ]
    },
    {
        q: 'Como você lida com imprevistos graves numa viagem a dois (ex: hotel cancelado ou tempo fechado)?',
        opts: [
            { t: 'Lido como parte da aventura; improviso alugando um carro para conhecer outras praias ou estradas vizinhas.', a: 'aventureiro' },
            { t: 'Transformo o caos em piada, compro bebidas e crio uma situação divertida de acampamento no quarto.', a: 'aventureiro' },
            { t: 'Fico frustrado e estressado com a quebra da rotina planejada e o dinheiro perdido na viagem.', a: 'nao_aventureiro' },
            { t: 'Resolvo a parte prática nos canais oficiais de forma séria e priorizo voltar para a nossa cidade.', a: 'nao_aventureiro' }
        ]
    },
    {
        q: 'Qual é a sua atitude em relação à ideia de mudar de cidade, estado ou país repentinamente por uma oportunidade?',
        opts: [
            { t: 'Acho estimulante; se fizer sentido para o meu crescimento, arrumo as malas e vou sem medo do desconhecido.', a: 'aventureiro' },
            { t: 'Gosto de desafios geográficos e novidades frequentes; a estabilidade excessiva no mesmo lugar me entedia.', a: 'aventureiro' },
            { t: 'Prefiro estabelecer minhas raízes de moradia num local sólido e manter uma vida confortável lá.', a: 'nao_aventureiro' },
            { t: 'Mudar de vida exige anos de reflexão e planejamento; prezo muito pela estabilidade da minha base atual.', a: 'nao_aventureiro' }
        ]
    },
    {
        q: 'Ao ser inserido no círculo de amigos dela, que tem um estilo de vida bem diferente do seu, você se posiciona:',
        opts: [
            { t: 'Curioso e receptivo; adoro ouvir sobre visões de mundo diferentes das minhas e entender o estilo deles.', a: 'aventureiro' },
            { t: 'Conversador e ativo; busco puxar assunto com as pessoas mais exóticas dali apenas para aprender algo novo.', a: 'aventureiro' },
            { t: 'Seletivo; prefiro interagir com quem possui hábitos parecidos com os meus e focar em papos mais conhecidos.', a: 'nao_aventureiro' },
            { t: 'Mais reservado no começo, observando o comportamento das pessoas antes de me integrar ou expor opiniões.', a: 'nao_aventureiro' }
        ]
    },
    {
        q: 'Ela te propõe virar a noite na praia conversando e bebendo, mesmo com vocês dois trabalhando cedo no dia seguinte. Você:',
        opts: [
            { t: 'Topo na hora; a falta de sono a gente resolve depois, mas a memória de uma noite livre fica gravada.', a: 'aventureiro' },
            { t: 'Vou com tudo, compro energéticos e transformo a loucura numa experiência inesquecível a dois.', a: 'aventureiro' },
            { t: 'Recuso de forma direta; meu rendimento e foco profissional no dia seguinte são minhas prioridades.', a: 'nao_aventureiro' },
            { t: 'Proponho deixarmos para fazer esse programa no sábado à noite para não comprometer a produtividade profissional de ninguém.', a: 'nao_aventureiro' }
        ]
    },
    {
        q: 'Qual tipo de programação cultural você prefere sugerir a ela?',
        opts: [
            { t: 'Ir a um festival independente de música alternativa ou uma exposição artística ousada e conceitual.', a: 'aventureiro' },
            { t: 'Fazer um tour noturno por locais históricos com lendas urbanas ou mistérios arqueológicos.', a: 'aventureiro' },
            { t: 'Ir ao cinema ver a grande estreia de bilheteria ou assistir ao lançamento do ano na TV de casa.', a: 'nao_aventureiro' },
            { t: 'Assistir a uma peça de teatro clássica consagrada ou a um show de stand-up tradicional recomendado.', a: 'nao_aventureiro' }
        ]
    },

    // ═══════════════════════════════════════
    // ADICAS — DIVERTIDO (8 perguntas)
    // ═══════════════════════════════════════
    {
        q: 'Quando a conversa com ela no encontro tem um momento de silêncio ou tensão, você costuma:',
        opts: [
            { t: 'Falar alguma bobagem absurda ou fazer uma piada sobre a nossa própria falta de assunto para quebrar o gelo.', a: 'divertido' },
            { t: 'Fazer um comentário irônico leve sobre a mesa vizinha ou imitar a pose de alguém para fazê-la rir.', a: 'divertido' },
            { t: 'Manter a compostura tranquila e puxar um assunto interessante e maduro sobre notícias ou mercado.', a: 'nao_divertido' },
            { t: 'Respeitar o silêncio com naturalidade, esperando que um papo com mais conteúdo volte de forma orgânica.', a: 'nao_divertido' }
        ]
    },
    {
        q: 'Ela esbarra no copo e derrama um pouco de bebida na mesa por acidente. Como você reage?',
        opts: [
            { t: 'Brinco dizendo que ela não aguenta beber ou que está nervosa demais perto de mim, abrindo um sorriso.', a: 'divertido' },
            { t: 'Faço uma cena cômica de drama fingindo que foi um acidente internacional gravíssimo.', a: 'divertido' },
            { t: 'Chamo o garçom com polidez imediata para limpar o local e ofereço guardanapos de papel.', a: 'nao_divertido' },
            { t: 'Digo que acidentes acontecem e ajudo a secar a mesa com calma e objetividade.', a: 'nao_divertido' }
        ]
    },
    {
        q: 'Ela te manda uma foto descabelada e engraçada dela mesma pela manhã no WhatsApp. Você responde:',
        opts: [
            { t: 'Mando uma figurinha tirando sarro ou tiro uma selfie minha fazendo careta pior ainda para responder.', a: 'divertido' },
            { t: 'Mando uma piada provocativa e ácida sobre o visual dela, mostrando que adoro esse lado sem filtro.', a: 'divertido' },
            { t: 'Elogio ela sinceramente, dizendo que ela continua linda mesmo com o cabelo bagunçado.', a: 'nao_divertido' },
            { t: 'Respondo desejando um ótimo dia de trabalho e pergunto como está a agenda dela hoje.', a: 'nao_divertido' }
        ]
    },
    {
        q: 'Qual costuma ser a sua assinatura ao trocar mensagens no WhatsApp com ela?',
        opts: [
            { t: 'Uso de ironia leve, trocadilhos bobos, memes internos e provocações rápidas para manter o astral alto.', a: 'divertido' },
            { t: 'Gravo áudios com piadas sobre situações ridículas que estou vendo na rua ou imito vozes cômicas.', a: 'divertido' },
            { t: 'Conversas focadas, bem estruturadas, descobrindo como foi o dia dela de forma atenciosa e direta.', a: 'nao_divertido' },
            { t: 'Prefiro trocar textos breves e objetivos apenas para definir o horário e local do nosso próximo encontro.', a: 'nao_divertido' }
        ]
    },
    {
        q: 'Durante uma caminhada de vocês na rua, passa um artista performático esquisito. Sua atitude:',
        opts: [
            { t: 'Entro na onda rápida da apresentação dele, faço uma brincadeira e puxo ela para participar junto rindo.', a: 'divertido' },
            { t: 'Faço uma paródia engraçada do artista no ouvido dela, comentando a cena de forma cômica.', a: 'divertido' },
            { t: 'Observo a performance com respeito social, dou uma contribuição financeira se curtir e sigo andando.', a: 'nao_divertido' },
            { t: 'Continuo focado no assunto principal da nossa conversa sem me distrair muito com o movimento da rua.', a: 'nao_divertido' }
        ]
    },
    {
        q: 'Em relação a usar apelidos íntimos no início da relação de vocês, você prefere:',
        opts: [
            { t: 'Apelidos zombeteiros baseados em gafes que um dos dois cometeu e que viraram piada interna.', a: 'divertido' },
            { t: 'Usar codinomes engraçados que só vocês dois compreendem o sentido humorístico por trás.', a: 'divertido' },
            { t: 'Tratar por nomes carinhosos tradicionais (como querida, linda) ou simplesmente chamá-la pelo próprio nome.', a: 'nao_divertido' },
            { t: 'Evitar o uso de qualquer apelido íntimo até que a relação esteja declarada como séria e duradoura.', a: 'nao_divertido' }
        ]
    },
    {
        q: 'O que você pensa sobre a ideia de jogarem um jogo de tabuleiro ou cartas descontraído num encontro a dois?',
        opts: [
            { t: 'Acho excelente; crio regras absurdas e trapaças cômicas no meio da partida só para provocar risadas.', a: 'divertido' },
            { t: 'Gosto muito; a competitividade misturada com provocações divertidas gera uma ótima tensão e riso.', a: 'divertido' },
            { t: 'Acho infantil para um encontro amoroso; prefiro focar em conversar olho no olho tomando um vinho.', a: 'nao_divertido' },
            { t: 'Aceito jogar, mas sigo as regras de forma séria e focada em jogar bem e honestamente.', a: 'nao_divertido' }
        ]
    },
    {
        q: 'Ela está num dia tenso, estressada com problemas de rotina. Qual é a sua forma de animar o dia dela?',
        opts: [
            { t: 'Envio uma enxurrada de vídeos cômicos ou figurinhas ridículas que sei que arrancam risadas dela.', a: 'divertido' },
            { t: 'Apareço de surpresa com a comida favorita dela e faço uma dancinha idiota na porta para desarmar o estresse dela.', a: 'divertido' },
            { t: 'Mando mensagem perguntando se ela prefere espaço para descansar ou se quer que eu resolva alguma pendência prática.', a: 'nao_divertido' },
            { t: 'Ligo para escutar o desabafo dela com paciência, oferecendo conselhos maduros e analíticos sobre os problemas.', a: 'nao_divertido' }
        ]
    },

    // ═══════════════════════════════════════
    // ADICAS — INTELIGENTE (8 perguntas)
    // ═══════════════════════════════════════
    {
        q: 'Quando ela te pergunta sobre o seu último livro lido ou filme marcante, você descreve:',
        opts: [
            { t: 'Uma obra profunda que me trouxe reflexões complexas sobre psicologia, comportamento humano ou sociedade.', a: 'inteligente' },
            { t: 'Um documentário científico denso ou livro técnico de alto nível sobre mercado ou inovação.', a: 'inteligente' },
            { t: 'Um blockbuster divertido, filme de ação leve ou livro de entretenimento rápido para relaxar a mente.', a: 'nao_inteligente' },
            { t: 'Explico que não leio tanto ultimamente por conta da correria e prefiro consumir conteúdos fáceis na TV.', a: 'nao_inteligente' }
        ]
    },
    {
        q: 'Num bar, a conversa de vocês entra em temas mais densos como inteligência artificial ou filosofia. Você:',
        opts: [
            { t: 'Desenvolvo argumentos profundos, cito dados de mercado e apresento visões complexas sobre o assunto.', a: 'inteligente' },
            { t: 'Adoro debater esses conceitos, desafiando a opinião dela e contra-argumentando com raciocínio lógico.', a: 'inteligente' },
            { t: 'Prefiro propor mudarmos de assunto antes que o clima de paquera vire um debate acadêmico chato.', a: 'nao_inteligente' },
            { t: 'Faço um comentário superficial ou piada rápida sobre o tema e peço mais uma rodada de bebidas.', a: 'nao_inteligente' }
        ]
    },
    {
        q: 'Qual dessas opções você escolheria para um encontro cultural diferenciado?',
        opts: [
            { t: 'Ir a uma galeria de arte contemporânea complexa ou museu histórico para analisarmos as obras juntos.', a: 'inteligente' },
            { t: 'Um planetário ou exposição tecnológica interativa que desperte discussões e reflexões científicas.', a: 'inteligente' },
            { t: 'Visitar um local com cenários bonitos e coloridos focando em tirar fotos estéticas legais para redes sociais.', a: 'nao_inteligente' },
            { t: 'Passear no shopping tradicional, olhar vitrines, tomar um sorvete e comer na praça de alimentação.', a: 'nao_inteligente' }
        ]
    },
    {
        q: 'Ela demonstra interesse por um assunto técnico da sua área profissional e te faz uma pergunta difícil. Você:',
        opts: [
            { t: 'Explico o tema com clareza conceitual, usando analogias inteligentes e aprofundando o funcionamento das coisas.', a: 'inteligente' },
            { t: 'Entro em detalhes técnicos interessantes da engrenagem do negócio, mostrando o impacto daquilo no mundo.', a: 'inteligente' },
            { t: 'Resumo tudo em uma frase rápida para não parecer cansativo ou chato no momento de descontração.', a: 'nao_inteligente' },
            { t: 'Dou uma resposta evasiva brincando que é um segredo profissional valioso e mudo de foco.', a: 'nao_inteligente' }
        ]
    },
    {
        q: 'Qual é o nível de relevância do intelecto de uma mulher na atração que você sente por ela?',
        opts: [
            { t: 'Fator crítico; se ela não tiver ideias profundas e conversa rica, meu interesse físico diminui rapidamente.', a: 'inteligente' },
            { t: 'Alto; adoro ser desafiado mentalmente por mulheres que trazem fatos novos e raciocínio afiado para a mesa.', a: 'inteligente' },
            { t: 'Secundário; valorizo mais a simpatia dela, o bom humor diário e a sintonia física do casal.', a: 'nao_inteligente' },
            { t: 'Prefiro uma conversa simples e leve, sem necessidade de debates intelectuais cansativos nos encontros.', a: 'nao_inteligente' }
        ]
    },
    {
        q: 'Ela te pede uma indicação de podcast interessante para escutar na rotina do trânsito. Você indica:',
        opts: [
            { t: 'Um programa focado em ciência, comportamento humano ou geopolítica que ensine conceitos densos.', a: 'inteligente' },
            { t: 'Entrevistas longas e analíticas de grandes empresários ou intelectuais debatendo ideias complexas.', a: 'inteligente' },
            { t: 'Um podcast de piadas, esporte amador ou conversas cotidianas leves para dar risada no trânsito.', a: 'nao_inteligente' },
            { t: 'Um canal focado em entretenimento, fofocas de celebridades ou bate-papo descompromissado de famosos.', a: 'nao_inteligente' }
        ]
    },
    {
        q: 'Diante de uma polêmica complexa que virou notícia no dia, qual costuma ser a sua atitude?',
        opts: [
            { t: 'Pesquiso sobre o contexto histórico e os fatos comprovados de várias fontes antes de formar minha opinião.', a: 'inteligente' },
            { t: 'Analiso os vieses psicológicos das pessoas envolvidas na polêmica para entender o comportamento das massas.', a: 'inteligente' },
            { t: 'Concordo com o ponto de vista geral dela se ela comentar comigo, sem buscar me aprofundar muito na notícia.', a: 'nao_inteligente' },
            { t: 'Comento brevemente sobre como a internet gosta de criar polêmicas por tudo e proponho falarmos de nós.', a: 'nao_inteligente' }
        ]
    },
    {
        q: 'Como você enxerga a busca pelo seu próprio aprimoramento individual?',
        opts: [
            { t: 'Dedico tempo expressivo estudando livros conceituais, fazendo formações densas e buscando conhecimento técnico.', a: 'inteligente' },
            { t: 'Mapeio meus próprios comportamentos e padrões mentais de forma crítica para evoluir meu intelecto sempre.', a: 'inteligente' },
            { t: 'Acredito em aprender vivendo as situações práticas da vida no dia a dia, sem necessidade de tanta teoria.', a: 'nao_inteligente' },
            { t: 'Acho que a evolução pessoal acontece no seu próprio tempo, sem necessidade de metas rígidas ou obsessões.', a: 'nao_inteligente' }
        ]
    },

    // ═══════════════════════════════════════
    // ADICAS — CONFIÁVEL (8 perguntas)
    // ═══════════════════════════════════════
    {
        q: 'Você prometeu buscar ela no aeroporto à noite, mas surgiu uma reunião profissional crítica de última hora. Você:',
        opts: [
            { t: 'Organizo um motorista particular executivo de minha inteira confiança para buscá-la em segurança e aviso ela antes.', a: 'confiavel' },
            { t: 'Delego a reunião profissional ou ajusto meu horário corporativo para cumprir a promessa que fiz a ela.', a: 'confiavel' },
            { t: 'Mando mensagem informando o imprevisto profissional em cima da hora e sugiro que ela chame um Uber comum.', a: 'nao_confiavel' },
            { t: 'Peço desculpas rápidas, sugiro que ela vá de táxi e prometo compensar pagando o jantar no final de semana.', a: 'nao_confiavel' }
        ]
    },
    {
        q: 'Como você trata segredos ou confidências íntimas que ela compartilha sobre a história dela?',
        opts: [
            { t: 'Mantenho discrição absoluta, não comento com absolutamente ninguém e ajo como um cofre seguro para ela.', a: 'confiavel' },
            { t: 'Escuto com empatia, dou apoio emocional e mostro que ela tem em mim um porto seguro para desabafar.', a: 'confiavel' },
            { t: 'Divido os detalhes com meu melhor amigo de confiança se achar a história engraçada ou curiosa demais.', a: 'nao_confiavel' },
            { t: 'Esqueço rápido os detalhes da conversa por não dar relevância para assuntos e fofocas familiares de terceiros.', a: 'nao_confiavel' }
        ]
    },
    {
        q: 'Ela está muito doente ou debilitada por uma virose forte e precisa de suporte na rotina. Sua atitude:',
        opts: [
            { t: 'Vou à casa dela levando medicamentos e alimentação saudável, cuidando de tudo para ela descansar.', a: 'confiavel' },
            { t: 'Ligo com frequência e mando mensagens perguntando se ela precisa que eu compre algo no mercado ou farmácia.', a: 'confiavel' },
            { t: 'Falo para ela priorizar o descanso e me mandar mensagem se a situação médica ficar muito grave.', a: 'nao_confiavel' },
            { t: 'Desejo melhoras por texto rápido e mantenho minha rotina normal de trabalho e treinos de academia.', a: 'nao_confiavel' }
        ]
    },
    {
        q: 'Vocês marcaram um almoço com a família dela com semanas de antecedência, mas o dia está ensolarado e você preferia ir à praia. Você:',
        opts: [
            { t: 'Cumpro o compromisso agendado, chego pontualmente e me mostro atencioso e simpático com os familiares dela.', a: 'confiavel' },
            { t: 'Vou com o foco claro de demonstrar respeito pela família dela e fortalecer a base do nosso relacionamento.', a: 'confiavel' },
            { t: 'Invento um imprevisto profissional de última hora para conseguir escapar do almoço e ir fazer meu programa.', a: 'nao_confiavel' },
            { t: 'Vou sem vontade nenhuma, demonstrando pressa para ir embora e checando o celular toda hora na mesa.', a: 'nao_confiavel' }
        ]
    },
    {
        q: 'Qual é o seu nível de abertura e verdade sobre o seu histórico de relações e situação de vida no início?',
        opts: [
            { t: 'Sou honesto e claro sobre o meu passado e minhas condições profissionais, sem florear ou criar personagens.', a: 'confiavel' },
            { t: 'Respondo às dúvidas dela com total transparência para garantirmos uma relação iniciada sem mentiras.', a: 'confiavel' },
            { t: 'Omito fatos que possam manchar minha imagem e exagero meus sucessos para parecer mais interessante.', a: 'nao_confiavel' },
            { t: 'Dou respostas vagas ou mudo de assunto para manter um clima de mistério e não me expor de verdade.', a: 'nao_confiavel' }
        ]
    },
    {
        q: 'Ela te liga chorando de madrugada por conta de uma crise forte de ansiedade ou pesadelo. Você:',
        opts: [
            { t: 'Atendo imediatamente, converso com tom de voz protetor até ela se acalmar e se preciso vou até lá.', a: 'confiavel' },
            { t: 'Fico na linha com paciência ouvindo ela desabafar o tempo necessário para restaurar a segurança dela.', a: 'confiavel' },
            { t: 'Mantenho meu celular no silencioso para não afetar meu sono e respondo pela manhã com um texto calmo.', a: 'nao_confiavel' },
            { t: 'Digo que ela precisa se acalmar e dormir, e proponho conversarmos sobre isso no dia seguinte com calma.', a: 'nao_confiavel' }
        ]
    },
    {
        q: 'Como você lida quando comete um erro que claramente chateia ou magoa ela?',
        opts: [
            { t: 'Assumo a culpa na hora, peço desculpas honestas e mudo minha atitude prática de verdade.', a: 'confiavel' },
            { t: 'Converso abertamente com ela para entender onde falhei e buscarmos uma solução de dinâmica juntos.', a: 'confiavel' },
            { t: 'Tento diminuir a relevância do meu erro, argumentando que ela está fazendo muito drama por pouco.', a: 'nao_confiavel' },
            { t: 'Fico na defensiva imediata e trago à tona erros do passado dela para rebater a crítica e me livrar da culpa.', a: 'nao_confiavel' }
        ]
    },
    {
        q: 'Ela deixa a bolsa pessoal ou pertences valiosos com você enquanto vai ao banheiro em um bar movimentado. Você:',
        opts: [
            { t: 'Mantenho atenção constante e guardo os pertences dela com cuidado próximo a mim o tempo todo.', a: 'confiavel' },
            { t: 'Seguro as coisas dela de bom grado, demonstrando que sou um parceiro confiável para pequenos apoios.', a: 'confiavel' },
            { t: 'Deixo as coisas sobre a cadeira vaga e vou conversar com conhecidos longe dali sem ficar vigiando.', a: 'nao_confiavel' },
            { t: 'Reclamo que carregar bolsas é incômodo para mim e tento passar o encargo para outra pessoa segurar.', a: 'nao_confiavel' }
        ]
    },

    // ═══════════════════════════════════════
    // ADICAS — AMBICIOSO (8 perguntas)
    // ═══════════════════════════════════════
    {
        q: 'Quando você comenta sobre a sua carreira ou negócios num encontro, qual é a sua postura usual?',
        opts: [
            { t: 'Falo com clareza e paixão sobre meus planos de expansão, novos projetos e metas de alta liderança.', a: 'ambicioso' },
            { t: 'Deixo evidente que meu foco principal está em acumular patrimônio sólido e crescer financeiramente com vigor.', a: 'ambicioso' },
            { t: 'Explico minhas tarefas profissionais de forma resumida e trago o assunto para meus momentos de lazer.', a: 'nao_ambicioso' },
            { t: 'Mostro que vejo o trabalho apenas como meio de subsistência e priorizo ter paz e tempo livre.', a: 'nao_ambicioso' }
        ]
    },
    {
        q: 'Como você costuma gerenciar os seus horários vagos e tempo de folga na semana?',
        opts: [
            { t: 'Uso boa parte do tempo livre estudando sobre investimentos, lendo livros de negócios ou estruturando ideias.', a: 'ambicioso' },
            { t: 'Acordo mais cedo ou reduzo horas de sono se for preciso para conciliar treinos, metas de trabalho e estudos.', a: 'ambicioso' },
            { t: 'Foco totalmente em relaxar, encontrar amigos, jogar ou assistir a esportes para desconectar a mente do trabalho.', a: 'nao_ambicioso' },
            { t: 'Prefiro seguir uma rotina sem pressões de produtividade pessoal fora da minha jornada comercial.', a: 'nao_ambicioso' }
        ]
    },
    {
        q: 'Ela te conta que sonha em abrir uma startup própria e te pede opiniões sinceras. Você diz:',
        opts: [
            { t: '"Excelente ideia. Monte uma estrutura de custos, estude a concorrência a fundo e se dedique 100% para vencer."', a: 'ambicioso' },
            { t: '"Crie um planejamento de vendas agressivo para dominar o nicho rápido. Posso te apoiar a desenhar a visão."', a: 'ambicioso' },
            { t: '"Pense com cuidado; ter empresa gera estresse absurdo. Às vezes manter a estabilidade do emprego é melhor."', a: 'nao_ambicioso' },
            { t: '"Comece sem pressa e bem pequeno. O importante é o trabalho ser leve e não tirar o seu sono diário."', a: 'nao_ambicioso' }
        ]
    },
    {
        q: 'Ela reclama em tom sério de que você está trabalhando e estudando demais ultimamente. Você responde:',
        opts: [
            { t: '"Estou focado agora para colhermos resultados grandes amanhã e termos uma vida de alto padrão depois."', a: 'ambicioso' },
            { t: '"Minhas metas profissionais são muito relevantes para mim; gosto de me superar e crescer na minha área."', a: 'ambicioso' },
            { t: '"Tem razão. Vou dar uma desacelerada no ritmo e programar um final de semana completo de lazer com você."', a: 'nao_ambicioso' },
            { t: '"O trabalho é só uma parte da vida; prefiro equilibrar as coisas e focar nos nossos momentos juntos."', a: 'nao_ambicioso' }
        ]
    },
    {
        q: 'Que características profissionais e financeiras você busca em uma parceira amorosa?',
        opts: [
            { t: 'Uma mulher focada na carreira dela, determinada e que queira crescer de vida lado a lado comigo.', a: 'ambicioso' },
            { t: 'Alguém que tenha metas financeiras claras e que me empurre para cima para sermos um casal forte no mercado.', a: 'ambicioso' },
            { t: 'Uma parceira tranquila que priorize a paz do relacionamento e não viva estressada por metas corporativas.', a: 'nao_ambicioso' },
            { t: 'Alguém simples e estável, que preze mais pelas folgas e pequenas felicidades do que por status ou posses.', a: 'nao_ambicioso' }
        ]
    },
    {
        q: 'Onde você planeja estar com clareza daqui a 5 anos?',
        opts: [
            { t: 'Liderando meu segmento de mercado, com patrimônio pessoal relevante e novos negócios rodando.', a: 'ambicioso' },
            { t: 'Ocupando um cargo de alta gestão ou tendo alcançado minha independência financeira estruturada.', a: 'ambicioso' },
            { t: 'Vivendo de forma confortável e estável, com saúde física e uma rotina tranquila perto de quem amo.', a: 'nao_ambicioso' },
            { t: 'Viajando bastante pelo mundo de férias, curtindo os hobbies sem neuras de crescimento corporativo.', a: 'nao_ambicioso' }
        ]
    },
    {
        q: 'Ela quer propor que façam uma atividade educativa rápida juntos no sábado. Você sugere:',
        opts: [
            { t: 'Um workshop prático de finanças pessoais, investimentos em ativos ou oratória comercial.', a: 'ambicioso' },
            { t: 'Um seminário focado em networking profissional com especialistas conceituados.', a: 'ambicioso' },
            { t: 'Uma oficina amadora de pintura, cerâmica ou culinária rápida focada em descontração física.', a: 'nao_ambicioso' },
            { t: 'Um curso relaxante de meditação, respiração ou yoga para tirar o peso do estresse de trabalho.', a: 'nao_ambicioso' }
        ]
    },
    {
        q: 'Como você lida com as suas economias mensais e investimentos?',
        opts: [
            { t: 'Estudo o mercado financeiro de perto, diversifico meus aportes e busco oportunidades de alta rentabilidade.', a: 'ambicioso' },
            { t: 'Separo uma verba agressiva todo mês com foco estrito em acelerar minha aposentadoria ou metas ousadas.', a: 'ambicioso' },
            { t: 'Deixo meu dinheiro guardado em fundos conservadores sugeridos pelo banco, sem perder meu tempo com isso.', a: 'nao_ambicioso' },
            { t: 'Invisto pouco e gasto bastante com jantares, roupas e saídas porque a vida precisa ser aproveitada hoje.', a: 'nao_ambicioso' }
        ]
    },

    // ═══════════════════════════════════════
    // ADICAS — SEXUAL (8 perguntas)
    // ═══════════════════════════════════════
    {
        q: 'Vocês estão no primeiro encontro em um bar escurinho e reservado. Como você cria atração física?',
        opts: [
            { t: 'Toco de leve no braço ou joelho dela durante as risadas, prolongando o contato por alguns segundos.', a: 'sexual' },
            { t: 'Aproximo-me do ouvido dela para sussurrar um comentário com tom de voz mais pausado e seguro.', a: 'sexual' },
            { t: 'Mantenho distância respeitosa focando no contato de olhar prolongado e sorrisos para gerar conexão.', a: 'nao_sexual' },
            { t: 'Espero uma atitude física clara de aproximação vinda dela antes de ensaiar qualquer toque.', a: 'nao_sexual' }
        ]
    },
    {
        q: 'Ela faz uma piada ousada com duplo sentido sexual explícito no meio da conversa. Você:',
        opts: [
            { t: 'Devolvo na hora com outra provocação física ou olhar insinuante, deixando o desejo claro no ar.', a: 'sexual' },
            { t: 'Sorrio de canto de boca e digo: "Você gosta de brincar com o perigo, né?", sustentando o olhar fixo.', a: 'sexual' },
            { t: 'Dou uma risada tímida, fico levemente sem graça e mudo de assunto para um tema neutro.', a: 'nao_sexual' },
            { t: 'Respondo fingindo que não entendi a malícia para garantir que ela não se sinta exposta ou desconfortável.', a: 'nao_sexual' }
        ]
    },
    {
        q: 'No momento da despedida do encontro, qual é a sua intenção principal de atitude?',
        opts: [
            { t: 'Buscar um beijo encaixado e de atitude, segurando ela pela nuca ou cintura de forma firme.', a: 'sexual' },
            { t: 'Sugerir estender a noite na minha casa ou na dela se a química física estiver muito latente na despedida.', a: 'sexual' },
            { t: 'Dar um abraço afetuoso e beijo no rosto, preferindo deixar a tensão do beijo na boca para outra data.', a: 'nao_sexual' },
            { t: 'Esperar a iniciativa ou sinal físico nítido dela demonstrando que quer ser beijada, sem precipitar.', a: 'nao_sexual' }
        ]
    },
    {
        q: 'Quando decide elogiar a aparência dela durante o encontro, qual costuma ser o seu tom?',
        opts: [
            { t: 'Elogio a atratividade do olhar dela ou o desenho do sorriso de forma direta e masculina.', a: 'sexual' },
            { t: 'Digo que o perfume ou a presença dela está desafiando meu autocontrole na mesa de forma positiva.', a: 'sexual' },
            { t: 'Elogio o bom gosto intelectual dela, a oratória elegante ou o refinamento da sua produção.', a: 'nao_sexual' },
            { t: 'Elogio a energia leve que ela transmite e como ela é uma pessoa doce e agradável de interagir.', a: 'nao_sexual' }
        ]
    },
    {
        q: 'Vocês estão assistindo a um filme juntos no sofá do seu apartamento. Qual é a sua postura física?',
        opts: [
            { t: 'Abraço ela trazendo-a para perto, acaricio o pescoço e busco o contato corporal máximo entre nós.', a: 'sexual' },
            { t: 'Começo a dar beijos no pescoço dela no meio da cena, sem esperar o fim do filme para tomar a iniciativa.', a: 'sexual' },
            { t: 'Fico sentado ao lado dela de forma respeitosa, dividindo a manta e prestando atenção no filme primeiro.', a: 'nao_sexual' },
            { t: 'Mantenho minha postura no canto do sofá e aguardo ela apoiar a cabeça no meu peito espontaneamente.', a: 'nao_sexual' }
        ]
    },
    {
        q: 'O que você pensa sobre a troca de mensagens com teor sensual (texto ou fotos) antes de saírem?',
        opts: [
            { t: 'Acho excelente; cria forte expectativa, aquece o clima e aumenta a tensão física para o encontro real.', a: 'sexual' },
            { t: 'Alimento o jogo de sedução virtual de forma confiante e ousada se perceber abertura e reciprocidade.', a: 'sexual' },
            { t: 'Prefiro evitar; acho que a atração e a intimidade carnal devem acontecer 100% ao vivo no encontro.', a: 'nao_sexual' },
            { t: 'Acho inadequado no começo; prefiro conduzir o papo virtual com discrição, respeito e educação formal.', a: 'nao_sexual' }
        ]
    },
    {
        q: 'Ela te manda uma mensagem de noite dizendo: "Acabei de sair do banho e deitar". Você responde:',
        opts: [
            { t: '"Pensar nessa cena com certeza vai perturbar o meu sono hoje. O que você está vestindo?"', a: 'sexual' },
            { t: '"Que desperdício eu não estar aí para te esquentar. Essa cama deve estar incrível agora."', a: 'sexual' },
            { t: '"Que delícia de rotina. Descanse bastante porque o seu dia de trabalho hoje foi exaustivo."', a: 'nao_sexual' },
            { t: '"Boa noite! Durma muito bem e nos falamos com calma amanhã no almoço."', a: 'nao_sexual' }
        ]
    },
    {
        q: 'Qual é o papel da química física e carnal imediata na escolha de uma parceira?',
        opts: [
            { t: 'Crítico; se o entrosamento na cama e o desejo não forem absurdamente altos, a relação não se sustenta.', a: 'sexual' },
            { t: 'Alto; necessito sentir um magnetismo de toque e atração de pele instantâneo para cogitar namoro.', a: 'sexual' },
            { t: 'Moderado; priorizo a convergência de valores de vida, parceria e estabilidade emocional no longo prazo.', a: 'nao_sexual' },
            { t: 'Secundário; a maturidade, companheirismo e carinho dela são muito mais valiosos para mim do que a beleza.', a: 'nao_sexual' }
        ]
    }
];
