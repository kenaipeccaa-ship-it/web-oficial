import { useMemo, useState } from 'react'
import { Icon } from './ui/Icon.jsx'
import Reveal from './ui/Reveal.jsx'
import WhatsAppLink from './ui/WhatsAppLink.jsx'
import ProductCard from './store/ProductCard.jsx'
import ProductModal from './store/ProductModal.jsx'
import ProductFilters from './store/ProductFilters.jsx'
import SearchProducts from './store/SearchProducts.jsx'
import Cart from './store/Cart.jsx'
import { useCart } from '../lib/cart.jsx'
import { storeCategories } from '../data/products.js'
import { useSiteInfo, useStoreProducts } from '../lib/content.jsx'
import { whatsappMessages } from '../config/site.js'
import './Store.css'

/** Normaliza para busca: minúsculas e sem acentos. */
const norm = (t) =>
  String(t)
    .toLocaleLowerCase('pt-BR')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')

export default function Store() {
  const products = useStoreProducts()
  const info = useSiteInfo()
  const [category, setCategory] = useState('todos')
  const [query, setQuery] = useState('')
  const [openProduct, setOpenProduct] = useState(null)
  const [cartOpen, setCartOpen] = useState(false)
  const { add, count, items } = useCart()

  const counts = useMemo(() => {
    const map = { todos: products.length }
    storeCategories.forEach((c) => {
      if (c.id !== 'todos') map[c.id] = products.filter((p) => p.category === c.id).length
    })
    return map
  }, [products])

  const visible = useMemo(() => {
    const q = norm(query.trim())
    return products.filter((p) => {
      if (category !== 'todos' && p.category !== category) return false
      if (!q) return true
      return norm(`${p.name} ${p.category} ${p.description}`).includes(q)
    })
  }, [category, query, products])

  const inCart = (id) => items.some((i) => i.id === id)

  const handleAdd = (product) => {
    add(product)
    setCartOpen(true)
  }

  return (
    <section className="section store" id="loja" aria-labelledby="store-title">
      <div className="store__bg" aria-hidden="true">
        <div className="bg-grid store__grid-bg" />
        <div className="glow store__glow" />
      </div>

      <div className="container">
        {/* ------------------------- Destaque da loja ------------------------- */}
        <div className="store__hero">
          <Reveal className="store__brand">
            <span className="store__badge">
              <Icon name="ShoppingBag" size={13} />
              Exclusive Store
            </span>
            <h2 className="store__title" id="store-title">
              <span>Seu treino.</span>
              <span>Seu suporte.</span>
              <span className="store__title-accent">Sua suplementação.</span>
            </h2>
            <p className="store__lead">{info.storeLead}</p>
            <p className="store__text">{info.storeText}</p>
          </Reveal>

          <Reveal className="store__aside" delay={120}>
            <ul className="store__points">
              <li>
                <span className="store__point-icon"><Icon name="Package" size={17} /></span>
                <div>
                  <strong>Retirada e pedidos</strong>
                  Combinados diretamente com a unidade.
                </div>
              </li>
              <li>
                <span className="store__point-icon"><Icon name="ShieldCheck" size={17} /></span>
                <div>
                  <strong>Sem pagamento online</strong>
                  Nenhum dado bancário é solicitado nesta página.
                </div>
              </li>
              <li>
                <span className="store__point-icon"><Icon name="Info" size={17} /></span>
                <div>
                  <strong>Marcas e valores</strong>
                  Confirmados com a unidade antes da compra.
                </div>
              </li>
            </ul>
            <WhatsAppLink className="p-btn p-btn--ghost p-btn--block" message={whatsappMessages.loja}>
              Falar com a loja
              <Icon name="ArrowRight" size={16} className="btn__arrow" />
            </WhatsAppLink>
          </Reveal>
        </div>

        {/* ---------------------------- Ferramentas --------------------------- */}
        <Reveal className="store__toolbar">
          <SearchProducts value={query} onChange={setQuery} />
          <button
            type="button"
            className="store__cart-btn"
            onClick={() => setCartOpen(true)}
            aria-label={`Abrir carrinho${count ? ` com ${count} ${count === 1 ? 'item' : 'itens'}` : ''}`}
          >
            <Icon name="ShoppingBag" size={17} />
            <span className="store__cart-label">Carrinho</span>
            {count > 0 && <span className="store__cart-count">{count}</span>}
          </button>
        </Reveal>

        <Reveal className="store__filters-row" delay={60}>
          <ProductFilters value={category} onChange={setCategory} counts={counts} />
        </Reveal>

        {/* ------------------------------ Vitrine ----------------------------- */}
        <p className="store__results" aria-live="polite">
          {visible.length === 0
            ? 'Nenhum produto encontrado'
            : `${visible.length} ${visible.length === 1 ? 'produto' : 'produtos'}`}
        </p>

        {visible.length === 0 ? (
          <div className="store__empty">
            <span className="store__empty-icon"><Icon name="Search" size={24} /></span>
            <p className="store__empty-title">Nada por aqui</p>
            <p className="store__empty-text">Tente outro termo de busca ou volte para todas as categorias.</p>
            <button
              type="button"
              className="p-btn p-btn--ghost"
              onClick={() => { setQuery(''); setCategory('todos') }}
            >
              Limpar filtros
            </button>
          </div>
        ) : (
          <ul className="store__grid">
            {visible.map((product, i) => (
              <Reveal as="li" key={product.id} delay={Math.min(i, 5) * 60}>
                <ProductCard
                  product={product}
                  onOpen={setOpenProduct}
                  onAdd={handleAdd}
                  inCart={inCart(product.id)}
                />
              </Reveal>
            ))}
          </ul>
        )}

        <Reveal className="demo-note store__note">
          <Icon name="Info" size={16} />
          <p>
            <strong>Nota da demonstração:</strong> os produtos acima representam categorias de suplemento e servem para
            mostrar a estrutura da loja. Marcas, preços, sabores, tamanhos e informação nutricional não foram
            cadastrados — tudo é definido pela unidade em <code>src/data/products.js</code>.
          </p>
        </Reveal>
      </div>

      <ProductModal
        product={openProduct}
        onClose={() => setOpenProduct(null)}
        onAdd={(p) => { add(p); setOpenProduct(null); setCartOpen(true) }}
        inCart={openProduct ? inCart(openProduct.id) : false}
      />

      <Cart open={cartOpen} onClose={() => setCartOpen(false)} />
    </section>
  )
}
