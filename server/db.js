/* ==========================================================================
   BANCO DE DADOS (libSQL)
   --------------------------------------------------------------------------
   Mesmo driver nos dois ambientes:
   - local:    file:DATA_DIR/app.db  (SQLite em arquivo)
   - produção: Turso (TURSO_DATABASE_URL + TURSO_AUTH_TOKEN)

   O dialeto é SQLite nos dois casos, então o schema e as consultas são
   exatamente os mesmos — nada de comportamento que só aparece em produção.

   Na primeira execução o banco é SEMEADO com o conteúdo que já existia nos
   arquivos estáticos do projeto (src/data/products.js e src/config/site.js).
   ========================================================================== */
import fs from 'node:fs'
import path from 'node:path'
import { createClient } from '@libsql/client'
import { DATA_DIR, DB_AUTH_TOKEN, DB_IS_FILE, DB_URL, UPLOADS_DIR } from './config.js'
import { products as seedProducts } from '../src/data/products.js'
import { brand, openingHours, INSTAGRAM_URL, INSTAGRAM_HANDLE, WHATSAPP_NUMBER, PHONE_NUMBER, EMAIL } from '../src/config/site.js'

/* As pastas locais só existem quando o banco/imagens são em arquivo. */
if (DB_IS_FILE) {
  fs.mkdirSync(DATA_DIR, { recursive: true })
  fs.mkdirSync(UPLOADS_DIR, { recursive: true })
  fs.mkdirSync(path.dirname(DB_URL.replace('file:', '')), { recursive: true })
}

const client = createClient({ url: DB_URL, authToken: DB_AUTH_TOKEN || undefined })

/* --------------------------------------------------------------------------
   Camada fina com a mesma forma que o código já usava, só que assíncrona:
     db.prepare(SQL).get(a, b)   ->   await q.get(SQL, a, b)
     db.prepare(SQL).all(a)      ->   await q.all(SQL, a)
     db.prepare(SQL).run(a)      ->   await q.run(SQL, a)
     db.transaction(...)         ->   await q.batch([{ sql, args }, ...])
   -------------------------------------------------------------------------- */
export const q = {
  async get(sql, ...args) {
    const r = await client.execute({ sql, args })
    return r.rows[0] ?? undefined
  },
  async all(sql, ...args) {
    const r = await client.execute({ sql, args })
    return r.rows
  },
  async run(sql, ...args) {
    const r = await client.execute({ sql, args })
    return {
      // o driver devolve BigInt; o resto do código espera número
      lastInsertRowid: r.lastInsertRowid === undefined ? 0 : Number(r.lastInsertRowid),
      changes: Number(r.rowsAffected ?? 0),
    }
  },
  /** Executa tudo numa transação: ou grava tudo, ou não grava nada. */
  async batch(statements) {
    if (statements.length === 0) return
    await client.batch(statements, 'write')
  },
}

const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS admin_users (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    email         TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at    TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
  `CREATE TABLE IF NOT EXISTS sessions (
    token_hash TEXT PRIMARY KEY,
    user_id    INTEGER NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    expires_at TEXT NOT NULL,
    user_agent TEXT
  )`,
  `CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id)`,
  `CREATE TABLE IF NOT EXISTS gallery_photos (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    filename      TEXT NOT NULL,
    original_name TEXT,
    title         TEXT NOT NULL DEFAULT '',
    caption       TEXT NOT NULL DEFAULT '',
    position      INTEGER NOT NULL DEFAULT 0,
    active        INTEGER NOT NULL DEFAULT 1,
    created_at    TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
  `CREATE TABLE IF NOT EXISTS products (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    slug        TEXT NOT NULL UNIQUE,
    name        TEXT NOT NULL,
    category    TEXT NOT NULL DEFAULT 'outros',
    price_cents INTEGER,
    description TEXT NOT NULL DEFAULT '',
    image       TEXT NOT NULL DEFAULT '',
    art         TEXT NOT NULL DEFAULT 'tub',
    available   INTEGER NOT NULL DEFAULT 1,
    active      INTEGER NOT NULL DEFAULT 1,
    position    INTEGER NOT NULL DEFAULT 0,
    created_at  TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
  `CREATE TABLE IF NOT EXISTS settings (
    key        TEXT PRIMARY KEY,
    value      TEXT NOT NULL,
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
]

/* ----------------------------- Configurações ---------------------------- */
export async function getSetting(key, fallback = null) {
  const row = await q.get('SELECT value FROM settings WHERE key = ?', key)
  if (!row) return fallback
  try {
    return JSON.parse(row.value)
  } catch {
    return fallback
  }
}

export async function setSetting(key, value) {
  await q.run(
    `INSERT INTO settings (key, value, updated_at) VALUES (?, ?, datetime('now'))
     ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = datetime('now')`,
    key,
    JSON.stringify(value),
  )
}

/* Campos editáveis das informações da academia, com os valores atuais do
   site como ponto de partida. */
export const defaultSiteInfo = {
  name: brand.name,
  unit: brand.unit,
  region: brand.region,
  city: brand.city,
  addressLine: brand.addressLine,
  mapEmbedUrl: brand.mapEmbedUrl,
  mapsDirectionsUrl: brand.mapsDirectionsUrl,
  whatsapp: WHATSAPP_NUMBER,
  instagramUrl: INSTAGRAM_URL,
  instagramHandle: INSTAGRAM_HANDLE,
  phone: PHONE_NUMBER,
  email: EMAIL,
  hoursWeek: openingHours.rows[0]?.value ?? '',
  hoursSaturday: openingHours.rows[1]?.value ?? '',
  hoursSunday: openingHours.rows[2]?.value ?? '',
  hoursNote: openingHours.note,
  heroTitleLine1: 'Seu próximo nível',
  heroTitleLine2: 'começa aqui.',
  heroLead:
    'Treine, evolua e faça parte de uma experiência pensada para quem busca mais disposição, saúde e performance.',
  storeLead: 'Suplementação para acompanhar sua rotina de treino.',
  storeText:
    'A loja da unidade reúne suplementos e acessórios para quem já treina e quer resolver tudo no mesmo lugar. Escolha os produtos, monte seu pedido e finalize pelo WhatsApp.',
}

/* ------------------------------- Semente -------------------------------- */
async function seed() {
  const { n } = await q.get('SELECT COUNT(*) AS n FROM products')
  if (Number(n) === 0) {
    await q.batch(
      seedProducts.map((p, i) => ({
        sql: `INSERT INTO products (slug, name, category, price_cents, description, image, art, available, active, position)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?)`,
        args: [
          p.id,
          p.name,
          p.category,
          typeof p.price === 'number' ? Math.round(p.price * 100) : null,
          p.description ?? '',
          p.image ?? '',
          p.art ?? 'tub',
          p.available ? 1 : 0,
          i,
        ],
      })),
    )
    console.log(`[db] ${seedProducts.length} produtos semeados a partir de src/data/products.js`)
  }

  if ((await getSetting('site_info')) === null) {
    await setSetting('site_info', defaultSiteInfo)
    console.log('[db] informações da academia semeadas a partir de src/config/site.js')
  }
}

/* --------------------------- Inicialização ------------------------------ */
/**
 * Em serverless cada invocação pode cair numa instância fria, então o schema
 * é garantido uma vez por instância e o resultado fica memoizado.
 */
let readyPromise = null

export function ready() {
  readyPromise ??= (async () => {
    await client.execute('PRAGMA foreign_keys = ON')
    for (const stmt of SCHEMA) await client.execute(stmt)
    await seed()
    await purgeExpiredSessions()
  })()
  return readyPromise
}

/** Remove sessões vencidas. */
export async function purgeExpiredSessions() {
  await q.run("DELETE FROM sessions WHERE expires_at <= datetime('now')")
}
