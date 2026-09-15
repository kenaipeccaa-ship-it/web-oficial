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
/**
 * O Vercel Blob aceita DUAS formas de credencial, e o SDK (@vercel/blob)
 * tenta as duas nesta ordem:
 *
 *   1. OIDC  — VERCEL_OIDC_TOKEN + BLOB_STORE_ID. É o que a integração atual
 *              de Blob provisiona ao conectar um store ao projeto. O token
 *              OIDC é de curta duração: chega por requisição (header
 *              x-vercel-oidc-token) e é renovado durante a execução.
 *   2. Token — BLOB_READ_WRITE_TOKEN, credencial longa do modelo anterior.
 *
 * Por isso nada aqui pode ser congelado em `const` no carregamento do módulo:
 * a credencial OIDC simplesmente não existe ainda nesse instante. Estas
 * funções leem o ambiente na hora do uso.
 */
const envOf = (name) => {
  const v = process.env[name]
  return typeof v === 'string' && v.trim() !== '' ? v.trim() : ''
}

/** Credencial disponível agora, ou null. Nunca devolve o valor no log. */
export function blobCredentials() {
  const token = envOf('BLOB_READ_WRITE_TOKEN')
  if (token) return { mode: 'token', token }
  const storeId = envOf('BLOB_STORE_ID')
  const oidc = envOf('VERCEL_OIDC_TOKEN')
  if (storeId && oidc) return { mode: 'oidc', token: '' }
  return null
}

/**
 * Na Vercel o destino é sempre o Blob: o disco da função é efêmero, então
 * gravar nele seria perder a imagem silenciosamente. Se a credencial ainda
 * não apareceu, é melhor falhar na hora do upload — com a mensagem do SDK —
 * do que escrever num lugar que some.
 */
export function storageDriver() {
  if (blobCredentials()) return 'blob'
  return IS_VERCEL ? 'blob' : 'local'
}

/** Nomes (nunca valores) das variáveis de Blob visíveis — só para diagnóstico. */
export const blobEnvNames = () =>
  ['BLOB_READ_WRITE_TOKEN', 'BLOB_STORE_ID', 'VERCEL_OIDC_TOKEN', 'BLOB_WEBHOOK_PUBLIC_KEY']
    .filter((n) => envOf(n) !== '')

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
  return faltando
}

/**
 * O Blob NÃO entra em serverlessMisconfig de propósito.
 *
 * Com autenticação OIDC a credencial pode chegar apenas no header
 * x-vercel-oidc-token da requisição, sem nunca aparecer em process.env — o
 * SDK lê esse contexto sozinho. Derrubar a API inteira com 503 porque não
 * enxergamos a variável seria justamente o bug que estamos corrigindo:
 * ler conteúdo, login e cadastro de produtos não dependem de imagem.
 *
 * Então aqui só avisamos. Se a credencial realmente faltar, quem falha é o
 * upload, com a mensagem do próprio SDK, e só ele.
 */
export function blobWarning() {
  if (!IS_VERCEL || blobCredentials()) return ''
  return (
    'nenhuma credencial de Blob visível em process.env ' +
    '(BLOB_READ_WRITE_TOKEN, ou BLOB_STORE_ID + VERCEL_OIDC_TOKEN). ' +
    'Uploads podem falhar; leitura do site não é afetada. ' +
    `Variáveis de Blob visíveis: ${blobEnvNames().join(', ') || 'nenhuma'}`
  )
}

/** Resumo do ambiente, para o log de boot. */
export const describeEnv = () => ({
  ambiente: IS_VERCEL ? 'vercel' : IS_PROD ? 'produção (node)' : 'desenvolvimento',
  banco: DB_IS_FILE ? `arquivo (${DB_URL.replace('file:', '')})` : 'Turso/libSQL (remoto)',
  imagens:
    storageDriver() === 'blob'
      ? `Vercel Blob (auth: ${blobCredentials()?.mode ?? 'ausente'})`
      : `disco (${UPLOADS_DIR})`,
  estatico: SERVE_STATIC ? 'servido pelo Node' : 'servido pela CDN da Vercel',
})
