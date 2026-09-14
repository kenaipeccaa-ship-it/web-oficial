import { Router } from 'express'
import { q } from '../db.js'
import { requireAdminHeader, requireAuth } from '../auth.js'
import { removeUpload, saveUpload, upload } from '../uploads.js'

const router = Router()
router.use(requireAuth)

/* A coluna "filename" guarda a URL pública da imagem: "/uploads/..." quando o
   armazenamento é em disco e "https://..." quando é o Vercel Blob. Registros
   antigos que guardavam só o nome do arquivo continuam funcionando. */
const toUrl = (v) => (!v ? '' : /^(https?:)?\/\//i.test(v) || v.startsWith('/') ? v : `/uploads/${v}`)

const toApi = (r) => ({
  id: r.id,
  url: toUrl(r.filename),
  filename: r.filename,
  originalName: r.original_name,
  title: r.title,
  caption: r.caption,
  position: r.position,
  active: Boolean(r.active),
  createdAt: r.created_at,
})

const listAll = async () =>
  (await q.all('SELECT * FROM gallery_photos ORDER BY position ASC, id ASC')).map(toApi)

router.get('/', async (_req, res, next) => {
  try {
    res.json({ photos: await listAll() })
  } catch (err) {
    next(err)
  }
})

/* Envio de várias fotos de uma vez. */
router.post('/', requireAdminHeader, upload.array('photos', 20), async (req, res, next) => {
  try {
    const files = req.files ?? []
    if (files.length === 0) return res.status(400).json({ error: 'Nenhuma imagem enviada.' })

    const { m } = await q.get('SELECT COALESCE(MAX(position), -1) AS m FROM gallery_photos')
    const base = Number(m)

    const urls = await Promise.all(files.map((f) => saveUpload(f)))
    await q.batch(
      urls.map((url, i) => ({
        sql: 'INSERT INTO gallery_photos (filename, original_name, title, position, active) VALUES (?, ?, ?, ?, 1)',
        args: [url, files[i].originalname, '', base + 1 + i],
      })),
    )

    res.status(201).json({ photos: await listAll(), added: files.length })
  } catch (err) {
    next(err)
  }
})

/* Título, legenda e ativar/desativar. */
router.patch('/:id', requireAdminHeader, async (req, res, next) => {
  try {
    const row = await q.get('SELECT * FROM gallery_photos WHERE id = ?', req.params.id)
    if (!row) return res.status(404).json({ error: 'Foto não encontrada.' })

    const title = req.body.title !== undefined ? String(req.body.title).slice(0, 120) : row.title
    const caption = req.body.caption !== undefined ? String(req.body.caption).slice(0, 300) : row.caption
    const active = req.body.active !== undefined ? (req.body.active ? 1 : 0) : row.active

    await q.run('UPDATE gallery_photos SET title = ?, caption = ?, active = ? WHERE id = ?',
      title, caption, active, row.id)
    res.json({ photos: await listAll() })
  } catch (err) {
    next(err)
  }
})

/* Substituir o arquivo de uma foto, mantendo posição e textos. */
router.put('/:id/file', requireAdminHeader, upload.single('photo'), async (req, res, next) => {
  try {
    const row = await q.get('SELECT * FROM gallery_photos WHERE id = ?', req.params.id)
    if (!row) return res.status(404).json({ error: 'Foto não encontrada.' })
    if (!req.file) return res.status(400).json({ error: 'Nenhuma imagem enviada.' })

    const url = await saveUpload(req.file)
    await q.run('UPDATE gallery_photos SET filename = ?, original_name = ? WHERE id = ?',
      url, req.file.originalname, row.id)
    await removeUpload(toUrl(row.filename))
    res.json({ photos: await listAll() })
  } catch (err) {
    next(err)
  }
})

router.delete('/:id', requireAdminHeader, async (req, res, next) => {
  try {
    const row = await q.get('SELECT * FROM gallery_photos WHERE id = ?', req.params.id)
    if (!row) return res.status(404).json({ error: 'Foto não encontrada.' })

    await q.run('DELETE FROM gallery_photos WHERE id = ?', row.id)
    await removeUpload(toUrl(row.filename))
    res.json({ photos: await listAll() })
  } catch (err) {
    next(err)
  }
})

/* Reordenar: recebe a lista de ids na ordem desejada. */
router.post('/reorder', requireAdminHeader, async (req, res, next) => {
  try {
    const ids = Array.isArray(req.body?.ids) ? req.body.ids : []
    await q.batch(ids.map((id, i) => ({ sql: 'UPDATE gallery_photos SET position = ? WHERE id = ?', args: [i, id] })))
    res.json({ photos: await listAll() })
  } catch (err) {
    next(err)
  }
})

export default router
