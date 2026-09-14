import { WHATSAPP_NUMBER } from '../config/site.js'

/**
 * Monta o link do WhatsApp a partir de um numero ja normalizado.
 * Retorna null quando nao ha numero — assim nada aponta para um numero
 * inventado.
 */
export function buildWaHref(number, message = '') {
  const digits = String(number || '').replace(/\D/g, '')
  if (!digits) return null
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`
}

/** Versao que usa o numero de src/config/site.js (fallback estatico). */
export const waHref = (message = '') => buildWaHref(WHATSAPP_NUMBER, message)

export const isWhatsAppConfigured = () => Boolean(String(WHATSAPP_NUMBER || '').replace(/\D/g, ''))
