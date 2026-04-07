const { search, autocomplete, getFacets, checkDuplicate, findSimilares, getSearchAnalytics } = require('../../lib/services/searchService');
const { createParecer, updateParecer, deleteParecer, getParecerById, addRelacionado, getStats } = require('../../lib/services/indexService');
const { requireAuth } = require('../../lib/auth');
const { validateParecer } = require('../../lib/validate');

module.exports = async function handler(req, res) {
  const segments = req.query.path || [];
  const path = segments.join('/');

  // GET /api/pareceres/search
  if (path === 'search' && req.method === 'GET') {
    try {
      const { q, tipo, orgao, materia, ano, status, autor, data_inicio, data_fim, page, limit, sort } = req.query;
      const result = await search({
        q, tipo, orgao, materia, ano, status, autor,
        dataInicio: data_inicio, dataFim: data_fim,
        page: parseInt(page) || 1,
        limit: Math.min(parseInt(limit) || 20, 100),
        sort: sort || 'relevancia'
      });
      return res.json(result);
    } catch (err) {
      return res.status(400).json({ error: 'Erro na busca: ' + err.message });
    }
  }

  // GET /api/pareceres/autocomplete
  if (path === 'autocomplete' && req.method === 'GET') {
    try {
      const { q, tipo, orgao, materia, ano } = req.query;
      const results = await autocomplete(q, { tipo, orgao, materia, ano });
      return res.json(results);
    } catch {
      return res.json([]);
    }
  }

  // GET /api/pareceres/check-duplicate
  if (path === 'check-duplicate' && req.method === 'GET') {
    const { numero } = req.query;
    if (!numero) return res.json({ exists: false });
    const existing = await checkDuplicate(numero);
    return res.json({ exists: !!existing, parecer: existing });
  }

  // GET /api/pareceres/facets
  if (path === 'facets' && req.method === 'GET') {
    try {
      const facets = await getFacets(req.query);
      return res.json(facets);
    } catch {
      return res.json({ tipos: [], orgaos: [], materias: [], anos: [], statuses: [] });
    }
  }

  // GET /api/pareceres/analytics/trending
  if (path === 'analytics/trending' && req.method === 'GET') {
    try {
      const analytics = await getSearchAnalytics();
      return res.json(analytics);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  // GET /api/pareceres/stats
  if (path === 'stats' && req.method === 'GET') {
    try {
      const stats = await getStats();
      return res.json(stats);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  // GET /api/pareceres/export
  if (path === 'export' && req.method === 'GET') {
    try {
      const { q, tipo, orgao, materia, ano, status } = req.query;
      const result = await search({ q, tipo, orgao, materia, ano, status, page: 1, limit: 10000 });
      const header = 'Numero;Tipo;Orgao;Assunto;Ementa;Materia;Status;Data Emissao;Ano;Autor\n';
      const csv = result.resultados.map(r =>
        [r.numero, r.tipo, r.orgao, r.assunto, (r.ementa || '').replace(/;/g, ',').replace(/\n/g, ' '), r.materia, r.status, r.data_emissao, r.ano, r.autor].join(';')
      ).join('\n');
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename=pareceres.csv');
      return res.send('\uFEFF' + header + csv);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  // Routes with :id parameter
  if (segments.length >= 1) {
    const id = parseInt(segments[0]);
    if (isNaN(id)) return res.status(400).json({ error: 'ID invalido' });
    const sub = segments[1] || '';

    // GET /api/pareceres/:id/similares
    if (sub === 'similares' && req.method === 'GET') {
      try {
        const limit = Math.min(parseInt(req.query.limit) || 5, 20);
        const results = await findSimilares(id, limit);
        return res.json(results);
      } catch (err) {
        return res.status(500).json({ error: err.message });
      }
    }

    // GET/POST /api/pareceres/:id/relacionados
    if (sub === 'relacionados') {
      if (req.method === 'GET') {
        const parecer = await getParecerById(id);
        if (!parecer) return res.status(404).json({ error: 'Parecer nao encontrado' });
        return res.json(parecer.relacionados || []);
      }
      if (req.method === 'POST') {
        const user = requireAuth(req, res);
        if (!user) return;
        try {
          const { relacionado_id, tipo_relacao } = req.body;
          await addRelacionado(id, relacionado_id, tipo_relacao || 'cita');
          return res.json({ success: true });
        } catch (err) {
          return res.status(500).json({ error: err.message });
        }
      }
    }

    // GET/PUT/DELETE /api/pareceres/:id
    if (!sub) {
      if (req.method === 'GET') {
        const parecer = await getParecerById(id);
        if (!parecer) return res.status(404).json({ error: 'Parecer nao encontrado' });
        return res.json(parecer);
      }
      if (req.method === 'PUT') {
        const user = requireAuth(req, res);
        if (!user) return;
        try {
          const parecer = await updateParecer(id, req.body);
          if (!parecer) return res.status(404).json({ error: 'Parecer nao encontrado' });
          return res.json(parecer);
        } catch (err) {
          return res.status(500).json({ error: err.message });
        }
      }
      if (req.method === 'DELETE') {
        const user = requireAuth(req, res);
        if (!user) return;
        const deleted = await deleteParecer(id);
        if (!deleted) return res.status(404).json({ error: 'Parecer nao encontrado' });
        return res.json({ success: true });
      }
    }
  }

  // POST /api/pareceres (create — path is empty array when no segments)
  if (segments.length === 0 && req.method === 'POST') {
    const user = requireAuth(req, res);
    if (!user) return;
    const validation = validateParecer(req.body);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error, code: 'VALIDATION_ERROR' });
    }
    try {
      const parecer = await createParecer(req.body);
      return res.status(201).json(parecer);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(404).json({ error: 'Endpoint nao encontrado' });
};
