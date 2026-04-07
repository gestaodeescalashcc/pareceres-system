import { useState } from 'react'

function FacetGroup({ title, items, filterKey, active, onFilterChange }) {
  const [open, setOpen] = useState(true)
  if (!items || items.length === 0) return null

  return (
    <div className="mb-4">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-1.5 group"
      >
        <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{title}</h4>
        <svg className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <div className={`overflow-hidden transition-all duration-300 ${open ? 'max-h-96 opacity-100 mt-1' : 'max-h-0 opacity-0'}`}>
        {active && (
          <button
            onClick={() => onFilterChange(filterKey, '')}
            className="w-full text-left px-2.5 py-1.5 text-xs rounded-lg hover:bg-red-50 dark:hover:bg-red-900/10 text-red-500 dark:text-red-400 font-medium transition-all mb-1"
          >
            &times; Limpar filtro
          </button>
        )}
        <div className="space-y-0.5">
          {items.map(({ valor, contagem }) => (
            <button
              key={valor}
              onClick={() => onFilterChange(filterKey, active === String(valor) ? '' : String(valor))}
              className={`w-full text-left px-2.5 py-1.5 text-sm rounded-lg flex items-center justify-between transition-all duration-200 ${
                active === String(valor)
                  ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 font-medium shadow-xs'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
              }`}
            >
              <span className="truncate">{String(valor)}</span>
              <span className={`text-2xs font-medium ml-2 flex-shrink-0 px-1.5 py-0.5 rounded-full ${
                active === String(valor)
                  ? 'bg-primary-200/50 dark:bg-primary-800/30 text-primary-600 dark:text-primary-400'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
              }`}>{contagem}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function FacetSidebar({ facets, filters, onFilterChange, collapsed, onToggle }) {
  if (!facets) return null

  const activeFilters = Object.entries(filters).filter(([k, v]) => v && ['tipo', 'status', 'materia', 'ano', 'orgao'].includes(k))

  return (
    <aside className="w-full lg:w-64 flex-shrink-0">
      {/* Mobile toggle */}
      <button
        onClick={onToggle}
        className="lg:hidden flex items-center gap-2 text-sm text-primary-600 dark:text-primary-400 font-medium mb-3 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
      >
        <svg className={`w-4 h-4 transition-transform duration-200 ${collapsed ? '' : 'rotate-90'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        {collapsed ? 'Mostrar filtros' : 'Ocultar filtros'}
      </button>

      <div className={`card sticky top-20 overflow-y-auto max-h-[calc(100vh-120px)] ${collapsed ? 'hidden lg:block' : ''}`}>
        {/* Gradient header */}
        <div className="bg-gradient-to-r from-primary-50/80 to-transparent dark:from-primary-900/10 px-4 pt-4 pb-3 rounded-t-2xl border-b border-gray-100 dark:border-gray-700/50">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white">Refinar busca</h3>
        </div>

        {/* Active filter chips */}
        {activeFilters.length > 0 && (
          <div className="px-4 pt-3 flex flex-wrap gap-1.5">
            {activeFilters.map(([key, val]) => (
              <button
                key={key}
                onClick={() => onFilterChange(key, '')}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 text-2xs font-medium hover:bg-primary-200 dark:hover:bg-primary-900/50 transition-colors animate-scale-in"
              >
                {val}
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            ))}
          </div>
        )}

        <div className="p-4">
          <FacetGroup title="Tipo" items={facets.tipos} filterKey="tipo" active={filters.tipo} onFilterChange={onFilterChange} />
          <FacetGroup title="Status" items={facets.statuses} filterKey="status" active={filters.status} onFilterChange={onFilterChange} />
          <FacetGroup title="Materia" items={facets.materias} filterKey="materia" active={filters.materia} onFilterChange={onFilterChange} />
          <FacetGroup title="Ano" items={facets.anos} filterKey="ano" active={filters.ano} onFilterChange={onFilterChange} />
          <FacetGroup title="Orgao" items={facets.orgaos} filterKey="orgao" active={filters.orgao} onFilterChange={onFilterChange} />
        </div>
      </div>
    </aside>
  )
}
