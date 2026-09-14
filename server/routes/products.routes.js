import { Router } from 'express'
import { db } from '../db.js'
import { requireAdminHeader, requireAuth } from '../auth.js'
import { publicUrl, removeUpload, upload } from '../uploads.js'
import { storeCategories } from '../../src/data/products.js'

const router = Router()
router.use(requireAuth)

const CATEGORY_IDS = storeCategories.filter((c) => c.id !== 'todos').map((c) => c.id)
const ART_KEYS = ['tub', 'bar', 'bottle', 'pills', 'shaker', 'sachet']

const toApi = (r) => ({
  id: r.id,
  slug: r.slug,
  name: r.name,
  category: r.category,
  price: r.price_cents === null ? null : r.price_cents / 100,
  priceCents: r.price_cents,
  description: r.description,
  image: r.image,
  imageIsUpload: r.image.startsWith('/uploads/'),
  art: r.art,
  available: Boolean(r.available),
  active: Boolean(r.active),
  position: r.position,
})

const listAll = () => db.prepare('SELECT * FROM products ORDER BY position ASC, id ASC').all().map(toApi)

const slugify = (t) =>
  String(t)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'produto'

function uniqueSlug(base, ignoreId = null) {
  let slug = base
  let n = 2
  for (;;) {
    const row = db.prepare('SELECT id FROM products WHERE slug = ?').get(slug)
    if (!row || row.id === ignoreId) return slug
    slug = `${base}-${n}`
    n += 1
  }
}

/** Valida e normaliza o corpo vindo do painel. */
function parseBody(body, current = null) {
  const errors = []

  const name = body.name !== undefined ? String(body.name).trim() : current?.name ?? ''
  if (name.length < 2) errors.push('Informe o nome do produto.')
  if (name.length > 120) errors.push('O nome é muito longo.')

  const category = body.category !== undefined ? String(body.category) : current?.category ?? 'outros'
  if (!CATEGORY_IDS.includes(category)) errors.push('Categoria inválida.')

  const art = body.art !== undefined ? String(body.art) : current?.art ?? 'tub'
  if (!ART_KEYS.includes(art)) errors.push('Arte inválida.')

  let priceCents = current?.price_cents ?? null
  if (body.price !== undefined) {
    const raw = body.price
    if (raw === null || raw === '' ) {
      priceCents = null // sem preço => "Consulte a unidade"
    } else {
      const num = typeof raw === 'number' ? raw : Number(String(raw).replace(/\./g, '').replace(',', '.'))
      if (!Number.isFinite(num) || num < 0 || num > 1e6) errors.push('Preço inválido.')
      else priceCents = Math.round(num * 100)
    }
  }

  const description = body.description !== undefined ? String(body.description).slice(0, 2000) : current?.description ?? ''
  const available = body.available !== undefined ? (body.available ? 1 : 0) : current?.available ?? 1
  const active = body.active !== undefined ? (body.active ? 1 : 0) : current?.active ?? 1

  return { errors, name, category, art, priceCents, description, available, active }
}

router.get('/', (_req, res) =>
  res.json({ products: listAll(), categories: storeCategories, artKeys: ART_KEYS }),
)

router.post('/', requireAdminHeader, (req, res) => {
  const d = parseBody(req.body ?? {})
  if (d.errors.length) return res.status(400).json({ error: d.errors[0], errors: d.errors })

  const maxPos = db.prepare('SELECT COALESCE(MAX(position), -1) AS m FROM products').get().m
  const info = db
    .prepare(
      `INSERT INTO products (slug, name, category, price_cents, description, image, art, available, active, position)
       VALUES (?, ?, ?, ?, ?, '', ?, ?, ?, ?)`,
    )
    .run(uniqueSlug(slugify(d.name)), d.name, d.category, d.priceCents, d.description, d.art, d.available, d.active, maxPos + 1)

  res.status(201).json({ products: listAll(), id: info.lastInsertRowid })
})

router.patch('/:id', requireAdminHeader, (req, res) => {
  const row = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id)
  if (!row) return res.status(404).json({ error: 'Produto não encontrado.' })

  const d = parseBody(req.body ?? {}, row)
  if (d.errors.length) return res.status(400).json({ error: d.errors[0], errors: d.errors })

  const slug = req.body.name !== undefined && d.name !== row.name ? uniqueSlug(slugify(d.name), row.id) : row.slug

  db.prepare(
    `UPDATE products SET slug = ?, name = ?, category = ?, price_cents = ?, description = ?,
     art = ?, available = ?, active = ?, updated_at = datetime('now') WHERE id = ?`,
  ).run(slug, d.name, d.category, d.priceCents, d.description, d.art, d.available, d.active, row.id)

  res.json({ products: listAll() })
})

/* Trocar a imagem do produto. */
router.put('/:id/image', requireAdminHeader, upload.single('image'), (req, res) => {
  const row = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id)
  if (!row) {
    if (req.file) removeUpload(req.file.filename)
    return res.status(404).json({ error: 'Produto não encontrado.' })
  }
  if (!req.file) return res.status(400).json({ error: 'Nenhuma imagem enviada.' })

  const previous = row.image
  db.prepare("UPDATE products SET image = ?, updated_at = datetime('now') WHERE id = ?")
    .run(publicUrl(req.file.filename), row.id)
  if (previous.startsWith('/uploads/')) removeUpload(previous.replace('/uploads/', ''))

  res.json({ products: listAll() })
})

/* Remover a imagem: volta a exibir a arte gerada pelo projeto. */
router.delete('/:id/image', requireAdminHeader, (req, res) => {
  const row = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id)
  if (!row) return res.status(404).json({ error: 'Produto não encontrado.' })

  db.prepare("UPDATE products SET image = '', updated_at = datetime('now') WHERE id = ?").run(row.id)
  if (row.image.startsWith('/uploads/')) removeUpload(row.image.replace('/uploads/', ''))
  res.json({ products: listAll() })
})

router.delete('/:id', requireAdminHeader, (req, res) => {
  const row = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id)
  if (!row) return res.status(404).json({ error: 'Produto não encontrado.' })

  db.prepare('DELETE FROM products WHERE id = ?').run(row.id)
  if (row.image.startsWith('/uploads/')) removeUpload(row.image.replace('/uploads/', ''))
  res.json({ products: listAll() })
})

router.post('/reorder', requireAdminHeader, (req, res) => {
  const ids = Array.isArray(req.body?.ids) ? req.body.ids : []
  const stmt = db.prepare('UPDATE products SET position = ? WHERE id = ?')
  const tx = db.transaction((list) => list.forEach((id, i) => stmt.run(i, id)))
  tx(ids)
  res.json({ products: listAll() })
})

export default router
