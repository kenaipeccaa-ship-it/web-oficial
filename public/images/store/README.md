# Imagens dos produtos da Exclusive Store

Coloque aqui as fotos dos suplementos.

## Como trocar uma imagem

1. Salve o arquivo nesta pasta, por exemplo:
   `public/images/store/whey-concentrado.jpg`

2. Abra `src/data/products.js` e preencha o campo `image` do produto:

   ```js
   {
     id: 'whey-concentrado',
     name: 'Whey protein concentrado',
     image: '/images/store/whey-concentrado.jpg',   // <— aqui
     ...
   }
   ```

Pronto. O selo "imagem ilustrativa" some sozinho e a foto passa a aparecer no
card e no modal. Se o arquivo não for encontrado, o site volta a exibir a arte
gerada — o layout não quebra.

## Enquanto não houver fotos

Cada produto sem `image` exibe uma **arte em SVG gerada pelo próprio projeto**
(escolhida pelo campo `art`: `tub`, `bar`, `bottle`, `pills`, `shaker`,
`sachet`). São desenhos abstratos de propósito: não simulam a foto de um
produto real e não usam marca nenhuma.

## Recomendações para as fotos

- Formato: `.jpg` ou `.webp` (use `.png` só se precisar de fundo transparente).
- Proporção: quadrada (1:1) — os cards recortam nesse formato.
- Tamanho sugerido: 800×800 px, abaixo de 300 KB cada.
- Use apenas fotos próprias ou com direito de uso. **Não** utilize fotos de
  catálogo ou logotipos de marcas sem autorização.
