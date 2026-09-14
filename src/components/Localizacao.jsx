import { Icon } from './ui/Icon.jsx'
import Reveal from './ui/Reveal.jsx'
import SectionHeading from './ui/SectionHeading.jsx'
import WhatsAppLink from './ui/WhatsAppLink.jsx'
import { useNotice } from '../lib/notice.jsx'
import { whatsappMessages } from '../config/site.js'
import { useSiteInfo } from '../lib/content.jsx'
import './Localizacao.css'

export default function Localizacao() {
  const brand = useSiteInfo()
  const { notify } = useNotice()
  const hasMap = Boolean(brand.mapEmbedUrl)
  const hasDirections = Boolean(brand.mapsDirectionsUrl)

  return (
    <section className="section localizacao" id="localizacao" aria-labelledby="localizacao-title">
      <div className="container">
        <SectionHeading
          eyebrow="Localização"
          id="localizacao-title"
          title="Onde estamos"
          lead={`A unidade fica na região do ${brand.region}, em ${brand.city}. O endereço completo é preenchido na versão oficial da página.`}
        />

        <div className="loc">
          {/* ---------------------------- Mapa ---------------------------- */}
          <Reveal className="loc__map">
            {hasMap ? (
              <iframe
                src={brand.mapEmbedUrl}
                title={`Mapa da unidade ${brand.unit}`}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            ) : (
              <div className="loc__map-empty">
                <div className="bg-grid loc__map-grid" aria-hidden="true" />
                <span className="loc__pin" aria-hidden="true">
                  <Icon name="MapPin" size={26} />
                </span>
                <p className="loc__map-label">[INSERIR MAPA/ENDEREÇO OFICIAL DA UNIDADE]</p>
                <p className="loc__map-help">
                  Espaço reservado para o mapa incorporado do Google Maps. Basta informar o endereço oficial para ativá-lo.
                </p>
              </div>
            )}
          </Reveal>

          {/* --------------------------- Detalhes -------------------------- */}
          <Reveal className="loc__info" delay={90}>
            <div className="loc__block">
              <span className="loc__block-icon"><Icon name="MapPin" size={18} /></span>
              <div>
                <h3 className="loc__block-title">Região</h3>
                <p className="loc__block-main">{brand.region} — {brand.city}</p>
                <p className="loc__block-sub">{brand.addressLine}</p>
              </div>
            </div>

            <div className="loc__block">
              <span className="loc__block-icon"><Icon name="Clock" size={18} /></span>
              <div>
                <h3 className="loc__block-title">Horários</h3>
                <ul className="loc__hours">
                  {brand.hoursRows.map((row) => (
                    <li key={row.label}>
                      <span>{row.label}</span>
                      <strong>{row.value}</strong>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="loc__actions">
              {hasDirections ? (
                <a className="btn btn--primary btn--block" href={brand.mapsDirectionsUrl} target="_blank" rel="noopener noreferrer">
                  <Icon name="Navigation" size={17} />
                  Como chegar
                </a>
              ) : (
                <button
                  type="button"
                  className="btn btn--primary btn--block"
                  onClick={() => notify('Demonstração: o endereço oficial ainda não foi informado. O botão "Como chegar" é ativado ao preencher o link do Google Maps na configuração.')}
                >
                  <Icon name="Navigation" size={17} />
                  Como chegar
                </button>
              )}
              <WhatsAppLink className="btn btn--ghost btn--block" message={whatsappMessages.localizacao}>
                Confirmar endereço
              </WhatsAppLink>
            </div>

            <div className="demo-note">
              <Icon name="Info" size={16} />
              <p>{brand.hoursNote} Endereço, referências e horários devem ser confirmados com a unidade.</p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
