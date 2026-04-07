import { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import ParecerForm from '../components/ParecerForm'
import { api } from '../utils/api'

function useCountUp(target, duration = 800) {
  const [value, setValue] = useState(0)
  const ref = useRef(null)

  useEffect(() => {
    if (typeof target !== 'number') return
    let start = null
    const animate = (ts) => {
      if (!start) start = ts
      const progress = Math.min((ts - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3) // easeOutCubic
      setValue(Math.round(eased * target))
      if (progress < 1) ref.current = requestAnimationFrame(animate)
    }
    ref.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(ref.current)
  }, [target, duration])

  return value
}

const statGradients = {
  primary: 'from-primary-50 to-blue-50 dark:from-primary-900/20 dark:to-blue-900/10',
  green: 'from-gov-50 to-emerald-50 dark:from-gov-900/20 dark:to-emerald-900/10',
  purple: 'from-accent-50 to-purple-50 dark:from-accent-900/20 dark:to-purple-900/10',
  amber: 'from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/10',
}

const statTextColors = {
  primary: 'text-primary-600 dark:text-primary-400',
  green: 'text-gov-600 dark:text-gov-400',
  purple: 'text-accent-600 dark:text-accent-400',
  amber: 'text-amber-600 dark:text-amber-400',
}

const statIcons = {
  primary: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
  green: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  purple: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>,
  amber: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
}

function StatCard({ value, label, color = 'primary', delay = 0 }) {
  const animatedValue = useCountUp(value)
  return (
    <div
      className={`card p-4 bg-gradient-to-br ${statGradients[color] || statGradients.primary}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between mb-2">
        <div className={`text-3xl font-bold tabular-nums ${statTextColors[color] || statTextColors.primary}`}>
          {animatedValue}
        </div>
        <div className={`${statTextColors[color]} opacity-40`}>{statIcons[color]}</div>
      </div>
      <div className="text-xs font-medium text-gray-500 dark:text-gray-400 capitalize">{label}</div>
    </div>
  )
}

function MiniChart({ data, label, delay = 0 }) {
  if (!data || data.length === 0) return null
  const max = Math.max(...data.map(d => d.value))
  return (
    <div
      className="card p-4"
      style={{ animationDelay: `${delay}ms` }}
    >
      <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">{label}</h3>
      <div className="space-y-2.5">
        {data.slice(0, 6).map((item, i) => (
          <div key={item.label} className="group flex items-center gap-2">
            <span className="text-xs text-gray-600 dark:text-gray-300 w-32 truncate">{item.label}</span>
            <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-primary-500 to-primary-400 h-full rounded-full animate-bar-grow animation-fill-both origin-left"
                style={{
                  width: `${(item.value / max) * 100}%`,
                  animationDelay: `${delay + (i * 100)}ms`
                }}
              />
            </div>
            <span className="text-xs font-medium text-gray-500 w-7 text-right tabular-nums group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function AdminPage() {
  const { id } = useParams()
  const [initial, setInitial] = useState(null)
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (id) {
      setLoading(true)
      api.getById(id).then(setInitial).finally(() => setLoading(false))
    }
  }, [id])

  useEffect(() => {
    api.stats().then(setStats).catch(() => {})
  }, [])

  const refreshStats = () => api.stats().then(setStats).catch(() => {})

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
          {id ? 'Editar Parecer' : 'Cadastrar Parecer'}
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {id ? 'Atualize os dados do parecer.' : 'Cadastre um novo parecer. Escolha o modo de importacao: formulario, copy-paste ou upload de PDF.'}
        </p>
      </div>

      {/* Dashboard stats */}
      {!id && stats && (
        <div className="mb-6 space-y-3 sm:space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
            <StatCard value={stats.total} label="Total de pareceres" color="primary" delay={0} />
            {stats.porTipo.map((t, i) => (
              <StatCard key={t.label} value={t.value} label={t.label} color={['green', 'purple', 'amber'][i] || 'primary'} delay={(i + 1) * 100} />
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
            <MiniChart data={stats.porMateria} label="Por materia" delay={400} />
            <MiniChart data={stats.porAno} label="Por ano" delay={500} />
            <MiniChart data={stats.porStatus} label="Por status" delay={600} />
          </div>
        </div>
      )}

      <div className="card p-3 sm:p-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <ParecerForm initial={initial} onSaved={refreshStats} />
        )}
      </div>

      {/* Recent entries */}
      {!id && stats?.recentes && stats.recentes.length > 0 && (
        <div className="mt-6" style={{ animationDelay: '700ms' }}>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Ultimos cadastrados</h2>
          <div className="card divide-y divide-gray-100 dark:divide-gray-700/50">
            {stats.recentes.map((p, i) => {
              const borderColor = p.tipo === 'normativo' ? 'border-l-accent-500' : p.tipo === 'sistemico' ? 'border-l-gov-500' : 'border-l-primary-500'
              return (
                <div key={p.id} className={`px-4 py-3 flex items-center gap-3 border-l-4 ${borderColor} hover:bg-surface-50 dark:hover:bg-surface-900/50 transition-colors`}>
                  <span className="font-mono text-sm font-medium text-primary-600 dark:text-primary-400">{p.numero}</span>
                  <span className="text-sm text-gray-700 dark:text-gray-300 truncate flex-1">{p.assunto}</span>
                  <span className="text-xs text-gray-400 hidden sm:inline">{p.orgao}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
