/* ==========================================================================
   APLICAÇÃO EXPRESS (sem escutar porta)
   --------------------------------------------------------------------------
   É aqui que a API é montada. Quem chama:
   - server/index.js  -> sobe um servidor local (npm run dev:all / npm start)
   - api/index.js     -> exporta como função serverless na Vercel

   O que muda entre os dois ambientes está em server/config.js; este arquivo é
   o mesmo nos dois.
   ========================================================================== */
import express from 'express'
import cookieParser from 'cookie-parser'
import fs from 'node:fs'
import path from 'node:path'
import {
  DIST_DIR, IS_PROD, IS_VERCEL, MAX_UPLOAD_BYTES, SERVE_STATIC, storageDriver, UPLOADS_DIR,
  blobWarning,
  serverlessMisconfig,
} from './config.js'
import { ensureAdminUser } from './auth.js'
import { requestContextMiddleware } from './request-context.js'
import { ready } from './db.js'
import authRoutes from './routes/auth.routes.js'
import galleryRoutes from './routes/gallery.routes.js'
import productRoutes from './routes/products.routes.js'
import settingsRoutes from './routes/settings.routes.js'
import publicRoutes from './routes/public.routes.js'

/**
 * Schema, semente e administrador são garantidos uma vez por instância.
 * Em serverless cada instância fria repete isso; as operações são idempotentes.
 */
let bootPromise = null
const boot = () => (bootPromise ??= ready().then(ensureAdminUser))

export function createApp() {
  const app = express()
  app.set('trust proxy', 1) // atrás de proxy/CDN: req.ip e cookie Secure corretos
  app.disable('x-powered-by')

  /* ----------------------------- Cabeçalhos ------------------------------ */
  app.use((_req, res, next) => {
    res.set('X-Content-Type-Options', 'nosniff')
    res.set('X-Frame-Options', 'DENY')
    res.set('Referrer-Policy', 'strict-origin-when-cross-origin')
    res.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()')
    if (IS_PROD) res.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
    next()
  })

  /* O token OIDC da Vercel chega no header de cada requisição; guardá-lo aqui
     é o que permite o upload no Blob autenticar. Precisa vir antes das rotas. */
  app.use(requestContextMiddleware)

  /* Deploy mal configurado falha alto, em vez de perder dados em silêncio.
     A checagem é POR REQUISIÇÃO, não no boot: numa função serverless nem toda
     variável está visível no instante em que o módulo carrega. */
  const aviso = blobWarning()
  if (aviso) console.warn(`[boot] aviso de imagens: ${aviso}`)

  app.use((_req, res, next) => {
    const faltando = serverlessMisconfig()
    if (faltando.length === 0) return next()
    console.error(`[req] variáveis de ambiente faltando na Vercel: ${faltando.join(', ')}`)
    res.status(503).json({
      error:
        'Servidor não configurado para produção. Defina no painel da Vercel: ' +
        `${faltando.join(', ')}. Sem isso, os dados seriam perdidos a cada requisição.`,
    })
  })

  app.use(express.json({ limit: '1mb' }))
  app.use(express.urlencoded({ extended: false, limit: '1mb' }))
  app.use(cookieParser())

  /* Nenhuma rota responde antes do banco estar pronto. */
  app.use(async (_req, _res, next) => {
    try {
      await boot()
      next()
    } catch (err) {
      next(err)
    }
  })

  /* ------------------------------- Imagens ------------------------------- */
  /* Só no armazenamento em disco. Com o Vercel Blob as URLs são absolutas e
     servidas pela CDN do Blob, sem passar por aqui. */
  if (storageDriver() === 'local') {
    app.use(
      '/uploads',
      express.static(UPLOADS_DIR, {
        maxAge: IS_PROD ? '7d' : 0,
        index: false,
        dotfiles: 'deny',
        setHeaders: (res) => res.set('X-Content-Type-Options', 'nosniff'),
      }),
    )
  }

  /* --------------------------------- API --------------------------------- */
  app.use('/api/public', publicRoutes)
  app.use('/api/auth', authRoutes)
  app.use('/api/admin/gallery', galleryRoutes)
  app.use('/api/admin/products', productRoutes)
  app.use('/api/admin/settings', settingsRoutes)

  app.get('/api/health', (_req, res) => res.json({ ok: true, serverless: IS_VERCEL, storage: storageDriver() }))

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

  /* ------------------------- Site buildado (local) ------------------------ */
  /* Na Vercel o site estático é servido pela CDN (ver vercel.json); a função
     cuida só da API. */
  if (SERVE_STATIC && fs.existsSync(DIST_DIR)) {
    app.use(express.static(DIST_DIR, { index: false, maxAge: IS_PROD ? '1h' : 0 }))
    // O site e o painel são a mesma SPA: qualquer rota devolve o index.html.
    app.get(/.*/, (_req, res) => res.sendFile(path.join(DIST_DIR, 'index.html')))
  } else if (SERVE_STATIC) {
    app.get('/', (_req, res) =>
      res.status(503).send('Build não encontrado. Rode "npm run build" ou use "npm run dev:all".'),
    )
  }

  return app
}

export default createApp
