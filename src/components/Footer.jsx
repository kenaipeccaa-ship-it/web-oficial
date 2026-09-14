import { Icon, WhatsAppGlyph } from './ui/Icon.jsx'
import WhatsAppLink from './ui/WhatsAppLink.jsx'
import { useNotice } from '../lib/notice.jsx'
import { demoNotice, whatsappMessages } from '../config/site.js'
import { useSiteInfo } from '../lib/content.jsx'
import './Footer.css'

const footerLinks = [
  { label: 'Início', href: '#inicio' },
  { label: 'Modalidades', href: '#modalidades' },
  { label: 'Planos', href: '#planos' },
  { label: 'Aula experimental', href: '#experimental' },
  { label: 'Localização', href: '#localizacao' },
]

export default function Footer() {
  const brand = useSiteInfo()
  const INSTAGRAM_URL = brand.instagramUrl
  const INSTAGRAM_HANDLE = brand.instagramHandle
  const { notify } = useNotice()
  const year = new Date().getFullYear()

  return (
    <footer className="footer">
      <div className="container footer__inner">
        <div className="footer__brand">
          <a href="#inicio" className="logo">
            <span className="logo__mark" aria-hidden="true">
              <svg viewBox="0 0 32 32" width="26" height="26" fill="none">
                <path d="M4 21 L13 7 L17 14 L21 10 L28 21" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="24.5" cy="24.5" r="2.5" fill="currentColor" />
              </svg>
            </span>
            <span className="logo__text">
              <strong className="logo__name">{brand.name}</strong>
              <span className="logo__unit">{brand.unit}</span>
            </span>
          </a>
          <p className="footer__city">
            <Icon name="MapPin" size={15} />
            {brand.city}
          </p>
          <p className="footer__about">{demoNotice.long}</p>
        </div>

        <nav className="footer__nav" aria-label="Links do rodapé">
          <h2 className="footer__title">Navegação</h2>
          <ul>
            {footerLinks.map((l) => (
              <li key={l.href}>
                <a href={l.href}>{l.label}</a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="footer__contact">
          <h2 className="footer__title">Contato</h2>
          <ul>
            <li>
              <WhatsAppLink className="footer__contact-link" message={whatsappMessages.geral}>
                <span className="footer__contact-icon"><WhatsAppGlyph size={16} /></span>
                <span>
                  WhatsApp
                  <small>Mensagem pronta para enviar</small>
                </span>
              </WhatsAppLink>
            </li>
            <li>
              {INSTAGRAM_URL ? (
                <a className="footer__contact-link" href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer">
                  <span className="footer__contact-icon"><Icon name="Instagram" size={16} /></span>
                  <span>
                    Instagram
                    <small>{INSTAGRAM_HANDLE}</small>
                  </span>
                </a>
              ) : (
                <button
                  type="button"
                  className="footer__contact-link"
                  onClick={() => notify('Demonstração: o perfil do Instagram é um campo editável e ainda não foi preenchido.')}
                >
                  <span className="footer__contact-icon"><Icon name="Instagram" size={16} /></span>
                  <span>
                    Instagram
                    <small>Campo editável — a definir</small>
                  </span>
                </button>
              )}
            </li>
            <li>
              <div className="footer__contact-link footer__contact-link--static">
                <span className="footer__contact-icon"><Icon name="Clock" size={16} /></span>
                <span>
                  Horários
                  <small>Consulte a unidade</small>
                </span>
              </div>
            </li>
          </ul>
        </div>
      </div>

      <div className="container footer__bottom">
        <p>{demoNotice.short}</p>
        <p className="footer__legal">
          © {year} — Página de demonstração criada para apresentação de proposta. Não é um canal oficial da academia.
        </p>
      </div>
    </footer>
  )
}
