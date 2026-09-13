import { useEffect } from 'react'

/** Trava a rolagem do body sem deslocar o layout (menu mobile e modais). */
export function useLockBodyScroll(locked) {
  useEffect(() => {
    if (!locked) return
    const { body } = document
    const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth
    const prevOverflow = body.style.overflow
    const prevPadding = body.style.paddingRight
    body.style.overflow = 'hidden'
    if (scrollBarWidth > 0) body.style.paddingRight = `${scrollBarWidth}px`
    return () => {
      body.style.overflow = prevOverflow
      body.style.paddingRight = prevPadding
    }
  }, [locked])
}
