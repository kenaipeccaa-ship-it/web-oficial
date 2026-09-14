/* ==========================================================================
   API PÚBLICA (somente leitura)
   Entrega ao site o conteúdo gerenciado pelo painel. Nenhuma operação de
   escrita passa por aqui.
   ========================================================================== */
import { Router } from 'express'
import { defaultSiteInfo, getSetting, q } from '../db.js'

const router = Router()

const toUrl = (v) => (!v ? '' : /^(https?:)?\/\//i.test(v) || v.startsWith('/') ? v : `/uploads/${v}`)

router.get('/content', async (_req, res, next) => {
  try {
    const photos = (
      await q.all('SELECT * FROM gallery_photos WHERE active = 1 ORDER BY position ASC, id ASC')
    ).map((r) => ({ id: r.id, url: toUrl(r.filename), title: r.title, caption: r.caption }))

    const products = (
      await q.all('SELECT * FROM products WHERE active = 1 ORDER BY position ASC, id ASC')
    ).map((r) => ({
      id: r.slug,
      name: r.name,
      category: r.category,
      price: r.price_cents === null ? null : Number(r.price_cents) / 100,
      image: r.image,
      art: r.art,
      description: r.description,
      available: Boolean(r.available),
    }))

    const info = {
      ...defaultSiteInfo,
      ...(await getSetting('site_info', {})),
      heroImage: await getSetting('hero_image', ''),
    }

    // Sem cache: o que o painel altera precisa aparecer no site na hora.
    res.set('Cache-Control', 'no-store')
    res.json({
      gallery: photos,
      products,
      info,
      modalidadeImages: (await getSetting('modalidade_images', {})) ?? {},
    })
  } catch (err) {
    next(err)
  }
})

export default router
