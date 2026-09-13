/**
 * Envolve um bloco com a animacao de entrada por rolagem.
 * A animacao e desativada automaticamente em "prefers-reduced-motion".
 */
export function Reveal({ as: Tag = 'div', delay = 0, className = '', children, ...rest }) {
  return (
    <Tag data-reveal className={`reveal ${className}`} style={delay ? { transitionDelay: `${delay}ms` } : undefined} {...rest}>
      {children}
    </Tag>
  )
}

export default Reveal
