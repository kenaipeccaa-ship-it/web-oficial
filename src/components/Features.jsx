import { Icon } from './ui/Icon.jsx'
import Reveal from './ui/Reveal.jsx'
import SectionHeading from './ui/SectionHeading.jsx'
import { features } from '../config/site.js'
import './Features.css'

export default function Features() {
  return (
    <section className="section features" id="diferenciais" aria-labelledby="features-title">
      <div className="glow features__glow" aria-hidden="true" />
      <div className="container">
        <SectionHeading
          eyebrow="Diferenciais"
          id="features-title"
          title="Mais do que uma academia"
          lead="Um lugar para construir consistência: estrutura, variedade de treinos e um ambiente que ajuda você a manter o ritmo."
        />

        <ul className="features__grid">
          {features.map((f, i) => (
            <Reveal as="li" key={f.id} className="feature card" delay={i * 90}>
              <span className="feature__index" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
              <span className="feature__icon">
                <Icon name={f.icon} size={22} />
              </span>
              <h3 className="feature__title">{f.title}</h3>
              <p className="feature__text">{f.text}</p>
              <span className="feature__line" aria-hidden="true" />
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  )
}
