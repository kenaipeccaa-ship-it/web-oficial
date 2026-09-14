/* ==========================================================================
   API PÚBLICA (somente leitura)
   Entrega ao site o conteúdo gerenciado pelo painel. Nenhuma operação de
   escrita passa por aqui.
   ========================================================================== */
import { Router } from 'express'
import { db, defaultSiteInfo, getSetting } from '../db.js'
import { publicUrl } from '../uploads.js'

const router = Router()

router.get('/content', (_req, res) => {
  const photos = db
    .prepare('SELECT * FROM gallery_photos WHERE active = 1 ORDER BY position ASC, id ASC')
    .all()
    .map((r) => ({ id: r.id, url: publicUrl(r.filename), title: r.title, caption: r.caption }))

  const products = db
    .prepare('SELECT * FROM products WHERE active = 1 ORDER BY position ASC, id ASC')
    .all()
    .map((r) => ({
      id: r.slug,
      name: r.name,
      category: r.category,
      price: r.price_cents === null ? null : r.price_cents / 100,
      image: r.image,
      art: r.art,
      description: r.description,
      available: Boolean(r.available),
    }))

  const info = {
    ...defaultSiteInfo,
    ...getSetting('site_info', {}),
    heroImage: getSetting('hero_image', ''),
  }

  // Sem cache: o que o painel altera precisa aparecer no site na hora.
  res.set('Cache-Control', 'no-store')
  res.json({ gallery: photos, products, info })
})

export default router
