import { Icon } from '../ui/Icon.jsx'

/** Campo de busca por nome, categoria ou descrição do produto. */
export function SearchProducts({ value, onChange }) {
  return (
    <div className="search">
      <Icon name="Search" size={17} className="search__icon" />
      <input
        type="search"
        className="search__input"
        placeholder="Pesquisar produto..."
        aria-label="Pesquisar produto"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {value && (
        <button type="button" className="search__clear" onClick={() => onChange('')} aria-label="Limpar busca">
          <Icon name="X" size={15} />
        </button>
      )}
    </div>
  )
}

export default SearchProducts
