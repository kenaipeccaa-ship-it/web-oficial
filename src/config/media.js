/* ==========================================================================
   MIDIA / IMAGENS
   --------------------------------------------------------------------------
   // SUBSTITUIR PELAS FOTOS REAIS DA UNIDADE
   --------------------------------------------------------------------------
   Enquanto nao houver fotos oficiais, cada slot de imagem renderiza uma ARTE
   GRAFICA gerada em SVG (componente <Art />). A arte e abstrata de proposito:
   ela NAO simula uma foto real da unidade e por isso nao induz o visitante a
   erro em producao.

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
 * red    -> vermelho da marca (cor principal de destaque)
 * ember  -> vermelho alaranjado (variacao quente)
 * steel  -> grafite neutro
 * slate  -> grafite frio
 * Os dois grafites dao variacao entre os cards sem competir com o vermelho.
 */
const ACCENTS = {
  red: { a: '#FF3742', b: '#7A0A12' },
  ember: { a: '#FF7A45', b: '#6E2A08' },
  steel: { a: '#B6C2D6', b: '#2F3743' },
  slate: { a: '#8896B4', b: '#1C2634' },
}

export const accentColor = (key) => ACCENTS[key] || ACCENTS.red

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
    accent: 'red',
    glyph: 'barbell',
    src: '', // SUBSTITUIR PELA FOTO REAL DA UNIDADE (ambiente amplo, horizontal)
    alt: 'Arte gráfica de abertura representando o ambiente de treino',
  },

  /* ---- Modalidades ---- */
  musculacao: { pattern: 'plates', accent: 'red', glyph: 'dumbbell', src: '', alt: 'Arte gráfica representando treino de musculação' },
  dance: { pattern: 'waves', accent: 'ember', glyph: 'note', src: '', alt: 'Arte gráfica representando aulas de dança fitness' },
  cardio: { pattern: 'pulse', accent: 'slate', glyph: 'heart', src: '', alt: 'Arte gráfica representando treino de condicionamento' },
  bike: { pattern: 'rings', accent: 'steel', glyph: 'bike', src: '', alt: 'Arte gráfica representando aula de bike indoor' },
  jam: { pattern: 'bars', accent: 'ember', glyph: 'disc', src: '', alt: 'Arte gráfica representando aula coletiva com música' },
  aerobicos: { pattern: 'burst', accent: 'slate', glyph: 'steps', src: '', alt: 'Arte gráfica representando aulas de aeróbicos' },
  aerower: { pattern: 'waves', accent: 'steel', glyph: 'rower', src: '', alt: 'Arte gráfica representando treinamento coletivo' },
  condicionamento: { pattern: 'grid', accent: 'red', glyph: 'kettle', src: '', alt: 'Arte gráfica representando condicionamento corporal' },

  /* ---- Estrutura ---- */
  // SUBSTITUIR PELAS FOTOS REAIS DA UNIDADE
  estruturaMusculacao: { pattern: 'arcs', accent: 'red', glyph: 'rack', src: '', alt: 'Arte gráfica representando a área de musculação' },
  estruturaEquipamentos: { pattern: 'grid', accent: 'steel', glyph: 'dumbbell', src: '', alt: 'Arte gráfica representando equipamentos e pesos livres' },
  estruturaCardio: { pattern: 'pulse', accent: 'slate', glyph: 'tread', src: '', alt: 'Arte gráfica representando a área de cardio' },
  estruturaAulas: { pattern: 'bars', accent: 'ember', glyph: 'group', src: '', alt: 'Arte gráfica representando a sala de aulas coletivas' },
  estruturaAmbiente: { pattern: 'rings', accent: 'red', glyph: 'space', src: '', alt: 'Arte gráfica representando o ambiente interno' },

  /* ---- Seções de conversão ---- */
  experimental: { pattern: 'burst', accent: 'red', glyph: 'barbell', src: '', alt: 'Arte gráfica da seção de aula experimental' },
  cta: { pattern: 'streaks', accent: 'red', glyph: 'rack', src: '', alt: 'Arte gráfica de encerramento' },
}

export const getMedia = (key) => media[key] || media.hero
