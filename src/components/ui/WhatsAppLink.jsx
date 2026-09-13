import { waHref } from '../../lib/whatsapp.js'
import { useNotice } from '../../lib/notice.jsx'

/**
 * Botao/link que abre o WhatsApp com uma mensagem pronta.
 * Se WHATSAPP_NUMBER (src/config/site.js) ainda estiver vazio, o clique
 * apenas avisa que o numero nao foi configurado — nunca aponta para um
 * numero inventado.
 */
export function WhatsAppLink({ message, className = '', children, ariaLabel, ...rest }) {
  const href = waHref(message)
  const { notify } = useNotice()

  if (href) {
    return (
      <a className={className} href={href} target="_blank" rel="noopener noreferrer" aria-label={ariaLabel} {...rest}>
        {children}
      </a>
    )
  }

  return (
    <button
      type="button"
      className={className}
      aria-label={ariaLabel}
      onClick={() =>
        notify('Demonstração: o número de WhatsApp ainda não foi configurado. Ele é definido em um único campo do projeto (WHATSAPP_NUMBER).')
      }
      {...rest}
    >
      {children}
    </button>
  )
}

export default WhatsAppLink
