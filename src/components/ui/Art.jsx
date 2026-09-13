import { useId, memo } from 'react'
import { accentColor, getMedia } from '../../config/media.js'

/* ==========================================================================
   <Art />
   Arte grafica gerada em SVG, usada como PLACEHOLDER das fotos da unidade.
   E abstrata de proposito: nao simula uma fotografia real do local.
   // SUBSTITUIR PELAS FOTOS REAIS DA UNIDADE (ver src/config/media.js)
   ========================================================================== */

/* ---------- Silhuetas geometricas de fundo (desenhadas em 0..200) --------- */
function Glyph({ name, color }) {
  const s = { fill: 'none', stroke: color, strokeWidth: 4, strokeLinecap: 'round', strokeLinejoin: 'round' }
  switch (name) {
    case 'dumbbell':
      return (
        <g style={s}>
          <rect x="78" y="92" width="44" height="16" rx="8" />
          <rect x="58" y="78" width="18" height="44" rx="6" />
          <rect x="124" y="78" width="18" height="44" rx="6" />
          <rect x="42" y="86" width="12" height="28" rx="5" />
          <rect x="146" y="86" width="12" height="28" rx="5" />
        </g>
      )
    case 'barbell':
      return (
        <g style={s}>
          <line x1="50" y1="100" x2="150" y2="100" />
          <rect x="26" y="70" width="14" height="60" rx="6" />
          <rect x="44" y="80" width="10" height="40" rx="4" />
          <rect x="160" y="70" width="14" height="60" rx="6" />
          <rect x="146" y="80" width="10" height="40" rx="4" />
        </g>
      )
    case 'bike':
      return (
        <g style={s}>
          <circle cx="56" cy="130" r="30" />
          <circle cx="146" cy="130" r="30" />
          <path d="M56 130 L92 74 L132 74" />
          <path d="M92 74 L112 130 L146 130" />
          <line x1="74" y1="62" x2="104" y2="62" />
        </g>
      )
    case 'heart':
      return (
        <g style={s}>
          <path d="M100 148 C 40 108 38 62 68 52 C 86 46 98 58 100 68 C 102 58 114 46 132 52 C 162 62 160 108 100 148 Z" />
        </g>
      )
    case 'note':
      return (
        <g style={s}>
          <circle cx="72" cy="134" r="20" />
          <circle cx="140" cy="118" r="20" />
          <path d="M92 134 V60 L160 44 V118" />
          <path d="M92 78 L160 62" />
        </g>
      )
    case 'disc':
      return (
        <g style={s}>
          <circle cx="100" cy="100" r="62" />
          <circle cx="100" cy="100" r="36" />
          <circle cx="100" cy="100" r="10" />
        </g>
      )
    case 'steps':
      return (
        <g style={s}>
          <path d="M30 150 H70 V118 H110 V86 H150 V54 H176" />
        </g>
      )
    case 'rower':
      return (
        <g style={s}>
          <line x1="30" y1="128" x2="170" y2="128" />
          <path d="M56 128 V104 H92" />
          <circle cx="150" cy="104" r="22" />
          <line x1="92" y1="104" x2="128" y2="104" />
        </g>
      )
    case 'kettle':
      return (
        <g style={s}>
          <circle cx="100" cy="122" r="40" />
          <path d="M74 88 C 74 56 126 56 126 88" />
          <rect x="80" y="76" width="40" height="14" rx="6" />
        </g>
      )
    case 'rack':
      return (
        <g style={s}>
          <line x1="46" y1="34" x2="46" y2="166" />
          <line x1="154" y1="34" x2="154" y2="166" />
          <line x1="46" y1="66" x2="154" y2="66" />
          <line x1="46" y1="166" x2="154" y2="166" />
          <rect x="62" y="98" width="22" height="46" rx="8" />
          <rect x="116" y="98" width="22" height="46" rx="8" />
        </g>
      )
    case 'tread':
      return (
        <g style={s}>
          <path d="M34 150 H150 L166 150" />
          <circle cx="46" cy="150" r="12" />
          <circle cx="154" cy="150" r="12" />
          <path d="M60 150 L92 86 H150" />
          <line x1="150" y1="86" x2="150" y2="44" />
          <line x1="124" y1="44" x2="172" y2="44" />
        </g>
      )
    case 'group':
      return (
        <g style={s}>
          <circle cx="56" cy="76" r="16" />
          <path d="M34 156 v-32 a22 22 0 0 1 44 0 v32" />
          <circle cx="112" cy="64" r="18" />
          <path d="M88 156 v-42 a24 24 0 0 1 48 0 v42" />
          <circle cx="164" cy="80" r="14" />
          <path d="M146 156 v-28 a18 18 0 0 1 36 0 v28" />
        </g>
      )
    case 'space':
    default:
      return (
        <g style={s}>
          <rect x="30" y="42" width="140" height="116" rx="16" />
          <line x1="30" y1="118" x2="170" y2="118" />
          <line x1="86" y1="42" x2="86" y2="118" />
          <line x1="128" y1="80" x2="170" y2="80" />
        </g>
      )
  }
}

/* ---------------------- Composicoes graficas (padroes) -------------------- */
function Pattern({ name, color }) {
  switch (name) {
    case 'streaks':
      return (
        <g transform="rotate(-24 400 300)">
          {Array.from({ length: 16 }).map((_, i) => (
            <rect
              key={i}
              x={-260 + i * 74}
              y={-160}
              width={i % 3 === 0 ? 16 : i % 2 === 0 ? 6 : 3}
              height={920}
              rx={3}
              fill={color}
              opacity={i % 3 === 0 ? 0.1 : 0.055}
            />
          ))}
        </g>
      )
    case 'plates':
      return (
        <g fill="none" stroke={color}>
          {Array.from({ length: 7 }).map((_, i) => (
            <rect
              key={i}
              x={300 - i * 52}
              y={190 - i * 40}
              width={200 + i * 104}
              height={220 + i * 80}
              rx={40 + i * 14}
              strokeWidth={i === 0 ? 6 : 2}
              opacity={0.22 - i * 0.024}
            />
          ))}
        </g>
      )
    case 'rings':
      return (
        <g fill="none" stroke={color}>
          {Array.from({ length: 9 }).map((_, i) => (
            <circle key={i} cx={600} cy={170} r={60 + i * 62} strokeWidth={i % 2 ? 1.5 : 4} opacity={0.26 - i * 0.025} />
          ))}
        </g>
      )
    case 'waves':
      return (
        <g fill="none" stroke={color} strokeLinecap="round">
          {Array.from({ length: 7 }).map((_, i) => (
            <path
              key={i}
              d={`M-40 ${120 + i * 62} C 140 ${40 + i * 62}, 260 ${240 + i * 62}, 420 ${150 + i * 62} S 700 ${40 + i * 62}, 860 ${160 + i * 62}`}
              strokeWidth={i % 2 ? 2 : 5}
              opacity={0.2 - i * 0.014}
            />
          ))}
        </g>
      )
    case 'bars':
      return (
        <g fill={color}>
          {Array.from({ length: 22 }).map((_, i) => {
            const h = 60 + Math.abs(Math.sin(i * 1.7)) * 330
            return <rect key={i} x={16 + i * 36} y={560 - h} width={18} height={h} rx={9} opacity={i % 4 === 0 ? 0.2 : 0.1} />
          })}
        </g>
      )
    case 'pulse':
      return (
        <g fill="none" stroke={color} strokeLinecap="round" strokeLinejoin="round">
          {[0, 1, 2].map((r) => (
            <path
              key={r}
              d={`M-40 ${200 + r * 150} H120 l40 -70 l36 150 l40 -110 l30 30 H420 l40 -70 l36 150 l40 -110 l30 30 H860`}
              strokeWidth={r === 1 ? 5 : 2}
              opacity={r === 1 ? 0.22 : 0.1}
            />
          ))}
        </g>
      )
    case 'grid':
      return (
        <g fill={color}>
          {Array.from({ length: 12 }).map((_, r) =>
            Array.from({ length: 16 }).map((__, c) => (
              <circle
                key={`${r}-${c}`}
                cx={20 + c * 52}
                cy={18 + r * 52}
                r={1.6 + ((r + c) % 5) * 1.5}
                opacity={0.05 + ((r * c) % 7) * 0.022}
              />
            )),
          )}
        </g>
      )
    case 'burst':
      return (
        <g stroke={color} strokeLinecap="round">
          {Array.from({ length: 26 }).map((_, i) => {
            const a = (i / 26) * Math.PI * 2
            return (
              <line
                key={i}
                x1={400 + Math.cos(a) * 90}
                y1={300 + Math.sin(a) * 90}
                x2={400 + Math.cos(a) * 720}
                y2={300 + Math.sin(a) * 720}
                strokeWidth={i % 3 === 0 ? 8 : 2}
                opacity={i % 3 === 0 ? 0.12 : 0.06}
              />
            )
          })}
        </g>
      )
    case 'arcs':
    default:
      return (
        <g fill="none" stroke={color}>
          {Array.from({ length: 8 }).map((_, i) => (
            <circle key={i} cx={90} cy={560} r={140 + i * 96} strokeWidth={i % 2 ? 1.5 : 4} opacity={0.24 - i * 0.026} />
          ))}
        </g>
      )
  }
}

/**
 * Arte de fundo em SVG.
 * @param {string} artKey  chave em src/config/media.js
 * @param {string} variant 'card' | 'cover'  (cover = mais discreta, para fundos de secao)
 */
function ArtBase({ artKey, variant = 'card', className = '' }) {
  const uid = useId().replace(/:/g, '')
  const cfg = getMedia(artKey)
  const { a, b } = accentColor(cfg.accent)
  const soft = variant === 'cover'

  return (
    <svg
      className={`art ${className}`}
      viewBox="0 0 800 600"
      preserveAspectRatio="xMidYMid slice"
      role="presentation"
      focusable="false"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`bg-${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0E1116" />
          <stop offset="68%" stopColor="#0A0C10" />
          <stop offset="100%" stopColor={b} stopOpacity={soft ? 0.26 : 0.4} />
        </linearGradient>
        <radialGradient id={`glow-${uid}`} cx="78%" cy="16%" r="72%">
          <stop offset="0%" stopColor={a} stopOpacity={soft ? 0.16 : 0.15} />
          <stop offset="100%" stopColor={a} stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`vig-${uid}`} cx="50%" cy="45%" r="78%">
          <stop offset="55%" stopColor="#000" stopOpacity="0" />
          <stop offset="100%" stopColor="#000" stopOpacity={soft ? 0.55 : 0.4} />
        </radialGradient>
        <filter id={`grain-${uid}`} x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
      </defs>

      <rect width="800" height="600" fill={`url(#bg-${uid})`} />
      <rect width="800" height="600" fill={`url(#glow-${uid})`} />

      <g opacity={soft ? 0.55 : 1}>
        <Pattern name={cfg.pattern} color={a} />
      </g>

      <g transform="translate(470 250) scale(1.65)" opacity={soft ? 0.1 : 0.16}>
        <Glyph name={cfg.glyph} color={a} />
      </g>

      <rect width="800" height="600" fill={`url(#vig-${uid})`} />
      <rect width="800" height="600" filter={`url(#grain-${uid})`} opacity="0.14" style={{ mixBlendMode: 'overlay' }} />
    </svg>
  )
}

export const Art = memo(ArtBase)
export default Art
