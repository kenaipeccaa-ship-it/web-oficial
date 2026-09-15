/* Armazenamento no Vercel Blob — usado em produção.
   Devolve URLs absolutas (https://...), então o site não depende de nenhum
   arquivo no filesystem da função. */
import crypto from 'node:crypto'
import { blobCredentials, blobDiagnostics, storeIdDaUrl } from '../config.js'

export const name = 'blob'

/**
 * ÚLTIMA fonte de storeId: uma URL de imagem já gravada no banco.
 *
 * O id do store não é segredo — ele é o subdomínio de toda URL pública do
 * Blob (https://<storeId>.public.blob.vercel-storage.com/...). Então, se
 * este projeto já subiu qualquer imagem, o id está guardado no banco e dá
 * para recuperá-lo sem pedir nada a ninguém.
 *
 * Fica aqui, e não em config.js, porque depende de I/O. O valor é
 * memorizado por instância: é imutável enquanto o store for o mesmo.
 */
let storeIdEmCache = ''
async function storeIdDoBanco() {
  if (storeIdEmCache) return storeIdEmCache
  try {
    const { q } = await import('../db.js')
    const alvos = [
      'SELECT filename AS url FROM gallery_photos WHERE filename LIKE \'https://%\' LIMIT 1',
      'SELECT image AS url FROM products WHERE image LIKE \'https://%\' LIMIT 1',
      'SELECT value AS url FROM settings WHERE value LIKE \'%blob.vercel-storage.com%\' LIMIT 1',
    ]
    for (const sql of alvos) {
      const row = await q.get(sql)
      const id = row?.url ? storeIdDaUrl(String(row.url)) : ''
      if (id) {
        storeIdEmCache = id
        return id
      }
    }
  } catch {
    /* Banco indisponível não pode transformar um erro de credencial em outro. */
  }
  return ''
}

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
 *   { oidcToken, storeId }  -> modo OIDC (obrigatório informar o storeId)
 */
async function auth() {
  const cred = blobCredentials()
  if (cred?.mode === 'token') return { token: cred.token }
  if (cred?.mode !== 'oidc') return {}

  const storeId = cred.storeId || (await storeIdDoBanco())
  if (!storeId) {
    throw new Error(
      'Vercel Blob: autenticação OIDC disponível, mas o storeId não foi encontrado. ' +
        'Defina BLOB_STORE_ID nas variáveis de ambiente do projeto na Vercel ' +
        '(o id do store NÃO é segredo: é o subdomínio das URLs públicas do Blob, ' +
        'visível em Storage → skyfit-media).',
    )
  }
  return { oidcToken: cred.oidcToken, storeId }
}

/**
 * Erro de credencial que se explica sozinho.
 *
 * A mensagem crua do SDK diz o que falta, mas não o que a função ENXERGA — e
 * é essa a informação que resolve. Anexamos o mapa de presença (só nomes,
 * nunca valores), para a próxima falha já vir diagnosticada.
 */
function enriquecerErro(err) {
  if (!/No blob credentials found|no storeId was found|storeId não foi encontrado/i.test(err?.message || '')) {
    return err
  }
  const d = blobDiagnostics()
  const vars = Object.entries(d.variaveis).map(([k, v]) => `${k}=${v}`).join(', ')
  err.message =
    `${err.message}\n[diagnóstico] ambiente=${d.vercelEnv}, ` +
    `header x-vercel-oidc-token nesta requisição=${d.headerOidcNestaRequisicao ? 'presente' : 'ausente'}, ` +
    `contexto global do SDK=${d.contextoGlobalDoSdk}, ${vars}, ` +
    `nomes relacionados vistos=[${d.nomesRelacionados.join(' ')}]`
  return err
}

export async function put(buffer, { ext, contentType }) {
  const { put: blobPut } = await import('@vercel/blob')
  const key = `skyfit/${Date.now().toString(36)}-${crypto.randomBytes(8).toString('hex')}${ext}`
  try {
    const res = await blobPut(key, buffer, {
      access: 'public',
      ...(await auth()),
      contentType,
      addRandomSuffix: false,
      cacheControlMaxAge: 31536000,
    })
    if (!storeIdEmCache) storeIdEmCache = storeIdDaUrl(res.url)
    return { url: res.url }
  } catch (err) {
    throw enriquecerErro(err)
  }
}

export async function del(url) {
  if (!url || !/^https?:\/\//i.test(url)) return
  const { del: blobDel } = await import('@vercel/blob')
  /* Uma remoção não deve derrubar a requisição: se a credencial faltar, o
     registro já saiu do banco e o arquivo órfão é o mal menor. */
  const opcoes = await auth().catch(() => null)
  if (!opcoes) return
  await blobDel(url, opcoes).catch(() => {})
}
