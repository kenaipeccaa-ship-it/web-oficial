import { Icon } from './ui/Icon.jsx'
import PhotoFrame from './ui/PhotoFrame.jsx'
import Reveal from './ui/Reveal.jsx'
import SectionHeading from './ui/SectionHeading.jsx'
import { estruturaItems } from '../config/site.js'
import './Estrutura.css'

export default function Estrutura() {
  return (
    <section className="section estrutura" id="academia" aria-labelledby="estrutura-title">
      <div className="container">
        <SectionHeading
          eyebrow="A academia"
          id="estrutura-title"
          title="Um espaço para você evoluir"
          lead="Áreas separadas para musculação, cardio e aulas coletivas — para você montar a rotina de treino do seu jeito."
        />

        {/* // SUBSTITUIR PELAS FOTOS REAIS DA UNIDADE
            Enquanto não houver fotos oficiais, cada quadro exibe uma arte gráfica
            identificada como "imagem ilustrativa" (ver src/config/media.js). */}
        <ul className="gal">
          {estruturaItems.map((item, i) => (
            <Reveal as="li" key={item.id} className={`gal__item gal__item--${item.size}`} delay={i * 70}>
              <PhotoFrame artKey={item.art} className="gal__photo" />
              <div className="gal__overlay">
                <h3 className="gal__title">{item.title}</h3>
                <p className="gal__text">{item.text}</p>
              </div>
            </Reveal>
          ))}
        </ul>

        <Reveal className="demo-note estrutura__note">
          <Icon name="Info" size={16} />
          <p>
            As imagens acima são <strong>artes ilustrativas</strong> criadas para esta demonstração — não são fotografias
            da unidade. Na versão final, elas são substituídas pelas fotos reais do espaço.
          </p>
        </Reveal>
      </div>
    </section>
  )
}
