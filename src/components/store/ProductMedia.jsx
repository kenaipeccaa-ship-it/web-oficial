import { useState } from 'react'
import ProductArt from './ProductArt.jsx'

/**
 * Exibe a FOTO do produto quando o campo "image" estiver preenchido em
 * src/data/products.js. Sem foto (ou se ela falhar ao carregar), mostra a
 * arte gerada e o selo "imagem ilustrativa".
 * // SUBSTITUIR PELAS FOTOS REAIS DOS PRODUTOS — ver /public/images/store/README.md
 */
export function ProductMedia({ product, badge = true, className = '' }) {
  const [failed, setFailed] = useState(false)
  const hasPhoto = Boolean(product.image) && !failed

  return (
    <div className={`p-media ${className}`}>
      {hasPhoto ? (
        <img
          className="p-media__img"
          src={product.image}
          alt={product.name}
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
        />
      ) : (
        <ProductArt art={product.art} seed={product.id} />
      )}
      {!hasPhoto && badge && <span className="p-media__badge">Imagem ilustrativa</span>}
    </div>
  )
}

export default ProductMedia
