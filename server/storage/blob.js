/* Armazenamento no Vercel Blob — usado em produção.
   Devolve URLs absolutas (https://...), então o site não depende de nenhum
   arquivo no filesystem da função. */
import crypto from 'node:crypto'
import { blobCredentials } from '../config.js'

export const name = 'blob'

/* Só passamos `token` quando existe de verdade. Passar string vazia não ajuda
   (o SDK ignora valor falsy), mas passar um token inválido atrapalharia: o SDK
   tentaria o modo read-write em vez de cair no OIDC, que é como a integração
   atual de Blob autentica. Sem token explícito, ele resolve sozinho via
   VERCEL_OIDC_TOKEN + BLOB_STORE_ID. */
const auth = () => {
  const cred = blobCredentials()
  return cred?.mode === 'token' ? { token: cred.token } : {}
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
