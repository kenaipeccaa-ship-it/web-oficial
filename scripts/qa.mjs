/* QA visual automatizado: console, rolagem horizontal, breakpoints e screenshots. */
import pw from '/opt/node22/lib/node_modules/playwright/index.js'
const { chromium } = pw
import fs from 'node:fs'

const BASE = process.env.BASE || 'http://localhost:4173'
const OUT = process.env.OUT || '/tmp/shots'
fs.mkdirSync(OUT, { recursive: true })

const sizes = [
  { name: '360', w: 360, h: 780, mobile: true },
  { name: '390', w: 390, h: 844, mobile: true },
  { name: '430', w: 430, h: 932, mobile: true },
  { name: '768', w: 768, h: 1024, mobile: false },
  { name: '1024', w: 1024, h: 800, mobile: false },
  { name: '1440', w: 1440, h: 900, mobile: false },
  { name: '1920', w: 1920, h: 1080, mobile: false },
]

const browser = await chromium.launch()
const problems = []

for (const s of sizes) {
  const ctx = await browser.newContext({
    viewport: { width: s.w, height: s.h },
    deviceScaleFactor: 1,
    isMobile: s.mobile,
    hasTouch: s.mobile,
    reducedMotion: 'reduce',
  })
  const page = await ctx.newPage()
  const logs = []
  page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') logs.push(`[${m.type()}] ${m.text()}`) })
  page.on('pageerror', (e) => logs.push(`[pageerror] ${e.message}`))

  await page.goto(BASE, { waitUntil: 'networkidle' })
  await page.waitForTimeout(400)
  // Revela todas as seções (o observer usa o viewport).
  await page.evaluate(() => document.querySelectorAll('[data-reveal]').forEach((el) => el.classList.add('is-visible')))
  await page.waitForTimeout(250)

  const metrics = await page.evaluate(() => {
    const de = document.documentElement
    const overflowing = []
    // Elementos recortados por um ancestral com overflow hidden/clip nao vazam
    // da tela — sao ignorados (ex.: artes SVG e brilhos decorativos).
    const isClipped = (el) => {
      let p = el.parentElement
      while (p && p !== document.body) {
        const o = getComputedStyle(p)
        if (/hidden|clip|auto|scroll/.test(o.overflowX) || o.clipPath !== 'none') return true
        p = p.parentElement
      }
      return false
    }
    for (const el of document.querySelectorAll('body *')) {
      if (el instanceof SVGElement) continue
      const r = el.getBoundingClientRect()
      if (r.width === 0 || r.height === 0) continue
      if (r.right > de.clientWidth + 1.5 || r.left < -1.5) {
        if (isClipped(el)) continue
        overflowing.push(`${el.tagName.toLowerCase()}.${(el.className || '').toString().split(' ').filter(Boolean).slice(0, 2).join('.')} [${Math.round(r.left)}..${Math.round(r.right)}]`)
      }
    }
    return {
      scrollW: de.scrollWidth,
      clientW: de.clientWidth,
      overflowing: [...new Set(overflowing)].slice(0, 12),
    }
  })

  if (metrics.scrollW > metrics.clientW + 1) {
    problems.push(`${s.name}px: rolagem horizontal (${metrics.scrollW} > ${metrics.clientW}) → ${metrics.overflowing.join(' | ')}`)
  } else if (metrics.overflowing.length) {
    problems.push(`${s.name}px: elementos fora da área visível → ${metrics.overflowing.join(' | ')}`)
  }
  if (logs.length) problems.push(`${s.name}px console: ${logs.join(' ;; ')}`)

  await page.screenshot({ path: `${OUT}/full-${s.name}.png`, fullPage: true })
  await page.screenshot({ path: `${OUT}/hero-${s.name}.png` })
  await ctx.close()
  console.log(`ok ${s.name}px  scrollW=${metrics.scrollW} clientW=${metrics.clientW} console=${logs.length}`)
}

await browser.close()
console.log('\n=== PROBLEMAS ===')
console.log(problems.length ? problems.join('\n') : 'nenhum')
