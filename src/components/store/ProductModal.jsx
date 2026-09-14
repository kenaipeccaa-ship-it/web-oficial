import { Icon } from '../ui/Icon.jsx'
import Modal from '../ui/Modal.jsx'
import WhatsAppLink from '../ui/WhatsAppLink.jsx'
import ProductMedia from './ProductMedia.jsx'
import { categoryLabel, formatPrice, hasPrice } from '../../data/products.js'
import { whatsappMessages } from '../../config/site.js'

/** Detalhe do produto. A compra é fechada pelo WhatsApp — não há checkout online. */
export function ProductModal({ product, onClose, onAdd, inCart }) {
  const open = Boolean(product)

  return (
    <Modal open={open} onClose={onClose} labelledBy="p-modal-title" className="p-modal">
      {product && (
        <div className="p-modal__grid">
          <div className="p-modal__media">
            <ProductMedia product={product} />
          </div>

          <div className="p-modal__info">
            <p className="p-modal__cat">{categoryLabel(product.category)}</p>
            <h3 className="p-modal__name" id="p-modal-title">{product.name}</h3>

            <div className="p-modal__row">
              <span className={`p-modal__price ${hasPrice(product.price) ? '' : 'is-quote'}`}>
                {formatPrice(product.price)}
              </span>
              <span className={`p-modal__stock ${product.available ? '' : 'is-out'}`}>
                {product.available ? 'Disponível' : 'Indisponível'}
              </span>
            </div>

            <p className="p-modal__desc">{product.description}</p>

            {product.note && <p className="p-modal__note">{product.note}</p>}

            <div className="demo-note p-modal__demo">
              <Icon name="Info" size={16} />
              <p>
                Demonstração: marca, sabor, tamanho e informação nutricional não foram cadastrados aqui. Valores e
                disponibilidade são confirmados com a unidade.
              </p>
            </div>

            <div className="p-modal__actions">
              <WhatsAppLink
                className="p-btn p-btn--solid p-btn--lg"
                message={whatsappMessages.produto(product.name)}
                ariaLabel={`Comprar ${product.name} pelo WhatsApp`}
              >
                Comprar pelo WhatsApp
                <Icon name="ArrowRight" size={16} className="btn__arrow" />
              </WhatsAppLink>

              <button
                type="button"
                className="p-btn p-btn--ghost p-btn--lg"
                disabled={!product.available}
                onClick={() => onAdd(product)}
              >
                <Icon name={inCart ? 'Check' : 'Plus'} size={16} />
                {product.available ? (inCart ? 'No carrinho' : 'Adicionar ao carrinho') : 'Indisponível'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Modal>
  )
}

export default ProductModal
