import { useEffect, useRef, useState } from 'react'
import { api } from '../api.js'

/* ==========================================================================
   Modalidades — apenas as IMAGENS dos cards
   Nome, etiqueta, ícone e textos continuam definidos em src/config/site.js;
   aqui só se troca a foto de cada modalidade. Sem imagem enviada, o card usa
   a arte gráfica padrão do projeto.
   ========================================================================== */
export default function ModalidadesPanel({ notify }) {
  const [modalidades, setModalidades] = useState([])
  const [images, setImages] = useState({})
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const fileInput = useRef(null)
  const targetId = useRef(null)

  useEffect(() => {
    api
      .settings()
      .then((d) => {
        setModalidades(d.modalidades ?? [])
        setImages(d.modalidadeImages ?? {})
      })
      .catch((e) => notify(e.message, 'error'))
      .finally(() => setLoading(false))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const run = async (fn, okMsg) => {
    setBusy(true)
    try {
      const d = await fn()
      setImages(d.modalidadeImages ?? {})
      notify(okMsg)
    } catch (e) {
      notify(e.message, 'error')
    } finally {
      setBusy(false)
    }
  }

  const onPick = (e) => {
    const file = e.target.files?.[0]
    const id = targetId.current
    if (!file || !id) return
    const nome = modalidades.find((m) => m.id === id)?.name ?? 'modalidade'
    run(() => api.modalidadeImageUpload(id, file), `Foto de ${nome} atualizada.`)
    e.target.value = ''
    targetId.current = null
  }

  const remove = (m) => {
    if (!window.confirm(`Remover a foto de ${m.name}? O card volta à arte padrão.`)) return
    run(() => api.modalidadeImageRemove(m.id), `Foto de ${m.name} removida.`)
  }

  const comFoto = modalidades.filter((m) => images[m.id]).length

  return (
    <section className="adm-panel">
      <header className="adm-panel__head">
        <div>
          <h1>Modalidades</h1>
          <p>
            Fotos dos cards da seção <strong>“Escolha como você quer treinar”</strong>.
            {modalidades.length > 0 && (
              <>
                {' '}
                <strong>{comFoto}</strong> de <strong>{modalidades.length}</strong> com foto própria.
              </>
            )}
          </p>
        </div>
      </header>

      <input ref={fileInput} type="file" accept="image/*" hidden onChange={onPick} />

      {modalidades.length === 0 ? (
        <div className="adm-empty">
          <p className="adm-empty__title">{loading ? 'Carregando…' : 'Nenhuma modalidade cadastrada'}</p>
        </div>
      ) : (
        <ul className="adm-grid">
          {modalidades.map((m) => {
            const url = images[m.id] || ''
            return (
              <li key={m.id} className="adm-card">
                <div className={`adm-card__thumb ${url ? '' : 'adm-card__thumb--empty'}`}>
                  {url ? (
                    <img src={url} alt={`Foto da modalidade ${m.name}`} loading="lazy" />
                  ) : (
                    <p className="adm-card__placeholder">
                      <strong>Sem foto</strong>
                      Usando a arte padrão
                    </p>
                  )}
                  <span className={`adm-chip ${url ? 'adm-chip--on' : 'adm-chip--off'}`}>
                    {url ? 'Foto própria' : 'Arte padrão'}
                  </span>
                </div>

                <div className="adm-card__body">
                  <p className="adm-card__title">{m.name}</p>
                  <p className="adm-card__meta">{m.tag}</p>

                  <div className="adm-card__row">
                    <button
                      type="button"
                      className="adm-btn adm-btn--sm"
                      disabled={busy}
                      onClick={() => { targetId.current = m.id; fileInput.current?.click() }}
                    >
                      {url ? 'Trocar foto' : 'Enviar foto'}
                    </button>
                    {url && (
                      <button type="button" className="adm-btn adm-btn--sm adm-btn--danger" disabled={busy} onClick={() => remove(m)}>
                        Remover foto
                      </button>
                    )}
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      <p className="adm-note">
        Só a imagem é editável aqui. Nome, etiqueta, ícone e descrição das modalidades continuam definidos no código
        (<code>src/config/site.js</code>). Use fotos horizontais — os cards recortam em 16:10. Formatos aceitos: JPG,
        PNG, WebP, AVIF e GIF, até 8 MB. A troca aparece no site na recarga seguinte.
      </p>
    </section>
  )
}
