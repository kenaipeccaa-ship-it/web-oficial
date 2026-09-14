import { Icon } from './ui/Icon.jsx'
import PhotoFrame from './ui/PhotoFrame.jsx'
import Reveal from './ui/Reveal.jsx'
import WhatsAppLink from './ui/WhatsAppLink.jsx'
import { whatsappMessages } from '../config/site.js'
import { useSiteInfo } from '../lib/content.jsx'
import './CTA.css'

export default function CTA() {
  const brand = useSiteInfo()

  return (
    <section className="cta" id="cta" aria-labelledby="cta-title">
      <div className="cta__bg" aria-hidden="true">
        <PhotoFrame artKey="cta" variant="cover" badge={false} className="cta__photo" />
        <div className="cta__scrim" />
      </div>

      <div className="container cta__inner">
        <Reveal as="p" className="eyebrow cta__eyebrow">
          <span className="eyebrow__dot" aria-hidden="true" />
          {brand.region} — {brand.city}
        </Reveal>

        <Reveal as="h2" className="cta__title" id="cta-title" delay={80}>
          <span>Seu objetivo.</span>
          <span>Seu treino.</span>
          <span className="cta__title-accent">Seu próximo nível.</span>
        </Reveal>

        <Reveal as="p" className="cta__text" delay={160}>
          Comece hoje a construir uma rotina mais ativa.
        </Reveal>

        <Reveal className="cta__actions" delay={220}>
          <WhatsAppLink className="btn btn--primary btn--lg" message={whatsappMessages.geral}>
            Quero conhecer
            <Icon name="ArrowRight" size={18} className="btn__arrow" />
          </WhatsAppLink>
          <a className="btn btn--ghost btn--lg" href="#planos">
            Ver os planos
          </a>
        </Reveal>
      </div>
    </section>
  )
}
