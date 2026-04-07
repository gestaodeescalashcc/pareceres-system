import { useState, useEffect, Component } from 'react'
import { BrowserRouter, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom'
import SearchPage from './pages/SearchPage'
import ParecerDetail from './pages/ParecerDetail'
import AdminPage from './pages/AdminPage'
import LoginPage from './pages/LoginPage'
import ProtectedRoute from './components/ProtectedRoute'
import { useAuth } from './contexts/AuthContext'

class ErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { hasError: false, error: null } }
  static getDerivedStateFromError(error) { return { hasError: true, error } }
  render() {
    if (this.state.hasError) {
      return (
        <div className="max-w-lg mx-auto mt-20 card p-8 text-center animate-fade-in">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <h2 className="text-xl font-bold text-red-600 mb-2">Erro inesperado</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{this.state.error?.message || 'Algo deu errado.'}</p>
          <button onClick={() => { this.setState({ hasError: false }); window.location.href = '/' }} className="btn-primary">Recarregar</button>
        </div>
      )
    }
    return this.props.children
  }
}

function Nav() {
  const location = useLocation()
  const navigate = useNavigate()
  const { isAuthenticated, user, logout } = useAuth()
  const [dark, setDark] = useState(() => localStorage.getItem('theme') === 'dark')

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('theme', dark ? 'dark' : 'light')
  }, [dark])

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const navLinks = [
    { path: '/', label: 'Busca', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>, show: true },
    { path: '/admin', label: 'Cadastro', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>, show: isAuthenticated },
    { path: '/login', label: 'Login', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" /></svg>, show: !isAuthenticated },
  ]

  return (
    <header className="bg-white/80 dark:bg-surface-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        <div className="flex items-center justify-between h-14 sm:h-16">
          <div className="flex items-center gap-2 sm:gap-8 min-w-0">
            <Link to="/" className="flex items-center gap-1.5 sm:gap-2.5 group flex-shrink-0">
              <span className="text-xl sm:text-2xl group-hover:scale-110 transition-transform duration-200">&#9878;</span>
              <span className="font-bold text-base sm:text-lg text-gradient hidden sm:block">Pareceres</span>
            </Link>
            <nav className="flex gap-0.5 sm:gap-1">
              {navLinks.filter(l => l.show).map(({ path, label, icon }) => {
                const isActive = location.pathname === path
                return (
                  <Link
                    key={path}
                    to={path}
                    className={`relative flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-lg transition-all duration-200 ${
                      isActive
                        ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20'
                        : 'text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    {icon}
                    <span className="hidden xs:inline sm:inline">{label}</span>
                  </Link>
                )
              })}
            </nav>
          </div>
          <div className="flex items-center gap-0.5 sm:gap-1.5 flex-shrink-0">
            {isAuthenticated && (
              <div className="flex items-center gap-0.5 sm:gap-1.5">
                <span className="hidden md:block text-xs text-gray-500 dark:text-gray-400 font-medium">{user?.nome}</span>
                <button
                  onClick={handleLogout}
                  className="p-2 sm:p-2.5 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-500 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200"
                  title="Sair"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                </button>
              </div>
            )}
            <button
              onClick={() => setDark(!dark)}
              className="p-2 sm:p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 group"
              aria-label={dark ? 'Ativar modo claro' : 'Ativar modo escuro'}
            >
              {dark ? (
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 group-hover:rotate-45 transition-transform duration-300" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" /></svg>
              ) : (
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 group-hover:-rotate-12 transition-transform duration-300" fill="currentColor" viewBox="0 0 20 20"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" /></svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

function KeyboardShortcuts() {
  useEffect(() => {
    const handler = (e) => {
      if (e.key === '/' && !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) {
        e.preventDefault()
        document.querySelector('[aria-label="Campo de busca de pareceres"]')?.focus()
      }
      if (e.key === 'Escape') {
        document.dispatchEvent(new CustomEvent('close-modals'))
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])
  return null
}

export default function App() {
  return (
    <BrowserRouter>
      <KeyboardShortcuts />
      <Nav />
      <main className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6">
        <ErrorBoundary>
          <Routes>
            <Route path="/" element={<SearchPage />} />
            <Route path="/parecer/:id" element={<ParecerDetail />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/admin" element={<ProtectedRoute><AdminPage /></ProtectedRoute>} />
            <Route path="/admin/:id" element={<ProtectedRoute><AdminPage /></ProtectedRoute>} />
          </Routes>
        </ErrorBoundary>
      </main>
    </BrowserRouter>
  )
}
