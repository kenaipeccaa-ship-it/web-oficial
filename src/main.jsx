import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

/* Estilos globais primeiro: garantem que o CSS de cada componente,
   importado depois, sempre vença na cascata. */
import './styles/fonts.css'
import './styles/tokens.css'
import './styles/base.css'
import './styles/ui.css'

import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
