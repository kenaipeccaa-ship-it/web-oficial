/* ==========================================================================
   MIDIA / IMAGENS
   --------------------------------------------------------------------------
   // SUBSTITUIR PELAS FOTOS REAIS DA UNIDADE
   --------------------------------------------------------------------------
   Enquanto nao houver fotos oficiais, cada slot de imagem renderiza uma ARTE
   GRAFICA gerada em SVG (componente <Art />). A arte e abstrata de proposito:
   ela NAO simula uma foto real da unidade e por isso nao induz o visitante a
   erro em uma demonstracao.

   COMO COLOCAR AS FOTOS REAIS
   1. Salve as imagens em /public/fotos/ (ex.: /public/fotos/musculacao.jpg).
   2. Preencha o campo "src" do slot correspondente abaixo:
        musculacao: { ...art, src: '/fotos/musculacao.jpg', alt: '...' }
   3. Pronto. O componente <PhotoFrame /> passa a exibir a foto no lugar da
      arte e o selo "IMAGEM ILUSTRATIVA" some automaticamente.
   Se a foto falhar ao carregar, a arte volta a ser exibida (sem quebrar o
   layout).
   ========================================================================== */

/**
 * Paleta de acento usada pelas artes.
 * volt  -> verde limao (cor primaria da marca da demonstracao)
 * sky   -> azul
 * cyan  -> ciano
 * grape -> violeta
 */
const ACCENTS = {
  volt: { a: '#C8FA4B', b: '#46700F' },
  sky: { a: '#4C86FF', b: '#1B3596' },
  cyan: { a: '#3FE0D0', b: '#116A66' },
  grape: { a: '#9B7BFF', b: '#3E248F' },
}

export const accentColor = (key) => ACCENTS[key] || ACCENTS.volt

/**
 * Slots de imagem do site.
 *  pattern -> composicao grafica da arte (ver src/components/ui/Art.jsx)
 *  accent  -> chave da paleta acima
 *  glyph   -> silhueta geometrica de fundo
 *  src     -> caminho da FOTO REAL (vazio = usa a arte)
 *  alt     -> texto alternativo (acessibilidade / SEO)
 */
export const media = {
  hero: {
    pattern: 'streaks',
    accent: 'volt',
    glyph: 'barbell',
    src: '', // SUBSTITUIR PELA FOTO REAL DA UNIDADE (ambiente amplo, horizontal)
    alt: 'Arte gráfica de abertura representando o ambiente de treino',
  },

  /* ---- Modalidades ---- */
  musculacao: { pattern: 'plates', accent: 'volt', glyph: 'dumbbell', src: '', alt: 'Arte gráfica representando treino de musculação' },
  dance: { pattern: 'waves', accent: 'grape', glyph: 'note', src: '', alt: 'Arte gráfica representando aulas de dança fitness' },
  cardio: { pattern: 'pulse', accent: 'cyan', glyph: 'heart', src: '', alt: 'Arte gráfica representando treino de condicionamento' },
  bike: { pattern: 'rings', accent: 'sky', glyph: 'bike', src: '', alt: 'Arte gráfica representando aula de bike indoor' },
  jam: { pattern: 'bars', accent: 'grape', glyph: 'disc', src: '', alt: 'Arte gráfica representando aula coletiva com música' },
  aerobicos: { pattern: 'burst', accent: 'cyan', glyph: 'steps', src: '', alt: 'Arte gráfica representando aulas de aeróbicos' },
  aerower: { pattern: 'waves', accent: 'sky', glyph: 'rower', src: '', alt: 'Arte gráfica representando treinamento coletivo' },
  condicionamento: { pattern: 'grid', accent: 'volt', glyph: 'kettle', src: '', alt: 'Arte gráfica representando condicionamento corporal' },

  /* ---- Estrutura ---- */
  // SUBSTITUIR PELAS FOTOS REAIS DA UNIDADE
  estruturaMusculacao: { pattern: 'arcs', accent: 'volt', glyph: 'rack', src: '', alt: 'Arte gráfica representando a área de musculação' },
  estruturaEquipamentos: { pattern: 'grid', accent: 'sky', glyph: 'dumbbell', src: '', alt: 'Arte gráfica representando equipamentos e pesos livres' },
  estruturaCardio: { pattern: 'pulse', accent: 'cyan', glyph: 'tread', src: '', alt: 'Arte gráfica representando a área de cardio' },
  estruturaAulas: { pattern: 'bars', accent: 'grape', glyph: 'group', src: '', alt: 'Arte gráfica representando a sala de aulas coletivas' },
  estruturaAmbiente: { pattern: 'rings', accent: 'volt', glyph: 'space', src: '', alt: 'Arte gráfica representando o ambiente interno' },

  /* ---- Seções de conversão ---- */
  experimental: { pattern: 'burst', accent: 'volt', glyph: 'barbell', src: '', alt: 'Arte gráfica da seção de aula experimental' },
  cta: { pattern: 'streaks', accent: 'volt', glyph: 'rack', src: '', alt: 'Arte gráfica de encerramento' },
}

export const getMedia = (key) => media[key] || media.hero
