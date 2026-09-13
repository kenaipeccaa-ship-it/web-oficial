import Header from './components/Header.jsx'
import Hero from './components/Hero.jsx'
import Features from './components/Features.jsx'
import Modalidades from './components/Modalidades.jsx'
import Estrutura from './components/Estrutura.jsx'
import Planos from './components/Planos.jsx'
import AulaExperimental from './components/AulaExperimental.jsx'
import Objetivos from './components/Objetivos.jsx'
import Localizacao from './components/Localizacao.jsx'
import FAQ from './components/FAQ.jsx'
import CTA from './components/CTA.jsx'
import Footer from './components/Footer.jsx'
import WhatsAppButton from './components/WhatsAppButton.jsx'
import { NoticeProvider } from './lib/notice.jsx'
import { useReveal } from './hooks/useReveal.js'

export default function App() {
  useReveal()

  return (
    <NoticeProvider>
      <a className="skip-link" href="#conteudo">Pular para o conteúdo</a>

      <Header />

      <main id="conteudo">
        <Hero />
        <Features />
        <Modalidades />
        <Estrutura />
        <Planos />
        <AulaExperimental />
        <Objetivos />
        <Localizacao />
        <FAQ />
        <CTA />
      </main>

      <Footer />
      <WhatsAppButton />
    </NoticeProvider>
  )
}
