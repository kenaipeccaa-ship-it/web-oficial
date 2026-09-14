import { useState } from 'react'
import { api } from '../api.js'

export default function AccountPanel({ user, notify, onLogout }) {
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    if (next !== confirm) {
      notify('A confirmação não confere com a nova senha.', 'error')
      return
    }
    setBusy(true)
    try {
      await api.changePassword(current, next)
      notify('Senha alterada. Entre novamente.')
      setTimeout(onLogout, 1200)
    } catch (err) {
      notify(err.message, 'error')
      setBusy(false)
    }
  }

  return (
    <section className="adm-panel">
      <header className="adm-panel__head">
        <div>
          <h1>Conta</h1>
          <p>Sessão ativa como <strong>{user.email}</strong>.</p>
        </div>
      </header>

      <form className="adm-form adm-form--narrow" onSubmit={submit}>
        <h2 className="adm-form__title">Alterar senha</h2>

        <label className="adm-field">
          <span>Senha atual</span>
          <input type="password" autoComplete="current-password" required value={current} onChange={(e) => setCurrent(e.target.value)} />
        </label>

        <label className="adm-field">
          <span>Nova senha</span>
          <input type="password" autoComplete="new-password" required minLength={10} value={next} onChange={(e) => setNext(e.target.value)} />
          <em className="adm-field__hint">Mínimo de 10 caracteres.</em>
        </label>

        <label className="adm-field">
          <span>Confirmar nova senha</span>
          <input type="password" autoComplete="new-password" required minLength={10} value={confirm} onChange={(e) => setConfirm(e.target.value)} />
        </label>

        <div className="adm-form__actions">
          <button type="submit" className="adm-btn adm-btn--primary" disabled={busy}>
            {busy ? 'Alterando…' : 'Alterar senha'}
          </button>
        </div>

        <p className="adm-note">
          Ao trocar a senha, todas as sessões abertas são encerradas — inclusive esta. A senha fica guardada como hash
          bcrypt no servidor; ninguém consegue lê-la de volta.
        </p>
      </form>

      <div className="adm-form adm-form--narrow">
        <h2 className="adm-form__title">Sessão</h2>
        <p className="adm-note">
          O acesso usa um cookie httpOnly: o navegador envia a sessão automaticamente e nenhum script da página consegue
          ler o token. Sair encerra a sessão também no servidor.
        </p>
        <div className="adm-form__actions">
          <button
            type="button"
            className="adm-btn adm-btn--danger"
            onClick={async () => {
              try {
                await api.logout()
              } finally {
                onLogout()
              }
            }}
          >
            Sair agora
          </button>
        </div>
      </div>
    </section>
  )
}
