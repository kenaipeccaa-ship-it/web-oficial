/* ==========================================================================
   Testes ponta a ponta do painel administrativo.
   Cobre: acesso sem sessão, login, logout, galeria, produtos, informações,
   reflexo no site público e responsividade.
   Requer o servidor rodando (npm start) em BASE.
   ========================================================================== */
import { chromium } from './_playwright.mjs'

const BASE = process.env.BASE || 'http://localhost:3001'
const EMAIL = process.env.ADMIN_EMAIL || 'admin@skyfit.local'
const PASSWORD = process.env.ADMIN_PASSWORD || 'demo-admin-2026'
const OUT = process.env.OUT || '/tmp/shots'

const b = await chromium.launch()
const fails = []
const check = (ok, label) => { console.log(`${ok ? 'PASS' : 'FAIL'} — ${label}`); if (!ok) fails.push(label) }

const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' })
const page = await ctx.newPage()
const errs = []
page.on('pageerror', (e) => errs.push(e.message))
// Os testes disparam 401/400 de propósito; o navegador registra isso como
// erro de console. Só interessam erros de JavaScript de verdade.
page.on('console', (m) => {
  const t = m.text()
  if (m.type() !== 'error') return
  if (/Failed to load resource|ERR_CONNECTION|ERR_CERT/.test(t)) return
  errs.push(t)
})
const norm = (t) => String(t).replace(/\u00a0/g, ' ')

/* ------------------------ 1. Acesso sem autenticação --------------------- */
await page.goto(`${BASE}/admin`, { waitUntil: 'load' })
await page.waitForTimeout(600)
check(await page.isVisible('.adm-login'), '/admin sem sessão mostra a tela de login')
check(!(await page.isVisible('.adm-shell')), '/admin sem sessão NÃO mostra o dashboard')
await page.screenshot({ path: `${OUT}/admin-login.png` })

/* A API administrativa também recusa sem sessão. */
const semSessao = await page.evaluate(async (base) => {
  const r = await fetch(`${base}/api/admin/products`, { credentials: 'same-origin' })
  return r.status
}, BASE)
check(semSessao === 401, `API administrativa sem sessão devolve 401 (devolveu ${semSessao})`)

/* ------------------------------ 2. Login --------------------------------- */
await page.fill('input[name="email"]', EMAIL)
await page.fill('input[name="password"]', 'senha-errada')
await page.click('button[type="submit"]')
await page.waitForTimeout(700)
check(await page.isVisible('.adm-alert--error'), 'senha errada mostra erro e não entra')

await page.fill('input[name="password"]', PASSWORD)
await page.click('button[type="submit"]')
await page.waitForSelector('.adm-shell', { timeout: 8000 })
check(await page.isVisible('.adm-shell'), 'login correto abre o dashboard')

/* O token da sessão não pode estar acessível ao JavaScript. */
const cookieVisivel = await page.evaluate(() => document.cookie.includes('skyfit_admin_session'))
check(!cookieVisivel, 'cookie de sessão é httpOnly (invisível ao JavaScript)')

/* ------------------------------ 3. Galeria ------------------------------- */
await page.click('.adm-nav__item:has-text("Galeria")')
await page.waitForTimeout(500)

const png = (r, g, bl) => Buffer.from(
  `iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==`, 'base64')

await page.setInputFiles('.adm-panel input[type="file"]', [
  { name: 'foto-academia-1.png', mimeType: 'image/png', buffer: png() },
  { name: 'foto-academia-2.png', mimeType: 'image/png', buffer: png() },
])
await page.waitForTimeout(1200)
check(await page.$$eval('.adm-card', (n) => n.length) === 2, 'adicionar 2 fotos de uma vez')
await page.screenshot({ path: `${OUT}/admin-galeria.png` })

/* Reflexo no site público */
let pub = await page.evaluate(async (base) => (await fetch(`${base}/api/public/content`)).json(), BASE)
check(pub.gallery.length === 2, 'fotos aparecem no conteúdo público')

/* Ocultar uma foto */
await page.click('.adm-card:first-child button:has-text("Ocultar")')
await page.waitForTimeout(900)
pub = await page.evaluate(async (base) => (await fetch(`${base}/api/public/content`)).json(), BASE)
check(pub.gallery.length === 1, 'foto ocultada some do site público')
await page.click('.adm-card:first-child button:has-text("Publicar")')
await page.waitForTimeout(900)

/* Reordenar */
const antes = await page.$$eval('.adm-card__meta', (n) => n.map((e) => e.textContent))
await page.click('.adm-card:first-child button[aria-label="Mover para baixo"]')
await page.waitForTimeout(900)
const depois = await page.$$eval('.adm-card__meta', (n) => n.map((e) => e.textContent))
check(antes[0] !== depois[0], 'reordenar fotos funciona')

/* Editar textos */
await page.click('.adm-card:first-child button:has-text("Editar")')
await page.waitForTimeout(400)
await page.fill('.adm-card:first-child input[name="title"]', 'Área de musculação')
await page.click('.adm-card:first-child button:has-text("Salvar")')
await page.waitForTimeout(900)
check((await page.textContent('.adm-card:first-child .adm-card__title')) === 'Área de musculação', 'editar título da foto')

/* Excluir */
page.once('dialog', (d) => d.accept())
await page.click('.adm-card:first-child button:has-text("Excluir")')
await page.waitForTimeout(1000)
check(await page.$$eval('.adm-card', (n) => n.length) === 1, 'excluir foto funciona')

/* ----------------------------- 4. Produtos ------------------------------- */
await page.click('.adm-nav__item:has-text("Produtos")')
await page.waitForTimeout(600)
const totalInicial = await page.$$eval('.adm-table tbody tr', (n) => n.length)
check(totalInicial === 12, `produtos semeados a partir do arquivo estático (${totalInicial})`)

await page.click('button:has-text("Novo produto")')
await page.waitForTimeout(400)
await page.fill('.adm-form input[placeholder^="Ex.: Whey"]', 'Produto de Teste E2E')
await page.selectOption('.adm-form select', 'whey')
await page.fill('.adm-form input[inputmode="decimal"]', '129,90')
await page.fill('.adm-form textarea', 'Descrição do produto de teste.')
await page.click('button:has-text("Criar produto")')
await page.waitForTimeout(1000)
check(await page.$$eval('.adm-table tbody tr', (n) => n.length) === 13, 'adicionar produto')

const linha = page.locator('.adm-table tbody tr', { hasText: 'Produto de Teste E2E' })
check(norm(await linha.textContent()).includes('R$ 129,90'), 'preço salvo e formatado em reais')
await page.screenshot({ path: `${OUT}/admin-produtos.png` })

/* Alterar preço */
await linha.locator('button:has-text("Editar")').click()
await page.waitForTimeout(400)
await page.fill('.adm-form input[inputmode="decimal"]', '99,50')
await page.click('button:has-text("Salvar alterações")')
await page.waitForTimeout(1000)
check(norm(await page.locator('.adm-table tbody tr', { hasText: 'Produto de Teste E2E' }).textContent()).includes('R$ 99,50'), 'alterar preço')

pub = await page.evaluate(async (base) => (await fetch(`${base}/api/public/content`)).json(), BASE)
check(pub.products.some((p) => p.name === 'Produto de Teste E2E' && p.price === 99.5), 'preço novo chega ao site público')

/* Desativar */
await page.locator('.adm-table tbody tr', { hasText: 'Produto de Teste E2E' }).locator('button:has-text("Ocultar")').click()
await page.waitForTimeout(1000)
pub = await page.evaluate(async (base) => (await fetch(`${base}/api/public/content`)).json(), BASE)
check(!pub.products.some((p) => p.name === 'Produto de Teste E2E'), 'produto desativado some da loja pública')

/* ---------------------------- 5. Informações ----------------------------- */
await page.click('.adm-nav__item:has-text("Informações")')
await page.waitForTimeout(700)
const waInput = page.locator('.adm-field', { hasText: 'WhatsApp' }).locator('input').first()
await waInput.fill('5519988887777')
await page.click('button:has-text("Salvar alterações")')
await page.waitForTimeout(1000)
check(await page.isVisible('.adm-toast--ok'), 'salvar informações mostra confirmação')
pub = await page.evaluate(async (base) => (await fetch(`${base}/api/public/content`)).json(), BASE)
check(pub.info.whatsapp === '5519988887777', 'WhatsApp salvo chega ao site público')

/* Validação */
await waInput.fill('123')
await page.click('button:has-text("Salvar alterações")')
await page.waitForTimeout(900)
check(await page.isVisible('.adm-toast--error'), 'WhatsApp inválido é recusado')
await waInput.fill('5519988887777')
await page.click('button:has-text("Salvar alterações")')
await page.waitForTimeout(900)

/* ------------------------ 6. Reflexo no site público --------------------- */
const site = await ctx.newPage()
await site.goto(BASE, { waitUntil: 'load' })
await site.waitForTimeout(1500)
const waLinks = await site.$$eval('a[href*="wa.me"]', (n) => n.map((a) => a.href))
check(waLinks.length > 0 && waLinks.every((h) => h.includes('5519988887777')), 'botões do site usam o WhatsApp do painel')

await site.evaluate(() => document.querySelectorAll('[data-reveal]').forEach((el) => el.classList.add('is-visible')))
await site.waitForTimeout(400)
const galeriaSite = await site.$$eval('#academia .gal__item img', (n) => n.length)
check(galeriaSite === 1, `galeria pública usa a foto enviada (${galeriaSite})`)
const semNotaDemo = await site.$$eval('#academia .estrutura__note', (n) => n.length)
check(semNotaDemo === 0, 'aviso de "arte ilustrativa" some quando há foto real')

const lojaNomes = await site.$$eval('.p-card__name', (n) => n.map((e) => e.textContent))
check(!lojaNomes.includes('Produto de Teste E2E'), 'produto oculto não aparece na loja pública')
await site.screenshot({ path: `${OUT}/site-com-painel.png` })
await site.close()

/* ------------------------------- 7. Limpeza ------------------------------ */
await page.click('.adm-nav__item:has-text("Produtos")')
await page.waitForTimeout(600)
page.once('dialog', (d) => d.accept())
await page.locator('.adm-table tbody tr', { hasText: 'Produto de Teste E2E' }).locator('button:has-text("Excluir")').click()
await page.waitForTimeout(1000)
check(await page.$$eval('.adm-table tbody tr', (n) => n.length) === 12, 'excluir produto')

/* -------------------------------- 8. Logout ------------------------------ */
await page.click('.adm-nav__item--logout')
await page.waitForTimeout(1000)
check(await page.isVisible('.adm-login'), 'logout volta para a tela de login')

const posLogout = await page.evaluate(async (base) => {
  const r = await fetch(`${base}/api/admin/products`, { credentials: 'same-origin' })
  return r.status
}, BASE)
check(posLogout === 401, `sessão invalidada no servidor após logout (${posLogout})`)

await page.goto(`${BASE}/admin`, { waitUntil: 'load' })
await page.waitForTimeout(700)
check(await page.isVisible('.adm-login'), 'reabrir /admin após logout pede login de novo')

check(errs.length === 0, `sem erros de JS no painel (${errs.join(' | ')})`)
await ctx.close()

/* ----------------------------- 9. Responsivo ----------------------------- */
for (const w of [390, 768, 1440]) {
  const c = await b.newContext({ viewport: { width: w, height: 800 }, isMobile: w < 700, hasTouch: w < 700 })
  const p = await c.newPage()
  await p.goto(`${BASE}/admin`, { waitUntil: 'load' })
  await p.waitForTimeout(700)
  await p.fill('input[name="email"]', EMAIL)
  await p.fill('input[name="password"]', PASSWORD)
  await p.click('button[type="submit"]')
  await p.waitForSelector('.adm-shell', { timeout: 8000 })
  await p.waitForTimeout(500)

  const overflow = await p.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1)
  check(!overflow, `${w}px: painel sem rolagem horizontal`)

  if (w < 1024) {
    await p.click('.adm-burger')
    await p.waitForTimeout(500)
    check(await p.isVisible('.adm-sidebar.is-open'), `${w}px: menu lateral abre`)
    if (w === 390) await p.screenshot({ path: `${OUT}/admin-mobile.png` })
  }
  await c.close()
}

await b.close()
console.log(`\n${fails.length ? 'FALHAS:\n- ' + fails.join('\n- ') : 'Todos os testes do painel passaram.'}`)
