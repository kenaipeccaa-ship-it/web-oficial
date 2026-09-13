import { Icon } from './ui/Icon.jsx'
import Reveal from './ui/Reveal.jsx'
import SectionHeading from './ui/SectionHeading.jsx'
import { objetivos } from '../config/site.js'
import './Objetivos.css'

/**
 * Ao escolher um objetivo, o visitante é levado ao formulário com o campo
 * "Objetivo" já preenchido (evento consumido por AulaExperimental).
 */
function pick(label) {
  window.dispatchEvent(new CustomEvent('skyfit:objetivo', { detail: label }))
}

export default function Objetivos() {
  return (
    <section className="section objetivos" id="objetivos" aria-labelledby="objetivos-title">
      <div className="container">
        <SectionHeading
          align="center"
          eyebrow="Objetivos"
          id="objetivos-title"
          title="Qual é o seu objetivo?"
          lead="Escolha o ponto de partida. Ele ajuda a montar a conversa sobre qual rotina de treino faz sentido para você."
        />

        <ul className="goals">
          {objetivos.map((o, i) => (
            <Reveal as="li" key={o.id} delay={i * 70}>
              <a className="goal" href="#experimental" onClick={() => pick(o.label)}>
                <span className="goal__emoji" aria-hidden="true">{o.emoji}</span>
                <span className="goal__label">{o.label}</span>
                <span className="goal__icon" aria-hidden="true">
                  <Icon name="ArrowUpRight" size={16} />
                </span>
              </a>
            </Reveal>
          ))}
        </ul>

        <Reveal as="p" className="objetivos__foot" delay={200}>
          Cada pessoa evolui em um ritmo. Esta página não promete resultados: o objetivo é apresentar as opções de treino
          disponíveis.
        </Reveal>
      </div>
    </section>
  )
}
