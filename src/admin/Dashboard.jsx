import { useEffect, useState } from 'react'
import { api } from './api.js'
import GalleryPanel from './panels/GalleryPanel.jsx'
import ProductsPanel from './panels/ProductsPanel.jsx'
import InfoPanel from './panels/InfoPanel.jsx'
import AccountPanel from './panels/AccountPanel.jsx'

const SECTIONS = [
  { id: 'galeria', label: 'Galeria', icon: 'M3 5h18v14H3z M3 15l5-5 4 4 3-3 6 6' },
  { id: 'produtos', label: 'Produtos', icon: 'M4 7l8-4 8 4v10l-8 4-8-4z M4 7l8 4 8-4 M12 11v10' },
  { id: 'informacoes', label: 'Informações', icon: 'M12 3a9 9 0 100 18 9 9 0 000-18z M12 8h.01 M11 12h1v5h1' },
  { id: 'conta', label: 'Conta', icon: 'M12 12a4 4 0 100-8 4 4 0 000 8z M4 21v-1a6 6 0 016-6h4a6 6 0 016 6v1' },
]

function NavIcon({ d }) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {d.split(' M').map((seg, i) => (
        <path key={i} d={i === 0 ? seg : `M${seg}`} />
      ))}
    </svg>
  )
}

export default function Dashboard({ user, onLogout }) {
  const [section, setSection] = useState(() => window.location.hash.slice(1) || 'galeria')
  const [menuOpen, setMenuOpen] = useState(false)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    window.location.hash = section
    setMenuOpen(false)
  }, [section])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 4000)
    return () => clearTimeout(t)
  }, [toast])

  const notify = (message, kind = 'ok') => setToast({ message, kind })

  const logout = async () => {
    try {
      await api.logout()
    } finally {
      onLogout()
    }
  }

  return (
    <div className="adm adm-shell">
      <header className="adm-topbar">
        <button
          type="button"
          className="adm-burger"
          aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span /><span /><span />
        </button>
        <div className="adm-topbar__title">
          <strong>Painel administrativo</strong>
          <span>{SECTIONS.find((s) => s.id === section)?.label}</span>
        </div>
        <a className="adm-topbar__site" href="/" target="_blank" rel="noopener noreferrer">
          Ver site
        </a>
      </header>

      <div className="adm-body">
        <aside className={`adm-sidebar ${menuOpen ? 'is-open' : ''}`}>
          <div className="adm-sidebar__brand">
            <span className="adm-sidebar__mark" aria-hidden="true">
              <svg viewBox="0 0 32 32" width="20" height="20" fill="none">
                <path d="M4 21 L13 7 L17 14 L21 10 L28 21" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="24.5" cy="24.5" r="2.5" fill="currentColor" />
              </svg>
            </span>
            <div>
              <strong>Dashboard</strong>
              <span>{user.email}</span>
            </div>
          </div>

          <nav className="adm-nav" aria-label="Seções do painel">
            {SECTIONS.map((s) => (
              <button
                key={s.id}
                type="button"
                className={`adm-nav__item ${section === s.id ? 'is-active' : ''}`}
                aria-current={section === s.id ? 'page' : undefined}
                onClick={() => setSection(s.id)}
              >
                <NavIcon d={s.icon} />
                {s.label}
              </button>
            ))}
          </nav>

          <button type="button" className="adm-nav__item adm-nav__item--logout" onClick={logout}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
              <path d="M16 17l5-5-5-5" />
              <path d="M21 12H9" />
            </svg>
            Sair
          </button>
        </aside>

        {menuOpen && <div className="adm-scrim" onClick={() => setMenuOpen(false)} />}

        <main className="adm-main">
          {section === 'galeria' && <GalleryPanel notify={notify} />}
          {section === 'produtos' && <ProductsPanel notify={notify} />}
          {section === 'informacoes' && <InfoPanel notify={notify} />}
          {section === 'conta' && <AccountPanel user={user} notify={notify} onLogout={onLogout} />}
        </main>
      </div>

      {toast && (
        <div className={`adm-toast adm-toast--${toast.kind}`} role="status">
          {toast.message}
        </div>
      )}
    </div>
  )
}
