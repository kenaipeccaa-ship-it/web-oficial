import { useEffect } from 'react'

/**
 * Revela os elementos [data-reveal] conforme entram na tela.
 * Respeita "prefers-reduced-motion": nesse caso tudo ja aparece visivel.
 */
export function useReveal() {
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const nodes = () => Array.from(document.querySelectorAll('[data-reveal]:not(.is-visible)'))

    if (reduce || !('IntersectionObserver' in window)) {
      nodes().forEach((el) => el.classList.add('is-visible'))
      return
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            io.unobserve(entry.target)
          }
        })
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
    )

    nodes().forEach((el) => io.observe(el))

    // Novos nos (ex.: conteudo de modal) tambem entram na observacao.
    const mo = new MutationObserver(() => nodes().forEach((el) => io.observe(el)))
    mo.observe(document.body, { childList: true, subtree: true })

    return () => {
      io.disconnect()
      mo.disconnect()
    }
  }, [])
}
