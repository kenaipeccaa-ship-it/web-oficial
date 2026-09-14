import { Router } from 'express'
import { defaultSiteInfo, getSetting, setSetting } from '../db.js'
import { requireAdminHeader, requireAuth } from '../auth.js'
import { removeUpload, saveUpload, upload } from '../uploads.js'
import { modalidades } from '../../src/config/site.js'

const router = Router()
router.use(requireAuth)

/* Campos aceitos e seu tamanho máximo. Nada fora desta lista é gravado. */
const FIELDS = {
  name: 60, unit: 60, region: 80, city: 80,
  addressLine: 200, mapEmbedUrl: 800, mapsDirectionsUrl: 500,
  whatsapp: 20, instagramUrl: 300, instagramHandle: 60, phone: 30, email: 120,
  hoursWeek: 80, hoursSaturday: 80, hoursSunday: 80, hoursNote: 200,
  heroTitleLine1: 80, heroTitleLine2: 80, heroLead: 400,
  storeLead: 200, storeText: 600,
}

router.get('/', async (_req, res, next) => {
  try {
    res.json({
      info: { ...defaultSiteInfo, ...(await getSetting('site_info', {})) },
      defaults: defaultSiteInfo,
      heroImage: await getSetting('hero_image', ''),
      // Nome, ícone e textos das modalidades continuam vindo de src/config/site.js;
      // o painel só gerencia a imagem de cada uma.
      modalidades: modalidades.map((m) => ({ id: m.id, name: m.name, tag: m.tag, art: m.art })),
      modalidadeImages: (await getSetting('modalidade_images', {})) ?? {},
    })
  } catch (err) {
    next(err)
  }
})

router.put('/', requireAdminHeader, async (req, res, next) => {
  try {
    const current = { ...defaultSiteInfo, ...(await getSetting('site_info', {})) }
    const body = req.body ?? {}
    const next_ = { ...current }
    const errors = []

    for (const [key, max] of Object.entries(FIELDS)) {
      if (body[key] === undefined) continue
      const value = String(body[key]).trim()
      if (value.length > max) {
        errors.push(`O campo "${key}" excede ${max} caracteres.`)
        continue
      }
      next_[key] = value
    }

    if (next_.whatsapp && !/^\d{10,15}$/.test(next_.whatsapp.replace(/\D/g, ''))) {
      errors.push('O WhatsApp deve ter entre 10 e 15 dígitos (ex.: 5519999999999).')
    }
    next_.whatsapp = next_.whatsapp.replace(/\D/g, '')

    if (next_.instagramUrl && !/^https?:\/\//i.test(next_.instagramUrl)) {
      errors.push('O link do Instagram deve começar com http:// ou https://')
    }
    if (next_.mapsDirectionsUrl && !/^https?:\/\//i.test(next_.mapsDirectionsUrl)) {
      errors.push('O link "Como chegar" deve começar com http:// ou https://')
    }
    if (next_.mapEmbedUrl && !/^https:\/\/(www\.)?google\.com\/maps\/embed/i.test(next_.mapEmbedUrl)) {
      errors.push('O mapa deve ser a URL de incorporação do Google Maps (https://www.google.com/maps/embed...).')
    }

    if (errors.length) return res.status(400).json({ error: errors[0], errors })

    await setSetting('site_info', next_)
    res.json({ info: next_ })
  } catch (err) {
    next(err)
  }
})

/* ==========================================================================
   IMAGEM DE FUNDO DO HERO
   Guardada na mesma tabela de configurações (chave "hero_image") e enviada
   pelo mesmo upload usado pela galeria e pelos produtos. Vazio => o site volta
   a exibir a arte padrão do projeto.
   ========================================================================== */

/** Substitui a imagem atual; a anterior é apagada do armazenamento. */
router.put('/hero-image', requireAdminHeader, upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Nenhuma imagem enviada.' })

    const previous = await getSetting('hero_image', '')
    await setSetting('hero_image', await saveUpload(req.file))
    if (previous) await removeUpload(previous)

    res.json({ heroImage: await getSetting('hero_image', '') })
  } catch (err) {
    next(err)
  }
})

/** Remove a imagem: o hero volta à arte padrão. */
router.delete('/hero-image', requireAdminHeader, async (req, res, next) => {
  try {
    const previous = await getSetting('hero_image', '')
    await setSetting('hero_image', '')
    if (previous) await removeUpload(previous)

    res.json({ heroImage: '' })
  } catch (err) {
    next(err)
  }
})

/* ==========================================================================
   IMAGENS DAS MODALIDADES
   Mesmo esquema da imagem do hero: um registro na tabela de configurações
   (chave "modalidade_images", um mapa id -> URL). Sem imagem, o card volta à
   arte padrão. Textos, nomes e ícones NÃO passam por aqui.
   ========================================================================== */

const MODALIDADE_IDS = new Set(modalidades.map((m) => m.id))
const getModalidadeImages = async () => (await getSetting('modalidade_images', {})) ?? {}

/** Substitui a imagem de uma modalidade; a anterior sai do armazenamento. */
router.put('/modalidade-image/:id', requireAdminHeader, upload.single('image'), async (req, res, next) => {
  try {
    const { id } = req.params
    if (!MODALIDADE_IDS.has(id)) return res.status(404).json({ error: 'Modalidade não encontrada.' })
    if (!req.file) return res.status(400).json({ error: 'Nenhuma imagem enviada.' })

    const images = await getModalidadeImages()
    const previous = images[id] || ''
    images[id] = await saveUpload(req.file)
    await setSetting('modalidade_images', images)
    if (previous) await removeUpload(previous)

    res.json({ modalidadeImages: await getModalidadeImages() })
  } catch (err) {
    next(err)
  }
})

/** Remove a imagem: o card volta à arte padrão da modalidade. */
router.delete('/modalidade-image/:id', requireAdminHeader, async (req, res, next) => {
  try {
    const { id } = req.params
    if (!MODALIDADE_IDS.has(id)) return res.status(404).json({ error: 'Modalidade não encontrada.' })

    const images = await getModalidadeImages()
    const previous = images[id] || ''
    delete images[id]
    await setSetting('modalidade_images', images)
    if (previous) await removeUpload(previous)

    res.json({ modalidadeImages: await getModalidadeImages() })
  } catch (err) {
    next(err)
  }
})

export default router
