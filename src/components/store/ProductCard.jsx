import { Icon } from '../ui/Icon.jsx'
import ProductMedia from './ProductMedia.jsx'
import { categoryLabel, formatPrice, hasPrice } from '../../data/products.js'

/** Card da vitrine. */
export function ProductCard({ product, onOpen, onAdd, inCart }) {
  const { name, category, price, available } = product

  return (
    <article className={`p-card ${available ? '' : 'is-out'}`}>
      <button
        type="button"
        className="p-card__media-btn"
        onClick={() => onOpen(product)}
        aria-label={`Ver detalhes de ${name}`}
      >
        <ProductMedia product={product} />
        <span className={`p-card__stock ${available ? '' : 'is-out'}`}>
          {available ? (
            <>
              <Icon name="Check" size={12} /> Disponível
            </>
          ) : (
            'Indisponível'
          )}
        </span>
      </button>

      <div className="p-card__body">
        <p className="p-card__cat">{categoryLabel(category)}</p>
        <h3 className="p-card__name">{name}</h3>

        <p className={`p-card__price ${hasPrice(price) ? '' : 'is-quote'}`}>{formatPrice(price)}</p>

        <div className="p-card__actions">
          <button type="button" className="p-btn p-btn--ghost" onClick={() => onOpen(product)}>
            Ver produto
          </button>
          <button
            type="button"
            className="p-btn p-btn--solid"
            disabled={!available}
            onClick={() => onAdd(product)}
            aria-label={available ? `Comprar ${name}` : `${name} indisponível`}
          >
            {available ? (
              <>
                <Icon name={inCart ? 'Check' : 'Plus'} size={15} />
                {inCart ? 'No carrinho' : 'Comprar'}
              </>
            ) : (
              'Indisponível'
            )}
          </button>
        </div>
      </div>
    </article>
  )
}

export default ProductCard
