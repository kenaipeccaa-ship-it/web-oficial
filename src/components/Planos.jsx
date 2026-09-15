import { Icon } from './ui/Icon.jsx'
import Reveal from './ui/Reveal.jsx'
import SectionHeading from './ui/SectionHeading.jsx'
import WhatsAppLink from './ui/WhatsAppLink.jsx'
import { planos, whatsappMessages } from '../config/site.js'
import './Planos.css'

export default function Planos() {
  return (
    <section className="section planos" id="planos" aria-labelledby="planos-title">
      <div className="glow planos__glow" aria-hidden="true" />
      <div className="container">
        <SectionHeading
          align="center"
          eyebrow="Planos"
          id="planos-title"
          title="Escolha seu plano"
          lead="Três formatos pensados para momentos diferentes de treino. Valores e condições são informados diretamente pela unidade."
        />

        <ul className="plans">
          {planos.map((p, i) => (
            <Reveal
              as="li"
              key={p.id}
              className={`plan card ${p.highlight ? 'plan--featured' : ''}`}
              delay={i * 90}
            >
              {p.badge && <span className="plan__badge">{p.badge}</span>}

              <div className="plan__head">
                <span className="plan__icon">
                  <Icon name={p.icon} size={20} />
                </span>
                <h3 className="plan__name">{p.name}</h3>
                <p className="plan__text">{p.text}</p>
              </div>

              <div className="plan__price">
                <span className="plan__price-label">Valor</span>
                <strong>{p.price}</strong>
              </div>

              <ul className="plan__items">
                {p.items.map((it) => (
                  <li key={it.label}>
                    <Icon name="Check" size={15} />
                    <span className="plan__item-label">{it.label}</span>
                    <span className="plan__item-value">{it.value}</span>
                  </li>
                ))}
              </ul>

              <WhatsAppLink
                className={`btn btn--block ${p.highlight ? 'btn--primary' : 'btn--ghost'}`}
                message={whatsappMessages.plano(p.name)}
                ariaLabel={`Saber mais sobre o plano ${p.name} pelo WhatsApp`}
              >
                Quero saber mais
                <Icon name="ArrowRight" size={16} className="btn__arrow" />
              </WhatsAppLink>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  )
}
