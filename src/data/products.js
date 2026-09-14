/* ==========================================================================
   PRODUTOS DA EXCLUSIVE STORE
   --------------------------------------------------------------------------
   ESTE É O ÚNICO ARQUIVO QUE PRECISA SER EDITADO PARA MEXER NA LOJA.
   Aqui ficam as categorias e a lista de produtos. Nenhum componente tem
   produto escrito no meio do código.

   ATENÇÃO — DEMONSTRAÇÃO DE CONCEITO:
   Nenhuma marca, preço, sabor, tamanho, peso ou informação nutricional foi
   inventado. Os itens abaixo representam CATEGORIAS de suplemento, para
   mostrar a estrutura da vitrine. Os dados reais devem vir da unidade.

   --------------------------------------------------------------------------
   COMO CADASTRAR UM PRODUTO NOVO
   Copie um bloco da lista "products" e ajuste os campos:

     id          string  — identificador único, sem espaços nem acentos
     name        string  — nome exibido no card e no modal
     category    string  — precisa ser um "id" existente em storeCategories
     price       number  — preço em reais (ex.: 149.9)
                           deixe null para exibir "Consulte a unidade"
     image       string  — caminho da foto em /public/images/store/
                           deixe '' para usar a arte gerada pelo projeto
     art         string  — arte usada quando não há foto:
                           'tub' | 'bar' | 'bottle' | 'pills' | 'shaker' | 'sachet'
     description string  — texto do modal
     available   boolean — false exibe "INDISPONÍVEL" e desativa a compra
     note        string  — (opcional) aviso extra dentro do modal

   COMO ALTERAR PREÇOS   -> campo "price" de cada produto
   COMO TROCAR IMAGENS   -> campo "image" (ver /public/images/store/README.md)
   COMO MEXER NO ESTOQUE -> campo "available"
   COMO ADICIONAR/REMOVER CATEGORIAS -> lista "storeCategories" logo abaixo
   ========================================================================== */

/**
 * Categorias dos filtros.
 * A primeira ("todos") é obrigatória e não filtra nada.
 * Para criar uma categoria: adicione um objeto aqui e use o mesmo "id"
 * no campo "category" dos produtos.
 */
export const storeCategories = [
  { id: 'todos', label: 'Todos' },
  { id: 'whey', label: 'Whey' },
  { id: 'creatina', label: 'Creatina' },
  { id: 'pre-treino', label: 'Pré-treino' },
  { id: 'barras', label: 'Barras' },
  { id: 'vitaminas', label: 'Vitaminas' },
  { id: 'outros', label: 'Outros' },
]

export const products = [
  {
    id: 'whey-concentrado',
    name: 'Whey protein concentrado',
    category: 'whey',
    price: null,
    image: '', // SUBSTITUIR PELA FOTO REAL DO PRODUTO
    art: 'tub',
    description:
      'Proteína em pó derivada do soro do leite, na versão concentrada. Marcas, sabores e tamanhos disponíveis variam conforme o estoque da unidade.',
    available: true,
  },
  {
    id: 'whey-isolado',
    name: 'Whey protein isolado',
    category: 'whey',
    price: null,
    image: '', // SUBSTITUIR PELA FOTO REAL DO PRODUTO
    art: 'tub',
    description:
      'Versão isolada da proteína do soro do leite, com processo de filtragem adicional. Marcas, sabores e tamanhos devem ser confirmados com a unidade.',
    available: true,
  },
  {
    id: 'creatina-monoidratada',
    name: 'Creatina monoidratada',
    category: 'creatina',
    price: null,
    image: '', // SUBSTITUIR PELA FOTO REAL DO PRODUTO
    art: 'tub',
    description:
      'Suplemento em pó, sem sabor, na forma monoidratada. Marcas e tamanhos disponíveis devem ser confirmados com a unidade.',
    available: true,
  },
  {
    id: 'pre-treino',
    name: 'Pré-treino',
    category: 'pre-treino',
    price: null,
    image: '', // SUBSTITUIR PELA FOTO REAL DO PRODUTO
    art: 'tub',
    description:
      'Suplemento em pó para consumo antes do treino. A composição varia bastante entre marcas — confira o rótulo do produto disponível na unidade.',
    available: true,
  },
  {
    id: 'barra-proteina',
    name: 'Barra de proteína',
    category: 'barras',
    price: null,
    image: '', // SUBSTITUIR PELA FOTO REAL DO PRODUTO
    art: 'bar',
    description:
      'Barra com proteína na composição, em embalagem individual. Sabores e marcas disponíveis variam conforme o estoque.',
    available: true,
  },
  {
    id: 'barra-castanhas',
    name: 'Barra de castanhas',
    category: 'barras',
    price: null,
    image: '', // SUBSTITUIR PELA FOTO REAL DO PRODUTO
    art: 'bar',
    description:
      'Barra à base de castanhas, em embalagem individual. Sabores e marcas disponíveis devem ser confirmados com a unidade.',
    available: true,
  },
  {
    id: 'multivitaminico',
    name: 'Multivitamínico',
    category: 'vitaminas',
    price: null,
    image: '', // SUBSTITUIR PELA FOTO REAL DO PRODUTO
    art: 'pills',
    description:
      'Suplemento com um conjunto de vitaminas e minerais. A composição muda de marca para marca — consulte o rótulo do produto na unidade.',
    available: true,
  },
  {
    id: 'omega-3',
    name: 'Ômega 3',
    category: 'vitaminas',
    price: null,
    image: '', // SUBSTITUIR PELA FOTO REAL DO PRODUTO
    art: 'pills',
    description:
      'Suplemento em cápsulas à base de óleo de peixe. Marcas e apresentações disponíveis devem ser confirmadas com a unidade.',
    available: false,
  },
  {
    id: 'glutamina',
    name: 'Glutamina',
    category: 'outros',
    price: null,
    image: '', // SUBSTITUIR PELA FOTO REAL DO PRODUTO
    art: 'tub',
    description:
      'Aminoácido em pó, sem sabor. Marcas e tamanhos disponíveis devem ser confirmados com a unidade.',
    available: true,
  },
  {
    id: 'bebida-proteica',
    name: 'Bebida proteica pronta',
    category: 'outros',
    price: null,
    image: '', // SUBSTITUIR PELA FOTO REAL DO PRODUTO
    art: 'bottle',
    description:
      'Bebida com proteína na composição, pronta para consumo. Sabores e marcas disponíveis variam conforme o estoque da unidade.',
    available: true,
  },
  {
    id: 'coqueteleira',
    name: 'Coqueteleira',
    category: 'outros',
    price: null,
    image: '', // SUBSTITUIR PELA FOTO REAL DO PRODUTO
    art: 'shaker',
    description:
      'Acessório para preparo das bebidas em pó. Modelos e capacidades disponíveis devem ser confirmados com a unidade.',
    available: false,
  },
  {
    id: 'sache-gel',
    name: 'Sachê de carboidrato em gel',
    category: 'outros',
    price: null,
    image: '', // SUBSTITUIR PELA FOTO REAL DO PRODUTO
    art: 'sachet',
    description:
      'Suplemento de carboidrato em sachê individual. Sabores e marcas disponíveis devem ser confirmados com a unidade.',
    available: true,
  },
]

/** Formata o preço em reais; sem preço cadastrado, devolve o texto padrão. */
export function formatPrice(price) {
  if (typeof price !== 'number' || Number.isNaN(price)) return 'Consulte a unidade'
  return price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export const hasPrice = (price) => typeof price === 'number' && !Number.isNaN(price)

export const categoryLabel = (id) =>
  storeCategories.find((c) => c.id === id)?.label ?? 'Outros'
