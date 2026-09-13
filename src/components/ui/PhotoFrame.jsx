import { useState } from 'react'
import { Art } from './Art.jsx'
import { getMedia } from '../../config/media.js'

/* ==========================================================================
   <PhotoFrame />
   // SUBSTITUIR PELAS FOTOS REAIS DA UNIDADE
   Exibe a FOTO REAL quando "src" estiver preenchido em src/config/media.js.
   Enquanto nao houver foto (ou se ela falhar ao carregar), exibe a arte
   grafica e o selo "IMAGEM ILUSTRATIVA", deixando claro que a imagem NAO e
   uma fotografia da unidade.
   ========================================================================== */
export function PhotoFrame({ artKey, variant = 'card', className = '', badge = true, children }) {
  const cfg = getMedia(artKey)
  const [failed, setFailed] = useState(false)
  const hasPhoto = Boolean(cfg.src) && !failed

  return (
    <div className={`photo ${className}`}>
      {hasPhoto ? (
        <img className="photo__img" src={cfg.src} alt={cfg.alt} loading="lazy" decoding="async" onError={() => setFailed(true)} />
      ) : (
        <Art artKey={artKey} variant={variant} />
      )}
      {!hasPhoto && badge && <span className="photo__badge">Imagem ilustrativa</span>}
      {children}
    </div>
  )
}

export default PhotoFrame
