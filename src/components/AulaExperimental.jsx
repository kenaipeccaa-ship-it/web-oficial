import { useEffect, useState } from 'react'
import { Icon } from './ui/Icon.jsx'
import PhotoFrame from './ui/PhotoFrame.jsx'
import Reveal from './ui/Reveal.jsx'
import WhatsAppLink from './ui/WhatsAppLink.jsx'
import { horariosContato, modalidades, objetivos, whatsappMessages } from '../config/site.js'
import './AulaExperimental.css'

const EMPTY = { nome: '', whatsapp: '', objetivo: '', modalidade: '', horario: '' }

/** Formata o número digitado como (00) 00000-0000 enquanto o usuário escreve. */
function maskPhone(value) {
  const d = value.replace(/\D/g, '').slice(0, 11)
  if (d.length <= 2) return d.replace(/^(\d{0,2})/, '($1')
  if (d.length <= 6) return d.replace(/^(\d{2})(\d{0,4})/, '($1) $2')
  if (d.length <= 10) return d.replace(/^(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3')
  return d.replace(/^(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3')
}

export default function AulaExperimental() {
  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [sent, setSent] = useState(false)

  // Preenche o objetivo quando o visitante escolhe um card na seção "Objetivos".
  useEffect(() => {
    const onPick = (e) => {
      setForm((f) => ({ ...f, objetivo: e.detail }))
      setErrors((prev) => ({ ...prev, objetivo: undefined }))
      setSent(false)
    }
    window.addEventListener('skyfit:objetivo', onPick)
    return () => window.removeEventListener('skyfit:objetivo', onPick)
  }, [])

  const setField = (name) => (e) => {
    const value = name === 'whatsapp' ? maskPhone(e.target.value) : e.target.value
    setForm((f) => ({ ...f, [name]: value }))
    setErrors((prev) => (prev[name] ? { ...prev, [name]: undefined } : prev))
  }

  const validate = () => {
    const next = {}
    if (form.nome.trim().length < 2) next.nome = 'Informe seu nome.'
    const digits = form.whatsapp.replace(/\D/g, '')
    if (digits.length < 10) next.whatsapp = 'Informe um WhatsApp com DDD.'
    if (!form.objetivo) next.objetivo = 'Selecione um objetivo.'
    return next
  }

  const onSubmit = (e) => {
    e.preventDefault()
    const next = validate()
    setErrors(next)
    if (Object.keys(next).length) {
      const first = document.getElementById(`f-${Object.keys(next)[0]}`)
      first?.focus()
      return
    }
    // Nenhum dado e enviado ou armazenado: o agendamento acontece pelo WhatsApp.
    // Para integrar de verdade, envie "form" para o seu backend/CRM aqui.
    setSent(true)
  }

  return (
    <section className="section experimental" id="experimental" aria-labelledby="experimental-title">
      <div className="experimental__bg" aria-hidden="true">
        <PhotoFrame artKey="experimental" variant="cover" badge={false} className="experimental__photo" />
        <div className="experimental__scrim" />
      </div>

      <div className="container experimental__inner">
        <div className="experimental__copy">
          <Reveal as="p" className="eyebrow">
            <span className="eyebrow__dot" aria-hidden="true" />
            Aula experimental
          </Reveal>

          <Reveal as="h2" className="experimental__title" id="experimental-title" delay={60}>
            Venha conhecer
          </Reveal>

          <Reveal as="p" className="experimental__lead" delay={120}>
            Antes de decidir, conheça o ambiente, a estrutura e as possibilidades de treino.
          </Reveal>

          <Reveal className="experimental__cta" delay={180}>
            <WhatsAppLink className="btn btn--primary btn--lg" message={whatsappMessages.experimental}>
              Quero fazer uma aula experimental
              <Icon name="ArrowRight" size={18} className="btn__arrow" />
            </WhatsAppLink>
          </Reveal>

          <Reveal as="ul" className="experimental__points" delay={240}>
            <li><Icon name="ShieldCheck" size={17} /> Sem compromisso: você conhece antes de decidir</li>
            <li><Icon name="Sparkles" size={17} /> Conheça a musculação e as aulas coletivas</li>
            <li><Icon name="Clock" size={17} /> Condições e disponibilidade: consulte a unidade</li>
          </Reveal>
        </div>

        {/* ------------------------------ Formulário ------------------------------ */}
        <Reveal className="form-card" delay={140}>
          {sent ? (
            <div className="form-done" role="status">
              <span className="form-done__icon"><Icon name="CheckCircle2" size={30} /></span>
              <h3 className="form-done__title">Obrigado!</h3>
              <p className="form-done__text">Falta só um passo para garantir sua aula.</p>
              <p className="form-done__note">
                Confirme seu horário pelo WhatsApp: é por lá que a equipe responde e agenda a visita.
              </p>
              <div className="form-done__actions">
                <WhatsAppLink className="btn btn--wa btn--block" message={whatsappMessages.experimental}>
                  Falar agora no WhatsApp
                </WhatsAppLink>
                <button type="button" className="btn btn--ghost btn--block" onClick={() => { setForm(EMPTY); setSent(false) }}>
                  Preencher novamente
                </button>
              </div>
            </div>
          ) : (
            <form className="form" onSubmit={onSubmit} noValidate>
              <header className="form__head">
                <h3 className="form__title">Agende sua visita</h3>
                <p className="form__sub">Preencha os dados e a unidade retorna o contato.</p>
              </header>

              <div className="field">
                <label htmlFor="f-nome">Nome</label>
                <input
                  id="f-nome" name="nome" type="text" autoComplete="name" placeholder="Como podemos te chamar?"
                  value={form.nome} onChange={setField('nome')}
                  aria-invalid={Boolean(errors.nome)} aria-describedby={errors.nome ? 'e-nome' : undefined}
                />
                {errors.nome && <p className="field__error" id="e-nome">{errors.nome}</p>}
              </div>

              <div className="field">
                <label htmlFor="f-whatsapp">WhatsApp</label>
                <input
                  id="f-whatsapp" name="whatsapp" type="tel" inputMode="numeric" autoComplete="tel"
                  placeholder="(00) 00000-0000" value={form.whatsapp} onChange={setField('whatsapp')}
                  aria-invalid={Boolean(errors.whatsapp)} aria-describedby={errors.whatsapp ? 'e-whatsapp' : undefined}
                />
                {errors.whatsapp && <p className="field__error" id="e-whatsapp">{errors.whatsapp}</p>}
              </div>

              <div className="field">
                <label htmlFor="f-objetivo">Objetivo</label>
                <div className="field__select">
                  <select
                    id="f-objetivo" name="objetivo" value={form.objetivo} onChange={setField('objetivo')}
                    aria-invalid={Boolean(errors.objetivo)} aria-describedby={errors.objetivo ? 'e-objetivo' : undefined}
                  >
                    <option value="">Selecione seu objetivo</option>
                    {objetivos.map((o) => (
                      <option key={o.id} value={o.label}>{o.label}</option>
                    ))}
                    <option value="Ainda estou definindo">Ainda estou definindo</option>
                  </select>
                  <Icon name="ChevronDown" size={16} />
                </div>
                {errors.objetivo && <p className="field__error" id="e-objetivo">{errors.objetivo}</p>}
              </div>

              <div className="field">
                <label htmlFor="f-modalidade">Modalidade de interesse</label>
                <div className="field__select">
                  <select id="f-modalidade" name="modalidade" value={form.modalidade} onChange={setField('modalidade')}>
                    <option value="">Selecione (opcional)</option>
                    {modalidades.map((m) => (
                      <option key={m.id} value={m.name}>{m.name}</option>
                    ))}
                    <option value="Quero conhecer todas">Quero conhecer todas</option>
                  </select>
                  <Icon name="ChevronDown" size={16} />
                </div>
              </div>

              <div className="field">
                <label htmlFor="f-horario">Melhor horário para contato</label>
                <div className="field__select">
                  <select id="f-horario" name="horario" value={form.horario} onChange={setField('horario')}>
                    <option value="">Selecione (opcional)</option>
                    {horariosContato.map((h) => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                  <Icon name="ChevronDown" size={16} />
                </div>
              </div>

              <button type="submit" className="btn btn--primary btn--block btn--lg form__submit">
                Enviar interesse
                <Icon name="Send" size={17} />
              </button>

              <p className="form__legal">
                <Icon name="Info" size={14} />
Seus dados não são armazenados. O agendamento é confirmado pelo WhatsApp.
              </p>
            </form>
          )}
        </Reveal>
      </div>
    </section>
  )
}
