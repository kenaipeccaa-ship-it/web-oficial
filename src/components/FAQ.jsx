import { useState } from 'react'
import { Icon } from './ui/Icon.jsx'
import Reveal from './ui/Reveal.jsx'
import SectionHeading from './ui/SectionHeading.jsx'
import WhatsAppLink from './ui/WhatsAppLink.jsx'
import { faq, whatsappMessages } from '../config/site.js'
import './FAQ.css'

export default function FAQ() {
  const [open, setOpen] = useState(faq[0]?.id ?? null)

  return (
    <section className="section faq" id="faq" aria-labelledby="faq-title">
      <div className="container faq__inner">
        <div className="faq__aside">
          <SectionHeading
            eyebrow="Dúvidas"
            id="faq-title"
            title="Perguntas frequentes"
            lead="O que costuma ser perguntado antes do primeiro treino. Informações não confirmadas ficam indicadas como tal."
          />
          <Reveal className="faq__help" delay={150}>
            <p>Não encontrou o que procurava?</p>
            <WhatsAppLink className="btn btn--ghost" message={whatsappMessages.geral}>
              Falar com a academia
              <Icon name="ArrowRight" size={16} className="btn__arrow" />
            </WhatsAppLink>
          </Reveal>
        </div>

        <ul className="acc">
          {faq.map((item, i) => {
            const isOpen = open === item.id
            return (
              <Reveal as="li" key={item.id} className={`acc__item ${isOpen ? 'is-open' : ''}`} delay={i * 55}>
                <h3>
                  <button
                    type="button"
                    className="acc__trigger"
                    aria-expanded={isOpen}
                    aria-controls={`panel-${item.id}`}
                    id={`trigger-${item.id}`}
                    onClick={() => setOpen(isOpen ? null : item.id)}
                  >
                    <span>{item.q}</span>
                    <span className="acc__sign" aria-hidden="true">
                      <Icon name="ChevronDown" size={18} />
                    </span>
                  </button>
                </h3>
                <div
                  className="acc__panel"
                  id={`panel-${item.id}`}
                  role="region"
                  aria-labelledby={`trigger-${item.id}`}
                  hidden={!isOpen}
                >
                  <p>{item.a}</p>
                </div>
              </Reveal>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
