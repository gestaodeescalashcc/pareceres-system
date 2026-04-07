export default function AdvancedFilters({ filters, onFilterChange, facets }) {
  const tipoOptions = ['consultivo', 'normativo', 'sistemico']
  const statusOptions = ['vigente', 'revogado', 'suspenso']
  const materiaOptions = facets?.materias?.map(f => f.valor) || []
  const orgaoOptions = facets?.orgaos?.map(f => f.valor) || []
  const anoOptions = facets?.anos?.map(f => String(f.valor)) || []

  const setDatePreset = (days) => {
    const end = new Date()
    const start = new Date()
    start.setDate(start.getDate() - days)
    onFilterChange('data_inicio', start.toISOString().split('T')[0])
    onFilterChange('data_fim', end.toISOString().split('T')[0])
  }

  const clearDates = () => {
    onFilterChange('data_inicio', '')
    onFilterChange('data_fim', '')
  }

  return (
    <div className="card p-3 sm:p-5 mb-4 animate-fade-in-down">
      {/* Main filters */}
      <div className="mb-4">
        <h4 className="text-2xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">Filtros principais</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="label">Tipo</label>
            <select value={filters.tipo || ''} onChange={e => onFilterChange('tipo', e.target.value)} className="input-field text-sm">
              <option value="">Todos</option>
              {tipoOptions.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Status</label>
            <select value={filters.status || ''} onChange={e => onFilterChange('status', e.target.value)} className="input-field text-sm">
              <option value="">Todos</option>
              {statusOptions.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Materia</label>
            <select value={filters.materia || ''} onChange={e => onFilterChange('materia', e.target.value)} className="input-field text-sm">
              <option value="">Todas</option>
              {materiaOptions.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Orgao</label>
            <select value={filters.orgao || ''} onChange={e => onFilterChange('orgao', e.target.value)} className="input-field text-sm">
              <option value="">Todos</option>
              {orgaoOptions.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Separator */}
      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200 dark:border-gray-700/50" /></div>
        <div className="relative flex justify-center">
          <span className="bg-white dark:bg-surface-850 px-3 text-2xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Complementares</span>
        </div>
      </div>

      {/* Complementary filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div>
          <label className="label">Ano</label>
          <select value={filters.ano || ''} onChange={e => onFilterChange('ano', e.target.value)} className="input-field text-sm">
            <option value="">Todos</option>
            {anoOptions.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Autor</label>
          <input
            type="text"
            value={filters.autor || ''}
            onChange={e => onFilterChange('autor', e.target.value)}
            placeholder="Nome do autor..."
            className="input-field text-sm"
          />
        </div>
        <div>
          <label className="label">Data inicio</label>
          <input type="date" value={filters.data_inicio || ''} onChange={e => onFilterChange('data_inicio', e.target.value)} className="input-field text-sm" />
        </div>
        <div>
          <label className="label">Data fim</label>
          <input type="date" value={filters.data_fim || ''} onChange={e => onFilterChange('data_fim', e.target.value)} className="input-field text-sm" />
        </div>
      </div>

      {/* Date presets */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="text-2xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Periodo rapido:</span>
        {[
          { label: 'Ultimo ano', days: 365 },
          { label: 'Ultimos 3 anos', days: 365 * 3 },
          { label: 'Ultimos 5 anos', days: 365 * 5 },
        ].map(({ label, days }) => (
          <button
            key={days}
            onClick={() => setDatePreset(days)}
            className="text-xs px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-primary-50 hover:text-primary-700 dark:hover:bg-primary-900/20 dark:hover:text-primary-400 transition-all duration-200 active:scale-95 hover:shadow-soft font-medium"
          >
            {label}
          </button>
        ))}
        {(filters.data_inicio || filters.data_fim) && (
          <button onClick={clearDates} className="text-xs px-3 py-1.5 rounded-full text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all font-medium">
            Limpar datas
          </button>
        )}
      </div>
    </div>
  )
}
