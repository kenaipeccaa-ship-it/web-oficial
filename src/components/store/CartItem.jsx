import { Icon } from '../ui/Icon.jsx'
import { formatPrice, hasPrice } from '../../data/products.js'

/** Linha do carrinho: quantidade, subtotal do item e remoção. */
export function CartItem({ item, onSetQty, onRemove }) {
  const lineTotal = hasPrice(item.price) ? formatPrice(item.price * item.qty) : 'A combinar'

  return (
    <li className="cart-item">
      <div className="cart-item__info">
        <p className="cart-item__name">{item.name}</p>
        <p className="cart-item__unit">{formatPrice(item.price)}</p>
      </div>

      <div className="cart-item__qty" role="group" aria-label={`Quantidade de ${item.name}`}>
        <button type="button" onClick={() => onSetQty(item.id, item.qty - 1)} aria-label={`Diminuir ${item.name}`}>
          <Icon name="Minus" size={14} />
        </button>
        <span aria-live="polite">{item.qty}</span>
        <button type="button" onClick={() => onSetQty(item.id, item.qty + 1)} aria-label={`Aumentar ${item.name}`}>
          <Icon name="Plus" size={14} />
        </button>
      </div>

      <div className="cart-item__end">
        <span className={`cart-item__total ${hasPrice(item.price) ? '' : 'is-quote'}`}>{lineTotal}</span>
        <button type="button" className="cart-item__remove" onClick={() => onRemove(item.id)} aria-label={`Remover ${item.name}`}>
          <Icon name="Trash2" size={15} />
        </button>
      </div>
    </li>
  )
}

export default CartItem
