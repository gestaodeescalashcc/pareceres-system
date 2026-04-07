const BASE = (import.meta.env.VITE_API_URL || '') + '/api';

async function request(url, options = {}) {
  const token = localStorage.getItem('auth_token');
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(BASE + url, { headers, ...options });
  if (res.status === 401) {
    localStorage.removeItem('auth_token');
    if (window.location.pathname.startsWith('/admin')) {
      window.location.href = '/login';
    }
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Erro na requisicao');
  }
  return res.json();
}

export const api = {
  // Search
  search: (params) => {
    const qs = new URLSearchParams(Object.entries(params).filter(([, v]) => v)).toString();
    return request(`/pareceres/search?${qs}`);
  },
  autocomplete: (q, filters = {}) => {
    const params = { q, ...Object.fromEntries(Object.entries(filters).filter(([, v]) => v)) };
    const qs = new URLSearchParams(params).toString();
    return request(`/pareceres/autocomplete?${qs}`);
  },
  facets: (params = {}) => {
    const qs = new URLSearchParams(Object.entries(params).filter(([, v]) => v)).toString();
    return request(`/pareceres/facets?${qs}`);
  },

  // CRUD
  getById: (id) => request(`/pareceres/${id}`),
  create: (data) => request('/pareceres', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/pareceres/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  remove: (id) => request(`/pareceres/${id}`, { method: 'DELETE' }),

  // Import
  importText: (data) => request('/import/text', { method: 'POST', body: JSON.stringify(data) }),
  importPaste: (texto) => request('/import/paste', { method: 'POST', body: JSON.stringify({ texto }) }),
  importConfirm: (data) => request('/import/confirm', { method: 'POST', body: JSON.stringify(data) }),
  importPdf: async (file) => {
    const form = new FormData();
    form.append('arquivo', file);
    const token = localStorage.getItem('auth_token');
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(BASE + '/import/pdf', { method: 'POST', body: form, headers });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(err.error || 'Erro no upload');
    }
    return res.json();
  },

  // Utils
  stats: () => request('/pareceres/stats'),
  checkDuplicate: (numero) => request(`/pareceres/check-duplicate?numero=${encodeURIComponent(numero)}`),
  exportCsv: (params = {}) => {
    const qs = new URLSearchParams(Object.entries(params).filter(([, v]) => v)).toString();
    window.open(BASE + `/pareceres/export?${qs}`, '_blank');
  },

  // Similar
  similares: (id, limit = 5) => request(`/pareceres/${id}/similares?limit=${limit}`),

  // Analytics
  trending: () => request('/pareceres/analytics/trending'),

  // Related
  getRelacionados: (id) => request(`/pareceres/${id}/relacionados`),
  addRelacionado: (id, relacionadoId, tipo) => request(`/pareceres/${id}/relacionados`, {
    method: 'POST', body: JSON.stringify({ relacionado_id: relacionadoId, tipo_relacao: tipo })
  })
};
