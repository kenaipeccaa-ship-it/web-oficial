/* Armazenamento no Vercel Blob — usado em produção.
   Devolve URLs absolutas (https://...), então o site não depende de nenhum
   arquivo no filesystem da função. */
import crypto from 'node:crypto'
import { BLOB_TOKEN } from '../config.js'

export const name = 'blob'

export async function put(buffer, { ext, contentType }) {
  const { put: blobPut } = await import('@vercel/blob')
  const key = `skyfit/${Date.now().toString(36)}-${crypto.randomBytes(8).toString('hex')}${ext}`
  const res = await blobPut(key, buffer, {
    access: 'public',
    token: BLOB_TOKEN,
    contentType,
    addRandomSuffix: false,
    cacheControlMaxAge: 31536000,
  })
  return { url: res.url }
}

export async function del(url) {
  if (!url || !/^https?:\/\//i.test(url)) return
  const { del: blobDel } = await import('@vercel/blob')
  await blobDel(url, { token: BLOB_TOKEN }).catch(() => {})
}
