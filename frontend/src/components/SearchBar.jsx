import { useState, useRef, useEffect, useCallback } from 'react'
import { useAutocomplete } from '../hooks/useSearch'
import { useNavigate } from 'react-router-dom'
import SearchHelp from './SearchHelp'

const HISTORY_KEY = 'pareceres_search_history'
const MAX_HISTORY = 10

function getHistory() {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]') } catch { return [] }
}

function addToHistory(term) {
  if (!term || term.trim().length < 2) return
  const history = getHistory().filter(h => h !== term)
  history.unshift(term)
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, MAX_HISTORY)))
}

function clearHistory() {
  localStorage.removeItem(HISTORY_KEY)
}

export default function SearchBar({ value, onChange, onToggleAdvanced, showAdvanced, filters }) {
  const [focused, setFocused] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const { suggestions, fetchSuggestions, clearSuggestions } = useAutocomplete()
  const wrapperRef = useRef(null)
  const navigate = useNavigate()
  const history = getHistory()

  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setFocused(false)
        setShowHistory(false)
        clearSuggestions()
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [clearSuggestions])

  const handleChange = (e) => {
    const v = e.target.value
    onChange(v)
    setShowHistory(false)
    fetchSuggestions(v, filters)
  }

  const handleFocus = () => {
    setFocused(true)
    if (!value && history.length > 0) setShowHistory(true)
  }

  const handleSelect = (item) => {
    clearSuggestions()
    setFocused(false)
    setShowHistory(false)
    navigate(`/parecer/${item.id}`)
  }

  const handleHistorySelect = (term) => {
    setShowHistory(false)
    onChange(term)
    fetchSuggestions(term, filters)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      clearSuggestions()
      setFocused(false)
      setShowHistory(false)
    }
    if (e.key === 'Enter' && value) {
      addToHistory(value)
      clearSuggestions()
      setShowHistory(false)
    }
  }

  return (
    <div ref={wrapperRef} className="relative w-full">
      <div className={`relative glass rounded-2xl p-1 transition-all duration-300 ${focused ? 'shadow-glow-primary scale-[1.01]' : 'shadow-soft'}`}>
        <svg className={`absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 w-5 h-5 transition-all duration-300 ${focused ? 'text-primary-500 rotate-[-15deg] scale-110' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          value={value}
          onChange={handleChange}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          placeholder="Buscar pareceres por termo, numero ou assunto..."
          aria-label="Campo de busca de pareceres"
          className="w-full pl-10 sm:pl-12 pr-24 sm:pr-36 py-3 sm:py-3.5 text-sm sm:text-base bg-transparent border-0 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none rounded-xl"
        />
        <div className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
          <SearchHelp />
          {value && (
            <button onClick={() => { onChange(''); clearSuggestions(); setShowHistory(false) }} className="p-1.5 hover:bg-gray-100/80 dark:hover:bg-gray-700/80 rounded-lg transition-all" title="Limpar">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          )}
          <button
            onClick={onToggleAdvanced}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 flex items-center gap-1.5 ${showAdvanced ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400 shadow-xs' : 'bg-gray-100/80 text-gray-600 dark:bg-gray-700/80 dark:text-gray-300 hover:bg-gray-200/80 dark:hover:bg-gray-600/80'}`}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
            Filtros
          </button>
        </div>
      </div>

      {/* Search history dropdown */}
      {focused && showHistory && !value && history.length > 0 && suggestions.length === 0 && (
        <div className="absolute z-50 w-full mt-2 glass rounded-2xl shadow-elevated max-h-64 overflow-auto animate-fade-in-down">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-200/50 dark:border-gray-700/50">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Buscas recentes</span>
            <button onClick={() => { clearHistory(); setShowHistory(false) }} className="text-xs text-red-500 hover:text-red-600 dark:hover:text-red-400 font-medium transition-colors">Limpar</button>
          </div>
          {history.map((term, i) => (
            <button
              key={i}
              onClick={() => handleHistorySelect(term)}
              className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50/80 dark:hover:bg-gray-700/40 flex items-center gap-3 transition-colors"
            >
              <svg className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <span className="text-gray-700 dark:text-gray-300">{term}</span>
            </button>
          ))}
        </div>
      )}

      {/* Autocomplete dropdown */}
      {focused && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-2 glass rounded-2xl shadow-elevated max-h-80 overflow-auto animate-fade-in-down">
          {suggestions.map((item, i) => (
            <button
              key={item.id}
              onClick={() => handleSelect(item)}
              className="w-full px-4 py-3 text-left hover:bg-gray-50/80 dark:hover:bg-gray-700/40 border-b border-gray-100/50 dark:border-gray-700/30 last:border-0 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono font-medium text-primary-600 dark:text-primary-400 bg-primary-50/80 dark:bg-primary-900/20 px-2 py-0.5 rounded-md">{item.numero}</span>
                <span className="text-sm text-gray-900 dark:text-gray-100 truncate font-medium">{item.assunto}</span>
              </div>
              <div className="mt-0.5 text-xs text-gray-500 dark:text-gray-400 pl-[calc(2rem+0.75rem)]">{item.orgao} &middot; {item.tipo}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
