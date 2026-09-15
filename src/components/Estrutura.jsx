import { Icon } from './ui/Icon.jsx'
import PhotoFrame from './ui/PhotoFrame.jsx'
import Reveal from './ui/Reveal.jsx'
import SectionHeading from './ui/SectionHeading.jsx'
import { estruturaItems } from '../config/site.js'
import { useGallery } from '../lib/content.jsx'
import './Estrutura.css'

export default function Estrutura() {
  /* Fotos publicadas no painel administrativo (/admin → Galeria).
     Enquanto não houver nenhuma, a seção continua exibindo as artes
     ilustrativas de sempre — o layout é o mesmo nos dois casos. */
  const photos = useGallery()
  const usandoFotosReais = photos.length > 0

  return (
    <section className="section estrutura" id="academia" aria-labelledby="estrutura-title">
      <div className="container">
        <SectionHeading
          eyebrow="A academia"
          id="estrutura-title"
          title="Um espaço para você evoluir"
          lead="Áreas separadas para musculação, cardio e aulas coletivas — para você montar a rotina de treino do seu jeito."
        />

        <ul className="gal">
          {usandoFotosReais
            ? photos.map((photo, i) => (
                <Reveal
                  as="li"
                  key={photo.id}
                  className={`gal__item gal__item--${i === 0 ? 'lg' : 'sm'}`}
                  delay={Math.min(i, 5) * 70}
                >
                  <div className="photo gal__photo">
                    <img className="photo__img" src={photo.url} alt={photo.title || 'Foto da unidade'} loading="lazy" decoding="async" />
                  </div>
                  {(photo.title || photo.caption) && (
                    <div className="gal__overlay">
                      {photo.title && <h3 className="gal__title">{photo.title}</h3>}
                      {photo.caption && <p className="gal__text">{photo.caption}</p>}
                    </div>
                  )}
                </Reveal>
              ))
            : estruturaItems.map((item, i) => (
                <Reveal as="li" key={item.id} className={`gal__item gal__item--${item.size}`} delay={i * 70}>
                  <PhotoFrame artKey={item.art} className="gal__photo" />
                  <div className="gal__overlay">
                    <h3 className="gal__title">{item.title}</h3>
                    <p className="gal__text">{item.text}</p>
                  </div>
                </Reveal>
              ))}
        </ul>
      </div>
    </section>
  )
}
