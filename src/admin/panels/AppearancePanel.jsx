import { useEffect, useRef, useState } from 'react'
import { api } from '../api.js'

/* ==========================================================================
   Página inicial / Aparência
   Gerencia a imagem de fundo do Hero. Sem imagem cadastrada, o site usa a
   arte gráfica padrão do projeto.
   ========================================================================== */
export default function AppearancePanel({ notify }) {
  const [heroImage, setHeroImage] = useState('')
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const fileInput = useRef(null)

  useEffect(() => {
    api
      .settings()
      .then((d) => setHeroImage(d.heroImage || ''))
      .catch((e) => notify(e.message, 'error'))
      .finally(() => setLoading(false))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const run = async (fn, okMsg) => {
    setBusy(true)
    try {
      const d = await fn()
      setHeroImage(d.heroImage || '')
      notify(okMsg)
    } catch (e) {
      notify(e.message, 'error')
    } finally {
      setBusy(false)
    }
  }

  const onPick = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    run(() => api.heroImageUpload(file), 'Imagem do topo atualizada. O site já está usando ela.')
    e.target.value = ''
  }

  const remove = () => {
    if (!window.confirm('Remover a imagem do topo? O site volta a exibir a arte padrão.')) return
    run(() => api.heroImageRemove(), 'Imagem removida. O site voltou à arte padrão.')
  }

  return (
    <section className="adm-panel">
      <header className="adm-panel__head">
        <div>
          <h1>Página inicial</h1>
          <p>Imagem de fundo do topo do site — a primeira coisa que o visitante vê.</p>
        </div>
        <div className="adm-panel__actions">
          <input ref={fileInput} type="file" accept="image/*" hidden onChange={onPick} />
          <button type="button" className="adm-btn adm-btn--primary" disabled={busy || loading} onClick={() => fileInput.current?.click()}>
            {heroImage ? 'Alterar imagem' : 'Enviar imagem'}
          </button>
          {heroImage && (
            <button type="button" className="adm-btn adm-btn--danger" disabled={busy} onClick={remove}>
              Remover imagem
            </button>
          )}
        </div>
      </header>

      <div className="adm-form">
        <h2 className="adm-form__title">Imagem atual</h2>

        <div className="adm-hero-preview">
          {loading ? (
            <p className="adm-hero-preview__empty">Carregando…</p>
          ) : heroImage ? (
            <img src={heroImage} alt="Imagem de fundo do topo do site" />
          ) : (
            <p className="adm-hero-preview__empty">
              <strong>Nenhuma imagem enviada</strong>
              O site está exibindo a arte gráfica padrão do projeto.
            </p>
          )}
          <span className={`adm-chip ${heroImage ? 'adm-chip--on' : 'adm-chip--off'}`}>
            {heroImage ? 'Publicada' : 'Arte padrão'}
          </span>
        </div>

        <p className="adm-note">
          Use uma foto horizontal e de boa resolução (sugestão: 1920×1080 ou maior, até 8 MB). O texto do topo fica por
          cima da imagem, então prefira fotos sem informação importante no canto esquerdo. Formatos aceitos: JPG, PNG,
          WebP, AVIF e GIF. A troca aparece no site assim que a página é recarregada.
        </p>
      </div>
    </section>
  )
}
