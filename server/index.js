/* ==========================================================================
   SERVIDOR LOCAL
   Sobe a mesma aplicação de server/app.js numa porta.
   Em produção na Vercel quem entra é api/index.js (função serverless).
   ========================================================================== */
import 'dotenv/config'
import { createApp } from './app.js'
import { IS_PROD, PORT, SESSION_SECRET, describeEnv } from './config.js'
import { purgeExpiredSessions } from './db.js'

if (IS_PROD && !SESSION_SECRET) {
  console.error('[boot] defina SESSION_SECRET no ambiente antes de subir em produção.')
  process.exit(1)
}

/* Faxina periódica de sessões vencidas: só faz sentido num processo que fica
   de pé. Em serverless a limpeza acontece a cada criação de sessão. */
setInterval(() => purgeExpiredSessions().catch(() => {}), 60 * 60 * 1000).unref()

const app = createApp()

app.listen(PORT, () => {
  const env = describeEnv()
  console.log(`[boot] API em http://localhost:${PORT}`)
  console.log(`[boot] ambiente: ${env.ambiente} | banco: ${env.banco}`)
  console.log(`[boot] imagens: ${env.imagens} | estático: ${env.estatico}`)
})
