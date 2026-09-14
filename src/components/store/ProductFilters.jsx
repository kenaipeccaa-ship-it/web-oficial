import { storeCategories } from '../../data/products.js'

/** Chips de categoria. Para adicionar/remover: edite storeCategories em src/data/products.js */
export function ProductFilters({ value, onChange, counts }) {
  return (
    <div className="filters" role="group" aria-label="Filtrar por categoria">
      {storeCategories.map((cat) => {
        const active = value === cat.id
        const total = counts[cat.id] ?? 0
        return (
          <button
            key={cat.id}
            type="button"
            className={`filters__chip ${active ? 'is-active' : ''}`}
            aria-pressed={active}
            onClick={() => onChange(cat.id)}
          >
            {cat.label}
            <span className="filters__count">{total}</span>
          </button>
        )
      })}
    </div>
  )
}

export default ProductFilters
