/* Resolve o Playwright: usa o do projeto, se houver, ou o instalado globalmente. */
const candidates = [
  'playwright',
  'playwright-core',
  '/opt/node22/lib/node_modules/playwright/index.js',
]

let loaded = null
for (const id of candidates) {
  try {
    const mod = await import(id)
    loaded = mod.chromium ? mod : mod.default
    if (loaded?.chromium) break
    loaded = null
  } catch {
    /* tenta o próximo */
  }
}

if (!loaded?.chromium) {
  console.error('Playwright não encontrado. Instale com:  npm i -D playwright && npx playwright install chromium')
  process.exit(1)
}

export const { chromium } = loaded
