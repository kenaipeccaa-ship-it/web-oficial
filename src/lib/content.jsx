import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import {
  INSTAGRAM_HANDLE, INSTAGRAM_URL, WHATSAPP_NUMBER, brand, openingHours,
} from '../config/site.js'
import { products as staticProducts } from '../data/products.js'

/* ==========================================================================
   CONTEÚDO GERENCIÁVEL
   --------------------------------------------------------------------------
   Busca em /api/public/content o que foi cadastrado no painel administrativo
   e entrega ao site público.

   REGRA IMPORTANTE: se a API não responder (site publicado como estático,
   servidor fora do ar, ambiente de build), TUDO cai de volta para o conteúdo
   dos arquivos src/config/site.js e src/data/products.js. A página fica
   exatamente como era antes do painel existir.
   ========================================================================== */

const ContentContext = createContext({ gallery: [], products: null, info: null, loaded: false })

export function ContentProvider({ children }) {
  const [state, setState] = useState({ gallery: [], products: null, info: null, loaded: false })

  useEffect(() => {
    let alive = true
    const ctrl = new AbortController()

    fetch('/api/public/content', { headers: { Accept: 'application/json' }, signal: ctrl.signal })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!alive || !data) return
        setState({
          gallery: Array.isArray(data.gallery) ? data.gallery : [],
          products: Array.isArray(data.products) && data.products.length ? data.products : null,
          info: data.info ?? null,
          loaded: true,
        })
      })
      .catch(() => {
        /* Sem API: segue com o conteúdo estático. */
      })

    return () => {
      alive = false
      ctrl.abort()
    }
  }, [])

  return <ContentContext.Provider value={state}>{children}</ContentContext.Provider>
}

const useContent = () => useContext(ContentContext)

/** Fotos publicadas na galeria. Vazio => a seção usa as artes estáticas. */
export const useGallery = () => useContent().gallery

/** Produtos da loja: os do painel ou, na falta deles, os de src/data/products.js. */
export const useStoreProducts = () => useContent().products ?? staticProducts

/** Informações da academia, com os valores estáticos como padrão. */
export function useSiteInfo() {
  const { info } = useContent()
  return useMemo(() => {
    const pick = (value, fallback) => (value === undefined || value === null || value === '' ? fallback : value)
    return {
      name: pick(info?.name, brand.name),
      unit: pick(info?.unit, brand.unit),
      region: pick(info?.region, brand.region),
      city: pick(info?.city, brand.city),
      addressLine: pick(info?.addressLine, brand.addressLine),
      mapEmbedUrl: pick(info?.mapEmbedUrl, brand.mapEmbedUrl),
      mapsDirectionsUrl: pick(info?.mapsDirectionsUrl, brand.mapsDirectionsUrl),
      instagramUrl: pick(info?.instagramUrl, INSTAGRAM_URL),
      instagramHandle: pick(info?.instagramHandle, INSTAGRAM_HANDLE),
      hoursNote: pick(info?.hoursNote, openingHours.note),
      hoursRows: [
        { label: openingHours.rows[0].label, value: pick(info?.hoursWeek, openingHours.rows[0].value) },
        { label: openingHours.rows[1].label, value: pick(info?.hoursSaturday, openingHours.rows[1].value) },
        { label: openingHours.rows[2].label, value: pick(info?.hoursSunday, openingHours.rows[2].value) },
      ],
      // Imagem de fundo do hero enviada pelo painel; vazio => arte padrão.
      heroImage: info?.heroImage || '',
      heroTitleLine1: pick(info?.heroTitleLine1, 'Seu próximo nível'),
      heroTitleLine2: pick(info?.heroTitleLine2, 'começa aqui.'),
      heroLead: pick(
        info?.heroLead,
        'Treine, evolua e faça parte de uma experiência pensada para quem busca mais disposição, saúde e performance.',
      ),
      storeLead: pick(info?.storeLead, 'Suplementação para acompanhar sua rotina de treino.'),
      storeText: pick(
        info?.storeText,
        'A loja da unidade reúne suplementos e acessórios para quem já treina e quer resolver tudo no mesmo lugar. Escolha os produtos, monte seu pedido e finalize pelo WhatsApp.',
      ),
    }
  }, [info])
}

/** Número de WhatsApp em vigor: o do painel ou o de src/config/site.js. */
export function useWhatsAppNumber() {
  const { info } = useContent()
  const fromPanel = String(info?.whatsapp || '').replace(/\D/g, '')
  return fromPanel || String(WHATSAPP_NUMBER || '').replace(/\D/g, '')
}
