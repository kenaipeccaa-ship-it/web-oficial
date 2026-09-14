import { Router } from 'express'
import { db } from '../db.js'
import { requireAdminHeader, requireAuth } from '../auth.js'
import { publicUrl, removeUpload, upload } from '../uploads.js'

const router = Router()
router.use(requireAuth)

const toApi = (r) => ({
  id: r.id,
  url: publicUrl(r.filename),
  filename: r.filename,
  originalName: r.original_name,
  title: r.title,
  caption: r.caption,
  position: r.position,
  active: Boolean(r.active),
  createdAt: r.created_at,
})

const listAll = () =>
  db.prepare('SELECT * FROM gallery_photos ORDER BY position ASC, id ASC').all().map(toApi)

router.get('/', (_req, res) => res.json({ photos: listAll() }))

/* Envio de várias fotos de uma vez. */
router.post('/', requireAdminHeader, upload.array('photos', 20), (req, res) => {
  const files = req.files ?? []
  if (files.length === 0) return res.status(400).json({ error: 'Nenhuma imagem enviada.' })

  const maxPos = db.prepare('SELECT COALESCE(MAX(position), -1) AS m FROM gallery_photos').get().m
  const insert = db.prepare(
    'INSERT INTO gallery_photos (filename, original_name, title, position, active) VALUES (?, ?, ?, ?, 1)',
  )
  const tx = db.transaction((list) => {
    list.forEach((f, i) => insert.run(f.filename, f.originalname, '', maxPos + 1 + i))
  })
  tx(files)

  res.status(201).json({ photos: listAll(), added: files.length })
})

/* Título, legenda e ativar/desativar. */
router.patch('/:id', requireAdminHeader, (req, res) => {
  const row = db.prepare('SELECT * FROM gallery_photos WHERE id = ?').get(req.params.id)
  if (!row) return res.status(404).json({ error: 'Foto não encontrada.' })

  const title = req.body.title !== undefined ? String(req.body.title).slice(0, 120) : row.title
  const caption = req.body.caption !== undefined ? String(req.body.caption).slice(0, 300) : row.caption
  const active = req.body.active !== undefined ? (req.body.active ? 1 : 0) : row.active

  db.prepare('UPDATE gallery_photos SET title = ?, caption = ?, active = ? WHERE id = ?')
    .run(title, caption, active, row.id)
  res.json({ photos: listAll() })
})

/* Substituir o arquivo de uma foto, mantendo posição e textos. */
router.put('/:id/file', requireAdminHeader, upload.single('photo'), (req, res) => {
  const row = db.prepare('SELECT * FROM gallery_photos WHERE id = ?').get(req.params.id)
  if (!row) {
    if (req.file) removeUpload(req.file.filename)
    return res.status(404).json({ error: 'Foto não encontrada.' })
  }
  if (!req.file) return res.status(400).json({ error: 'Nenhuma imagem enviada.' })

  db.prepare('UPDATE gallery_photos SET filename = ?, original_name = ? WHERE id = ?')
    .run(req.file.filename, req.file.originalname, row.id)
  removeUpload(row.filename)
  res.json({ photos: listAll() })
})

router.delete('/:id', requireAdminHeader, (req, res) => {
  const row = db.prepare('SELECT * FROM gallery_photos WHERE id = ?').get(req.params.id)
  if (!row) return res.status(404).json({ error: 'Foto não encontrada.' })

  db.prepare('DELETE FROM gallery_photos WHERE id = ?').run(row.id)
  removeUpload(row.filename)
  res.json({ photos: listAll() })
})

/* Reordenar: recebe a lista de ids na ordem desejada. */
router.post('/reorder', requireAdminHeader, (req, res) => {
  const ids = Array.isArray(req.body?.ids) ? req.body.ids : []
  const stmt = db.prepare('UPDATE gallery_photos SET position = ? WHERE id = ?')
  const tx = db.transaction((list) => list.forEach((id, i) => stmt.run(i, id)))
  tx(ids)
  res.json({ photos: listAll() })
})

export default router
