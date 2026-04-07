import { Link } from 'react-router-dom'
import DOMPurify from 'dompurify'
import StatusBadge from './StatusBadge'
import { formatDate } from '../utils/formatDate'

const borderColors = {
  consultivo: 'border-l-primary-500',
  normativo: 'border-l-accent-500',
  sistemico: 'border-l-gov-500',
}

const tipoColors = {
  consultivo: 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400',
  normativo: 'bg-accent-50 text-accent-700 dark:bg-accent-900/20 dark:text-accent-400',
  sistemico: 'bg-gov-50 text-gov-700 dark:bg-gov-900/20 dark:text-gov-400',
}

export default function ResultCard({ parecer }) {
  const sanitizedSnippet = parecer.snippet
    ? DOMPurify.sanitize(parecer.snippet, { ALLOWED_TAGS: ['mark'] })
    : null

  return (
    <Link
      to={`/parecer/${parecer.id}`}
      className={`block card p-3.5 sm:p-5 border-l-4 ${borderColors[parecer.tipo] || borderColors.consultivo} hover:shadow-elevated hover:-translate-y-0.5 transition-[box-shadow,transform] duration-300 group focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:ring-offset-2`}
    >
      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
        <span className="font-mono text-xs sm:text-sm font-bold text-primary-600 dark:text-primary-400 tracking-tight">{parecer.numero}</span>
        <span className={`text-2xs px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider ${tipoColors[parecer.tipo] || tipoColors.consultivo}`}>
          {parecer.tipo}
        </span>
        <StatusBadge status={parecer.status} />
        {parecer.materia && (
          <span className="text-2xs px-2 py-0.5 rounded-full bg-surface-100 dark:bg-surface-800 text-gray-600 dark:text-gray-300 font-medium">
            {parecer.materia}
          </span>
        )}
      </div>

      <h3 className="text-sm sm:text-[15px] font-semibold leading-snug text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors mb-1 sm:mb-1.5">
        {parecer.assunto}
      </h3>

      {sanitizedSnippet ? (
        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-2 sm:mb-3 leading-relaxed" dangerouslySetInnerHTML={{ __html: sanitizedSnippet }} />
      ) : parecer.ementa ? (
        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-2 sm:mb-3 leading-relaxed">{parecer.ementa}</p>
      ) : null}

      <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-2xs sm:text-xs text-gray-500 dark:text-gray-400">
        <span className="flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
          {parecer.orgao}
        </span>
        {parecer.autor && (
          <span className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            {parecer.autor}
          </span>
        )}
        <span className="flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          {formatDate(parecer.data_emissao)}
        </span>
      </div>
    </Link>
  )
}
