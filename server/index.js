/* ==========================================================================
   SERVIDOR
   - Serve a API (pública e administrativa) e, em produção, o site já buildado.
   - Nenhuma rota administrativa responde sem sessão válida.
   ========================================================================== */
// Carrega o .env antes de qualquer módulo que leia process.env.
import 'dotenv/config'
import express from 'express'
import cookieParser from 'cookie-parser'
import fs from 'node:fs'
import path from 'node:path'
import { DIST_DIR, IS_PROD, MAX_UPLOAD_BYTES, PORT, SESSION_SECRET, UPLOADS_DIR } from './config.js'
import { ensureAdminUser } from './auth.js'
import { purgeExpiredSessions } from './db.js'
import authRoutes from './routes/auth.routes.js'
import galleryRoutes from './routes/gallery.routes.js'
import productRoutes from './routes/products.routes.js'
import settingsRoutes from './routes/settings.routes.js'
import publicRoutes from './routes/public.routes.js'

if (IS_PROD && !SESSION_SECRET) {
  console.error('[boot] defina SESSION_SECRET no ambiente antes de subir em produção.')
  process.exit(1)
}

ensureAdminUser()
setInterval(purgeExpiredSessions, 60 * 60 * 1000).unref()

const app = express()
app.set('trust proxy', 1) // atrás de proxy/CDN: req.ip e cookie Secure corretos
app.disable('x-powered-by')

/* ----------------------------- Cabeçalhos ------------------------------- */
app.use((_req, res, next) => {
  res.set('X-Content-Type-Options', 'nosniff')
  res.set('X-Frame-Options', 'DENY')
  res.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  res.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()')
  if (IS_PROD) res.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
  next()
})

app.use(express.json({ limit: '1mb' }))
app.use(express.urlencoded({ extended: false, limit: '1mb' }))
app.use(cookieParser())

/* ------------------------------- Imagens -------------------------------- */
app.use(
  '/uploads',
  express.static(UPLOADS_DIR, {
    maxAge: IS_PROD ? '7d' : 0,
    index: false,
    dotfiles: 'deny',
    setHeaders: (res) => res.set('X-Content-Type-Options', 'nosniff'),
  }),
)

/* --------------------------------- API ---------------------------------- */
app.use('/api/public', publicRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/admin/gallery', galleryRoutes)
app.use('/api/admin/products', productRoutes)
app.use('/api/admin/settings', settingsRoutes)

app.get('/api/health', (_req, res) => res.json({ ok: true }))

/* Erros de upload e afins viram JSON (nunca HTML de stack trace). */
app.use('/api', (err, _req, res, _next) => {
  const tooBig = err?.code === 'LIMIT_FILE_SIZE'
  const status = tooBig ? 413 : 400
  const message = tooBig
    ? `Imagem acima do limite de ${Math.round(MAX_UPLOAD_BYTES / 1024 / 1024)} MB.`
    : err?.message || 'Requisição inválida.'
  if (!IS_PROD) console.error('[api]', err)
  res.status(status).json({ error: message })
})

app.use('/api', (_req, res) => res.status(404).json({ error: 'Rota não encontrada.' }))

/* ------------------------- Site buildado (produção) ---------------------- */
if (fs.existsSync(DIST_DIR)) {
  app.use(express.static(DIST_DIR, { index: false, maxAge: IS_PROD ? '1h' : 0 }))
  // O site e o painel são a mesma SPA: qualquer rota devolve o index.html.
  app.get(/.*/, (_req, res) => res.sendFile(path.join(DIST_DIR, 'index.html')))
} else {
  app.get('/', (_req, res) =>
    res.status(503).send('Build não encontrado. Rode "npm run build" ou use "npm run dev".'),
  )
}

app.listen(PORT, () => {
  console.log(`[boot] API em http://localhost:${PORT}`)
  if (fs.existsSync(DIST_DIR)) console.log(`[boot] site servido de ${DIST_DIR}`)
})
