import Reveal from './Reveal.jsx'

export function SectionHeading({ eyebrow, title, lead, align = 'left', id }) {
  return (
    <header className={`sec-head sec-head--${align}`}>
      {eyebrow && (
        <Reveal as="p" className="eyebrow">
          <span className="eyebrow__dot" aria-hidden="true" />
          {eyebrow}
        </Reveal>
      )}
      <Reveal as="h2" className="sec-head__title" delay={60} id={id}>
        {title}
      </Reveal>
      {lead && (
        <Reveal as="p" className="sec-head__lead" delay={120}>
          {lead}
        </Reveal>
      )}
    </header>
  )
}

export default SectionHeading
