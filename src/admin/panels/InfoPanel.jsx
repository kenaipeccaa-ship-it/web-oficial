import { useEffect, useState } from 'react'
import { api } from '../api.js'

const GROUPS = [
  {
    title: 'Identificação',
    fields: [
      { key: 'name', label: 'Nome da academia' },
      { key: 'unit', label: 'Unidade' },
      { key: 'region', label: 'Região' },
      { key: 'city', label: 'Cidade/UF' },
    ],
  },
  {
    title: 'Contato',
    fields: [
      { key: 'whatsapp', label: 'WhatsApp', hint: 'Só números: 55 + DDD + número. Ex.: 5519999999999' },
      { key: 'instagramUrl', label: 'Link do Instagram', hint: 'Começando com https://' },
      { key: 'instagramHandle', label: 'Perfil do Instagram', hint: 'Ex.: @suaacademia' },
      { key: 'phone', label: 'Telefone' },
      { key: 'email', label: 'E-mail' },
    ],
  },
  {
    title: 'Endereço e mapa',
    fields: [
      { key: 'addressLine', label: 'Endereço completo' },
      { key: 'mapsDirectionsUrl', label: 'Link “Como chegar”', hint: 'Link do Google Maps' },
      { key: 'mapEmbedUrl', label: 'Mapa incorporado', hint: 'URL de incorporação (https://www.google.com/maps/embed...)' },
    ],
  },
  {
    title: 'Horários',
    fields: [
      { key: 'hoursWeek', label: 'Segunda a sexta' },
      { key: 'hoursSaturday', label: 'Sábado' },
      { key: 'hoursSunday', label: 'Domingo e feriados' },
      { key: 'hoursNote', label: 'Observação sobre horários' },
    ],
  },
  {
    title: 'Textos da página',
    fields: [
      { key: 'heroTitleLine1', label: 'Título — 1ª linha' },
      { key: 'heroTitleLine2', label: 'Título — 2ª linha (destaque)' },
      { key: 'heroLead', label: 'Texto de abertura', multiline: true },
      { key: 'storeLead', label: 'Loja — frase principal' },
      { key: 'storeText', label: 'Loja — texto de apoio', multiline: true },
    ],
  },
]

export default function InfoPanel({ notify }) {
  const [info, setInfo] = useState(null)
  const [busy, setBusy] = useState(false)
  const [dirty, setDirty] = useState(false)

  useEffect(() => {
    api
      .settings()
      .then(({ info: i }) => setInfo(i))
      .catch((e) => notify(e.message, 'error'))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const set = (key, value) => {
    setInfo((prev) => ({ ...prev, [key]: value }))
    setDirty(true)
  }

  const save = async (e) => {
    e.preventDefault()
    setBusy(true)
    try {
      const { info: saved } = await api.settingsSave(info)
      setInfo(saved)
      setDirty(false)
      notify('Informações salvas. O site já está atualizado.')
    } catch (err) {
      notify(err.message, 'error')
    } finally {
      setBusy(false)
    }
  }

  if (!info) {
    return (
      <section className="adm-panel">
        <div className="adm-empty"><p className="adm-empty__title">Carregando…</p></div>
      </section>
    )
  }

  return (
    <section className="adm-panel">
      <header className="adm-panel__head">
        <div>
          <h1>Informações</h1>
          <p>Dados da academia exibidos no site. As mudanças aparecem assim que você salvar.</p>
        </div>
        <div className="adm-panel__actions">
          <button type="submit" form="info-form" className="adm-btn adm-btn--primary" disabled={busy || !dirty}>
            {busy ? 'Salvando…' : dirty ? 'Salvar alterações' : 'Tudo salvo'}
          </button>
        </div>
      </header>

      <form id="info-form" className="adm-form" onSubmit={save}>
        {GROUPS.map((group) => (
          <fieldset key={group.title} className="adm-fieldset">
            <legend>{group.title}</legend>
            <div className="adm-form__grid">
              {group.fields.map((f) => (
                <label key={f.key} className={`adm-field ${f.multiline ? 'adm-field--full' : ''}`}>
                  <span>{f.label}</span>
                  {f.multiline ? (
                    <textarea rows={3} value={info[f.key] ?? ''} onChange={(e) => set(f.key, e.target.value)} />
                  ) : (
                    <input value={info[f.key] ?? ''} onChange={(e) => set(f.key, e.target.value)} />
                  )}
                  {f.hint && <em className="adm-field__hint">{f.hint}</em>}
                </label>
              ))}
            </div>
          </fieldset>
        ))}

        <p className="adm-note">
          Campos em branco voltam a usar o texto padrão do projeto. O WhatsApp preenchido aqui passa a valer em todos os
          botões do site.
        </p>
      </form>
    </section>
  )
}
