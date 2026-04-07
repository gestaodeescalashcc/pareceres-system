import { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { api } from '../utils/api'
import StatusBadge from '../components/StatusBadge'
import { formatDate } from '../utils/formatDate'

const borderByTipo = {
  consultivo: 'border-l-primary-500',
  normativo: 'border-l-accent-500',
  sistemico: 'border-l-gov-500',
}

function SkeletonDetail() {
  return (
    <div className="card p-6 lg:p-8">
      <div className="flex gap-3 mb-4">
        <div className="skeleton h-7 w-32 rounded-md" />
        <div className="skeleton h-7 w-20 rounded-full" />
        <div className="skeleton h-7 w-16 rounded-full" />
      </div>
      <div className="skeleton h-8 w-3/4 mb-4 rounded-md" />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6 p-4 rounded-xl bg-surface-50 dark:bg-surface-900/50">
        {[...Array(6)].map((_, i) => (
          <div key={i}><div className="skeleton h-3 w-12 mb-1 rounded" /><div className="skeleton h-4 w-24 rounded" /></div>
        ))}
      </div>
      {[...Array(3)].map((_, i) => (
        <div key={i} className="mb-6"><div className="skeleton h-4 w-32 mb-2 rounded" /><div className="skeleton h-20 w-full rounded-lg" /></div>
      ))}
    </div>
  )
}

function formatLegalText(text) {
  if (!text) return null
  const lines = text.split('\n')
  const elements = []
  let currentParagraph = []

  const flushParagraph = () => {
    if (currentParagraph.length > 0) {
      const joined = currentParagraph.join(' ').trim()
      if (joined) elements.push({ type: 'paragraph', text: joined })
      currentParagraph = []
    }
  }

  for (const line of lines) {
    const trimmed = line.trim()

    if (!trimmed) {
      flushParagraph()
      continue
    }

    // Section headers: "I -", "II -", "III -", "I.", "II.1 -" (Roman numerals)
    if (/^[IVXLC]+(\.\d+)*\s*[-–.]/.test(trimmed)) {
      flushParagraph()
      elements.push({ type: 'heading', text: trimmed })
      continue
    }

    // Numbered list items: "1.", "2.", "3)" etc followed by longer content
    if (/^\d+[.)]\s/.test(trimmed)) {
      flushParagraph()
      elements.push({ type: 'numbered-item', text: trimmed })
      continue
    }

    // Sub-items: "a)", "b)", "a." at start of line
    if (/^[a-z][.)]\s/i.test(trimmed)) {
      flushParagraph()
      elements.push({ type: 'item', text: trimmed })
      continue
    }

    // "REQUISITOS:", "CONCLUSAO:", "FUNDAMENTACAO:" style labels
    if (/^[A-ZÁÉÍÓÚÂÊÔÃÕÇ\s]{4,}:$/.test(trimmed) || /^(?:Art\.|Artigo|Paragrafo|§)\s/.test(trimmed)) {
      flushParagraph()
      if (/^[A-ZÁÉÍÓÚÂÊÔÃÕÇ\s]{4,}:$/.test(trimmed)) {
        elements.push({ type: 'label', text: trimmed })
      } else {
        elements.push({ type: 'legal-ref', text: trimmed })
      }
      continue
    }

    currentParagraph.push(trimmed)
  }
  flushParagraph()

  return elements.map((el, i) => {
    switch (el.type) {
      case 'heading':
        return <h4 key={i} className="text-sm font-bold text-gray-900 dark:text-white mt-5 mb-2 first:mt-0">{el.text}</h4>
      case 'label':
        return <h4 key={i} className="text-xs font-bold uppercase tracking-wider text-primary-600 dark:text-primary-400 mt-6 mb-2 first:mt-0">{el.text}</h4>
      case 'legal-ref':
        return <p key={i} className="text-[15px] leading-relaxed text-gray-800 dark:text-gray-200 mb-3 pl-4 border-l-2 border-primary-200 dark:border-primary-800 bg-primary-50/30 dark:bg-primary-900/10 py-1.5 pr-3 rounded-r-lg font-medium">{el.text}</p>
      case 'numbered-item':
        return <p key={i} className="text-[15px] leading-[1.8] text-gray-800 dark:text-gray-200 mb-2 pl-6 border-l-2 border-gray-200 dark:border-gray-700 py-0.5">{el.text}</p>
      case 'item':
        return <p key={i} className="text-[15px] leading-relaxed text-gray-800 dark:text-gray-200 mb-1.5 pl-8">{el.text}</p>
      default:
        return <p key={i} className="text-[15px] leading-[1.8] text-gray-800 dark:text-gray-200 mb-3 text-justify">{el.text}</p>
    }
  })
}

function estimateReadingTime(text) {
  if (!text) return null
  const words = text.split(/\s+/).length
  const minutes = Math.ceil(words / 200)
  return minutes
}

function CollapsibleSection({ id, title, content, activeSection }) {
  const [expanded, setExpanded] = useState(true)
  const COLLAPSE_THRESHOLD = 1500
  const isLong = content && content.length > COLLAPSE_THRESHOLD
  const [showFull, setShowFull] = useState(!isLong)
  const readingTime = estimateReadingTime(content)
  const charCount = content?.length || 0
  const pageEstimate = Math.ceil(charCount / 3000)

  if (!content) return null

  const formattedContent = formatLegalText(content)

  return (
    <div id={id} className="mb-6 sm:mb-8 scroll-mt-20 sm:scroll-mt-24">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 mb-3 group w-full"
      >
        <h3 className={`text-sm font-semibold uppercase tracking-wider transition-colors ${activeSection === id ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500 dark:text-gray-400'}`}>
          {title}
        </h3>
        {charCount > 500 && (
          <span className="text-2xs text-gray-400 dark:text-gray-500 font-normal normal-case tracking-normal">
            {pageEstimate > 1 ? `~${pageEstimate} pag.` : ''} {readingTime > 1 ? `· ${readingTime} min leitura` : ''}
          </span>
        )}
        <svg className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ml-auto ${expanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {expanded && (
        <div>
          <div className={`max-w-prose ${!showFull ? 'max-h-64 overflow-hidden relative' : ''}`}>
            {formattedContent}
            {!showFull && (
              <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white dark:from-surface-850 to-transparent" />
            )}
          </div>
          {isLong && (
            <button
              onClick={() => setShowFull(!showFull)}
              className="mt-3 text-sm text-primary-600 dark:text-primary-400 hover:underline font-medium flex items-center gap-1.5 py-1.5 px-3 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
            >
              {showFull ? (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                  Recolher
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  Mostrar texto completo ({pageEstimate > 1 ? `~${pageEstimate} paginas` : `${charCount} caracteres`})
                </>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  )
}

function TableOfContents({ sections, activeSection }) {
  if (sections.length < 3) return null
  return (
    <nav className="hidden xl:block w-48 flex-shrink-0">
      <div className="sticky top-24">
        <h4 className="text-2xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">Neste parecer</h4>
        <ul className="space-y-1.5 border-l-2 border-gray-200 dark:border-gray-700">
          {sections.map(({ id, label }) => (
            <li key={id}>
              <a
                href={`#${id}`}
                onClick={(e) => {
                  e.preventDefault()
                  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }}
                className={`block pl-3 -ml-0.5 text-xs font-medium transition-all border-l-2 -translate-x-px ${
                  activeSection === id
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                {label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  )
}

export default function ParecerDetail() {
  const { id } = useParams()
  const [parecer, setParecer] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeSection, setActiveSection] = useState(null)
  const [citationCopied, setCitationCopied] = useState(false)
  const [similares, setSimilares] = useState([])

  useEffect(() => {
    setLoading(true)
    setSimilares([])
    api.getById(id)
      .then(setParecer)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
    api.similares(id, 5).then(setSimilares).catch(() => {})
  }, [id])

  // Intersection observer for TOC highlighting
  useEffect(() => {
    if (!parecer) return
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveSection(entry.target.id)
        }
      },
      { rootMargin: '-100px 0px -60% 0px' }
    )
    const sections = document.querySelectorAll('[id^="section-"]')
    sections.forEach(s => observer.observe(s))
    return () => observer.disconnect()
  }, [parecer])

  if (loading) return (
    <div>
      <div className="skeleton h-4 w-24 mb-4 rounded" />
      <SkeletonDetail />
    </div>
  )

  if (error) return (
    <div className="card p-8 text-center">
      <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
      <Link to="/" className="btn-primary">Voltar a busca</Link>
    </div>
  )

  if (!parecer) return null

  const contentSections = [
    parecer.ementa && { id: 'section-ementa', label: 'Ementa', title: 'Ementa', content: parecer.ementa },
    parecer.texto_completo && { id: 'section-texto', label: 'Texto completo', title: 'Texto completo', content: parecer.texto_completo },
    parecer.fundamentacao_legal && { id: 'section-fund', label: 'Fundamentacao', title: 'Fundamentacao legal', content: parecer.fundamentacao_legal },
    parecer.conclusao && { id: 'section-conclusao', label: 'Conclusao', title: 'Conclusao', content: parecer.conclusao },
  ].filter(Boolean)

  const copyCitation = (format) => {
    let text
    if (format === 'simple') {
      text = `PARECER N. ${parecer.numero}. ${parecer.assunto}. ${parecer.orgao}, ${formatDate(parecer.data_emissao)}.`
    } else {
      text = `${parecer.orgao.toUpperCase()}. Parecer n. ${parecer.numero}: ${parecer.assunto}. ${formatDate(parecer.data_emissao)}.`
    }
    navigator.clipboard.writeText(text)
    setCitationCopied(true)
    setTimeout(() => setCitationCopied(false), 2000)
  }

  return (
    <div>
      <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium mb-4 transition-colors">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        Voltar a busca
      </Link>

      <div className="flex gap-6">
        {/* Main content */}
        <div className="flex-1 min-w-0">
          <div className={`card p-4 sm:p-6 lg:p-8 border-l-4 ${borderByTipo[parecer.tipo] || borderByTipo.consultivo}`}>
            {/* Header */}
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2.5 mb-3 sm:mb-4">
              <span className="font-mono text-sm sm:text-lg font-bold text-primary-600 dark:text-primary-400">{parecer.numero}</span>
              <span className="text-2xs sm:text-xs px-2 sm:px-3 py-0.5 sm:py-1 rounded-full bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 font-semibold uppercase tracking-wider">
                {parecer.tipo}
              </span>
              <StatusBadge status={parecer.status} />
            </div>

            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-5 leading-snug">{parecer.assunto}</h1>

            {/* Metadata grid */}
            <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8 p-3 sm:p-4 bg-gradient-to-br from-surface-50 to-primary-50/20 dark:from-surface-900 dark:to-primary-950/10 rounded-xl border border-gray-100 dark:border-gray-700/30">
              <div>
                <span className="flex items-center gap-1 text-2xs text-gray-500 dark:text-gray-400 mb-0.5">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5" /></svg>
                  Orgao
                </span>
                <span className="text-sm font-medium">{parecer.orgao}</span>
              </div>
              {parecer.orgao_solicitante && (
                <div>
                  <span className="text-2xs text-gray-500 dark:text-gray-400 block mb-0.5">Solicitante</span>
                  <span className="text-sm font-medium">{parecer.orgao_solicitante}</span>
                </div>
              )}
              {parecer.autor && (
                <div>
                  <span className="flex items-center gap-1 text-2xs text-gray-500 dark:text-gray-400 mb-0.5">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    Autor
                  </span>
                  <span className="text-sm font-medium">{parecer.autor}</span>
                </div>
              )}
              <div>
                <span className="flex items-center gap-1 text-2xs text-gray-500 dark:text-gray-400 mb-0.5">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  Data
                </span>
                <span className="text-sm font-medium">{formatDate(parecer.data_emissao)}</span>
              </div>
              {parecer.materia && (
                <div>
                  <span className="text-2xs text-gray-500 dark:text-gray-400 block mb-0.5">Materia</span>
                  <span className="text-sm font-medium">{parecer.materia}</span>
                </div>
              )}
              {parecer.nup && (
                <div>
                  <span className="text-2xs text-gray-500 dark:text-gray-400 block mb-0.5">NUP/Processo</span>
                  <span className="text-sm font-mono font-medium">{parecer.nup}</span>
                </div>
              )}
              {parecer.palavras_chave && (
                <div className="col-span-2">
                  <span className="text-2xs text-gray-500 dark:text-gray-400 block mb-1">Palavras-chave</span>
                  <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
                    {parecer.palavras_chave.split(',').map((kw, i) => (
                      <span key={i} className="text-2xs px-2 py-0.5 bg-gray-200/50 dark:bg-gray-700/50 rounded-full font-medium">{kw.trim()}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Content sections */}
            {contentSections.map(section => (
              <CollapsibleSection key={section.id} {...section} activeSection={activeSection} />
            ))}

            {/* Related pareceres */}
            {parecer.relacionados && parecer.relacionados.length > 0 && (
              <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Pareceres relacionados</h3>
                <div className="space-y-2">
                  {parecer.relacionados.map((rel, i) => (
                    <Link key={i} to={`/parecer/${rel.id}`} className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-50 dark:hover:bg-surface-900/50 hover:shadow-soft transition-all group">
                      <span className="text-2xs px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-700 font-medium text-gray-600 dark:text-gray-400">{rel.tipo_relacao}</span>
                      <span className="font-mono text-sm font-medium text-primary-600 dark:text-primary-400">{rel.numero}</span>
                      <span className="text-sm text-gray-700 dark:text-gray-300 truncate group-hover:text-gray-900 dark:group-hover:text-white transition-colors">{rel.assunto}</span>
                      <StatusBadge status={rel.status} />
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Similar pareceres */}
            {similares.length > 0 && (
              <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Pareceres similares</h3>
                <div className="flex gap-3 overflow-x-auto pb-2 -mx-2 px-2 snap-x scrollbar-none">
                  {similares.map((sim, i) => (
                    <Link
                      key={sim.id}
                      to={`/parecer/${sim.id}`}
                      className={`flex-shrink-0 w-56 sm:w-64 card p-3 sm:p-4 border-l-4 ${borderByTipo[sim.tipo] || borderByTipo.consultivo} hover:shadow-elevated hover:-translate-y-0.5 transition-all snap-start`}
                      style={{ animationDelay: `${i * 80}ms` }}
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="font-mono text-xs font-bold text-primary-600 dark:text-primary-400">{sim.numero}</span>
                        <StatusBadge status={sim.status} />
                      </div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2 leading-snug">{sim.assunto}</p>
                      <div className="mt-2 flex items-center gap-2 text-2xs text-gray-500">
                        <span>{sim.orgao}</span>
                        {sim.data_emissao && <span>{formatDate(sim.data_emissao)}</span>}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200 dark:border-gray-700 flex flex-wrap gap-2 sm:gap-3 no-print">
              <Link to={`/admin/${parecer.id}`} className="btn-secondary text-sm flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                Editar
              </Link>
              <div className="relative group">
                <button className="btn-secondary text-sm flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                  {citationCopied ? 'Copiado!' : 'Copiar citacao'}
                </button>
                <div className="absolute bottom-full left-0 mb-1 hidden group-hover:block z-10">
                  <div className="glass rounded-xl shadow-elevated p-1.5 min-w-[200px]">
                    <button onClick={() => copyCitation('simple')} className="w-full text-left px-3 py-2 text-xs hover:bg-gray-50/80 dark:hover:bg-gray-700/40 rounded-lg transition-colors">
                      Referencia simples
                    </button>
                    <button onClick={() => copyCitation('abnt')} className="w-full text-left px-3 py-2 text-xs hover:bg-gray-50/80 dark:hover:bg-gray-700/40 rounded-lg transition-colors">
                      Citacao formal (ABNT)
                    </button>
                  </div>
                </div>
              </div>
              <button onClick={() => window.print()} className="btn-secondary text-sm flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                Imprimir
              </button>
            </div>
          </div>
        </div>

        {/* Table of Contents sidebar */}
        <TableOfContents sections={contentSections} activeSection={activeSection} />
      </div>
    </div>
  )
}
