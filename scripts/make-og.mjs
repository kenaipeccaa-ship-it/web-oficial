/* Gera public/og-image.png (1200x630) a partir de um HTML, usando o Chromium.
   Rode com: node scripts/make-og.mjs
   // SUBSTITUIR PELA IMAGEM OFICIAL quando houver fotos/arte da unidade. */
import { chromium } from './_playwright.mjs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
  * { margin: 0; box-sizing: border-box; }
  body {
    width: 1200px; height: 630px; overflow: hidden; position: relative;
    background: #06070A; color: #F3F5F8;
    font-family: 'Archivo', Helvetica, Arial, sans-serif;
    display: flex; flex-direction: column; justify-content: space-between;
    padding: 64px 72px;
  }
  .art { position: absolute; inset: 0; }
  .scrim { position: absolute; inset: 0;
    background: linear-gradient(105deg, rgba(6,7,10,.96) 0%, rgba(6,7,10,.82) 46%, rgba(6,7,10,.42) 100%); }
  .row { position: relative; display: flex; align-items: center; gap: 16px; }
  .mark { width: 56px; height: 56px; border-radius: 16px; background: #E30613; display: grid; place-items: center; }
  .name { font-size: 34px; font-weight: 900; letter-spacing: -.02em; line-height: 1; }
  .unit { font-size: 13px; font-weight: 800; letter-spacing: .22em; color: #FF3742; margin-top: 6px; }
  h1 { position: relative; font-size: 82px; font-weight: 900; line-height: 1.02; letter-spacing: -.04em;
       text-transform: uppercase; max-width: 15ch; }
  h1 em { font-style: normal; color: #FF3742; }
  .foot { position: relative; display: flex; align-items: center; justify-content: space-between; gap: 24px;
          border-top: 1px solid rgba(255,255,255,.12); padding-top: 26px; }
  .tags { font-size: 16px; font-weight: 700; letter-spacing: .16em; text-transform: uppercase; color: #C3CAD6; }
  .badge { font-size: 13px; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; color: #fff;
           background: #E30613; padding: 9px 16px; border-radius: 999px; white-space: nowrap; }
</style></head><body>
  <svg class="art" viewBox="0 0 1200 630" preserveAspectRatio="none">
    <defs>
      <radialGradient id="g" cx="80%" cy="14%" r="70%">
        <stop offset="0%" stop-color="#FF3742" stop-opacity=".2"/>
        <stop offset="100%" stop-color="#FF3742" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <rect width="1200" height="630" fill="#080A0D"/>
    <rect width="1200" height="630" fill="url(#g)"/>
    <g transform="rotate(-24 600 315)">
      ${Array.from({ length: 14 }, (_, i) => `<rect x="${-300 + i * 118}" y="-200" width="${i % 3 === 0 ? 22 : 7}" height="1030" fill="#FF3742" opacity="${i % 3 === 0 ? 0.1 : 0.05}"/>`).join('')}
    </g>
    <g fill="none" stroke="#FF3742" stroke-width="6" stroke-linecap="round" opacity=".14"
       transform="translate(830 210) scale(2.1)">
      <line x1="50" y1="100" x2="150" y2="100"/>
      <rect x="26" y="70" width="14" height="60" rx="6"/><rect x="44" y="80" width="10" height="40" rx="4"/>
      <rect x="160" y="70" width="14" height="60" rx="6"/><rect x="146" y="80" width="10" height="40" rx="4"/>
    </g>
  </svg>
  <div class="scrim"></div>

  <div class="row">
    <div class="mark">
      <svg viewBox="0 0 32 32" width="34" height="34" fill="none">
        <path d="M4 21 L13 7 L17 14 L21 10 L28 21" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="24.5" cy="24.5" r="2.5" fill="#fff"/>
      </svg>
    </div>
    <div><div class="name">SKYFIT</div><div class="unit">SATÉLITE ÍRIS</div></div>
  </div>

  <h1>Seu próximo nível<br><em>começa aqui.</em></h1>

  <div class="foot">
    <div class="tags">Musculação • Cardio • Aulas coletivas — Campinas/SP</div>
    <div class="badge">Demonstração de conceito</div>
  </div>
</body></html>`

const b = await chromium.launch()
const page = await (await b.newContext({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 })).newPage()
await page.setContent(html, { waitUntil: 'load' })
await page.waitForTimeout(300)
await page.screenshot({ path: path.join(root, 'public', 'og-image.png') })
await b.close()
console.log('public/og-image.png gerado (1200x630)')
