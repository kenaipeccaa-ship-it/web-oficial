import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Icon } from './Icon.jsx'
import { useLockBodyScroll } from '../../hooks/useLockBodyScroll.js'

/** Modal acessivel: fecha com ESC, clique no fundo e prende o foco. */
export function Modal({ open, onClose, labelledBy, children, className = '' }) {
  const panelRef = useRef(null)
  const lastFocused = useRef(null)
  useLockBodyScroll(open)

  useEffect(() => {
    if (!open) return
    lastFocused.current = document.activeElement
    const panel = panelRef.current
    panel?.focus()

    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        onClose()
        return
      }
      if (e.key !== 'Tab' || !panel) return
      const focusables = panel.querySelectorAll(
        'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])',
      )
      if (!focusables.length) return
      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      if (lastFocused.current instanceof HTMLElement) lastFocused.current.focus()
    }
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div className="modal" role="dialog" aria-modal="true" aria-labelledby={labelledBy}>
      <div className="modal__backdrop" onClick={onClose} />
      <div className={`modal__panel ${className}`} ref={panelRef} tabIndex={-1}>
        <button type="button" className="modal__close" onClick={onClose} aria-label="Fechar">
          <Icon name="X" size={20} />
        </button>
        {children}
      </div>
    </div>,
    document.body,
  )
}

export default Modal
