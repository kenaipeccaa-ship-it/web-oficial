/* Testa fluxos interativos: menu mobile, modais, formulário, FAQ, WhatsApp e âncoras. */
import { chromium } from './_playwright.mjs'
const OUT = process.env.OUT || '/tmp/shots'
const BASE = 'http://localhost:4173'
const b = await chromium.launch()
const fails = []
const check = (ok, label) => { console.log(`${ok ? 'PASS' : 'FAIL'} — ${label}`); if (!ok) fails.push(label) }

/* ---------------------------- MOBILE (390px) ---------------------------- */
{
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true })
  const page = await ctx.newPage()
  const errs = []
  page.on('pageerror', (e) => errs.push(e.message))
  await page.goto(BASE, { waitUntil: 'load' })
  await page.waitForTimeout(500)

  // Menu hamburger
  await page.click('.burger')
  await page.waitForTimeout(500)
  check(await page.isVisible('.mmenu.is-open'), 'menu mobile abre')
  check(await page.evaluate(() => getComputedStyle(document.body).overflow === 'hidden'), 'menu mobile trava a rolagem do fundo')
  await page.screenshot({ path: `${OUT}/menu-mobile.png` })

  // Navegar por um link do menu fecha o menu e rola até a seção
  await page.click('.mmenu__link >> text=Planos')
  await page.waitForTimeout(900)
  check(!(await page.isVisible('.mmenu.is-open')), 'menu fecha ao clicar em um link')
  const planosTop = await page.evaluate(() => document.getElementById('planos').getBoundingClientRect().top)
  check(planosTop > -40 && planosTop < 200, `âncora leva à seção Planos (top=${Math.round(planosTop)})`)

  // Botão flutuante do WhatsApp
  await page.click('.wa__fab')
  await page.waitForTimeout(400)
  check(await page.isVisible('.wa__panel'), 'painel do WhatsApp abre')
  check((await page.$$('.wa__panel .wa__option')).length === 3, 'painel traz as 3 mensagens prontas')
  await page.screenshot({ path: `${OUT}/wa-panel-mobile.png` })
  await page.keyboard.press('Escape')
  await page.waitForTimeout(300)
  check(!(await page.isVisible('.wa__panel')), 'painel do WhatsApp fecha com ESC')

  check(errs.length === 0, `sem erros de JS no mobile (${errs.join(' | ')})`)
  await ctx.close()
}

/* --------------------------- DESKTOP (1440px) --------------------------- */
{
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await ctx.newPage()
  const errs = []
  page.on('pageerror', (e) => errs.push(e.message))
  await page.goto(BASE, { waitUntil: 'load' })
  await page.waitForTimeout(400)

  // Modal de modalidade
  await page.click('.mod:first-child .mod__more')
  await page.waitForTimeout(500)
  check(await page.isVisible('.modal__panel'), 'modal de modalidade abre')
  check((await page.textContent('#mod-modal-title')).includes('MUSCULAÇÃO'), 'modal mostra a modalidade certa')
  check((await page.textContent('.mod-modal__meta')).includes('Consulte a unidade'), 'modal não inventa horário')
  await page.screenshot({ path: `${OUT}/modal-desktop.png` })
  await page.keyboard.press('Escape')
  await page.waitForTimeout(400)
  check(!(await page.isVisible('.modal__panel')), 'modal fecha com ESC')

  // FAQ
  const firstOpen = await page.getAttribute('.acc__item:first-child .acc__trigger', 'aria-expanded')
  await page.click('.acc__item:nth-child(3) .acc__trigger')
  await page.waitForTimeout(350)
  check(firstOpen === 'true', 'FAQ inicia com a primeira pergunta aberta')
  check(await page.getAttribute('.acc__item:nth-child(3) .acc__trigger', 'aria-expanded') === 'true', 'FAQ abre outra pergunta')
  check(await page.getAttribute('.acc__item:first-child .acc__trigger', 'aria-expanded') === 'false', 'FAQ fecha a anterior')

  // Objetivo preenche o formulário
  await page.click('.goals li:nth-child(2) .goal')
  await page.waitForTimeout(800)
  check(await page.inputValue('#f-objetivo') === 'Melhorar condicionamento', 'card de objetivo preenche o formulário')

  // Validação do formulário
  await page.click('.form__submit')
  await page.waitForTimeout(300)
  check(await page.isVisible('#e-nome'), 'formulário valida o nome')
  await page.fill('#f-nome', 'Visitante Demo')
  await page.fill('#f-whatsapp', '19999998888')
  check(await page.inputValue('#f-whatsapp') === '(19) 99999-8888', 'máscara de telefone funciona')
  await page.click('.form__submit')
  await page.waitForTimeout(500)
  const done = await page.textContent('.form-done')
  check(done.includes('Sua solicitação foi registrada nesta demonstração'), 'formulário mostra a confirmação da demonstração')
  await page.screenshot({ path: `${OUT}/form-done.png` })

  // Aviso quando o WhatsApp ainda não foi configurado
  await page.click('.header__cta')
  await page.waitForTimeout(400)
  check((await page.textContent('.toast')).includes('WHATSAPP_NUMBER'), 'botão de WhatsApp avisa que o número não foi configurado')

  // Links internos: todas as âncoras existem
  const badAnchors = await page.evaluate(() =>
    [...document.querySelectorAll('a[href^="#"]')]
      .map((a) => a.getAttribute('href'))
      .filter((h) => h !== '#' && !document.querySelector(h)),
  )
  check(badAnchors.length === 0, `todas as âncoras existem (quebradas: ${badAnchors.join(', ') || 'nenhuma'})`)

  // Nenhum link externo apontando para número/endereço inventado
  const externals = await page.evaluate(() => [...document.querySelectorAll('a[href^="http"]')].map((a) => a.href))
  check(externals.length === 0, `sem links externos com dados inventados (${externals.join(', ') || 'nenhum'})`)

  check(errs.length === 0, `sem erros de JS no desktop (${errs.join(' | ')})`)
  await ctx.close()
}

await b.close()
console.log(`\n${fails.length ? 'FALHAS:\n- ' + fails.join('\n- ') : 'Todos os testes passaram.'}`)
