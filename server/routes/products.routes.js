import { Router } from 'express'
import { q } from '../db.js'
import { requireAdminHeader, requireAuth } from '../auth.js'
import { removeUpload, saveUpload, upload } from '../uploads.js'
import { storeCategories } from '../../src/data/products.js'

const router = Router()
router.use(requireAuth)

const CATEGORY_IDS = storeCategories.filter((c) => c.id !== 'todos').map((c) => c.id)
const ART_KEYS = ['tub', 'bar', 'bottle', 'pills', 'shaker', 'sachet']

/** Imagem gravada pelo painel: caminho local ou URL absoluta do Blob. */
const isUploaded = (image) => Boolean(image) && (image.startsWith('/uploads/') || /^https?:\/\//i.test(image))

const toApi = (r) => ({
  id: r.id,
  slug: r.slug,
  name: r.name,
  category: r.category,
  price: r.price_cents === null ? null : Number(r.price_cents) / 100,
  priceCents: r.price_cents === null ? null : Number(r.price_cents),
  description: r.description,
  image: r.image,
  imageIsUpload: isUploaded(r.image),
  art: r.art,
  available: Boolean(r.available),
  active: Boolean(r.active),
  position: r.position,
})

const listAll = async () => (await q.all('SELECT * FROM products ORDER BY position ASC, id ASC')).map(toApi)

const slugify = (t) =>
  String(t)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'produto'

async function uniqueSlug(base, ignoreId = null) {
  let slug = base
  let n = 2
  for (;;) {
    const row = await q.get('SELECT id FROM products WHERE slug = ?', slug)
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
  if (priceCents !== null) priceCents = Number(priceCents)
  if (body.price !== undefined) {
    const raw = body.price
    if (raw === null || raw === '') {
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

router.get('/', async (_req, res, next) => {
  try {
    res.json({ products: await listAll(), categories: storeCategories, artKeys: ART_KEYS })
  } catch (err) {
    next(err)
  }
})

router.post('/', requireAdminHeader, async (req, res, next) => {
  try {
    const d = parseBody(req.body ?? {})
    if (d.errors.length) return res.status(400).json({ error: d.errors[0], errors: d.errors })

    const { m } = await q.get('SELECT COALESCE(MAX(position), -1) AS m FROM products')
    const info = await q.run(
      `INSERT INTO products (slug, name, category, price_cents, description, image, art, available, active, position)
       VALUES (?, ?, ?, ?, ?, '', ?, ?, ?, ?)`,
      await uniqueSlug(slugify(d.name)), d.name, d.category, d.priceCents, d.description,
      d.art, d.available, d.active, Number(m) + 1,
    )

    res.status(201).json({ products: await listAll(), id: info.lastInsertRowid })
  } catch (err) {
    next(err)
  }
})

router.patch('/:id', requireAdminHeader, async (req, res, next) => {
  try {
    const row = await q.get('SELECT * FROM products WHERE id = ?', req.params.id)
    if (!row) return res.status(404).json({ error: 'Produto não encontrado.' })

    const d = parseBody(req.body ?? {}, row)
    if (d.errors.length) return res.status(400).json({ error: d.errors[0], errors: d.errors })

    const slug =
      req.body.name !== undefined && d.name !== row.name ? await uniqueSlug(slugify(d.name), row.id) : row.slug

    await q.run(
      `UPDATE products SET slug = ?, name = ?, category = ?, price_cents = ?, description = ?,
       art = ?, available = ?, active = ?, updated_at = datetime('now') WHERE id = ?`,
      slug, d.name, d.category, d.priceCents, d.description, d.art, d.available, d.active, row.id,
    )

    res.json({ products: await listAll() })
  } catch (err) {
    next(err)
  }
})

/* Trocar a imagem do produto. */
router.put('/:id/image', requireAdminHeader, upload.single('image'), async (req, res, next) => {
  try {
    const row = await q.get('SELECT * FROM products WHERE id = ?', req.params.id)
    if (!row) return res.status(404).json({ error: 'Produto não encontrado.' })
    if (!req.file) return res.status(400).json({ error: 'Nenhuma imagem enviada.' })

    const previous = row.image
    const url = await saveUpload(req.file)
    await q.run("UPDATE products SET image = ?, updated_at = datetime('now') WHERE id = ?", url, row.id)
    if (isUploaded(previous)) await removeUpload(previous)

    res.json({ products: await listAll() })
  } catch (err) {
    next(err)
  }
})

/* Remover a imagem: volta a exibir a arte gerada pelo projeto. */
router.delete('/:id/image', requireAdminHeader, async (req, res, next) => {
  try {
    const row = await q.get('SELECT * FROM products WHERE id = ?', req.params.id)
    if (!row) return res.status(404).json({ error: 'Produto não encontrado.' })

    await q.run("UPDATE products SET image = '', updated_at = datetime('now') WHERE id = ?", row.id)
    if (isUploaded(row.image)) await removeUpload(row.image)
    res.json({ products: await listAll() })
  } catch (err) {
    next(err)
  }
})

router.delete('/:id', requireAdminHeader, async (req, res, next) => {
  try {
    const row = await q.get('SELECT * FROM products WHERE id = ?', req.params.id)
    if (!row) return res.status(404).json({ error: 'Produto não encontrado.' })

    await q.run('DELETE FROM products WHERE id = ?', row.id)
    if (isUploaded(row.image)) await removeUpload(row.image)
    res.json({ products: await listAll() })
  } catch (err) {
    next(err)
  }
})

router.post('/reorder', requireAdminHeader, async (req, res, next) => {
  try {
    const ids = Array.isArray(req.body?.ids) ? req.body.ids : []
    await q.batch(ids.map((id, i) => ({ sql: 'UPDATE products SET position = ? WHERE id = ?', args: [i, id] })))
    res.json({ products: await listAll() })
  } catch (err) {
    next(err)
  }
})

export default router
