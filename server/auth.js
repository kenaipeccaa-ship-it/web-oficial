/* ==========================================================================
   AUTENTICAÇÃO DO PAINEL
   --------------------------------------------------------------------------
   - Senha guardada como hash bcrypt (nunca em texto puro, nunca no frontend).
   - Sessão em cookie httpOnly + registro no banco, para o logout realmente
     invalidar o acesso.
   - Limite de tentativas de login por IP.
   ========================================================================== */
import crypto from 'node:crypto'
import bcrypt from 'bcryptjs'
import { db, purgeExpiredSessions } from './db.js'
import {
  ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_PASSWORD_HASH, IS_PROD,
  SESSION_COOKIE, SESSION_TTL_HOURS,
} from './config.js'

const sha256 = (v) => crypto.createHash('sha256').update(v).digest('hex')

/* --------------------- Provisionamento do administrador ------------------ */
export function ensureAdminUser() {
  if (!ADMIN_EMAIL) {
    console.warn('[auth] ADMIN_EMAIL não definido — o painel ficará inacessível até configurar o .env')
    return
  }

  const existing = db.prepare('SELECT id, password_hash FROM admin_users WHERE email = ?').get(ADMIN_EMAIL)

  if (ADMIN_PASSWORD && !ADMIN_PASSWORD_HASH) {
    console.warn(
      '[auth] usando ADMIN_PASSWORD em texto puro. ' +
        'Em produção prefira ADMIN_PASSWORD_HASH (gere com: npm run admin:hash).',
    )
  }

  const applyNewPassword = (userId, hash) => {
    db.prepare("UPDATE admin_users SET password_hash = ?, updated_at = datetime('now') WHERE id = ?").run(hash, userId)
    db.prepare('DELETE FROM sessions WHERE user_id = ?').run(userId) // derruba sessões antigas
    console.log('[auth] senha do administrador atualizada pelo ambiente')
  }

  if (existing) {
    // Rotação por hash: troca só quando o hash do ambiente é outro.
    if (ADMIN_PASSWORD_HASH && ADMIN_PASSWORD_HASH !== existing.password_hash) {
      applyNewPassword(existing.id, ADMIN_PASSWORD_HASH)
      return
    }
    // Rotação por senha em texto: bcrypt gera um sal novo a cada chamada, então
    // comparar hashes sempre daria "diferente" e derrubaria a sessão a cada
    // reinício. Aqui a comparação é feita contra a senha em si.
    if (!ADMIN_PASSWORD_HASH && ADMIN_PASSWORD && !bcrypt.compareSync(ADMIN_PASSWORD, existing.password_hash)) {
      applyNewPassword(existing.id, bcrypt.hashSync(ADMIN_PASSWORD, 12))
    }
    return
  }

  const hash = ADMIN_PASSWORD_HASH || (ADMIN_PASSWORD ? bcrypt.hashSync(ADMIN_PASSWORD, 12) : '')
  if (!hash) {
    console.warn('[auth] nenhum administrador cadastrado: defina ADMIN_PASSWORD_HASH (ou ADMIN_PASSWORD) no .env')
    return
  }
  db.prepare('INSERT INTO admin_users (email, password_hash) VALUES (?, ?)').run(ADMIN_EMAIL, hash)
  console.log(`[auth] administrador criado: ${ADMIN_EMAIL}`)
}

/* ------------------------------- Sessões -------------------------------- */
export function createSession(userId, userAgent = '') {
  purgeExpiredSessions()
  const token = crypto.randomBytes(32).toString('hex')
  const expires = new Date(Date.now() + SESSION_TTL_HOURS * 3600 * 1000)
  db.prepare('INSERT INTO sessions (token_hash, user_id, expires_at, user_agent) VALUES (?, ?, ?, ?)').run(
    sha256(token),
    userId,
    expires.toISOString().replace('T', ' ').slice(0, 19),
    String(userAgent).slice(0, 255),
  )
  return { token, expires }
}

export function destroySession(token) {
  if (!token) return
  db.prepare('DELETE FROM sessions WHERE token_hash = ?').run(sha256(token))
}

export function destroyAllSessions(userId) {
  db.prepare('DELETE FROM sessions WHERE user_id = ?').run(userId)
}

export function userFromToken(token) {
  if (!token) return null
  const row = db
    .prepare(
      `SELECT u.id, u.email FROM sessions s
       JOIN admin_users u ON u.id = s.user_id
       WHERE s.token_hash = ? AND s.expires_at > datetime('now')`,
    )
    .get(sha256(token))
  return row ?? null
}

/* ------------------------------- Cookies -------------------------------- */
export function setSessionCookie(res, token, expires) {
  res.cookie(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: IS_PROD,
    path: '/',
    expires,
  })
}

export function clearSessionCookie(res) {
  res.clearCookie(SESSION_COOKIE, { httpOnly: true, sameSite: 'lax', secure: IS_PROD, path: '/' })
}

/* ------------------------------ Middleware ------------------------------ */
/** Exige sessão válida. Sem ela, 401 — nenhum endpoint administrativo é público. */
export function requireAuth(req, res, next) {
  const user = userFromToken(req.cookies?.[SESSION_COOKIE])
  if (!user) return res.status(401).json({ error: 'Não autenticado.' })
  req.user = user
  next()
}

/**
 * Defesa contra CSRF: o cookie é SameSite=Lax e, além disso, toda operação de
 * escrita precisa deste cabeçalho — que um formulário de outro site não
 * consegue enviar sem passar pelo CORS.
 */
export function requireAdminHeader(req, res, next) {
  if (req.get('X-Admin-Request') !== '1') {
    return res.status(403).json({ error: 'Requisição inválida.' })
  }
  next()
}

/* -------------------------- Limite de tentativas ------------------------- */
const attempts = new Map() // ip -> { count, first }
const WINDOW_MS = 15 * 60 * 1000
const MAX_ATTEMPTS = 10

export function loginRateLimit(req, res, next) {
  const ip = req.ip || 'desconhecido'
  const now = Date.now()
  const rec = attempts.get(ip)

  if (rec && now - rec.first > WINDOW_MS) attempts.delete(ip)
  const cur = attempts.get(ip)

  if (cur && cur.count >= MAX_ATTEMPTS) {
    const waitMin = Math.ceil((WINDOW_MS - (now - cur.first)) / 60000)
    return res.status(429).json({ error: `Muitas tentativas. Tente novamente em ${waitMin} min.` })
  }
  next()
}

export function registerFailedLogin(req) {
  const ip = req.ip || 'desconhecido'
  const rec = attempts.get(ip)
  if (rec) rec.count += 1
  else attempts.set(ip, { count: 1, first: Date.now() })
}

export function clearLoginAttempts(req) {
  attempts.delete(req.ip || 'desconhecido')
}

export const verifyPassword = (plain, hash) => bcrypt.compareSync(plain, hash)
export const hashPassword = (plain) => bcrypt.hashSync(plain, 12)
