import { useEffect, useRef, useState } from 'react'
import { api } from '../api.js'

export default function GalleryPanel({ notify }) {
  const [photos, setPhotos] = useState([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [editing, setEditing] = useState(null) // id em edição de texto
  const fileInput = useRef(null)
  const replaceInput = useRef(null)
  const replacingId = useRef(null)

  const load = async () => {
    try {
      const { photos: list } = await api.gallery()
      setPhotos(list)
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
      const { photos: list } = await fn()
      setPhotos(list)
      if (okMsg) notify(okMsg)
    } catch (e) {
      notify(e.message, 'error')
    } finally {
      setBusy(false)
    }
  }

  const onUpload = (e) => {
    const files = e.target.files
    if (!files?.length) return
    run(() => api.galleryUpload(files), `${files.length} ${files.length === 1 ? 'foto enviada' : 'fotos enviadas'}.`)
    e.target.value = ''
  }

  const onReplace = (e) => {
    const file = e.target.files?.[0]
    if (!file || !replacingId.current) return
    run(() => api.galleryReplace(replacingId.current, file), 'Foto substituída.')
    e.target.value = ''
    replacingId.current = null
  }

  const move = (id, dir) => {
    const idx = photos.findIndex((p) => p.id === id)
    const next = idx + dir
    if (idx < 0 || next < 0 || next >= photos.length) return
    const ids = photos.map((p) => p.id)
    ;[ids[idx], ids[next]] = [ids[next], ids[idx]]
    setPhotos((prev) => {
      const copy = [...prev]
      ;[copy[idx], copy[next]] = [copy[next], copy[idx]]
      return copy
    })
    run(() => api.galleryReorder(ids))
  }

  const remove = (photo) => {
    if (!window.confirm(`Excluir esta foto? A ação não pode ser desfeita.`)) return
    run(() => api.galleryDelete(photo.id), 'Foto excluída.')
  }

  const publicadas = photos.filter((p) => p.active).length

  return (
    <section className="adm-panel">
      <header className="adm-panel__head">
        <div>
          <h1>Galeria</h1>
          <p>
            Fotos da seção <strong>“Um espaço para você evoluir”</strong> do site.
            {photos.length > 0 && (
              <>
                {' '}
                <strong>{publicadas}</strong> de <strong>{photos.length}</strong> publicada(s).
              </>
            )}
          </p>
        </div>
        <div className="adm-panel__actions">
          <input ref={fileInput} type="file" accept="image/*" multiple hidden onChange={onUpload} />
          <input ref={replaceInput} type="file" accept="image/*" hidden onChange={onReplace} />
          <button type="button" className="adm-btn adm-btn--primary" disabled={busy} onClick={() => fileInput.current?.click()}>
            Adicionar fotos
          </button>
        </div>
      </header>

      {photos.length === 0 && (
        <div className="adm-empty">
          <p className="adm-empty__title">{loading ? 'Carregando…' : 'Nenhuma foto enviada'}</p>
          {!loading && (
            <p className="adm-empty__text">
              Enquanto não houver fotos aqui, o site continua exibindo as artes ilustrativas. Assim que você enviar a
              primeira, a seção passa a mostrar as fotos reais da unidade.
            </p>
          )}
        </div>
      )}

      {photos.length > 0 && (
        <ul className="adm-grid">
          {photos.map((photo, i) => (
            <li key={photo.id} className={`adm-card ${photo.active ? '' : 'is-off'}`}>
              <div className="adm-card__thumb">
                <img src={photo.url} alt={photo.title || photo.originalName || 'Foto'} loading="lazy" />
                <span className={`adm-chip ${photo.active ? 'adm-chip--on' : 'adm-chip--off'}`}>
                  {photo.active ? 'Publicada' : 'Oculta'}
                </span>
              </div>

              <div className="adm-card__body">
                {editing === photo.id ? (
                  <form
                    className="adm-card__form"
                    onSubmit={(e) => {
                      e.preventDefault()
                      const fd = new FormData(e.currentTarget)
                      run(
                        () => api.galleryUpdate(photo.id, { title: fd.get('title'), caption: fd.get('caption') }),
                        'Textos salvos.',
                      ).then(() => setEditing(null))
                    }}
                  >
                    <label className="adm-field adm-field--sm">
                      <span>Título</span>
                      <input name="title" defaultValue={photo.title} maxLength={120} placeholder="Ex.: Área de musculação" />
                    </label>
                    <label className="adm-field adm-field--sm">
                      <span>Legenda</span>
                      <input name="caption" defaultValue={photo.caption} maxLength={300} placeholder="Texto curto (opcional)" />
                    </label>
                    <div className="adm-card__row">
                      <button type="submit" className="adm-btn adm-btn--primary adm-btn--sm" disabled={busy}>Salvar</button>
                      <button type="button" className="adm-btn adm-btn--sm" onClick={() => setEditing(null)}>Cancelar</button>
                    </div>
                  </form>
                ) : (
                  <>
                    <p className="adm-card__title">{photo.title || <em>Sem título</em>}</p>
                    {photo.caption && <p className="adm-card__sub">{photo.caption}</p>}
                    <p className="adm-card__meta">#{i + 1} · {photo.originalName || photo.filename}</p>

                    <div className="adm-card__row">
                      <button type="button" className="adm-btn adm-btn--sm" disabled={busy} onClick={() => setEditing(photo.id)}>
                        Editar
                      </button>
                      <button
                        type="button"
                        className="adm-btn adm-btn--sm"
                        disabled={busy}
                        onClick={() => run(() => api.galleryUpdate(photo.id, { active: !photo.active }), photo.active ? 'Foto ocultada.' : 'Foto publicada.')}
                      >
                        {photo.active ? 'Ocultar' : 'Publicar'}
                      </button>
                      <button
                        type="button"
                        className="adm-btn adm-btn--sm"
                        disabled={busy}
                        onClick={() => { replacingId.current = photo.id; replaceInput.current?.click() }}
                      >
                        Substituir
                      </button>
                    </div>

                    <div className="adm-card__row">
                      <button type="button" className="adm-btn adm-btn--icon" disabled={busy || i === 0} onClick={() => move(photo.id, -1)} aria-label="Mover para cima">↑</button>
                      <button type="button" className="adm-btn adm-btn--icon" disabled={busy || i === photos.length - 1} onClick={() => move(photo.id, 1)} aria-label="Mover para baixo">↓</button>
                      <button type="button" className="adm-btn adm-btn--sm adm-btn--danger" disabled={busy} onClick={() => remove(photo)}>
                        Excluir
                      </button>
                    </div>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
