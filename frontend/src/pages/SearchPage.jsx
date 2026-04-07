import { useState } from 'react'
import SearchBar from '../components/SearchBar'
import AdvancedFilters from '../components/AdvancedFilters'
import ResultCard from '../components/ResultCard'
import FacetSidebar from '../components/FacetSidebar'
import Pagination from '../components/Pagination'
import { useSearch } from '../hooks/useSearch'
import { api } from '../utils/api'

function SkeletonCard({ delay = 0 }) {
  return (
    <div className="card p-5 border-l-4 border-l-gray-200 dark:border-l-gray-700">
      <div className="flex gap-2 mb-3">
        <div className="skeleton h-5 w-24 rounded-md" />
        <div className="skeleton h-5 w-16 rounded-full" />
        <div className="skeleton h-5 w-14 rounded-full" />
      </div>
      <div className="skeleton h-5 w-3/4 mb-2.5 rounded-md" />
      <div className="skeleton h-4 w-full mb-1.5 rounded-md" />
      <div className="skeleton h-4 w-2/3 mb-4 rounded-md" />
      <div className="flex gap-4">
        <div className="skeleton h-3 w-32 rounded-md" />
        <div className="skeleton h-3 w-24 rounded-md" />
        <div className="skeleton h-3 w-20 rounded-md" />
      </div>
    </div>
  )
}

export default function SearchPage() {
  const { query, setQuery, filters, updateFilter, clearFilters, results, loading, error, page, setPage, limit, setLimit, sort, setSort, facets } = useSearch()
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [facetsCollapsed, setFacetsCollapsed] = useState(true)

  const hasActiveFilters = Object.keys(filters).length > 0 || query
  const activeFilterEntries = Object.entries(filters).filter(([, v]) => v)

  const handlePageChange = (p) => {
    setPage(p)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div>
      {/* Hero / Search area */}
      <div className="mb-6 relative">
        {!hasActiveFilters && !results?.total && (
          <div className="text-center mb-6 sm:mb-8 relative">
            {/* Decorative gradient blob */}
            <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-64 sm:w-96 h-64 sm:h-96 bg-gradient-to-r from-primary-400/15 to-accent-400/15 rounded-full blur-3xl pointer-events-none" />
            <h1 className="relative text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight mb-2 sm:mb-3">
              <span className="text-gradient">Sistema de Pareceres Juridicos</span>
            </h1>
            <p className="relative text-sm sm:text-base text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
              Busque por palavra-chave, numero, assunto ou ementa. Use operadores <strong className="text-gray-700 dark:text-gray-300">E</strong>, <strong className="text-gray-700 dark:text-gray-300">OU</strong>, <strong className="text-gray-700 dark:text-gray-300">NAO</strong> para refinar. Clique em <strong className="text-gray-700 dark:text-gray-300">?</strong> para mais opcoes.
            </p>
          </div>
        )}

        <SearchBar value={query} onChange={setQuery} onToggleAdvanced={() => setShowAdvanced(!showAdvanced)} showAdvanced={showAdvanced} filters={filters} />

        {showAdvanced && <div className="mt-3"><AdvancedFilters filters={filters} onFilterChange={updateFilter} facets={facets} /></div>}
      </div>

      {/* Results area */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Facet sidebar */}
        {results && results.total > 0 && (
          <FacetSidebar facets={facets} filters={filters} onFilterChange={updateFilter} collapsed={facetsCollapsed} onToggle={() => setFacetsCollapsed(!facetsCollapsed)} />
        )}

        {/* Main results */}
        <div className="flex-1 min-w-0">
          {/* Toolbar */}
          {results && (
            <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3 mb-4">
              <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400" role="status" aria-live="polite">
                  <strong className="text-gray-900 dark:text-white">{results.total}</strong> {results.total === 1 ? 'resultado' : 'resultados'}
                  {query && <> para "<em className="text-primary-600 dark:text-primary-400">{query}</em>"</>}
                </span>
                {hasActiveFilters && (
                  <button onClick={clearFilters} className="text-xs text-primary-600 dark:text-primary-400 hover:underline font-medium">
                    Limpar tudo
                  </button>
                )}
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <select value={limit} onChange={e => { setLimit(parseInt(e.target.value)); setPage(1) }} className="input-field text-xs sm:text-sm py-1 sm:py-1.5 w-auto" aria-label="Resultados por pagina">
                  <option value={10}>10 / pag</option>
                  <option value={20}>20 / pag</option>
                  <option value={50}>50 / pag</option>
                  <option value={100}>100 / pag</option>
                </select>
                <select value={sort} onChange={e => setSort(e.target.value)} className="input-field text-xs sm:text-sm py-1 sm:py-1.5 w-auto" aria-label="Ordenacao">
                  <option value="relevancia">Relevancia</option>
                  <option value="data_desc">Mais recente</option>
                  <option value="data_asc">Mais antigo</option>
                  <option value="numero">Numero</option>
                </select>
                <button
                  onClick={() => api.exportCsv({ q: query, ...filters })}
                  className="btn-secondary text-xs sm:text-sm py-1 sm:py-1.5 px-2 sm:px-3 flex items-center gap-1"
                  title="Exportar CSV"
                >
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  <span className="hidden sm:inline">CSV</span>
                </button>
              </div>
            </div>
          )}

          {/* Active filter chips */}
          {activeFilterEntries.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {activeFilterEntries.map(([key, val]) => (
                <button
                  key={key}
                  onClick={() => updateFilter(key, '')}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-xs font-medium hover:bg-primary-200 dark:hover:bg-primary-900/50 transition-all animate-scale-in"
                >
                  <span className="text-primary-400 dark:text-primary-500 text-2xs uppercase">{key}:</span> {val}
                  <svg className="w-3 h-3 ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              ))}
            </div>
          )}

          {/* Loading skeletons */}
          {loading && (
            <div className="space-y-3" role="status" aria-live="polite">
              {[0, 1, 2, 3, 4].map(i => <SkeletonCard key={i} delay={i * 80} />)}
              <span className="sr-only">Buscando pareceres...</span>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="card p-6 text-center">
              <p className="text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Results list */}
          {!loading && results && (
            <>
              {results.total === 0 ? (
                <div className="card p-12 text-center">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-surface-100 dark:bg-surface-800 flex items-center justify-center">
                    <svg className="w-10 h-10 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1.5">Nenhum resultado encontrado</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 max-w-sm mx-auto">Tente termos diferentes, remova alguns filtros ou use operadores como <strong>OU</strong> para ampliar a busca.</p>
                  {hasActiveFilters && (
                    <button onClick={clearFilters} className="btn-secondary text-sm">Limpar filtros e buscar tudo</button>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {results.resultados.map((parecer, i) => (
                    <ResultCard key={parecer.id} parecer={parecer} index={i} />
                  ))}
                </div>
              )}

              <Pagination page={results.pagina} totalPages={results.totalPaginas} onPageChange={handlePageChange} />
            </>
          )}
        </div>
      </div>
    </div>
  )
}
