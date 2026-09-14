import { Router } from 'express'
import { defaultSiteInfo, getSetting, setSetting } from '../db.js'
import { requireAdminHeader, requireAuth } from '../auth.js'

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

router.get('/', (_req, res) => {
  res.json({ info: { ...defaultSiteInfo, ...getSetting('site_info', {}) }, defaults: defaultSiteInfo })
})

router.put('/', requireAdminHeader, (req, res) => {
  const current = { ...defaultSiteInfo, ...getSetting('site_info', {}) }
  const body = req.body ?? {}
  const next = { ...current }
  const errors = []

  for (const [key, max] of Object.entries(FIELDS)) {
    if (body[key] === undefined) continue
    const value = String(body[key]).trim()
    if (value.length > max) {
      errors.push(`O campo "${key}" excede ${max} caracteres.`)
      continue
    }
    next[key] = value
  }

  if (next.whatsapp && !/^\d{10,15}$/.test(next.whatsapp.replace(/\D/g, ''))) {
    errors.push('O WhatsApp deve ter entre 10 e 15 dígitos (ex.: 5519999999999).')
  }
  next.whatsapp = next.whatsapp.replace(/\D/g, '')

  if (next.instagramUrl && !/^https?:\/\//i.test(next.instagramUrl)) {
    errors.push('O link do Instagram deve começar com http:// ou https://')
  }
  if (next.mapsDirectionsUrl && !/^https?:\/\//i.test(next.mapsDirectionsUrl)) {
    errors.push('O link "Como chegar" deve começar com http:// ou https://')
  }
  if (next.mapEmbedUrl && !/^https:\/\/(www\.)?google\.com\/maps\/embed/i.test(next.mapEmbedUrl)) {
    errors.push('O mapa deve ser a URL de incorporação do Google Maps (https://www.google.com/maps/embed...).')
  }

  if (errors.length) return res.status(400).json({ error: errors[0], errors })

  setSetting('site_info', next)
  res.json({ info: next })
})

export default router
