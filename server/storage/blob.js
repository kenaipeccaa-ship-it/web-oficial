/* Armazenamento no Vercel Blob — usado em produção.
   Devolve URLs absolutas (https://...), então o site não depende de nenhum
   arquivo no filesystem da função. */
import crypto from 'node:crypto'
import { blobCredentials, blobDiagnostics } from '../config.js'

export const name = 'blob'

/**
 * Credenciais passadas EXPLICITAMENTE ao SDK.
 *
 * Deixar o SDK se virar sozinho não é confiável nesta arquitetura: ele procura
 * o token OIDC em globalThis[Symbol.for('@vercel/request-context')], global que
 * o runtime da Vercel preenche para o handler dele, não necessariamente para
 * uma app Express exportada como default.
 *
 * O resolvedor do SDK aceita:
 *   { token }               -> modo read-write
 *   { oidcToken, storeId }  -> modo OIDC (storeId cai para BLOB_STORE_ID)
 */
const auth = () => {
  const cred = blobCredentials()
  if (cred?.mode === 'token') return { token: cred.token }
  if (cred?.mode === 'oidc') {
    return cred.storeId ? { oidcToken: cred.oidcToken, storeId: cred.storeId } : { oidcToken: cred.oidcToken }
  }
  return {}
}

/**
 * Erro de credencial que se explica sozinho.
 *
 * A mensagem crua do SDK ("No blob credentials found") diz o que falta, mas
 * não diz o que a função ENXERGA — e é essa a informação que falta para
 * resolver. Aqui anexamos o mapa de presença (só nomes, nunca valores), para
 * que a próxima falha já venha diagnosticada.
 */
function enriquecerErro(err) {
  if (!/No blob credentials found|no storeId was found/i.test(err?.message || '')) return err
  const d = blobDiagnostics()
  const vars = Object.entries(d.variaveis).map(([k, v]) => `${k}=${v}`).join(', ')
  err.message =
    `${err.message}\n[diagnóstico] ambiente=${d.vercelEnv}, ` +
    `header x-vercel-oidc-token nesta requisição=${d.headerOidcNestaRequisicao ? 'presente' : 'ausente'}, ` +
    `contexto global do SDK=${d.contextoGlobalDoSdk}, ${vars}`
  return err
}

export async function put(buffer, { ext, contentType }) {
  const { put: blobPut } = await import('@vercel/blob')
  const key = `skyfit/${Date.now().toString(36)}-${crypto.randomBytes(8).toString('hex')}${ext}`
  try {
    const res = await blobPut(key, buffer, {
      access: 'public',
      ...auth(),
      contentType,
      addRandomSuffix: false,
      cacheControlMaxAge: 31536000,
    })
    return { url: res.url }
  } catch (err) {
    throw enriquecerErro(err)
  }
}

export async function del(url) {
  if (!url || !/^https?:\/\//i.test(url)) return
  const { del: blobDel } = await import('@vercel/blob')
  await blobDel(url, auth()).catch(() => {})
}
