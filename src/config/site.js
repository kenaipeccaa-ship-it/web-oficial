/* ==========================================================================
   CONFIGURACAO CENTRAL DO SITE
   --------------------------------------------------------------------------
   Este arquivo concentra TODO o conteudo editavel do site.
   Para atualizar os dados publicados, altere apenas este arquivo.

   ATENCAO:
   Nenhum telefone, preco, endereco, horario, depoimento ou numero de alunos
   foi inventado. Todos os campos nao confirmados estao marcados com o
   prefixo "[DEFINIR]" ou com o texto "Consulte a unidade".
   ========================================================================== */

/* --------------------------------------------------------------------------
   1) WHATSAPP — ALTERE APENAS ESTA VARIAVEL
   Formato internacional, somente numeros: 55 + DDD + numero.
   Exemplo (ficticio, apenas ilustrando o formato): '5519999999999'
   Enquanto estiver vazio, os botoes avisam que o numero nao foi configurado.
   -------------------------------------------------------------------------- */
export const WHATSAPP_NUMBER = '' // [DEFINIR] numero oficial da unidade

/* --------------------------------------------------------------------------
   2) REDES E CONTATO — campos editaveis
   -------------------------------------------------------------------------- */
export const INSTAGRAM_URL = '' // [DEFINIR] ex.: 'https://instagram.com/perfil-oficial'
export const INSTAGRAM_HANDLE = '@[DEFINIR]'
export const PHONE_NUMBER = '' // [DEFINIR] telefone fixo/comercial, se houver
export const EMAIL = '' // [DEFINIR] e-mail de contato, se houver

/* --------------------------------------------------------------------------
   3) MARCA E LOCALIZACAO
   -------------------------------------------------------------------------- */
export const brand = {
  name: 'SKYFIT',
  unit: 'CAMPO GRANDE',
  region: 'Campo Grande',
  city: 'Campinas/SP',
  // Endereco completo NAO confirmado — nao inventar.
  addressLine: '[INSERIR ENDEREÇO OFICIAL DA UNIDADE]',
  mapEmbedUrl: '', // [DEFINIR] URL do iframe do Google Maps da unidade
  mapsDirectionsUrl: '', // [DEFINIR] link "Como chegar" do Google Maps
}

/* Horarios de funcionamento NAO confirmados — nao inventar. */
export const openingHours = {
  confirmed: false,
  note: 'Horários não confirmados. Consulte a unidade.',
  rows: [
    { label: 'Segunda a sexta', value: 'Consulte a unidade' },
    { label: 'Sábado', value: 'Consulte a unidade' },
    { label: 'Domingo e feriados', value: 'Consulte a unidade' },
  ],
}

/* --------------------------------------------------------------------------
   4) MENSAGENS PRONTAS DE WHATSAPP
   -------------------------------------------------------------------------- */
/** "MUSCULAÇÃO" -> "Musculação" (os títulos ficam em caixa alta no layout). */
const titleCase = (t) =>
  String(t)
    .toLocaleLowerCase('pt-BR')
    .replace(/(^|\s)(\p{L})/gu, (_, sep, ch) => sep + ch.toLocaleUpperCase('pt-BR'))

export const whatsappMessages = {
  geral: 'Olá! Vi a página da academia e gostaria de conhecer os planos.',
  planos: 'Olá! Gostaria de saber mais sobre os planos da academia.',
  experimental: 'Olá! Gostaria de saber sobre a aula experimental.',
  aulas: 'Olá! Gostaria de saber quais aulas estão disponíveis.',
  horarios: 'Olá! Gostaria de saber os horários de funcionamento e das aulas.',
  localizacao: 'Olá! Gostaria de confirmar o endereço da unidade.',
  plano: (nome) => `Olá! Gostaria de saber mais sobre o plano ${titleCase(nome)}.`,

  /* ---- Exclusive Store ---- */
  loja: 'Olá! Gostaria de saber mais sobre os suplementos da loja.',
  produto: (nome) =>
    `Olá! Tenho interesse no produto ${nome}. Gostaria de saber mais informações e disponibilidade.`,
  /**
   * Pedido do carrinho.
   * @param {{name: string, qty: number}[]} itens
   */
  pedido: (itens) => {
    const linhas = itens.map((i) => `• ${i.qty}x ${i.name}`).join('\n')
    return `Olá! Gostaria de fazer um pedido na loja:\n\n${linhas}\n\nPode me confirmar valores e disponibilidade?`
  },
  modalidade: (nome) => `Olá! Gostaria de saber mais sobre as aulas de ${titleCase(nome)}.`,
}

/* --------------------------------------------------------------------------
   5) NAVEGACAO
   -------------------------------------------------------------------------- */
export const navLinks = [
  { label: 'Início', href: '#inicio' },
  { label: 'A academia', href: '#academia' },
  { label: 'Modalidades', href: '#modalidades' },
  { label: 'Planos', href: '#planos' },
  { label: 'Loja', href: '#loja' },
  { label: 'Aula experimental', href: '#experimental' },
  { label: 'Localização', href: '#localizacao' },
]

/* --------------------------------------------------------------------------
   6) DIFERENCIAIS
   -------------------------------------------------------------------------- */
export const features = [
  {
    id: 'estrutura',
    icon: 'LayoutGrid',
    title: 'ESTRUTURA',
    text: 'Um ambiente preparado para diferentes objetivos de treino.',
  },
  {
    id: 'variedade',
    icon: 'Shuffle',
    title: 'VARIEDADE',
    text: 'Opções de treinamento para tornar sua rotina mais dinâmica.',
  },
  {
    id: 'energia',
    icon: 'Flame',
    title: 'ENERGIA',
    text: 'Um ambiente que incentiva você a manter o foco.',
  },
  {
    id: 'evolucao',
    icon: 'TrendingUp',
    title: 'EVOLUÇÃO',
    text: 'Treine de acordo com seus objetivos e acompanhe sua evolução.',
  },
]

/* --------------------------------------------------------------------------
   7) MODALIDADES
   --------------------------------------------------------------------------
   IMPORTANTE: nomes, disponibilidade e horarios listados aqui
   precisam ser CONFIRMADOS COM A UNIDADE antes de qualquer publicacao.
   Para editar: adicione, remova ou reordene os objetos desta lista.
     id        -> ancora unica (sem acentos/espacos)
     name      -> titulo do card
     short     -> descricao curta do card
     icon      -> nome de um icone da biblioteca lucide-react
     art       -> chave da arte visual (ver src/config/media.js)
     tag       -> etiqueta exibida sobre a imagem
     details   -> conteudo do modal "SAIBA MAIS"
   -------------------------------------------------------------------------- */
export const modalidades = [
  {
    id: 'musculacao',
    name: 'MUSCULAÇÃO',
    short: 'Treinos de força para diferentes objetivos e níveis de experiência.',
    icon: 'Dumbbell',
    art: 'musculacao',
    tag: 'Treino de força',
    details: {
      about:
        'A musculação trabalha os grupos musculares com cargas e séries organizadas em um programa de treino. É uma modalidade adaptável: o mesmo equipamento atende desde quem está começando até quem já treina há anos.',
      topics: [
        'Treino individual, no seu ritmo e na sua rotina.',
        'Progressão de carga ajustada ao seu nível de experiência.',
        'Combina com as aulas coletivas dentro da mesma semana de treino.',
      ],
      level: 'Do primeiro treino ao avançado',
      focus: 'Força e condicionamento muscular',
    },
  },
  {
    id: 'fit-dance',
    name: 'FIT DANCE',
    short: 'Aulas com música e movimento para deixar o treino mais dinâmico.',
    icon: 'Music',
    art: 'dance',
    tag: 'Aula coletiva',
    details: {
      about:
        'Aula coletiva que une coreografias simples e música para movimentar o corpo de forma leve e descontraída. É uma porta de entrada comum para quem quer sair do sedentarismo sem começar por um treino pesado.',
      topics: [
        'Coreografias acessíveis, montadas para serem acompanhadas.',
        'Clima de turma: você treina junto com outras pessoas.',
        'Não é preciso saber dançar para participar.',
      ],
      level: 'Todos os níveis',
      focus: 'Movimento, ritmo e disposição',
    },
  },
  {
    id: 'cardio-training',
    name: 'CARDIO TRAINING',
    short: 'Atividades voltadas ao condicionamento e à resistência.',
    icon: 'HeartPulse',
    art: 'cardio',
    tag: 'Condicionamento',
    details: {
      about:
        'Treino voltado ao sistema cardiorrespiratório, com atividades contínuas ou intervaladas. A intensidade é ajustável, o que permite começar leve e evoluir conforme o condicionamento melhora.',
      topics: [
        'Intensidade ajustável ao seu momento de treino.',
        'Boa combinação com a musculação na mesma rotina.',
        'Trabalho de resistência e fôlego.',
      ],
      level: 'Todos os níveis',
      focus: 'Condicionamento e resistência',
    },
  },
  {
    id: 'power-bike',
    name: 'POWER BIKE',
    short: 'Treinamento cardiovascular em bicicleta, com muita energia.',
    icon: 'Bike',
    art: 'bike',
    tag: 'Aula coletiva',
    details: {
      about:
        'Aula em bicicleta estacionária conduzida por um professor, com variação de carga e ritmo ao longo da sessão. Cada aluno regula a resistência da própria bike, então a intensidade é individual mesmo em grupo.',
      topics: [
        'Você controla a carga da sua bicicleta durante a aula.',
        'Trabalho de pernas e condicionamento no mesmo treino.',
        'Formato em grupo, com música e comando do professor.',
      ],
      level: 'Todos os níveis',
      focus: 'Cardiovascular e resistência',
    },
  },
  {
    id: 'body-jam',
    name: 'BODY JAM',
    short: 'Aulas coletivas que combinam música, movimento e condicionamento.',
    icon: 'Disc3',
    art: 'jam',
    tag: 'Aula coletiva',
    details: {
      about:
        'Aula coletiva com sequências de movimento conduzidas pelo professor no ritmo da música. Une a parte lúdica da dança com o trabalho contínuo de condicionamento.',
      topics: [
        'Sequências guiadas do início ao fim da aula.',
        'Trabalho de coordenação junto com o condicionamento.',
        'Ambiente de turma, com energia alta.',
      ],
      level: 'Todos os níveis',
      focus: 'Coordenação e condicionamento',
    },
  },
  {
    id: 'aerobicos',
    name: 'AERÓBICOS',
    short: 'Atividades coletivas para movimentar o corpo e elevar a intensidade do treino.',
    icon: 'Activity',
    art: 'aerobicos',
    tag: 'Aula coletiva',
    details: {
      about:
        'Aulas em grupo com exercícios contínuos que elevam a frequência cardíaca de forma progressiva. Os movimentos são guiados e podem ser adaptados de acordo com o ritmo de cada aluno.',
      topics: [
        'Movimentos guiados e adaptáveis.',
        'Progressão de intensidade ao longo da aula.',
        'Alternativa dinâmica ao treino individual.',
      ],
      level: 'Todos os níveis',
      focus: 'Intensidade e condicionamento',
    },
  },
  {
    id: 'aerower',
    name: 'AEROWER',
    short: 'Treinamento coletivo com foco em movimento e condicionamento.',
    icon: 'Waves',
    art: 'aerower',
    tag: 'Aula coletiva',
    details: {
      about:
        'Treinamento coletivo conduzido por professor, com foco em manter o corpo em movimento durante a aula e trabalhar o condicionamento geral.',
      topics: [
        'Aula conduzida do aquecimento ao encerramento.',
        'Foco em movimento contínuo e condicionamento.',
        'Formato coletivo, com acompanhamento do professor.',
      ],
      level: 'Todos os níveis',
      focus: 'Movimento e condicionamento',
      // Nome de modalidade a confirmar com a unidade antes da publicacao.
      needsConfirmation: true,
    },
  },
  {
    id: 'condicionamento-corporal',
    name: 'CONDICIONAMENTO CORPORAL',
    short: 'Exercícios voltados ao desenvolvimento do condicionamento físico.',
    icon: 'Zap',
    art: 'condicionamento',
    tag: 'Aula coletiva',
    details: {
      about:
        'Aula com exercícios que trabalham o corpo de forma integrada, combinando força, mobilidade e resistência dentro da mesma sessão.',
      topics: [
        'Exercícios que usam o corpo todo.',
        'Combinação de força, mobilidade e resistência.',
        'Intensidade ajustável conforme o nível do aluno.',
      ],
      level: 'Todos os níveis',
      focus: 'Condicionamento físico geral',
    },
  },
]

/* --------------------------------------------------------------------------
   8) ESTRUTURA / GALERIA
   As artes sao ilustrativas. Substitua pelas fotos reais da unidade.
   -------------------------------------------------------------------------- */
export const estruturaItems = [
  {
    id: 'musculacao-area',
    title: 'Área de musculação',
    text: 'Espaço destinado aos treinos de força.',
    art: 'estruturaMusculacao',
    size: 'lg',
  },
  {
    id: 'equipamentos',
    title: 'Equipamentos',
    text: 'Aparelhos e pesos livres para diferentes tipos de treino.',
    art: 'estruturaEquipamentos',
    size: 'sm',
  },
  {
    id: 'cardio-area',
    title: 'Área de cardio',
    text: 'Espaço voltado ao trabalho de condicionamento.',
    art: 'estruturaCardio',
    size: 'sm',
  },
  {
    id: 'aulas-coletivas',
    title: 'Sala de aulas coletivas',
    text: 'Ambiente reservado para as turmas e aulas em grupo.',
    art: 'estruturaAulas',
    size: 'sm',
  },
  {
    id: 'ambiente',
    title: 'Ambiente interno',
    text: 'Circulação, apoio e áreas de convivência.',
    art: 'estruturaAmbiente',
    size: 'sm',
  },
]

/* --------------------------------------------------------------------------
   9) PLANOS — sem precos inventados
   -------------------------------------------------------------------------- */
export const planos = [
  {
    id: 'essencial',
    name: 'ESSENCIAL',
    text: 'Para quem quer começar sua rotina de treinos.',
    price: 'CONSULTE A UNIDADE',
    icon: 'Play',
    highlight: false,
    items: [
      { label: 'Acesso à academia', value: 'Consulte a unidade' },
      { label: 'Modalidades incluídas', value: 'Consulte a unidade' },
      { label: 'Condições e fidelidade', value: 'Consulte a unidade' },
    ],
  },
  {
    id: 'plus',
    name: 'PLUS',
    text: 'Mais possibilidades para sua rotina.',
    price: 'CONSULTE A UNIDADE',
    icon: 'Layers',
    highlight: true,
    badge: 'DESTAQUE DA PROPOSTA',
    items: [
      { label: 'Acesso à academia', value: 'Consulte a unidade' },
      { label: 'Modalidades incluídas', value: 'Consulte a unidade' },
      { label: 'Condições e fidelidade', value: 'Consulte a unidade' },
    ],
  },
  {
    id: 'premium',
    name: 'PREMIUM',
    text: 'Para quem busca uma experiência mais completa.',
    price: 'CONSULTE A UNIDADE',
    icon: 'Crown',
    highlight: false,
    items: [
      { label: 'Acesso à academia', value: 'Consulte a unidade' },
      { label: 'Modalidades incluídas', value: 'Consulte a unidade' },
      { label: 'Condições e fidelidade', value: 'Consulte a unidade' },
    ],
  },
]

/* --------------------------------------------------------------------------
   10) OBJETIVOS
   -------------------------------------------------------------------------- */
export const objetivos = [
  { id: 'forca', emoji: '🔥', icon: 'Dumbbell', label: 'Ganhar força' },
  { id: 'condicionamento', emoji: '❤️', icon: 'HeartPulse', label: 'Melhorar condicionamento' },
  { id: 'disposicao', emoji: '⚡', icon: 'Zap', label: 'Ter mais disposição' },
  { id: 'resistencia', emoji: '🏃', icon: 'Footprints', label: 'Melhorar resistência' },
  { id: 'rotina', emoji: '💪', icon: 'CalendarCheck', label: 'Desenvolver uma rotina de treino' },
]

/* --------------------------------------------------------------------------
   11) FORMULARIO DA AULA EXPERIMENTAL
   -------------------------------------------------------------------------- */
export const horariosContato = [
  'Manhã',
  'Tarde',
  'Noite',
  'Qualquer horário',
]

/* --------------------------------------------------------------------------
   12) FAQ — quando a informacao nao estiver confirmada, responder
   "Consulte a unidade para informacoes atualizadas."
   -------------------------------------------------------------------------- */
export const faq = [
  {
    id: 'faq-modalidades',
    q: 'Quais modalidades estão disponíveis?',
    a: 'A unidade trabalha com musculação e aulas coletivas como Fit Dance, Cardio Training, Power Bike, Body Jam, Aeróbicos, Aerower e Condicionamento Corporal. A lista de modalidades ativas e a disponibilidade de cada turma devem ser confirmadas com a unidade.',
  },
  {
    id: 'faq-planos',
    q: 'Quais são os planos?',
    a: 'São três formatos de plano — Essencial, Plus e Premium. Valores, condições e o que cada plano inclui devem ser consultados diretamente com a unidade.',
  },
  {
    id: 'faq-experimental',
    q: 'Como funciona a aula experimental?',
    a: 'Preencha o formulário desta página e confirme pelo WhatsApp, que abre uma conversa com uma mensagem pronta. As regras da aula experimental — disponibilidade, duração e o que levar — devem ser confirmadas com a unidade.',
  },
  {
    id: 'faq-horarios',
    q: 'Quais são os horários?',
    a: 'Os horários de funcionamento e a grade de aulas não foram divulgados aqui. Consulte a unidade para informações atualizadas.',
  },
  {
    id: 'faq-experiencia',
    q: 'Preciso ter experiência para começar?',
    a: 'Não. As modalidades apresentadas atendem tanto quem está começando quanto quem já treina. A orientação inicial e o acompanhamento disponíveis devem ser confirmados com a unidade.',
  },
  {
    id: 'faq-contato',
    q: 'Como posso entrar em contato?',
    a: 'Pelo botão de WhatsApp desta página, que abre uma conversa com uma mensagem pronta. Você também pode falar com a equipe pessoalmente na unidade.',
  },
]
