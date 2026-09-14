import { useCallback, useEffect, useState } from 'react'
import { api } from './api.js'
import Login from './Login.jsx'
import Dashboard from './Dashboard.jsx'

export default function AdminApp() {
  const [user, setUser] = useState(null)
  const [checking, setChecking] = useState(true)

  /* Quem decide se há sessão é o servidor: o cookie é httpOnly e o
     JavaScript não consegue lê-lo. Sem sessão válida, cai no login. */
  const refresh = useCallback(async () => {
    try {
      const { user: u } = await api.me()
      setUser(u)
    } catch {
      setUser(null)
    } finally {
      setChecking(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  if (checking) {
    return (
      <div className="adm adm-boot">
        <div className="adm-spinner" aria-hidden="true" />
        <p>Verificando acesso…</p>
      </div>
    )
  }

  if (!user) return <Login onSuccess={refresh} />

  return <Dashboard user={user} onLogout={() => setUser(null)} />
}
