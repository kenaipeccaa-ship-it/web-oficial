import { useEffect, useMemo, useState } from 'react'
import { Icon } from './ui/Icon.jsx'
import WhatsAppLink from './ui/WhatsAppLink.jsx'
import { demoNotice, navLinks, whatsappMessages } from '../config/site.js'
import { useSiteInfo } from '../lib/content.jsx'
import { useLockBodyScroll } from '../hooks/useLockBodyScroll.js'
import { useScrollSpy } from '../hooks/useScrollSpy.js'
import './Header.css'

export default function Header() {
  const brand = useSiteInfo()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  useLockBodyScroll(open)

  const ids = useMemo(() => navLinks.map((l) => l.href.slice(1)), [])
  const active = useScrollSpy(ids)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Fecha o menu ao passar para desktop (evita menu preso aberto no resize).
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    const onChange = (e) => e.matches && setOpen(false)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  return (
    <header className={`header ${scrolled ? 'is-scrolled' : ''} ${open ? 'is-open' : ''}`}>
      {/* Faixa que deixa explicito o carater de demonstracao do projeto. */}
      <div className="header__demo" aria-hidden={scrolled}>
        <div className="container header__demo-inner">
          <Icon name="Info" size={13} />
          <span className="header__demo-full">{demoNotice.short}</span>
          <span className="header__demo-short">Demonstração de conceito</span>
        </div>
      </div>

      <div className="header__bar">
        <div className="container header__inner">
          <a href="#inicio" className="logo" onClick={() => setOpen(false)}>
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

          <nav className="nav" aria-label="Navegação principal">
            <ul className="nav__list">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <a
                    className={`nav__link ${active === link.href.slice(1) ? 'is-active' : ''}`}
                    href={link.href}
                    aria-current={active === link.href.slice(1) ? 'true' : undefined}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="header__actions">
            <WhatsAppLink className="btn btn--primary btn--sm header__cta" message={whatsappMessages.geral}>
              Quero treinar
            </WhatsAppLink>

            <button
              type="button"
              className="burger"
              aria-label={open ? 'Fechar menu' : 'Abrir menu'}
              aria-expanded={open}
              aria-controls="menu-mobile"
              onClick={() => setOpen((v) => !v)}
            >
              <span className="burger__box" aria-hidden="true">
                <span />
                <span />
                <span />
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* -------------------------- Menu mobile -------------------------- */}
      <div className={`mmenu ${open ? 'is-open' : ''}`} id="menu-mobile" hidden={!open}>
        <div className="mmenu__inner">
          <nav aria-label="Navegação mobile">
            <ul className="mmenu__list">
              {navLinks.map((link, i) => (
                <li key={link.href} style={{ transitionDelay: `${70 + i * 45}ms` }}>
                  <a className="mmenu__link" href={link.href} onClick={() => setOpen(false)}>
                    <span className="mmenu__num">{String(i + 1).padStart(2, '0')}</span>
                    {link.label}
                    <Icon name="ArrowUpRight" size={18} />
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="mmenu__foot">
            <WhatsAppLink className="btn btn--primary btn--block" message={whatsappMessages.geral} onClick={() => setOpen(false)}>
              Quero treinar
            </WhatsAppLink>
            <p className="mmenu__note">
              <Icon name="MapPin" size={14} /> {brand.region} — {brand.city}
            </p>
          </div>
        </div>
      </div>
    </header>
  )
}
