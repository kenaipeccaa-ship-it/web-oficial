import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'
import { Info, X } from 'lucide-react'

const NoticeContext = createContext({ notify: () => {} })

export function NoticeProvider({ children }) {
  const [notice, setNotice] = useState(null)
  const timer = useRef(null)

  const notify = useCallback((message) => {
    window.clearTimeout(timer.current)
    setNotice({ message, id: Date.now() })
    timer.current = window.setTimeout(() => setNotice(null), 6000)
  }, [])

  const value = useMemo(() => ({ notify }), [notify])

  return (
    <NoticeContext.Provider value={value}>
      {children}
      <div className="toast-region" role="status" aria-live="polite">
        {notice && (
          <div className="toast" key={notice.id}>
            <Info size={18} aria-hidden="true" />
            <p>{notice.message}</p>
            <button type="button" className="toast__close" onClick={() => setNotice(null)} aria-label="Fechar aviso">
              <X size={16} aria-hidden="true" />
            </button>
          </div>
        )}
      </div>
    </NoticeContext.Provider>
  )
}

export const useNotice = () => useContext(NoticeContext)
