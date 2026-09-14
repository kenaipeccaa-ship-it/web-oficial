import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { hasPrice } from '../data/products.js'

/* ==========================================================================
   CARRINHO DA LOJA
   Estado simples em memória (sem backend, sem pagamento online e sem
   qualquer dado bancário). O pedido é fechado pelo WhatsApp.
   ========================================================================== */

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [items, setItems] = useState([]) // [{ id, name, price, qty }]

  const add = useCallback((product, qty = 1) => {
    if (!product?.available) return
    setItems((prev) => {
      const found = prev.find((i) => i.id === product.id)
      if (found) {
        return prev.map((i) => (i.id === product.id ? { ...i, qty: Math.min(i.qty + qty, 99) } : i))
      }
      return [...prev, { id: product.id, name: product.name, price: product.price, qty }]
    })
  }, [])

  const remove = useCallback((id) => {
    setItems((prev) => prev.filter((i) => i.id !== id))
  }, [])

  const setQty = useCallback((id, qty) => {
    const next = Math.max(0, Math.min(Number(qty) || 0, 99))
    setItems((prev) => (next === 0 ? prev.filter((i) => i.id !== id) : prev.map((i) => (i.id === id ? { ...i, qty: next } : i))))
  }, [])

  const clear = useCallback(() => setItems([]), [])

  const value = useMemo(() => {
    const count = items.reduce((sum, i) => sum + i.qty, 0)
    // Só entram no subtotal os itens que já têm preço cadastrado.
    const subtotal = items.reduce((sum, i) => (hasPrice(i.price) ? sum + i.price * i.qty : sum), 0)
    const pendingPrice = items.filter((i) => !hasPrice(i.price)).length
    return { items, add, remove, setQty, clear, count, subtotal, pendingPrice }
  }, [items, add, remove, setQty, clear])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart precisa estar dentro de <CartProvider>')
  return ctx
}
