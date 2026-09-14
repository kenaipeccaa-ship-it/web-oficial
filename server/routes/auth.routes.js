import { Router } from 'express'
import { db } from '../db.js'
import {
  clearLoginAttempts, clearSessionCookie, createSession, destroyAllSessions, destroySession,
  hashPassword, loginRateLimit, registerFailedLogin, requireAdminHeader, requireAuth,
  setSessionCookie, verifyPassword,
} from '../auth.js'
import { SESSION_COOKIE } from '../config.js'

const router = Router()

router.post('/login', loginRateLimit, requireAdminHeader, (req, res) => {
  const email = String(req.body?.email || '').trim().toLowerCase()
  const password = String(req.body?.password || '')

  if (!email || !password) {
    return res.status(400).json({ error: 'Informe e-mail e senha.' })
  }

  const user = db.prepare('SELECT id, email, password_hash FROM admin_users WHERE email = ?').get(email)
  // Mensagem única para não revelar se o e-mail existe.
  if (!user || !verifyPassword(password, user.password_hash)) {
    registerFailedLogin(req)
    return res.status(401).json({ error: 'E-mail ou senha incorretos.' })
  }

  clearLoginAttempts(req)
  const { token, expires } = createSession(user.id, req.get('user-agent'))
  setSessionCookie(res, token, expires)
  res.json({ user: { id: user.id, email: user.email } })
})

router.post('/logout', (req, res) => {
  destroySession(req.cookies?.[SESSION_COOKIE])
  clearSessionCookie(res)
  res.json({ ok: true })
})

router.get('/me', requireAuth, (req, res) => {
  res.json({ user: req.user })
})

router.post('/password', requireAuth, requireAdminHeader, (req, res) => {
  const current = String(req.body?.currentPassword || '')
  const next = String(req.body?.newPassword || '')

  if (next.length < 10) {
    return res.status(400).json({ error: 'A nova senha precisa ter pelo menos 10 caracteres.' })
  }

  const row = db.prepare('SELECT password_hash FROM admin_users WHERE id = ?').get(req.user.id)
  if (!row || !verifyPassword(current, row.password_hash)) {
    return res.status(401).json({ error: 'Senha atual incorreta.' })
  }

  db.prepare("UPDATE admin_users SET password_hash = ?, updated_at = datetime('now') WHERE id = ?")
    .run(hashPassword(next), req.user.id)
  destroyAllSessions(req.user.id)
  clearSessionCookie(res)
  res.json({ ok: true, message: 'Senha alterada. Faça login novamente.' })
})

export default router
