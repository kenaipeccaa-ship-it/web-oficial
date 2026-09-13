import { WHATSAPP_NUMBER } from '../config/site.js'

/**
 * Monta o link do WhatsApp com uma mensagem pronta.
 * Retorna null enquanto WHATSAPP_NUMBER nao estiver preenchido
 * (ver src/config/site.js) — assim nada aponta para um numero inventado.
 */
export function waHref(message = '') {
  const digits = String(WHATSAPP_NUMBER || '').replace(/\D/g, '')
  if (!digits) return null
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`
}

export const isWhatsAppConfigured = () => Boolean(String(WHATSAPP_NUMBER || '').replace(/\D/g, ''))
