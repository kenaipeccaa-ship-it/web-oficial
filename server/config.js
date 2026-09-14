/* ==========================================================================
   CONFIGURAÇÃO DO SERVIDOR
   Lida do ambiente. Nenhum segredo no código nem no bundle do frontend.

   DOIS AMBIENTES, UM CÓDIGO SÓ
   - Local:     banco em arquivo SQLite (file:) e imagens em disco.
   - Produção:  banco no Turso/libSQL e imagens no Vercel Blob.
   A troca é feita por variável de ambiente; o código dos handlers é o mesmo.
   ========================================================================== */
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
export const ROOT = path.resolve(here, '..')

export const PORT = Number(process.env.PORT || 3001)
export const NODE_ENV = process.env.NODE_ENV || 'development'
export const IS_PROD = NODE_ENV === 'production'

/** Na Vercel o processo é uma função serverless, não um servidor de longa duração. */
export const IS_VERCEL = Boolean(process.env.VERCEL)

/** Onde ficam o banco em arquivo e as imagens, quando rodando localmente. */
export const DATA_DIR = process.env.DATA_DIR
  ? path.resolve(process.env.DATA_DIR)
  : path.join(ROOT, 'data')
export const UPLOADS_DIR = path.join(DATA_DIR, 'uploads')

/** Pasta do build do site (npm run build). Na Vercel quem serve é a CDN. */
export const DIST_DIR = path.join(ROOT, 'dist')
export const SERVE_STATIC = !IS_VERCEL

/* ------------------------------- Banco ---------------------------------- */
/**
 * Sem TURSO_DATABASE_URL, cai para um arquivo SQLite local — é o mesmo driver
 * (libSQL), então o caminho de código em desenvolvimento é idêntico ao de
 * produção.
 */
export const DB_URL = process.env.TURSO_DATABASE_URL || `file:${path.join(DATA_DIR, 'app.db')}`
export const DB_AUTH_TOKEN = process.env.TURSO_AUTH_TOKEN || ''
export const DB_IS_FILE = DB_URL.startsWith('file:')

/* ----------------------------- Imagens ---------------------------------- */
/** Com o token do Blob presente, as imagens vão para o Vercel Blob. */
export const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN || ''
export const STORAGE_DRIVER = BLOB_TOKEN ? 'blob' : 'local'

/* ------------------------------ Sessão ---------------------------------- */
export const SESSION_COOKIE = 'skyfit_admin_session'
export const SESSION_TTL_HOURS = Number(process.env.SESSION_TTL_HOURS || 12)
export const SESSION_SECRET = process.env.SESSION_SECRET || ''

/* ------------------------------ Uploads --------------------------------- */
export const MAX_UPLOAD_BYTES = Number(process.env.MAX_UPLOAD_BYTES || 8 * 1024 * 1024) // 8 MB
export const MAX_UPLOAD_FILES = 20

/* ------------------------- Administrador -------------------------------- */
export const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || '').trim().toLowerCase()
export const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || ''
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '' // só para o primeiro boot local

/**
 * Configurações que tornam o deploy inviável em serverless: o filesystem da
 * Vercel é efêmero, então banco em arquivo ou imagens em disco seriam
 * perdidos a cada invocação — sem erro visível, o que é pior do que falhar.
 */
export function serverlessMisconfig() {
  if (!IS_VERCEL) return []
  const faltando = []
  if (DB_IS_FILE) faltando.push('TURSO_DATABASE_URL (e TURSO_AUTH_TOKEN)')
  if (STORAGE_DRIVER === 'local') faltando.push('BLOB_READ_WRITE_TOKEN')
  return faltando
}

/** Resumo do ambiente, para o log de boot. */
export const describeEnv = () => ({
  ambiente: IS_VERCEL ? 'vercel' : IS_PROD ? 'produção (node)' : 'desenvolvimento',
  banco: DB_IS_FILE ? `arquivo (${DB_URL.replace('file:', '')})` : 'Turso/libSQL (remoto)',
  imagens: STORAGE_DRIVER === 'blob' ? 'Vercel Blob' : `disco (${UPLOADS_DIR})`,
  estatico: SERVE_STATIC ? 'servido pelo Node' : 'servido pela CDN da Vercel',
})
