/* ==========================================================================
   CONTEXTO DA REQUISIÇÃO
   --------------------------------------------------------------------------
   Existe por causa de como o @vercel/blob procura a credencial OIDC.

   O SDK chama getVercelOidcToken(), que lê:

       getContext().headers?.['x-vercel-oidc-token'] ?? process.env.VERCEL_OIDC_TOKEN

   e getContext() lê globalThis[Symbol.for('@vercel/request-context')]. Esse
   global é preenchido pelo runtime da Vercel para o formato de handler dele.
   Com uma app Express exportada como default (api/index.js), não há garantia
   de que ele seja preenchido.

   Este módulo faz duas coisas:
     1. guarda os dados da requisição num AsyncLocalStorage — put()/del() são
        chamados de dez pontos nas rotas e nenhum precisa receber `req`;
     2. instala uma ponte no global acima QUANDO ele não existe, para que a
        resolução interna do SDK também funcione. Se a Vercel já tiver
        preenchido o global, não encostamos nele.
   ========================================================================== */
import { AsyncLocalStorage } from 'node:async_hooks'

const storage = new AsyncLocalStorage()

/** O mesmo símbolo que o @vercel/oidc usa para achar o contexto. */
export const VERCEL_REQUEST_CONTEXT = Symbol.for('@vercel/request-context')

/** Contexto da requisição atual (ou vazio, fora de uma). */
export const requestContext = () => storage.getStore() ?? {}

/**
 * Ponte para o SDK: só instalada se a Vercel não tiver posto a dela.
 * Instalar por cima do runtime seria arriscado — ele sabe mais que nós.
 */
function installBridge() {
  if (globalThis[VERCEL_REQUEST_CONTEXT]) return false
  globalThis[VERCEL_REQUEST_CONTEXT] = {
    get: () => {
      const { headers } = requestContext()
      return headers ? { headers } : {}
    },
  }
  return true
}

/** Middleware: guarda o token OIDC que a Vercel envia no header. */
export function requestContextMiddleware(req, _res, next) {
  installBridge()
  const headers = req.headers || {}
  const oidcToken = String(headers['x-vercel-oidc-token'] || '').trim()
  storage.run({ headers, oidcToken }, next)
}

/**
 * Diagnóstico: o token chegou nesta requisição? Só o fato, nunca o valor.
 */
export const oidcHeaderPresente = () => Boolean(requestContext().oidcToken)
export const pontePropria = () => {
  const atual = globalThis[VERCEL_REQUEST_CONTEXT]
  if (!atual) return 'ausente'
  return typeof atual.get === 'function' ? 'presente' : 'invalido'
}
