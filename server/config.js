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
import { pontePropria, requestContext } from './request-context.js'

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

/**
 * Procura uma variável pelo nome canônico, ignorando maiúsculas/minúsculas,
 * e aceitando também nomes com prefixo.
 *
 * A Vercel não injeta necessariamente o nome canônico. Ao conectar um store
 * com prefixo, ela usa o prefixo COMO ESCRITO e só padroniza o resto — foi o
 * que aconteceu aqui: o projeto recebeu `blob_STORE_ID` e
 * `blob_READ_WRITE_TOKEN`, em minúsculas. Repare que `blob_STORE_ID` não
 * termina em `_BLOB_STORE_ID`; comparar caixa a caixa, ou só por sufixo,
 * fazia a variável parecer ausente estando presente.
 *
 * Por isso a comparação é feita em caixa alta, de duas formas:
 *   - nome inteiro igual            (blob_STORE_ID          -> BLOB_STORE_ID)
 *   - nome terminado em `_<alvo>`   (SKYFIT_BLOB_STORE_ID   -> BLOB_STORE_ID)
 *
 * A varredura é ordenada para o resultado não depender da ordem do ambiente.
 */
export function findEnv(suffix) {
  const alvo = suffix.toUpperCase()

  const exato = envOf(suffix)
  if (exato) return { name: suffix, value: exato }

  for (const name of Object.keys(process.env).sort()) {
    const up = name.toUpperCase()
    if (up !== alvo && !up.endsWith(`_${alvo}`)) continue
    const value = envOf(name)
    if (value) return { name, value }
  }
  return null
}

/**
 * Um token read-write do Blob é `vercel_blob_rw_<storeId>_<resto>`. Checar o
 * formato evita trocar um OIDC que funciona por um token inutilizável só
 * porque alguma variável de nome parecido existe.
 */
const pareceTokenBlob = (valor) =>
  /^vercel_blob_rw_/i.test(valor) && Boolean(String(valor).split('_')[3])

/** `https://<storeId>.public.blob.vercel-storage.com/...` -> storeId */
export function storeIdDaUrl(url) {
  try {
    const host = new URL(String(url)).hostname
    if (!host.endsWith('.blob.vercel-storage.com')) return ''
    const sub = host.split('.')[0]
    return sub && sub !== 'blob' ? sub : ''
  } catch {
    return ''
  }
}

/** O SDK trabalha com o id sem o prefixo `store_`. */
export const normalizeStoreId = (id) =>
  String(id).startsWith('store_') ? String(id).slice('store_'.length) : String(id)

/**
 * Credencial disponível agora, ou null. Nunca devolve o valor no log.
 *
 * O token OIDC é procurado primeiro no contexto da requisição (header
 * x-vercel-oidc-token, que é por onde ele realmente chega na Vercel) e só
 * depois no ambiente. Por isso esta função não pode virar `const`.
 */
export function blobCredentials() {
  const tokenVar = findEnv('BLOB_READ_WRITE_TOKEN')
  if (tokenVar && pareceTokenBlob(tokenVar.value)) return { mode: 'token', token: tokenVar.value }

  const oidcToken = requestContext().oidcToken || envOf('VERCEL_OIDC_TOKEN')
  if (!oidcToken) return null

  /* Com OIDC o storeId é obrigatório — vira o header x-vercel-blob-store-id
     e o subdomínio da URL pública. Aqui cobrimos as fontes baratas; a outra
     (uma URL já gravada no banco) depende de I/O e fica em storage/blob.js. */
  const idVar = findEnv('BLOB_STORE_ID')
  return {
    mode: 'oidc',
    oidcToken,
    storeId: idVar ? normalizeStoreId(idVar.value) : '',
  }
}

/**
 * Diagnóstico de credenciais — NOMES e fatos, nunca valores.
 *
 * Serve para responder, de dentro da produção, a única pergunta que não dá
 * para responder de fora: quais variáveis a função realmente enxerga. Um
 * segredo nunca sai daqui; só "presente" ou "ausente".
 */
export function blobDiagnostics() {
  const nomes = [
    'BLOB_READ_WRITE_TOKEN', 'BLOB_STORE_ID', 'BLOB_WEBHOOK_PUBLIC_KEY',
    'VERCEL_OIDC_TOKEN', 'TURSO_DATABASE_URL', 'TURSO_AUTH_TOKEN',
  ]
  const cred = blobCredentials()
  return {
    /* VERCEL_ENV não é segredo: diz se este deploy é production ou preview.
       Variável definida só para Production não chega num deploy de Preview. */
    vercelEnv: process.env.VERCEL_ENV || '(não definido)',
    vercel: IS_VERCEL,
    driver: storageDriver(),
    credencial: cred ? cred.mode : 'nenhuma',
    headerOidcNestaRequisicao: Boolean(requestContext().oidcToken),
    contextoGlobalDoSdk: pontePropria(),
    /* "presente" aqui significa achado pela MESMA busca que o upload usa —
       sob qualquer caixa ou prefixo. Mostra o nome real quando difere. */
    variaveis: Object.fromEntries(
      nomes.map((n) => {
        const achado = findEnv(n)
        if (!achado) return [n, 'ausente']
        return [n, achado.name === n ? 'presente' : `presente como ${achado.name}`]
      }),
    ),
    /* Nomes (nunca valores) de toda variável de Blob/OIDC que a função
       enxerga. É aqui que apareceria um nome com prefixo, se existisse. */
    nomesRelacionados: Object.keys(process.env).filter((n) => /BLOB|OIDC/i.test(n)).sort(),
  }
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
    'nenhuma credencial de Blob visível fora de uma requisição ' +
    '(BLOB_READ_WRITE_TOKEN, ou BLOB_STORE_ID + token OIDC). ' +
    'Isso é normal no boot: o token OIDC chega no header de cada requisição. ' +
    'Uploads só falham se continuar ausente durante a requisição. ' +
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
