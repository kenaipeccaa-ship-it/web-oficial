/* ==========================================================================
   CONTEXTO DA REQUISIÇÃO
   --------------------------------------------------------------------------
   Existe por causa de um detalhe do Vercel Blob.

   O SDK (@vercel/blob) tenta descobrir a credencial OIDC sozinho, chamando
   getVercelOidcToken(), que por sua vez lê:

       getContext().headers?.['x-vercel-oidc-token'] ?? process.env.VERCEL_OIDC_TOKEN

   e getContext() lê o global globalThis[Symbol.for('@vercel/request-context')].
   Esse global é preenchido pelo runtime da Vercel para o formato de handler
   dele. Exportando uma app Express como default (api/index.js), ele não é
   preenchido — e VERCEL_OIDC_TOKEN também não vai para o ambiente. Resultado:
   o SDK não acha credencial nenhuma, mesmo com o store conectado.

   Só que a Vercel MANDA o token em toda invocação, no header
   x-vercel-oidc-token — e isso o Express enxerga sem problema. Este módulo
   guarda esse valor por requisição, para a camada de armazenamento usar.

   AsyncLocalStorage em vez de passar `req` adiante: put()/del() são chamados
   de dez lugares nas rotas, e nenhum precisa saber que isso existe.
   ========================================================================== */
import { AsyncLocalStorage } from 'node:async_hooks'

const storage = new AsyncLocalStorage()

/** Executa o restante da requisição com o contexto disponível. */
export const runWithRequestContext = (context, fn) => storage.run(context, fn)

/** Contexto da requisição atual (ou vazio, fora de uma). */
export const requestContext = () => storage.getStore() ?? {}

/** Middleware: captura o token OIDC que a Vercel envia no header. */
export function requestContextMiddleware(req, _res, next) {
  const oidcToken = String(req.get('x-vercel-oidc-token') || '').trim()
  runWithRequestContext({ oidcToken }, next)
}
