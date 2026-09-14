/* Testes da Exclusive Store: filtros, busca, modal, carrinho, estoque e WhatsApp. */
import { chromium } from './_playwright.mjs'

const OUT = process.env.OUT || '/tmp/shots'
const BASE = 'http://localhost:4173'
const b = await chromium.launch()
const fails = []
const check = (ok, label) => { console.log(`${ok ? 'PASS' : 'FAIL'} — ${label}`); if (!ok) fails.push(label) }

/* ----------------------------- DESKTOP ---------------------------------- */
{
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' })
  const page = await ctx.newPage()
  const errs = []
  page.on('pageerror', (e) => errs.push(e.message))
  page.on('console', (m) => { if (m.type() === 'error' && !m.text().includes('ERR_CONNECTION')) errs.push(`console: ${m.text()}`) })

  await page.goto(BASE, { waitUntil: 'load' })
  await page.waitForTimeout(400)

  // Menu
  check(await page.isVisible('.nav__link:has-text("Loja")'), 'item "Loja" existe no menu desktop')
  await page.click('.nav__link:has-text("Loja")')
  await page.waitForTimeout(900)
  const top = await page.evaluate(() => document.getElementById('loja').getBoundingClientRect().top)
  check(top > -40 && top < 200, `menu leva à seção da loja (top=${Math.round(top)})`)

  await page.evaluate(() => document.querySelectorAll('[data-reveal]').forEach((el) => el.classList.add('is-visible')))
  await page.waitForTimeout(250)

  // Vitrine
  const total = await page.$$eval('.p-card', (n) => n.length)
  check(total === 12, `vitrine mostra todos os 12 produtos (achou ${total})`)
  await page.screenshot({ path: `${OUT}/store-desktop.png` })

  // Filtro por categoria
  await page.click('.filters__chip:has-text("Whey")')
  await page.waitForTimeout(350)
  const wheyNames = await page.$$eval('.p-card__cat', (n) => n.map((e) => e.textContent))
  check(wheyNames.length === 2 && wheyNames.every((c) => c === 'Whey'), `filtro WHEY isola 2 produtos (achou ${wheyNames.length})`)

  await page.click('.filters__chip:has-text("Barras")')
  await page.waitForTimeout(350)
  check(await page.$$eval('.p-card', (n) => n.length) === 2, 'filtro BARRAS funciona')

  await page.click('.filters__chip:has-text("Todos")')
  await page.waitForTimeout(350)
  check(await page.$$eval('.p-card', (n) => n.length) === 12, 'filtro TODOS volta a listar tudo')

  // Busca (inclusive sem acento)
  await page.fill('.search__input', 'creatina')
  await page.waitForTimeout(350)
  check(await page.$$eval('.p-card', (n) => n.length) === 1, 'busca "creatina" retorna 1 produto')

  await page.fill('.search__input', 'PROTEICA')
  await page.waitForTimeout(350)
  check(await page.$$eval('.p-card', (n) => n.length) === 1, 'busca não diferencia maiúsculas')

  await page.fill('.search__input', 'omega')
  await page.waitForTimeout(350)
  check(await page.$$eval('.p-card__name', (n) => n[0]?.textContent) === 'Ômega 3', 'busca ignora acentos ("omega" acha "Ômega 3")')

  await page.fill('.search__input', 'xyzabc')
  await page.waitForTimeout(350)
  check(await page.isVisible('.store__empty'), 'busca sem resultado mostra estado vazio')
  await page.click('.store__empty .p-btn')
  await page.waitForTimeout(350)
  check(await page.$$eval('.p-card', (n) => n.length) === 12, 'botão "limpar filtros" restaura a vitrine')

  // Busca + filtro combinados
  await page.click('.filters__chip:has-text("Whey")')
  await page.fill('.search__input', 'isolado')
  await page.waitForTimeout(350)
  check(await page.$$eval('.p-card', (n) => n.length) === 1, 'busca e filtro funcionam combinados')
  await page.fill('.search__input', '')
  await page.click('.filters__chip:has-text("Todos")')
  await page.waitForTimeout(350)

  // Estoque
  const outCards = await page.$$eval('.p-card.is-out', (n) => n.length)
  check(outCards === 2, `produtos indisponíveis marcados (achou ${outCards})`)
  const outDisabled = await page.$$eval('.p-card.is-out .p-btn--solid', (n) => n.every((b) => b.disabled))
  check(outDisabled, 'botão de compra desabilitado nos indisponíveis')
  const outLabel = await page.$eval('.p-card.is-out .p-card__stock', (e) => e.textContent.trim())
  check(outLabel === 'Indisponível', `card indisponível exibe "${outLabel}"`)

  // Modal
  await page.click('.store__grid > li:first-child .p-btn--ghost')
  await page.waitForTimeout(450)
  check(await page.isVisible('.p-modal'), 'modal do produto abre')
  const modalName = await page.textContent('#p-modal-title')
  check(modalName === 'Whey protein concentrado', `modal mostra o produto certo (${modalName})`)
  const modalTxt = await page.textContent('.p-modal__info')
  check(modalTxt.includes('Consulte a unidade'), 'modal não inventa preço')
  check(modalTxt.includes('Comprar pelo WhatsApp'), 'modal tem o botão de WhatsApp')
  await page.screenshot({ path: `${OUT}/store-modal.png` })
  await page.keyboard.press('Escape')
  await page.waitForTimeout(400)
  check(!(await page.isVisible('.p-modal')), 'modal fecha com ESC')

  // Carrinho
  await page.click('.store__grid > li:first-child .p-btn--solid')
  await page.waitForTimeout(500)
  check(await page.isVisible('.cart__panel'), 'carrinho abre ao adicionar produto')
  check(await page.$$eval('.cart-item', (n) => n.length) === 1, 'item entra no carrinho')

  await page.click('.cart-item__qty button:last-child')
  await page.click('.cart-item__qty button:last-child')
  await page.waitForTimeout(300)
  check(await page.textContent('.cart-item__qty span') === '3', 'aumentar quantidade funciona')

  await page.click('.cart-item__qty button:first-child')
  await page.waitForTimeout(300)
  check(await page.textContent('.cart-item__qty span') === '2', 'diminuir quantidade funciona')

  check((await page.textContent('.cart__subtotal')).includes('A combinar'), 'subtotal sem preço cadastrado mostra "A combinar"')
  check(await page.isVisible('.cart__hint'), 'carrinho avisa sobre itens sem preço')
  await page.screenshot({ path: `${OUT}/store-cart.png` })

  await page.click('.cart__close')
  await page.waitForTimeout(350)
  await page.click('.store__grid > li:nth-child(3) .p-btn--solid')
  await page.waitForTimeout(450)
  check(await page.$$eval('.cart-item', (n) => n.length) === 2, 'segundo produto entra no carrinho')
  check(await page.textContent('.store__cart-count, .cart__count') !== null, 'contador do carrinho aparece')

  await page.click('.cart-item:first-child .cart-item__remove')
  await page.waitForTimeout(350)
  check(await page.$$eval('.cart-item', (n) => n.length) === 1, 'remover item funciona')

  await page.click('.cart__clear')
  await page.waitForTimeout(350)
  check(await page.isVisible('.cart__empty'), 'esvaziar carrinho mostra o estado vazio')

  check(errs.length === 0, `sem erros de JS no desktop (${errs.join(' | ')})`)
  await ctx.close()
}

/* ------------------------------ MOBILE ---------------------------------- */
for (const w of [375, 390, 414]) {
  const ctx = await b.newContext({ viewport: { width: w, height: 800 }, isMobile: true, hasTouch: true, reducedMotion: 'reduce' })
  const page = await ctx.newPage()
  await page.goto(BASE, { waitUntil: 'load' })
  await page.waitForTimeout(400)

  // Menu hamburger
  await page.click('.burger')
  await page.waitForTimeout(500)
  const hasLoja = await page.isVisible('.mmenu__link:has-text("Loja")')
  await page.click('.mmenu__link:has-text("Loja")')
  await page.waitForTimeout(900)
  if (w === 390) check(hasLoja, 'item "Loja" existe no menu hamburger')

  await page.evaluate(() => document.querySelectorAll('[data-reveal]').forEach((el) => el.classList.add('is-visible')))
  await page.waitForTimeout(250)

  // 2 por linha quando cabe
  const cols = await page.evaluate(() => {
    const grid = document.querySelector('.store__grid')
    return getComputedStyle(grid).gridTemplateColumns.split(' ').length
  })
  check(cols === 2, `${w}px: ${cols} produto(s) por linha (esperado 2)`)

  const noScroll = await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1)
  check(noScroll, `${w}px: sem rolagem horizontal`)

  if (w === 390) {
    await page.screenshot({ path: `${OUT}/store-mobile.png` })
    await page.click('.store__grid > li:first-child .p-btn--solid')
    await page.waitForTimeout(500)
    check(await page.isVisible('.cart__panel'), '390px: carrinho abre como painel inferior')
    await page.screenshot({ path: `${OUT}/store-cart-mobile.png` })
    await page.click('.cart__close')
    await page.waitForTimeout(300)
    await page.click('.store__grid > li:first-child .p-btn--ghost')
    await page.waitForTimeout(450)
    check(await page.isVisible('.p-modal'), '390px: modal do produto abre')
    await page.screenshot({ path: `${OUT}/store-modal-mobile.png` })
  }
  await ctx.close()
}

/* -------------------- 320px: 1 por linha (tela estreita) ----------------- */
{
  const ctx = await b.newContext({ viewport: { width: 320, height: 720 }, isMobile: true, hasTouch: true })
  const page = await ctx.newPage()
  await page.goto(BASE, { waitUntil: 'load' })
  await page.waitForTimeout(400)
  const cols = await page.evaluate(() => getComputedStyle(document.querySelector('.store__grid')).gridTemplateColumns.split(' ').length)
  check(cols === 1, `320px: ${cols} produto por linha (esperado 1)`)
  await ctx.close()
}

await b.close()
console.log(`\n${fails.length ? 'FALHAS:\n- ' + fails.join('\n- ') : 'Todos os testes da loja passaram.'}`)
