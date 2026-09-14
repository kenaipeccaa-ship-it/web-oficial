/* ==========================================================================
   BANCO DE DADOS (SQLite via better-sqlite3)
   --------------------------------------------------------------------------
   Arquivo único em DATA_DIR/app.db. Sem serviço externo: basta o processo
   Node ter permissão de escrita na pasta.

   Na primeira execução o banco é SEMEADO com exatamente o conteúdo que já
   existia nos arquivos estáticos do projeto (src/data/products.js e
   src/config/site.js). Assim o site público continua idêntico no dia 1 e
   passa a ser editável pelo painel a partir daí.
   ========================================================================== */
import Database from 'better-sqlite3'
import fs from 'node:fs'
import path from 'node:path'
import { DATA_DIR, UPLOADS_DIR } from './config.js'
import { products as seedProducts } from '../src/data/products.js'
import { brand, openingHours, INSTAGRAM_URL, INSTAGRAM_HANDLE, WHATSAPP_NUMBER, PHONE_NUMBER, EMAIL } from '../src/config/site.js'

fs.mkdirSync(DATA_DIR, { recursive: true })
fs.mkdirSync(UPLOADS_DIR, { recursive: true })

export const db = new Database(path.join(DATA_DIR, 'app.db'))
db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')

db.exec(`
  CREATE TABLE IF NOT EXISTS admin_users (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    email         TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at    TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS sessions (
    token_hash TEXT PRIMARY KEY,
    user_id    INTEGER NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    expires_at TEXT NOT NULL,
    user_agent TEXT
  );
  CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);

  CREATE TABLE IF NOT EXISTS gallery_photos (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    filename      TEXT NOT NULL,
    original_name TEXT,
    title         TEXT NOT NULL DEFAULT '',
    caption       TEXT NOT NULL DEFAULT '',
    position      INTEGER NOT NULL DEFAULT 0,
    active        INTEGER NOT NULL DEFAULT 1,
    created_at    TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS products (
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
  );

  CREATE TABLE IF NOT EXISTS settings (
    key        TEXT PRIMARY KEY,
    value      TEXT NOT NULL,
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`)

/* ----------------------------- Configurações ---------------------------- */
export function getSetting(key, fallback = null) {
  const row = db.prepare('SELECT value FROM settings WHERE key = ?').get(key)
  if (!row) return fallback
  try {
    return JSON.parse(row.value)
  } catch {
    return fallback
  }
}

export function setSetting(key, value) {
  db.prepare(
    `INSERT INTO settings (key, value, updated_at) VALUES (?, ?, datetime('now'))
     ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = datetime('now')`,
  ).run(key, JSON.stringify(value))
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
function seed() {
  const count = db.prepare('SELECT COUNT(*) AS n FROM products').get().n
  if (count === 0) {
    const insert = db.prepare(
      `INSERT INTO products (slug, name, category, price_cents, description, image, art, available, active, position)
       VALUES (@slug, @name, @category, @price_cents, @description, @image, @art, @available, 1, @position)`,
    )
    const tx = db.transaction((list) => {
      list.forEach((p, i) => {
        insert.run({
          slug: p.id,
          name: p.name,
          category: p.category,
          price_cents: typeof p.price === 'number' ? Math.round(p.price * 100) : null,
          description: p.description ?? '',
          image: p.image ?? '',
          art: p.art ?? 'tub',
          available: p.available ? 1 : 0,
          position: i,
        })
      })
    })
    tx(seedProducts)
    console.log(`[db] ${seedProducts.length} produtos semeados a partir de src/data/products.js`)
  }

  if (getSetting('site_info') === null) {
    setSetting('site_info', defaultSiteInfo)
    console.log('[db] informações da academia semeadas a partir de src/config/site.js')
  }
}

seed()

/** Remove sessões vencidas (chamado no boot e periodicamente). */
export function purgeExpiredSessions() {
  db.prepare("DELETE FROM sessions WHERE expires_at <= datetime('now')").run()
}
purgeExpiredSessions()
