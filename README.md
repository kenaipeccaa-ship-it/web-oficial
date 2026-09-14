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
cp .env.example .env          # preencha as credenciais do painel (ver abaixo)

npm run dev:all               # site + API juntos (http://localhost:5173)
npm run build                 # gera a versão de produção em dist/
npm start                     # produção: serve o site e a API na porta 3001
```

Requer Node.js 20+.

| Comando | Para quê |
|---|---|
| `npm run dev:all` | Sobe o Vite e a API juntos. É o modo normal de desenvolvimento. |
| `npm run dev` | Só o site (sem API — o conteúdo cai no estático). |
| `npm run dev:server` | Só a API, com recarga automática. |
| `npm start` | Produção: um processo Node serve o `dist/`, a API e as imagens. |
| `npm run admin:hash -- "senha"` | Gera o hash bcrypt da senha do painel. |

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

### 6. Exclusive Store (loja de suplementos)

Tudo o que a loja mostra vem de **um arquivo só**:
[`src/data/products.js`](src/data/products.js).

**Cadastrar um produto** — copie um bloco da lista `products` e ajuste:

```js
{
  id: 'whey-concentrado',            // identificador único, sem espaços
  name: 'Whey protein concentrado',  // nome no card e no modal
  category: 'whey',                  // id de uma categoria (lista abaixo)
  price: null,                       // número (149.9) ou null => "Consulte a unidade"
  image: '/images/store/whey.jpg',   // '' usa a arte gerada pelo projeto
  art: 'tub',                        // tub | bar | bottle | pills | shaker | sachet
  description: '...',                // texto do modal
  available: true,                   // false => "INDISPONÍVEL" e compra desativada
}
```

| O que mudar | Onde |
|---|---|
| Preços | campo `price` de cada produto |
| Fotos | campo `image` (ver [`public/images/store/README.md`](public/images/store/README.md)) |
| Estoque | campo `available` |
| Categorias dos filtros | lista `storeCategories`, no topo do mesmo arquivo |
| Número do WhatsApp | `WHATSAPP_NUMBER` em `src/config/site.js` (o mesmo do site) |
| Mensagens do WhatsApp | `whatsappMessages.produto` e `whatsappMessages.pedido` |

**Adicionar uma categoria:** inclua `{ id: 'pos-treino', label: 'Pós-treino' }`
em `storeCategories` e use esse mesmo `id` no campo `category` dos produtos.
Para remover, apague a linha — a categoria some do filtro. A categoria
`todos` é obrigatória e não filtra nada.

**Carrinho:** fica em memória enquanto a página está aberta. Não há checkout,
pagamento online nem qualquer dado bancário — o pedido vira uma mensagem de
WhatsApp com os itens e as quantidades.

### 7. SEO e imagem de compartilhamento

- Título, descrição, Open Graph e Twitter Card estão em [`index.html`](index.html).
- `public/og-image.png` (1200×630) pode ser regerado com `node scripts/make-og.mjs`.
- A página está com `noindex, nofollow` enquanto for demonstração — **remova essa linha**
  de `index.html` antes de publicar como site oficial, e preencha a URL canônica.

---

## Painel administrativo

Área privada em **`/admin`** para gerenciar fotos, produtos e informações da
academia **sem editar código**. Visitantes não têm acesso: sem sessão válida a
rota mostra a tela de login e a API administrativa responde `401`.

### Como acessar

1. Preencha o `.env` (ver [Variáveis de ambiente](#variáveis-de-ambiente)).
2. Suba o projeto (`npm run dev:all` em desenvolvimento, `npm start` em produção).
3. Abra `http://seu-dominio/admin` e entre com o e-mail e a senha do `.env`.

A sessão dura 12 horas (configurável) e vive num cookie `httpOnly` — nenhum
script da página consegue ler o token. "Sair" encerra a sessão também no
servidor.

### Página inicial (imagem do topo)

Painel → **Página inicial**. Controla a imagem de fundo do Hero — a primeira
coisa que o visitante vê.

- **Enviar / Alterar imagem:** substitui a imagem atual (JPG, PNG, WebP, AVIF
  ou GIF, até 8 MB). O arquivo anterior é apagado do disco.
- **Remover imagem:** o site volta a exibir a arte gráfica padrão do projeto.

A área de visualização mostra sempre a imagem em vigor. A troca aparece no site
na recarga seguinte. Sugestão: foto horizontal, 1920×1080 ou maior, sem
informação importante no canto esquerdo (é onde fica o texto do topo).

### Galeria

Painel → **Galeria**. Controla a seção *“Um espaço para você evoluir”* do site.

- **Adicionar:** botão *Adicionar fotos* — aceita várias de uma vez (JPG, PNG,
  WebP, AVIF ou GIF, até 8 MB cada).
- **Excluir:** botão *Excluir* no card (pede confirmação; apaga também o arquivo).
- **Substituir:** troca o arquivo mantendo posição, título e legenda.
- **Publicar/Ocultar:** tira a foto do site sem apagá-la.
- **Ordenar:** setas ↑ ↓ — a primeira foto ocupa o quadro grande da seção.
- **Editar:** título e legenda exibidos sobre a foto.

Tudo aparece no site imediatamente. Enquanto não houver **nenhuma** foto, a
seção continua exibindo as artes ilustrativas de sempre.

### Modalidades (fotos dos cards)

Painel → **Modalidades**. Controla apenas a **foto** de cada card da seção
*“Escolha como você quer treinar”*.

- **Enviar / Trocar foto:** por modalidade (JPG, PNG, WebP, AVIF ou GIF, até
  8 MB). O arquivo anterior é apagado do disco.
- **Remover foto:** aquele card volta à arte gráfica padrão, sem afetar os
  outros.

A foto aparece no card e também no modal “Saiba mais”. Nome, etiqueta, ícone e
descrição das modalidades continuam definidos em `src/config/site.js` — o painel
não mexe nesses campos.

### Produtos

Painel → **Produtos**. Controla a Exclusive Store.

- **Novo produto / Editar:** nome, categoria, preço, descrição, arte e estoque.
- **Preço:** aceita `129,90` ou `129.90`. **Em branco** exibe
  *“Consulte a unidade”* no site.
- **Estoque:** desmarcar *Em estoque* exibe **INDISPONÍVEL** e desativa a compra.
- **Ativo no site:** desmarcado, o produto some da loja pública.
- **Foto:** *Enviar/Trocar foto*; *Remover foto* volta a usar a arte do projeto.
- **Excluir:** remove o produto e a imagem enviada.

Na primeira execução o banco é semeado com os 12 produtos que já estavam em
`src/data/products.js`, então a loja continua idêntica até você mexer.

### Informações

Painel → **Informações**. Nome, região, cidade, endereço, mapa, horários,
WhatsApp, Instagram e os textos do hero e da loja. O WhatsApp salvo aqui passa
a valer em **todos** os botões do site.

### Onde ficam os dados

```
data/              ← criado no primeiro boot, fora do código (não versionado)
├─ app.db          ← banco SQLite: produtos, fotos, informações, imagem do
│                    topo, fotos das modalidades, usuário e sessões
└─ uploads/        ← imagens enviadas pelo painel, servidas em /uploads/...
```

O caminho é controlado por `DATA_DIR`. **Em produção aponte para um disco
persistente** — se a pasta for efêmera, as fotos somem a cada deploy.

A pasta `public/images/store/` continua funcionando para quem preferir versionar
imagens junto do código, mas pelo painel é mais simples.

### Segurança

- Senha guardada como **hash bcrypt**; as credenciais vêm de variáveis de
  ambiente e **nunca** entram no bundle do frontend (há um teste que verifica).
- Sessão em cookie `httpOnly` + `SameSite=Lax` + `Secure` em produção, com
  registro no banco — o logout invalida de verdade.
- Toda escrita exige o cabeçalho `X-Admin-Request` (defesa contra CSRF).
- Limite de 10 tentativas de login por IP a cada 15 minutos.
- Upload: tipo validado, 8 MB por arquivo, nome aleatório no disco (sem usar o
  nome enviado pelo navegador).
- O bundle do painel só é baixado em `/admin`: quem visita o site não recebe
  nem o código nem o CSS da área administrativa.

### Variáveis de ambiente

Copie `.env.example` para `.env`:

| Variável | Obrigatória | Para quê |
|---|---|---|
| `ADMIN_EMAIL` | sim | E-mail de login do painel. |
| `ADMIN_PASSWORD_HASH` | sim (produção) | Hash bcrypt da senha. Gere com `npm run admin:hash -- "sua-senha"`. |
| `ADMIN_PASSWORD` | alternativa | Senha em texto puro. Só para desenvolvimento. |
| `SESSION_SECRET` | sim (produção) | Segredo da sessão. Gere com `openssl rand -hex 32`. |
| `DATA_DIR` | recomendada | Onde ficam `app.db` e `uploads/`. Padrão: `./data`. |
| `PORT` | não | Porta do servidor. Padrão: `3001`. |
| `SESSION_TTL_HOURS` | não | Duração da sessão. Padrão: `12`. |
| `MAX_UPLOAD_BYTES` | não | Limite por imagem. Padrão: `8388608` (8 MB). |

> Não defina `NODE_ENV` no `.env`: o Vite também lê esse arquivo e um
> `NODE_ENV=development` faria o build de produção sair com a versão de debug do
> React. O `npm start` já define `NODE_ENV=production`.

Para trocar a senha depois, use **Conta → Alterar senha** no painel, ou gere um
novo `ADMIN_PASSWORD_HASH` e reinicie o servidor (as sessões abertas caem).

### Deploy

O projeto virou uma aplicação Node: um único processo serve o site, a API e as
imagens. Serve qualquer host com Node 20+ e disco persistente (VPS, Render,
Railway, Fly.io, Docker).

```bash
npm ci
npm run build          # gera dist/
npm start              # NODE_ENV=production node server/index.js
```

Checklist de produção:

1. `.env` preenchido com `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH` e `SESSION_SECRET`.
2. `DATA_DIR` apontando para um **volume persistente** (ex.: `/var/data`).
3. Servir atrás de HTTPS — o cookie de sessão usa `Secure` em produção e não
   trafega em HTTP puro. Com proxy reverso (Nginx, Caddy, Traefik), encaminhe
   `X-Forwarded-Proto`; o servidor já está com `trust proxy` ligado.
4. Manter o processo vivo com `systemd`, `pm2` ou o supervisor do seu host.
5. Backup: basta copiar a pasta do `DATA_DIR` (banco + imagens).

Exemplo de bloco Nginx:

```nginx
location / {
  proxy_pass http://127.0.0.1:3001;
  proxy_set_header Host $host;
  proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  proxy_set_header X-Forwarded-Proto $scheme;
  client_max_body_size 10M;   # precisa ser maior que MAX_UPLOAD_BYTES
}
```

Hospedagem **estática** (Netlify, GitHub Pages, S3) continua funcionando para o
site público — ele cai no conteúdo dos arquivos estáticos — mas **sem painel**,
porque não há servidor para a API.

## Estrutura

```
src/
├─ config/
│  ├─ site.js            ← conteúdo editável (contato, modalidades, planos, FAQ…)
│  └─ media.js           ← slots de imagem: arte placeholder ou foto real
├─ data/
│  └─ products.js        ← produtos e categorias da Exclusive Store
├─ components/
│  ├─ Header · Hero · Features · Modalidades · Estrutura · Planos
│  ├─ Store · AulaExperimental · Objetivos · Localizacao · FAQ · CTA · Footer
│  ├─ WhatsAppButton
│  ├─ store/             ← ProductCard, ProductModal, ProductFilters,
│  │                       SearchProducts, Cart, CartItem, ProductArt, ProductMedia
│  └─ ui/                ← Art, PhotoFrame, Modal, Reveal, Icon, SectionHeading, WhatsAppLink
├─ admin/                ← painel /admin (bundle separado do site público)
│  ├─ AdminApp · Login · Dashboard · api.js · admin.css
│  └─ panels/            ← AppearancePanel, GalleryPanel, ModalidadesPanel,
│                          ProductsPanel, InfoPanel, AccountPanel
├─ hooks/                ← useReveal, useLockBodyScroll, useScrollSpy
├─ lib/                  ← whatsapp (link), notice (avisos), cart (carrinho),
│                          content (conteúdo vindo do painel, com fallback)
└─ styles/               ← fonts, tokens, base, ui

server/                  ← API e painel (Express + SQLite)
├─ index.js · config.js · db.js · auth.js · uploads.js
├─ routes/               ← auth, gallery, products, settings, public
└─ cli/hash-password.js  ← gera o hash da senha do administrador
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
node scripts/qa.mjs           # rolagem horizontal, console e screenshots em 9 larguras
node scripts/interactions.mjs # menu mobile, modais, FAQ, formulário, WhatsApp e âncoras
node scripts/store-tests.mjs  # filtros, busca, modal, carrinho, estoque e grade da loja
node scripts/admin-tests.mjs  # login, logout, galeria, produtos, informações e reflexo no site
```

Os scripts aceitam `BASE` para apontar o alvo, por exemplo
`BASE=http://localhost:3001 node scripts/qa.mjs`.

Testado em 360, 375, 390, 414, 430, 768, 1024, 1440 e 1920px: sem rolagem
horizontal, sem sobreposição de texto e sem erros de JavaScript no console.

Os scripts usam o Playwright instalado no ambiente; ajuste o caminho do `import` no topo
de cada arquivo se o seu Playwright estiver em outro lugar (`npm i -D playwright` e
`import { chromium } from 'playwright'`).

---

## Acessibilidade

HTML semântico, hierarquia de headings, foco visível, `aria-*` em menu/modais/acordeão,
travamento de foco nos modais, link "pular para o conteúdo" e respeito a
`prefers-reduced-motion` (as animações são desligadas).
