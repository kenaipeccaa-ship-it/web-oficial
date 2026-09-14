import { useState } from 'react'
import { api } from './api.js'

export default function Login({ onSuccess }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      await api.login(email, password)
      await onSuccess()
    } catch (err) {
      setError(err.message)
      setBusy(false)
    }
  }

  return (
    <div className="adm adm-login">
      <form className="adm-login__card" onSubmit={submit}>
        <div className="adm-login__brand">
          <span className="adm-login__mark" aria-hidden="true">
            <svg viewBox="0 0 32 32" width="22" height="22" fill="none">
              <path d="M4 21 L13 7 L17 14 L21 10 L28 21" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="24.5" cy="24.5" r="2.5" fill="currentColor" />
            </svg>
          </span>
          <div>
            <strong>Painel administrativo</strong>
            <span>Acesso restrito ao responsável pelo site</span>
          </div>
        </div>

        <label className="adm-field">
          <span>E-mail</span>
          <input
            type="email"
            name="email"
            autoComplete="username"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="voce@seudominio.com"
          />
        </label>

        <label className="adm-field">
          <span>Senha</span>
          <input
            type="password"
            name="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••••"
          />
        </label>

        {error && (
          <p className="adm-alert adm-alert--error" role="alert">
            {error}
          </p>
        )}

        <button type="submit" className="adm-btn adm-btn--primary adm-btn--block" disabled={busy}>
          {busy ? 'Entrando…' : 'Entrar'}
        </button>

        <p className="adm-login__note">
          As credenciais ficam apenas no servidor, em variáveis de ambiente. Nenhuma senha é guardada no código do site.
        </p>
      </form>
    </div>
  )
}
