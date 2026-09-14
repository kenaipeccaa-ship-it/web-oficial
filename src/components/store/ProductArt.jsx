import { useId, memo } from 'react'

/* ==========================================================================
   <ProductArt />
   Arte em SVG usada enquanto o produto não tem foto cadastrada.
   // SUBSTITUIR PELAS FOTOS REAIS DOS PRODUTOS
   (campo "image" em src/data/products.js — ver /public/images/store/README.md)

   É uma silhueta abstrata de embalagem: não simula a foto de um produto real
   e não reproduz marca nenhuma.
   ========================================================================== */

const ACCENT = '#ff3742'

/* Silhuetas desenhadas em uma caixa 0..200.
   "v" (0, 1 ou 2) muda levemente a embalagem para dois produtos da mesma
   categoria não ficarem com o desenho idêntico. */
function Shape({ name, color, v = 0 }) {
  const s = { fill: 'none', stroke: color, strokeWidth: 4, strokeLinecap: 'round', strokeLinejoin: 'round' }
  switch (name) {
    case 'bar': // barra de proteína
      return (
        <g style={s}>
          <rect x="34" y={v === 1 ? 68 : 74} width="132" height={v === 1 ? 64 : 52} rx="14" />
          {v === 1 ? (
            <path d="M34 100 h132" opacity="0.5" />
          ) : (
            <path d="M34 92 h132 M34 108 h132" opacity="0.5" />
          )}
          <path d={v === 1 ? 'M34 82 l-14 -12 l0 60 l14 -12' : 'M34 86 l-14 -10 l0 48 l14 -10'} />
          <path d={v === 1 ? 'M166 82 l14 -12 l0 60 l-14 -12' : 'M166 86 l14 -10 l0 48 l-14 -10'} />
        </g>
      )
    case 'bottle': // bebida pronta
      return (
        <g style={s}>
          <path d="M84 34 h32 v20 l14 20 v82 a10 10 0 0 1 -10 10 h-40 a10 10 0 0 1 -10 -10 v-82 l14 -20 z" />
          <path d="M70 96 h60" opacity="0.6" />
          <path d="M70 130 h60" opacity="0.6" />
        </g>
      )
    case 'pills': // cápsulas / vitaminas
      return (
        <g style={s}>
          <path d="M66 46 h68 v18 h-68 z" />
          <path d="M58 64 h84 v96 a10 10 0 0 1 -10 10 h-64 a10 10 0 0 1 -10 -10 z" />
          <rect x="78" y={v === 1 ? 100 : 92} width="44" height="26" rx="13" opacity="0.6" />
          <path d={v === 1 ? 'M78 113 h44' : 'M78 105 h44'} opacity="0.6" />
          {v === 1 && <path d="M70 84 h60" opacity="0.4" />}
        </g>
      )
    case 'shaker': // coqueteleira
      return (
        <g style={s}>
          <path d="M72 40 h56 v16 h-56 z" />
          <path d="M64 56 h72 v104 a12 12 0 0 1 -12 12 h-48 a12 12 0 0 1 -12 -12 z" />
          <path d="M64 86 h72" opacity="0.6" />
          <path d="M100 86 v86" opacity="0.35" />
        </g>
      )
    case 'sachet': // sachê
      return (
        <g style={s}>
          <path d="M62 52 h76 v112 a6 6 0 0 1 -6 6 h-64 a6 6 0 0 1 -6 -6 z" />
          <path d="M56 40 h88 l-6 12 h-76 z" />
          <path d="M62 128 h76" opacity="0.5" />
        </g>
      )
    case 'tub': // pote de pó (whey, creatina, pré-treino, glutamina)
    default:
      if (v === 1) {
        // Pote mais alto e estreito, com faixa de rótulo larga.
        return (
          <g style={s}>
            <path d="M68 34 h64 a8 8 0 0 1 8 8 v12 h-80 v-12 a8 8 0 0 1 8 -8 z" />
            <path d="M56 54 h88 v104 a14 14 0 0 1 -14 14 h-60 a14 14 0 0 1 -14 -14 z" />
            <path d="M56 92 h88 v34 h-88 z" opacity="0.5" />
            <path d="M78 146 h44" opacity="0.4" />
          </g>
        )
      }
      if (v === 2) {
        // Pote mais baixo e largo, com tampa saliente.
        return (
          <g style={s}>
            <path d="M52 56 h96 a8 8 0 0 1 8 8 v10 h-112 v-10 a8 8 0 0 1 8 -8 z" />
            <path d="M46 74 h108 v76 a16 16 0 0 1 -16 16 h-76 a16 16 0 0 1 -16 -16 z" />
            <path d="M46 106 h108" opacity="0.55" />
            <path d="M68 128 h64" opacity="0.4" />
          </g>
        )
      }
      return (
        <g style={s}>
          <path d="M60 46 h80 a8 8 0 0 1 8 8 v12 h-96 v-12 a8 8 0 0 1 8 -8 z" />
          <path d="M48 66 h104 v92 a14 14 0 0 1 -14 14 h-76 a14 14 0 0 1 -14 -14 z" />
          <path d="M48 100 h104" opacity="0.55" />
          <path d="M74 122 h52" opacity="0.4" />
          <path d="M74 140 h32" opacity="0.4" />
        </g>
      )
  }
}

/** Semente estável: o mesmo produto sempre recebe a mesma variação. */
function variantOf(seed) {
  const t = String(seed)
  let sum = 0
  for (let i = 0; i < t.length; i += 1) sum += t.charCodeAt(i)
  return sum % 3
}

function ProductArtBase({ art = 'tub', seed = '', className = '' }) {
  const uid = useId().replace(/:/g, '')
  const v = variantOf(seed)
  return (
    <svg
      className={`p-art ${className}`}
      viewBox="0 0 200 200"
      preserveAspectRatio="xMidYMid meet"
      role="presentation"
      focusable="false"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id={`pg-${uid}`} cx="50%" cy="38%" r="62%">
          <stop offset="0%" stopColor={ACCENT} stopOpacity="0.14" />
          <stop offset="100%" stopColor={ACCENT} stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="200" height="200" fill={`url(#pg-${uid})`} />
      <g opacity="0.72">
        <Shape name={art} color={ACCENT} v={v} />
      </g>
      {/* sombra de apoio */}
      <ellipse cx="100" cy="180" rx="46" ry="6" fill={ACCENT} opacity="0.1" />
    </svg>
  )
}

export const ProductArt = memo(ProductArtBase)
export default ProductArt
