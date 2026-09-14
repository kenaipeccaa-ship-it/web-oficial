# SKYFIT — Campo Grande · Demonstração de conceito

Demonstração **independente** de um site para uma academia na região do Campo Grande,
Campinas/SP. O objetivo é apresentar uma proposta de experiência digital ao responsável
pela unidade.

> **Importante:** esta página **não é um canal oficial da academia**. Nenhum telefone,
> preço, endereço, horário, avaliação, depoimento ou quantidade (de alunos, equipamentos
> etc.) foi inventado. Todo campo não confirmado aparece como `[DEFINIR]`,
> `[INSERIR ...]` ou com o texto **"Consulte a unidade"**.

---

## Rodando o projeto

```bash
npm install
npm run dev      # ambiente de desenvolvimento (http://localhost:5173)
npm run build    # gera a versão de produção em dist/
npm run preview  # serve o build de produção
```

Requer Node.js 20+.

---

## O que editar antes de publicar

Quase tudo está em **um único arquivo**: [`src/config/site.js`](src/config/site.js).

### 1. WhatsApp — uma variável só

```js
// src/config/site.js
export const WHATSAPP_NUMBER = '5519999999999' // 55 + DDD + número, só dígitos
```

Todos os botões da página (header, planos, aula experimental, rodapé, botão flutuante e
modais) passam a funcionar a partir desse campo. Enquanto ele estiver vazio, os botões
avisam que o número ainda não foi configurado — eles nunca apontam para um número
inventado.

### 2. Redes e contato

```js
export const INSTAGRAM_URL = 'https://instagram.com/perfil-oficial'
export const INSTAGRAM_HANDLE = '@perfil-oficial'
export const PHONE_NUMBER = ''  // opcional
export const EMAIL = ''         // opcional
```

### 3. Endereço, mapa e horários

```js
export const brand = {
  addressLine: 'Rua ..., nº ... — Campo Grande, Campinas/SP',
  mapEmbedUrl: 'https://www.google.com/maps/embed?pb=...', // ativa o mapa na seção
  mapsDirectionsUrl: 'https://maps.app.goo.gl/...',        // ativa o botão "Como chegar"
}

export const openingHours = {
  confirmed: true,
  rows: [{ label: 'Segunda a sexta', value: '06h — 22h' }, /* ... */],
}
```

### 4. Modalidades, planos, objetivos e FAQ

São listas simples no mesmo arquivo — basta adicionar, remover ou reordenar os objetos.
Cada modalidade tem `name`, `short`, `icon` (nome de um ícone do
[lucide](https://lucide.dev)), `art` e o conteúdo do modal em `details`.

> Os nomes de modalidades usados aqui servem para a demonstração e **precisam ser
> confirmados com a unidade** (nomes, disponibilidade e horários).

### 5. Fotos reais

Os visuais atuais são **artes gráficas em SVG geradas pelo próprio projeto**, marcadas
como *"imagem ilustrativa"*. Elas são abstratas de propósito: não simulam fotografias do
local, para que a demonstração não induza ninguém a erro.

Para usar as fotos reais:

1. Coloque os arquivos em `public/fotos/`.
2. Preencha o campo `src` do slot correspondente em
   [`src/config/media.js`](src/config/media.js):

```js
musculacao: { pattern: 'plates', accent: 'red', glyph: 'dumbbell',
              src: '/fotos/musculacao.jpg', alt: 'Área de musculação da unidade' },
```

O selo "imagem ilustrativa" some sozinho quando há foto. Se a foto falhar ao carregar, a
arte volta a aparecer e o layout não quebra.

### 6. SEO e imagem de compartilhamento

- Título, descrição, Open Graph e Twitter Card estão em [`index.html`](index.html).
- `public/og-image.png` (1200×630) pode ser regerado com `node scripts/make-og.mjs`.
- A página está com `noindex, nofollow` enquanto for demonstração — **remova essa linha**
  de `index.html` antes de publicar como site oficial, e preencha a URL canônica.

---

## Estrutura

```
src/
├─ config/
│  ├─ site.js            ← conteúdo editável (contato, modalidades, planos, FAQ…)
│  └─ media.js           ← slots de imagem: arte placeholder ou foto real
├─ components/
│  ├─ Header · Hero · Features · Modalidades · Estrutura · Planos
│  ├─ AulaExperimental · Objetivos · Localizacao · FAQ · CTA · Footer
│  ├─ WhatsAppButton
│  └─ ui/                ← Art, PhotoFrame, Modal, Reveal, Icon, SectionHeading, WhatsAppLink
├─ hooks/                ← useReveal, useLockBodyScroll, useScrollSpy
├─ lib/                  ← whatsapp (montagem do link), notice (avisos)
└─ styles/               ← fonts, tokens, base, ui
```

**Stack:** React 18 + Vite + CSS moderno (custom properties, sem framework de UI) +
ícones lucide-react.

---

## Formulário da aula experimental

O formulário valida nome e WhatsApp, aplica máscara no telefone e mostra a confirmação
*"Sua solicitação foi registrada nesta demonstração."*

**Nenhum dado é enviado ou armazenado.** Para integrar de verdade, envie o objeto `form`
para o seu backend, e-mail ou CRM em `onSubmit`
([`src/components/AulaExperimental.jsx`](src/components/AulaExperimental.jsx)).

---

## Verificações automatizadas

```bash
npm run build
npm run preview          # em outro terminal
node scripts/qa.mjs           # rolagem horizontal, console e screenshots em 7 larguras
node scripts/interactions.mjs # menu mobile, modais, FAQ, formulário, WhatsApp e âncoras
```

Testado em 360, 390, 430, 768, 1024, 1440 e 1920px: sem rolagem horizontal, sem
sobreposição de texto e sem erros de JavaScript no console.

Os scripts usam o Playwright instalado no ambiente; ajuste o caminho do `import` no topo
de cada arquivo se o seu Playwright estiver em outro lugar (`npm i -D playwright` e
`import { chromium } from 'playwright'`).

---

## Acessibilidade

HTML semântico, hierarquia de headings, foco visível, `aria-*` em menu/modais/acordeão,
travamento de foco nos modais, link "pular para o conteúdo" e respeito a
`prefers-reduced-motion` (as animações são desligadas).
