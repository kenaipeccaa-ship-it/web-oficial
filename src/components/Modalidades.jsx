import { useCallback, useState } from 'react'
import { Icon } from './ui/Icon.jsx'
import Modal from './ui/Modal.jsx'
import PhotoFrame from './ui/PhotoFrame.jsx'
import Reveal from './ui/Reveal.jsx'
import SectionHeading from './ui/SectionHeading.jsx'
import WhatsAppLink from './ui/WhatsAppLink.jsx'
import { modalidades, whatsappMessages } from '../config/site.js'
import { useModalidadeImages } from '../lib/content.jsx'
import './Modalidades.css'

export default function Modalidades() {
  const [openId, setOpenId] = useState(null)
  /* Imagens enviadas pelo painel (/admin → Modalidades). Nomes, textos e
     ícones seguem vindo de src/config/site.js. */
  const images = useModalidadeImages()
  const current = modalidades.find((m) => m.id === openId) || null
  const close = useCallback(() => setOpenId(null), [])

  return (
    <section className="section modalidades" id="modalidades" aria-labelledby="modalidades-title">
      <div className="container">
        <SectionHeading
          eyebrow="Modalidades"
          id="modalidades-title"
          title="Escolha como você quer treinar"
          lead="Musculação para o treino individual e aulas coletivas para variar a rotina. Confira abaixo e veja o que combina com o seu momento."
        />

        <ul className="mods__grid">
          {modalidades.map((m, i) => (
            <Reveal as="li" key={m.id} className="mod card" delay={(i % 4) * 80}>
              <div className="mod__media">
                <PhotoFrame artKey={m.art} src={images[m.id]} alt={m.name} badge={false} className="mod__photo" />
                <span className="mod__tag">{m.tag}</span>
                <span className="mod__icon">
                  <Icon name={m.icon} size={20} />
                </span>
              </div>

              <div className="mod__body">
                <h3 className="mod__title">{m.name}</h3>
                <p className="mod__text">{m.short}</p>
                <button type="button" className="mod__more" onClick={() => setOpenId(m.id)} aria-haspopup="dialog">
                  Saiba mais
                  <Icon name="ArrowRight" size={16} className="btn__arrow" />
                </button>
              </div>
            </Reveal>
          ))}
        </ul>

      </div>

      {/* ------------------------------ Modal ------------------------------ */}
      <Modal open={Boolean(current)} onClose={close} labelledBy="mod-modal-title" className="mod-modal">
        {current && (
          <>
            <div className="mod-modal__media">
              <PhotoFrame artKey={current.art} src={images[current.id]} alt={current.name} badge={false} className="mod-modal__photo" />
              <div className="mod-modal__head">
                <span className="mod-modal__tag">
                  <Icon name={current.icon} size={15} />
                  {current.tag}
                </span>
                <h3 className="mod-modal__title" id="mod-modal-title">{current.name}</h3>
              </div>
            </div>

            <div className="mod-modal__body">
              <p className="mod-modal__about">{current.details.about}</p>

              <dl className="mod-modal__meta">
                <div>
                  <dt>Nível</dt>
                  <dd>{current.details.level}</dd>
                </div>
                <div>
                  <dt>Foco</dt>
                  <dd>{current.details.focus}</dd>
                </div>
                <div>
                  <dt>Horários</dt>
                  <dd>Consulte a unidade</dd>
                </div>
              </dl>

              <ul className="mod-modal__topics">
                {current.details.topics.map((t) => (
                  <li key={t}>
                    <Icon name="Check" size={16} />
                    {t}
                  </li>
                ))}
              </ul>

              <div className="demo-note">
                <Icon name="Info" size={16} />
                <p>
                  {current.details.needsConfirmation
                    ? 'O nome desta modalidade e sua disponibilidade precisam ser confirmados com a unidade. Grade de horários não divulgada.'
                    : 'Disponibilidade e grade de horários desta modalidade devem ser confirmadas com a unidade.'}
                </p>
              </div>

              <div className="mod-modal__actions">
                <WhatsAppLink className="btn btn--primary btn--block" message={whatsappMessages.modalidade(current.name)}>
                  Falar sobre {current.name.toLowerCase()}
                </WhatsAppLink>
                <a className="btn btn--ghost btn--block" href="#experimental" onClick={close}>
                  Quero uma aula experimental
                </a>
              </div>
            </div>
          </>
        )}
      </Modal>
    </section>
  )
}
