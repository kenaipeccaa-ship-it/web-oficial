/* ==========================================================================
   ENTRADA DA VERCEL (função serverless)
   Toda requisição /api/* cai aqui (ver vercel.json). O site estático é
   servido pela CDN, não por esta função.
   ========================================================================== */
// Em produção as variáveis vêm da Vercel. O dotenv só ajuda no `vercel dev`
// e em testes locais — ele nunca sobrescreve o que já está no ambiente.
import 'dotenv/config'
import { createApp } from '../server/app.js'

const app = createApp()

export default app
