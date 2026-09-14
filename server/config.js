/* Configuração do servidor, lida do ambiente. Nenhum segredo no frontend. */
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
export const ROOT = path.resolve(here, '..')

export const PORT = Number(process.env.PORT || 3001)
export const NODE_ENV = process.env.NODE_ENV || 'development'
export const IS_PROD = NODE_ENV === 'production'

/** Onde ficam o banco e as imagens enviadas. Fora do código-fonte. */
export const DATA_DIR = process.env.DATA_DIR
  ? path.resolve(process.env.DATA_DIR)
  : path.join(ROOT, 'data')
export const UPLOADS_DIR = path.join(DATA_DIR, 'uploads')

/** Pasta do build do site (npm run build). */
export const DIST_DIR = path.join(ROOT, 'dist')

export const SESSION_COOKIE = 'skyfit_admin_session'
export const SESSION_TTL_HOURS = Number(process.env.SESSION_TTL_HOURS || 12)

export const MAX_UPLOAD_BYTES = Number(process.env.MAX_UPLOAD_BYTES || 8 * 1024 * 1024) // 8 MB
export const MAX_UPLOAD_FILES = 20

/** Credenciais do administrador — sempre do ambiente, nunca do código. */
export const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || '').trim().toLowerCase()
export const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || ''
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '' // só para o primeiro boot

export const SESSION_SECRET = process.env.SESSION_SECRET || ''
