import { useState, useRef, useCallback, forwardRef, useImperativeHandle } from 'react'
import { api } from '../utils/api'
import { useToast } from './Toast'

function TextToolbar({ textareaRef, value, onChange }) {
  const insert = (before, after = '', placeholder = '') => {
    const ta = textareaRef.current
    if (!ta) return
    const start = ta.selectionStart
    const end = ta.selectionEnd
    const selected = value.substring(start, end) || placeholder
    const newText = value.substring(0, start) + before + selected + after + value.substring(end)
    onChange(newText)
    setTimeout(() => {
      ta.focus()
      const cursorPos = start + before.length + selected.length + after.length
      ta.setSelectionRange(cursorPos, cursorPos)
    }, 0)
  }

  const insertAtLineStart = (prefix) => {
    const ta = textareaRef.current
    if (!ta) return
    const start = ta.selectionStart
    const lineStart = value.lastIndexOf('\n', start - 1) + 1
    const newText = value.substring(0, lineStart) + prefix + value.substring(lineStart)
    onChange(newText)
    setTimeout(() => {
      ta.focus()
      ta.setSelectionRange(start + prefix.length, start + prefix.length)
    }, 0)
  }

  const wrapLines = (prefix) => {
    const ta = textareaRef.current
    if (!ta) return
    const start = ta.selectionStart
    const end = ta.selectionEnd
    const selected = value.substring(start, end)
    if (selected) {
      const wrapped = selected.split('\n').map(line => prefix + line).join('\n')
      const newText = value.substring(0, start) + wrapped + value.substring(end)
      onChange(newText)
    } else {
      insertAtLineStart(prefix)
    }
  }

  const tools = [
    { label: 'Secao', title: 'Inserir titulo de secao (I - ...)', icon: 'H',
      action: () => insert('\nI - ', '\n', 'TITULO DA SECAO') },
    { label: 'Sub', title: 'Inserir sub-secao (I.1 - ...)', icon: 'h',
      action: () => insert('\nI.1 - ', '\n', 'Subtitulo') },
    { type: 'sep' },
    { label: 'Lista', title: 'Lista numerada (1. 2. 3.)', icon: '1.',
      action: () => {
        const ta = textareaRef.current
        const start = ta?.selectionStart || 0
        const selected = value.substring(start, ta?.selectionEnd || start)
        if (selected) {
          const items = selected.split('\n').map((line, i) => `${i + 1}. ${line}`).join('\n')
          const newText = value.substring(0, start) + items + value.substring(ta.selectionEnd)
          onChange(newText)
        } else {
          insert('\n1. ', '\n2. \n3. ', 'Primeiro item')
        }
      }
    },
    { label: 'Itens', title: 'Sub-itens (a) b) c))', icon: 'a)',
      action: () => {
        const ta = textareaRef.current
        const start = ta?.selectionStart || 0
        const selected = value.substring(start, ta?.selectionEnd || start)
        if (selected) {
          const items = selected.split('\n').map((line, i) => `${String.fromCharCode(97 + i)}) ${line}`).join('\n')
          const newText = value.substring(0, start) + items + value.substring(ta.selectionEnd)
          onChange(newText)
        } else {
          insert('\na) ', '\nb) \nc) ', 'Primeiro sub-item')
        }
      }
    },
    { type: 'sep' },
    { label: 'Art.', title: 'Referencia legal (Art. ...)', icon: '§',
      action: () => insert('\nArt. ', '\n', '59, paragrafo unico, Lei 8.666/93') },
    { label: 'Label', title: 'Label em maiusculas (TITULO:)', icon: 'A:',
      action: () => insert('\n', ':\n', 'REQUISITOS') },
    { type: 'sep' },
    { label: 'Paragrafo', title: 'Quebra de paragrafo', icon: '¶',
      action: () => insert('\n\n', '', '') },
  ]

  return (
    <div className="flex flex-wrap items-center gap-0.5 px-1.5 sm:px-2 py-1 sm:py-1.5 bg-surface-50 dark:bg-surface-900/50 border border-gray-200 dark:border-gray-700 border-b-0 rounded-t-xl">
      {tools.map((tool, i) =>
        tool.type === 'sep' ? (
          <div key={i} className="w-px h-4 sm:h-5 bg-gray-200 dark:bg-gray-700 mx-0.5 sm:mx-1" />
        ) : (
          <button
            key={i}
            type="button"
            onClick={tool.action}
            title={tool.title}
            className="px-1.5 sm:px-2 py-0.5 sm:py-1 text-2xs sm:text-xs font-mono font-bold text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-white dark:hover:bg-surface-800 rounded-md transition-colors"
          >
            {tool.icon}
          </button>
        )
      )}
      <span className="ml-auto text-2xs text-gray-400 dark:text-gray-500 hidden lg:block">
        Formatacao compativel com visualizacao
      </span>
    </div>
  )
}

const RichTextarea = forwardRef(function RichTextarea({ value, onChange, rows = 8, placeholder, className = '' }, ref) {
  const internalRef = useRef(null)
  const taRef = ref || internalRef

  return (
    <div>
      <TextToolbar textareaRef={taRef} value={value} onChange={onChange} />
      <textarea
        ref={taRef}
        value={value}
        onChange={e => onChange(e.target.value)}
        rows={rows}
        className={`input-field rounded-t-none font-mono text-sm ${className}`}
        placeholder={placeholder}
      />
    </div>
  )
})

const INITIAL = {
  numero: '', tipo: 'consultivo', orgao: '', orgao_solicitante: '', autor: '',
  assunto: '', ementa: '', texto_completo: '', fundamentacao_legal: '', conclusao: '',
  materia: '', status: 'vigente', data_emissao: '', nup: '', palavras_chave: ''
}

const TABS = [
  { key: 'form', label: 'Formulario', icon: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
  )},
  { key: 'paste', label: 'Copy-Paste', icon: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
  )},
  { key: 'pdf', label: 'Upload PDF', icon: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
  )},
]

function FormSection({ title, icon, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border border-gray-100 dark:border-gray-700/50 rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 bg-surface-50 dark:bg-surface-900/50 hover:bg-surface-100 dark:hover:bg-surface-900 transition-colors"
      >
        <span className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300">
          {icon}
          {title}
        </span>
        <svg className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${open ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">{children}</div>
      </div>
    </div>
  )
}

export default function ParecerForm({ initial, onSaved }) {
  const [form, setForm] = useState(initial || INITIAL)
  const [mode, setMode] = useState('form')
  const [pasteText, setPasteText] = useState('')
  const [pdfResult, setPdfResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [duplicate, setDuplicate] = useState(null)
  const toast = useToast()
  const [dragging, setDragging] = useState(false)
  const fileRef = useRef(null)
  const dupTimerRef = useRef(null)

  const set = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }))
    if (field === 'numero' && !initial?.id) {
      clearTimeout(dupTimerRef.current)
      setDuplicate(null)
      if (value && value.length >= 3) {
        dupTimerRef.current = setTimeout(async () => {
          try {
            const result = await api.checkDuplicate(value)
            if (result.exists) setDuplicate(result.parecer)
          } catch {}
        }, 500)
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (initial?.id) {
        await api.update(initial.id, form)
        toast.success('Parecer atualizado com sucesso!')
      } else {
        await api.importConfirm(form)
        toast.success('Parecer cadastrado e indexado com sucesso!')
        if (!initial) setForm(INITIAL)
      }
      onSaved?.()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handlePaste = async () => {
    if (!pasteText.trim()) return
    setLoading(true)
    try {
      const result = await api.importPaste(pasteText)
      const detected = result.detectado
      setForm(prev => ({
        ...prev,
        ...Object.fromEntries(Object.entries(detected).filter(([, v]) => v))
      }))
      setMode('form')
      toast.success('Campos detectados automaticamente. Revise e salve.')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handlePdf = async (e) => {
    const file = e.target?.files?.[0] || e
    if (!file) return
    setLoading(true)
    try {
      const result = await api.importPdf(file)
      setPdfResult(result)
      const detected = result.detectado
      setForm(prev => ({
        ...prev,
        texto_completo: result.texto_extraido,
        ...Object.fromEntries(Object.entries(detected).filter(([, v]) => v))
      }))
      setMode('form')
      toast.success(`PDF processado (${result.paginas} paginas). Texto extraido. Revise e salve.`)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file && file.type === 'application/pdf') handlePdf(file)
  }

  return (
    <div>
      {/* Tab bar with sliding indicator */}
      <div className="bg-gray-100 dark:bg-surface-900 rounded-xl p-1 flex gap-0.5 sm:gap-1 mb-4 sm:mb-5">
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setMode(tab.key)}
            className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm rounded-lg font-medium transition-all duration-200 ${
              mode === tab.key
                ? 'bg-white dark:bg-surface-800 text-primary-600 dark:text-primary-400 shadow-soft'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            {tab.icon}
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Paste mode */}
      {mode === 'paste' && (
        <div className="mb-5 animate-fade-in-up">
          <label className="label">Cole o texto do parecer abaixo</label>
          <textarea
            value={pasteText}
            onChange={e => setPasteText(e.target.value)}
            rows={12}
            className="input-field font-mono text-sm"
            placeholder="Cole aqui o texto completo do parecer. O sistema tentara detectar automaticamente: numero, data, orgao, ementa, assunto, fundamentacao e conclusao..."
          />
          <button onClick={handlePaste} disabled={loading || !pasteText.trim()} className="btn-primary mt-3">
            {loading ? 'Processando...' : 'Detectar campos automaticamente'}
          </button>
        </div>
      )}

      {/* PDF mode */}
      {mode === 'pdf' && (
        <div className="mb-5 animate-fade-in-up">
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all duration-300 ${
              dragging
                ? 'border-primary-400 bg-primary-50/50 dark:bg-primary-900/10 scale-[1.01]'
                : 'border-gray-300 dark:border-gray-600 hover:border-primary-300 dark:hover:border-primary-500'
            }`}
          >
            <svg className={`w-14 h-14 mx-auto mb-4 transition-all duration-300 ${dragging ? 'text-primary-500 scale-110' : 'text-gray-300 dark:text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1 font-medium">Arraste um PDF ou clique para selecionar</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">O PDF sera processado em memoria e descartado. Apenas o texto sera salvo.</p>
            <input ref={fileRef} type="file" accept=".pdf" onChange={handlePdf} className="hidden" id="pdf-upload" />
            <label htmlFor="pdf-upload" className="btn-primary cursor-pointer inline-block">
              {loading ? 'Extraindo texto...' : 'Selecionar PDF'}
            </label>
          </div>
        </div>
      )}

      {/* Form mode */}
      {mode === 'form' && (
        <form onSubmit={handleSubmit} className="space-y-4 animate-fade-in">
          <FormSection
            title="Identificacao"
            icon={<svg className="w-4 h-4 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="label">Numero *</label>
                <input value={form.numero} onChange={e => set('numero', e.target.value)} className={`input-field ${duplicate ? 'border-amber-400 dark:border-amber-500 shadow-[0_0_8px_rgb(245_158_11/0.15)]' : ''}`} placeholder="001/2024/PROJUR" required />
                {duplicate && (
                  <p className="mt-1.5 text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    Ja existe o parecer "{duplicate.numero}" — {duplicate.assunto}
                  </p>
                )}
              </div>
              <div>
                <label className="label">Tipo *</label>
                <select value={form.tipo} onChange={e => set('tipo', e.target.value)} className="input-field">
                  <option value="consultivo">Consultivo</option>
                  <option value="normativo">Normativo</option>
                  <option value="sistemico">Sistemico</option>
                </select>
              </div>
              <div>
                <label className="label">Status</label>
                <select value={form.status} onChange={e => set('status', e.target.value)} className="input-field">
                  <option value="vigente">Vigente</option>
                  <option value="revogado">Revogado</option>
                  <option value="suspenso">Suspenso</option>
                </select>
              </div>
              <div>
                <label className="label">Data emissao *</label>
                <input type="date" value={form.data_emissao} onChange={e => set('data_emissao', e.target.value)} className="input-field" required />
              </div>
            </div>
          </FormSection>

          <FormSection
            title="Orgao e Autoria"
            icon={<svg className="w-4 h-4 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>}
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="label">Orgao emissor *</label>
                <input value={form.orgao} onChange={e => set('orgao', e.target.value)} className="input-field" placeholder="Procuradoria Juridica..." required />
              </div>
              <div>
                <label className="label">Orgao solicitante</label>
                <input value={form.orgao_solicitante} onChange={e => set('orgao_solicitante', e.target.value)} className="input-field" placeholder="Diretoria..." />
              </div>
              <div>
                <label className="label">Autor</label>
                <input value={form.autor} onChange={e => set('autor', e.target.value)} className="input-field" placeholder="Nome do procurador/assessor" />
              </div>
            </div>
          </FormSection>

          <FormSection
            title="Classificacao"
            icon={<svg className="w-4 h-4 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>}
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="label">Materia</label>
                <select value={form.materia} onChange={e => set('materia', e.target.value)} className="input-field">
                  <option value="">Selecione...</option>
                  <option value="Administrativo">Administrativo</option>
                  <option value="Licitacoes e Contratos">Licitacoes e Contratos</option>
                  <option value="Pessoal">Pessoal</option>
                  <option value="Tributario">Tributario</option>
                  <option value="Trabalhista">Trabalhista</option>
                  <option value="Saude">Saude</option>
                  <option value="Previdenciario">Previdenciario</option>
                  <option value="Disciplinar">Disciplinar</option>
                  <option value="Patrimonio Publico">Patrimonio Publico</option>
                  <option value="Convenios">Convenios</option>
                </select>
              </div>
              <div>
                <label className="label">NUP (Processo)</label>
                <input value={form.nup} onChange={e => set('nup', e.target.value)} className="input-field" placeholder="0022.000145/2024-38" />
              </div>
              <div>
                <label className="label">Palavras-chave</label>
                <input value={form.palavras_chave} onChange={e => set('palavras_chave', e.target.value)} className="input-field" placeholder="licitacao, contrato, emergencia..." />
              </div>
            </div>
          </FormSection>

          <FormSection
            title="Conteudo"
            icon={<svg className="w-4 h-4 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" /></svg>}
          >
            <div>
              <label className="label">Assunto *</label>
              <input value={form.assunto} onChange={e => set('assunto', e.target.value)} className="input-field" placeholder="Titulo/assunto do parecer" required />
            </div>
            <div>
              <label className="label">Ementa</label>
              <textarea value={form.ementa} onChange={e => set('ementa', e.target.value)} rows={3} className="input-field" placeholder="Resumo juridico do parecer..." />
            </div>
            <div>
              <label className="label">Texto completo</label>
              <RichTextarea
                value={form.texto_completo}
                onChange={v => set('texto_completo', v)}
                rows={12}
                placeholder="Corpo integral do parecer (sera indexado para busca full-text)..."
              />
              {form.texto_completo && (
                <p className="mt-1 text-2xs text-gray-400 dark:text-gray-500">
                  {form.texto_completo.length.toLocaleString()} caracteres · ~{Math.ceil(form.texto_completo.split(/\s+/).length / 200)} min leitura
                </p>
              )}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <label className="label">Fundamentacao legal</label>
                <RichTextarea
                  value={form.fundamentacao_legal}
                  onChange={v => set('fundamentacao_legal', v)}
                  rows={4}
                  placeholder="Leis, artigos, jurisprudencia citados..."
                />
              </div>
              <div>
                <label className="label">Conclusao</label>
                <RichTextarea
                  value={form.conclusao}
                  onChange={v => set('conclusao', v)}
                  rows={4}
                  placeholder="Conclusao e recomendacoes..."
                />
              </div>
            </div>
          </FormSection>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
              {loading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                  Salvando...
                </>
              ) : initial?.id ? 'Atualizar parecer' : 'Cadastrar e indexar'}
            </button>
            <button type="button" onClick={() => setForm(INITIAL)} className="btn-secondary">
              Limpar
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
