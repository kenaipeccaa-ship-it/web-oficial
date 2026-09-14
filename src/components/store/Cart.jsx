import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Icon } from '../ui/Icon.jsx'
import WhatsAppLink from '../ui/WhatsAppLink.jsx'
import CartItem from './CartItem.jsx'
import { useCart } from '../../lib/cart.jsx'
import { useLockBodyScroll } from '../../hooks/useLockBodyScroll.js'
import { formatPrice } from '../../data/products.js'
import { whatsappMessages } from '../../config/site.js'

/**
 * Painel do carrinho.
 * Não há pagamento online nem qualquer dado bancário: o pedido é enviado
 * pelo WhatsApp com a lista de itens e quantidades.
 */
export function Cart({ open, onClose }) {
  const { items, setQty, remove, clear, count, subtotal, pendingPrice } = useCart()
  useLockBodyScroll(open)

  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div className="cart" role="dialog" aria-modal="true" aria-labelledby="cart-title">
      <div className="cart__backdrop" onClick={onClose} />

      <aside className="cart__panel">
        <header className="cart__head">
          <h3 className="cart__title" id="cart-title">
            <Icon name="ShoppingBag" size={18} />
            Seu pedido
            {count > 0 && <span className="cart__count">{count}</span>}
          </h3>
          <button type="button" className="cart__close" onClick={onClose} aria-label="Fechar carrinho">
            <Icon name="X" size={18} />
          </button>
        </header>

        {items.length === 0 ? (
          <div className="cart__empty">
            <span className="cart__empty-icon"><Icon name="ShoppingBag" size={26} /></span>
            <p className="cart__empty-title">Seu carrinho está vazio</p>
            <p className="cart__empty-text">Escolha os produtos na vitrine e eles aparecem aqui.</p>
            <button type="button" className="p-btn p-btn--ghost" onClick={onClose}>
              Voltar à vitrine
            </button>
          </div>
        ) : (
          <>
            <ul className="cart__list">
              {items.map((item) => (
                <CartItem key={item.id} item={item} onSetQty={setQty} onRemove={remove} />
              ))}
            </ul>

            <footer className="cart__foot">
              <div className="cart__subtotal">
                <span>Subtotal</span>
                <strong>{subtotal > 0 ? formatPrice(subtotal) : 'A combinar'}</strong>
              </div>

              {pendingPrice > 0 && (
                <p className="cart__hint">
                  <Icon name="Info" size={14} />
                  {pendingPrice === 1
                    ? '1 item ainda não tem preço cadastrado — o valor é informado pela unidade.'
                    : `${pendingPrice} itens ainda não têm preço cadastrado — os valores são informados pela unidade.`}
                </p>
              )}

              <WhatsAppLink
                className="p-btn p-btn--solid p-btn--lg p-btn--block"
                message={whatsappMessages.pedido(items.map((i) => ({ name: i.name, qty: i.qty })))}
                ariaLabel="Finalizar pedido pelo WhatsApp"
              >
                Finalizar pedido pelo WhatsApp
                <Icon name="ArrowRight" size={16} className="btn__arrow" />
              </WhatsAppLink>

              <button type="button" className="cart__clear" onClick={clear}>
                Esvaziar carrinho
              </button>

              <p className="cart__legal">
                <Icon name="Info" size={13} />
                Demonstração: o pedido é apenas uma mensagem de WhatsApp. Não há pagamento online nem armazenamento de
                dados bancários.
              </p>
            </footer>
          </>
        )}
      </aside>
    </div>,
    document.body,
  )
}

export default Cart
