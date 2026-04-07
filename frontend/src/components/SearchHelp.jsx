import { useState, useEffect } from 'react'

export default function SearchHelp() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    const handler = (e) => {
      if (e.type === 'close-modals' || e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('close-modals', handler)
    document.addEventListener('keydown', handler)
    return () => {
      document.removeEventListener('close-modals', handler)
      document.removeEventListener('keydown', handler)
    }
  }, [open])

  return (
    <>
      <button onClick={() => setOpen(true)} className="p-1.5 hover:bg-gray-100/80 dark:hover:bg-gray-700/80 rounded-lg transition-all" title="Ajuda de busca">
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in" onClick={() => setOpen(false)}>
          <div className="bg-white dark:bg-surface-850 rounded-2xl shadow-dramatic max-w-lg w-full max-h-[80vh] overflow-auto p-6 border border-gray-100 dark:border-gray-700/50 animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <svg className="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Guia de Busca
              </h2>
              <button onClick={() => setOpen(false)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="space-y-5 text-sm text-gray-700 dark:text-gray-300">
              <section>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1.5 flex items-center gap-2">
                  <svg className="w-4 h-4 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                  Busca simples
                </h3>
                <p className="text-gray-600 dark:text-gray-400">Digite qualquer termo. A busca procura em todos os campos: numero, assunto, ementa, texto completo, fundamentacao e conclusao.</p>
                <code className="block mt-2 p-2.5 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-surface-900 dark:to-surface-850 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-mono text-primary-700 dark:text-primary-400">licitacao medicamento</code>
              </section>

              <section>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1.5 flex items-center gap-2">
                  <svg className="w-4 h-4 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
                  Operadores booleanos
                </h3>
                <div className="space-y-1.5 mt-2">
                  {[
                    { op: 'E', desc: 'Ambos os termos devem aparecer' },
                    { op: 'OU', desc: 'Qualquer um dos termos' },
                    { op: 'NAO', desc: 'Exclui o termo seguinte' },
                  ].map(({ op, desc }) => (
                    <div key={op} className="flex items-center gap-3 py-1">
                      <span className="font-mono font-bold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 px-2 py-0.5 rounded-md text-xs min-w-[2.5rem] text-center">{op}</span>
                      <span className="text-xs text-gray-600 dark:text-gray-400">{desc}</span>
                    </div>
                  ))}
                </div>
                <code className="block mt-2 p-2.5 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-surface-900 dark:to-surface-850 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-mono text-primary-700 dark:text-primary-400">licitacao E medicamento NAO suspenso</code>
              </section>

              <section>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1.5 flex items-center gap-2">
                  <svg className="w-4 h-4 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" /></svg>
                  Frase exata
                </h3>
                <p className="text-gray-600 dark:text-gray-400">Use aspas para buscar uma frase exata.</p>
                <code className="block mt-2 p-2.5 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-surface-900 dark:to-surface-850 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-mono text-primary-700 dark:text-primary-400">"dispensa de licitacao"</code>
              </section>

              <section>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1.5 flex items-center gap-2">
                  <svg className="w-4 h-4 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
                  Busca por campo
                </h3>
                <p className="text-gray-600 dark:text-gray-400">Busque em um campo especifico usando <code className="font-mono text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 px-1 rounded">campo:"valor"</code>.</p>
                <div className="mt-2 space-y-1.5">
                  {['assunto:"contratacao temporaria"', 'ementa:"LGPD"', 'conclusao:"admissivel"'].map(ex => (
                    <code key={ex} className="block p-2.5 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-surface-900 dark:to-surface-850 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-mono text-primary-700 dark:text-primary-400">{ex}</code>
                  ))}
                </div>
              </section>

              <section>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1.5">Campos disponiveis</h3>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {['numero', 'assunto', 'ementa', 'texto_completo', 'fundamentacao_legal', 'conclusao', 'palavras_chave'].map(f => (
                    <span key={f} className="text-2xs px-2.5 py-1 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 rounded-full font-mono font-medium">{f}</span>
                  ))}
                </div>
              </section>

              <section className="bg-surface-50 dark:bg-surface-900 rounded-xl p-4 -mx-1">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1.5 flex items-center gap-2">
                  <svg className="w-4 h-4 text-gov-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  Dicas
                </h3>
                <ul className="list-disc list-inside space-y-1.5 text-xs text-gray-600 dark:text-gray-400">
                  <li>A busca ignora acentos e maiusculas/minusculas</li>
                  <li>Use os filtros laterais para refinar por tipo, materia, ano ou status</li>
                  <li>Clique em "Filtros" para opcoes avancadas de data e autor</li>
                  <li>Exporte resultados em CSV usando o botao na barra de resultados</li>
                  <li>Pressione <kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-2xs font-mono">/</kbd> para focar na busca</li>
                </ul>
              </section>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
