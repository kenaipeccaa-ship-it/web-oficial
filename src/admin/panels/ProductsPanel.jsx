import { useEffect, useRef, useState } from 'react'
import { api } from '../api.js'

const EMPTY = { name: '', category: 'whey', price: '', description: '', art: 'tub', available: true, active: true }

const formatBRL = (v) =>
  typeof v === 'number' ? v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'Consulte a unidade'

export default function ProductsPanel({ notify }) {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [artKeys, setArtKeys] = useState([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [form, setForm] = useState(null) // null | EMPTY (novo) | produto (edição)
  const imageInput = useRef(null)
  const imageForId = useRef(null)

  const load = async () => {
    try {
      const d = await api.products()
      setProducts(d.products)
      setCategories(d.categories.filter((c) => c.id !== 'todos'))
      setArtKeys(d.artKeys)
    } catch (e) {
      notify(e.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const run = async (fn, okMsg) => {
    setBusy(true)
    try {
      const { products: list } = await fn()
      setProducts(list)
      if (okMsg) notify(okMsg)
      return true
    } catch (e) {
      notify(e.message, 'error')
      return false
    } finally {
      setBusy(false)
    }
  }

  const submit = async (e) => {
    e.preventDefault()
    const payload = {
      name: form.name,
      category: form.category,
      price: form.price === '' ? null : form.price,
      description: form.description,
      art: form.art,
      available: form.available,
      active: form.active,
    }
    const ok = form.id
      ? await run(() => api.productUpdate(form.id, payload), 'Produto atualizado.')
      : await run(() => api.productCreate(payload), 'Produto criado.')
    if (ok) setForm(null)
  }

  const onImage = (e) => {
    const file = e.target.files?.[0]
    if (!file || !imageForId.current) return
    run(() => api.productImage(imageForId.current, file), 'Imagem atualizada.')
    e.target.value = ''
    imageForId.current = null
  }

  const remove = (p) => {
    if (!window.confirm(`Excluir "${p.name}"? A ação não pode ser desfeita.`)) return
    run(() => api.productDelete(p.id), 'Produto excluído.')
  }

  const ativos = products.filter((p) => p.active).length

  return (
    <section className="adm-panel">
      <header className="adm-panel__head">
        <div>
          <h1>Produtos</h1>
          <p>
            Itens da <strong>Exclusive Store</strong>. <strong>{ativos}</strong> de <strong>{products.length}</strong> ativo(s)
            no site.
          </p>
        </div>
        <div className="adm-panel__actions">
          <input ref={imageInput} type="file" accept="image/*" hidden onChange={onImage} />
          <button type="button" className="adm-btn adm-btn--primary" disabled={busy} onClick={() => setForm({ ...EMPTY })}>
            Novo produto
          </button>
        </div>
      </header>

      {form && (
        <form className="adm-form" onSubmit={submit}>
          <h2 className="adm-form__title">{form.id ? `Editando: ${form.name}` : 'Novo produto'}</h2>

          <div className="adm-form__grid">
            <label className="adm-field">
              <span>Nome</span>
              <input
                required
                maxLength={120}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Ex.: Whey protein concentrado"
              />
            </label>

            <label className="adm-field">
              <span>Categoria</span>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
            </label>

            <label className="adm-field">
              <span>Preço (R$)</span>
              <input
                inputMode="decimal"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                placeholder="129,90 — deixe vazio para “Consulte a unidade”"
              />
            </label>

            <label className="adm-field">
              <span>Arte (quando não houver foto)</span>
              <select value={form.art} onChange={(e) => setForm({ ...form, art: e.target.value })}>
                {artKeys.map((a) => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </label>
          </div>

          <label className="adm-field">
            <span>Descrição</span>
            <textarea
              rows={3}
              maxLength={2000}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Texto exibido no detalhe do produto."
            />
          </label>

          <div className="adm-form__checks">
            <label className="adm-check">
              <input type="checkbox" checked={form.available} onChange={(e) => setForm({ ...form, available: e.target.checked })} />
              <span>Em estoque <em>(desmarcado exibe “INDISPONÍVEL” e desativa a compra)</em></span>
            </label>
            <label className="adm-check">
              <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
              <span>Ativo no site <em>(desmarcado some da loja pública)</em></span>
            </label>
          </div>

          <div className="adm-form__actions">
            <button type="submit" className="adm-btn adm-btn--primary" disabled={busy}>
              {form.id ? 'Salvar alterações' : 'Criar produto'}
            </button>
            <button type="button" className="adm-btn" onClick={() => setForm(null)}>Cancelar</button>
          </div>
        </form>
      )}

      {products.length === 0 ? (
        <div className="adm-empty">
          <p className="adm-empty__title">{loading ? 'Carregando…' : 'Nenhum produto cadastrado'}</p>
        </div>
      ) : (
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Produto</th>
                <th>Categoria</th>
                <th>Preço</th>
                <th>Estoque</th>
                <th>Site</th>
                <th className="adm-table__end">Ações</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className={p.active ? '' : 'is-off'}>
                  <td>
                    <div className="adm-prod">
                      <span className="adm-prod__img">
                        {p.image ? <img src={p.image} alt="" loading="lazy" /> : <em>arte</em>}
                      </span>
                      <div>
                        <strong>{p.name}</strong>
                        <span>{p.slug}</span>
                      </div>
                    </div>
                  </td>
                  <td>{categories.find((c) => c.id === p.category)?.label ?? p.category}</td>
                  <td className={p.price === null ? 'adm-muted' : ''}>{formatBRL(p.price)}</td>
                  <td>
                    <span className={`adm-chip ${p.available ? 'adm-chip--on' : 'adm-chip--off'}`}>
                      {p.available ? 'Em estoque' : 'Indisponível'}
                    </span>
                  </td>
                  <td>
                    <span className={`adm-chip ${p.active ? 'adm-chip--on' : 'adm-chip--off'}`}>
                      {p.active ? 'Ativo' : 'Oculto'}
                    </span>
                  </td>
                  <td className="adm-table__end">
                    <div className="adm-card__row adm-card__row--end">
                      <button
                        type="button"
                        className="adm-btn adm-btn--sm"
                        disabled={busy}
                        onClick={() => setForm({ ...p, price: p.price === null ? '' : String(p.price).replace('.', ',') })}
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        className="adm-btn adm-btn--sm"
                        disabled={busy}
                        onClick={() => { imageForId.current = p.id; imageInput.current?.click() }}
                      >
                        {p.image ? 'Trocar foto' : 'Enviar foto'}
                      </button>
                      {p.imageIsUpload && (
                        <button type="button" className="adm-btn adm-btn--sm" disabled={busy} onClick={() => run(() => api.productImageRemove(p.id), 'Imagem removida.')}>
                          Remover foto
                        </button>
                      )}
                      <button
                        type="button"
                        className="adm-btn adm-btn--sm"
                        disabled={busy}
                        onClick={() => run(() => api.productUpdate(p.id, { active: !p.active }), p.active ? 'Produto ocultado.' : 'Produto publicado.')}
                      >
                        {p.active ? 'Ocultar' : 'Publicar'}
                      </button>
                      <button type="button" className="adm-btn adm-btn--sm adm-btn--danger" disabled={busy} onClick={() => remove(p)}>
                        Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
