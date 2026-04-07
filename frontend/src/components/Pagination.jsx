export default function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null

  const pages = []
  const range = 2
  for (let i = Math.max(1, page - range); i <= Math.min(totalPages, page + range); i++) {
    pages.push(i)
  }

  const btnBase = 'px-3 py-2 text-sm font-medium transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed'
  const btnNav = `${btnBase} flex items-center gap-1.5 rounded-xl border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 hover:shadow-soft`
  const btnPage = (active) => active
    ? `${btnBase} bg-gradient-to-b from-primary-500 to-primary-600 text-white rounded-lg shadow-sm`
    : `${btnBase} text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg`

  return (
    <div className="flex items-center justify-center gap-1.5 mt-6">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className={btnNav}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        <span className="hidden sm:inline">Anterior</span>
      </button>

      <div className="flex items-center gap-0.5 bg-gray-100/50 dark:bg-gray-800/50 rounded-xl p-0.5">
        {pages[0] > 1 && (
          <>
            <button onClick={() => onPageChange(1)} className={btnPage(false)}>1</button>
            {pages[0] > 2 && <span className="px-1.5 text-gray-400 text-sm">&hellip;</span>}
          </>
        )}

        {pages.map(p => (
          <button key={p} onClick={() => onPageChange(p)} className={btnPage(p === page)}>
            {p}
          </button>
        ))}

        {pages[pages.length - 1] < totalPages && (
          <>
            {pages[pages.length - 1] < totalPages - 1 && <span className="px-1.5 text-gray-400 text-sm">&hellip;</span>}
            <button onClick={() => onPageChange(totalPages)} className={btnPage(false)}>{totalPages}</button>
          </>
        )}
      </div>

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className={btnNav}
      >
        <span className="hidden sm:inline">Proximo</span>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
      </button>
    </div>
  )
}
