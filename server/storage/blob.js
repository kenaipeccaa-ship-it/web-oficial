/* Armazenamento no Vercel Blob — usado em produção.
   Devolve URLs absolutas (https://...), então o site não depende de nenhum
   arquivo no filesystem da função. */
import crypto from 'node:crypto'
import { blobCredentials } from '../config.js'

export const name = 'blob'

/**
 * Credenciais passadas EXPLICITAMENTE ao SDK.
 *
 * Deixar o SDK se virar sozinho não funciona nesta arquitetura: ele procura o
 * token OIDC em globalThis[Symbol.for('@vercel/request-context')], global que
 * o runtime da Vercel preenche para o handler dele, não para uma app Express
 * exportada como default. O token existe — chega no header
 * x-vercel-oidc-token —, mas o SDK não o enxerga, e o erro é
 * "No blob credentials found".
 *
 * Então entregamos de bandeja. O resolvedor do SDK aceita as duas formas:
 *   { token }                  -> modo read-write
 *   { oidcToken, storeId }     -> modo OIDC
 */
const auth = () => {
  const cred = blobCredentials()
  if (cred?.mode === 'token') return { token: cred.token }
  if (cred?.mode === 'oidc') return { oidcToken: cred.oidcToken, storeId: cred.storeId }
  return {}
}

export async function put(buffer, { ext, contentType }) {
  const { put: blobPut } = await import('@vercel/blob')
  const key = `skyfit/${Date.now().toString(36)}-${crypto.randomBytes(8).toString('hex')}${ext}`
  const res = await blobPut(key, buffer, {
    access: 'public',
    ...auth(),
    contentType,
    addRandomSuffix: false,
    cacheControlMaxAge: 31536000,
  })
  return { url: res.url }
}

export async function del(url) {
  if (!url || !/^https?:\/\//i.test(url)) return
  const { del: blobDel } = await import('@vercel/blob')
  await blobDel(url, auth()).catch(() => {})
}
