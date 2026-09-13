import { Icon } from './ui/Icon.jsx'
import PhotoFrame from './ui/PhotoFrame.jsx'
import { brand } from '../config/site.js'
import './Hero.css'

const tags = ['Musculação', 'Cardio', 'Aulas coletivas']

export default function Hero() {
  return (
    <section className="hero" id="inicio">
      {/* Fundo: arte gráfica em tela cheia.
          // SUBSTITUIR PELA FOTO REAL DA UNIDADE (ver src/config/media.js → hero) */}
      <div className="hero__bg">
        <PhotoFrame artKey="hero" variant="cover" badge={false} className="hero__photo" />
        <div className="hero__scrim" aria-hidden="true" />
        <div className="bg-grid" aria-hidden="true" />
      </div>

      <div className="container hero__inner">
        <div className="hero__content">
          <p className="hero__kicker">
            <span className="hero__kicker-dot" aria-hidden="true" />
            <span className="hero__kicker-full">Academia na região do {brand.region}</span>
            <span className="hero__kicker-short">Região do {brand.region}</span>
          </p>

          <h1 className="hero__title">
            <span className="hero__line"><span>Seu próximo nível</span></span>
            <span className="hero__line"><span>começa aqui.</span></span>
          </h1>

          <p className="hero__lead">
            Treine, evolua e faça parte de uma experiência pensada para quem busca mais disposição, saúde e performance.
          </p>

          <div className="hero__actions">
            <a className="btn btn--primary btn--lg" href="#experimental">
              Quero fazer uma aula experimental
              <Icon name="ArrowRight" size={18} className="btn__arrow" />
            </a>
            <a className="btn btn--ghost btn--lg" href="#academia">
              Conhecer a academia
            </a>
          </div>

          <p className="hero__place">
            <Icon name="MapPin" size={16} />
            {brand.region} — {brand.city}
          </p>
        </div>

        <div className="hero__strip">
          <ul className="hero__tags">
            {tags.map((t) => (
              <li key={t}>
                <span className="hero__tag-dot" aria-hidden="true" />
                {t}
              </li>
            ))}
          </ul>
          <a className="hero__scroll" href="#diferenciais" aria-label="Rolar para a próxima seção">
            <span>Role</span>
            <Icon name="ArrowDown" size={16} />
          </a>
        </div>
      </div>
    </section>
  )
}
