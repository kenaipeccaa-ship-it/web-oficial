import { useEffect, useRef, useState } from 'react'
import { Icon, WhatsAppGlyph } from './ui/Icon.jsx'
import WhatsAppLink from './ui/WhatsAppLink.jsx'
import { useWhatsAppNumber } from '../lib/content.jsx'
import { whatsappMessages } from '../config/site.js'
import './WhatsAppButton.css'

/** Mensagens rápidas do botão flutuante (editáveis em src/config/site.js). */
const quickOptions = [
  { id: 'planos', icon: 'Layers', label: 'Conhecer os planos', message: whatsappMessages.geral },
  { id: 'experimental', icon: 'Sparkles', label: 'Aula experimental', message: whatsappMessages.experimental },
  { id: 'aulas', icon: 'Activity', label: 'Aulas disponíveis', message: whatsappMessages.aulas },
]

export default function WhatsAppButton() {
  const [open, setOpen] = useState(false)
  const [visible, setVisible] = useState(false)
  const whatsappNumber = useWhatsAppNumber()
  const wrapRef = useRef(null)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 420)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!open) return
    const onDown = (e) => { if (!wrapRef.current?.contains(e.target)) setOpen(false) }
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div className={`wa ${visible ? 'is-visible' : ''} ${open ? 'is-open' : ''}`} ref={wrapRef}>
      <div className="wa__panel" id="wa-panel" role="menu" aria-label="Opções de contato" hidden={!open}>
        <div className="wa__panel-head">
          <span className="wa__panel-title">Falar no WhatsApp</span>
          <p className="wa__panel-sub">Escolha o assunto e a mensagem já vai escrita.</p>
        </div>
        <ul>
          {quickOptions.map((o) => (
            <li key={o.id}>
              <WhatsAppLink className="wa__option" message={o.message} role="menuitem" onClick={() => setOpen(false)}>
                <span className="wa__option-icon"><Icon name={o.icon} size={16} /></span>
                <span className="wa__option-label">{o.label}</span>
                <Icon name="ArrowUpRight" size={15} />
              </WhatsAppLink>
            </li>
          ))}
        </ul>
        {!whatsappNumber && (
          <p className="wa__panel-note">
O número de WhatsApp ainda não foi divulgado.
          </p>
        )}
      </div>

      <button
        type="button"
        className="wa__fab"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="wa-panel"
        aria-label={open ? 'Fechar opções de WhatsApp' : 'Falar no WhatsApp'}
      >
        <span className="wa__fab-icon" aria-hidden="true">
          {open ? <Icon name="X" size={22} /> : <WhatsAppGlyph size={24} />}
        </span>
        <span className="wa__fab-label">Falar no WhatsApp</span>
      </button>
    </div>
  )
}
