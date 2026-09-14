import { useState } from 'react'
import { Art } from './Art.jsx'
import { getMedia } from '../../config/media.js'

/* ==========================================================================
   <PhotoFrame />
   // SUBSTITUIR PELAS FOTOS REAIS DA UNIDADE
   Ordem de prioridade da imagem:
     1. "src" recebido por propriedade (imagem enviada pelo painel /admin);
     2. "src" de src/config/media.js (foto versionada junto do codigo);
     3. arte grafica gerada pelo projeto + selo "IMAGEM ILUSTRATIVA".
   Se a imagem falhar ao carregar, cai para a arte — o layout nao quebra.
   ========================================================================== */
export function PhotoFrame({ artKey, src, variant = 'card', className = '', badge = true, alt, children }) {
  const cfg = getMedia(artKey)
  const [failed, setFailed] = useState(false)
  const source = src || cfg.src
  const hasPhoto = Boolean(source) && !failed

  // Uma imagem nova precisa de uma tentativa nova, mesmo que a anterior falhe.
  const imgKey = source || 'art'

  return (
    <div className={`photo ${className}`}>
      {hasPhoto ? (
        <img
          key={imgKey}
          className="photo__img"
          src={source}
          alt={alt || cfg.alt}
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
        />
      ) : (
        <Art artKey={artKey} variant={variant} />
      )}
      {!hasPhoto && badge && <span className="photo__badge">Imagem ilustrativa</span>}
      {children}
    </div>
  )
}

export default PhotoFrame
