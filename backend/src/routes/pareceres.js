const express = require('express');
const router = express.Router();
const { search, autocomplete, getFacets, checkDuplicate, findSimilares, getSearchAnalytics } = require('../services/searchService');
const { createParecer, updateParecer, deleteParecer, getParecerById, addRelacionado, getStats } = require('../services/indexService');
const { validateParecer } = require('../middleware/validate');
const { requireAuth } = require('../middleware/auth');

// Search
router.get('/search', async (req, res) => {
  try {
    const { q, tipo, orgao, materia, ano, status, autor, data_inicio, data_fim, page, limit, sort } = req.query;
    const result = await search({
      q, tipo, orgao, materia, ano, status, autor,
      dataInicio: data_inicio, dataFim: data_fim,
      page: parseInt(page) || 1,
      limit: Math.min(parseInt(limit) || 20, 100),
      sort: sort || 'relevancia'
    });
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: 'Erro na busca: ' + err.message });
  }
});

// Autocomplete (contextual — accepts filters)
router.get('/autocomplete', async (req, res) => {
  try {
    const { q, tipo, orgao, materia, ano } = req.query;
    const results = await autocomplete(q, { tipo, orgao, materia, ano });
    res.json(results);
  } catch (err) {
    res.json([]);
  }
});

// Check duplicate
router.get('/check-duplicate', async (req, res) => {
  const { numero } = req.query;
  if (!numero) return res.json({ exists: false });
  const existing = await checkDuplicate(numero);
  res.json({ exists: !!existing, parecer: existing });
});

// Facets
router.get('/facets', async (req, res) => {
  try {
    const facets = await getFacets(req.query);
    res.json(facets);
  } catch (err) {
    res.json({ tipos: [], orgaos: [], materias: [], anos: [], statuses: [] });
  }
});

// Analytics / trending
router.get('/analytics/trending', async (req, res) => {
  try {
    const analytics = await getSearchAnalytics();
    res.json(analytics);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Stats
router.get('/stats', async (req, res) => {
  try {
    const stats = await getStats();
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Export CSV
router.get('/export', async (req, res) => {
  try {
    const { q, tipo, orgao, materia, ano, status } = req.query;
    const result = await search({ q, tipo, orgao, materia, ano, status, page: 1, limit: 10000 });
    const header = 'Numero;Tipo;Orgao;Assunto;Ementa;Materia;Status;Data Emissao;Ano;Autor\n';
    const csv = result.resultados.map(r =>
      [r.numero, r.tipo, r.orgao, r.assunto, (r.ementa || '').replace(/;/g, ',').replace(/\n/g, ' '), r.materia, r.status, r.data_emissao, r.ano, r.autor].join(';')
    ).join('\n');
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename=pareceres.csv');
    res.send('\uFEFF' + header + csv);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Similar pareceres
router.get('/:id/similares', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 5, 20);
    const results = await findSimilares(parseInt(req.params.id), limit);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get by ID
router.get('/:id', async (req, res) => {
  const parecer = await getParecerById(parseInt(req.params.id));
  if (!parecer) return res.status(404).json({ error: 'Parecer nao encontrado' });
  res.json(parecer);
});

// Create
router.post('/', requireAuth, validateParecer, async (req, res) => {
  try {
    const parecer = await createParecer(req.body);
    res.status(201).json(parecer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const parecer = await updateParecer(parseInt(req.params.id), req.body);
    if (!parecer) return res.status(404).json({ error: 'Parecer nao encontrado' });
    res.json(parecer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete
router.delete('/:id', requireAuth, async (req, res) => {
  const deleted = await deleteParecer(parseInt(req.params.id));
  if (!deleted) return res.status(404).json({ error: 'Parecer nao encontrado' });
  res.json({ success: true });
});

// Related
router.get('/:id/relacionados', async (req, res) => {
  const parecer = await getParecerById(parseInt(req.params.id));
  if (!parecer) return res.status(404).json({ error: 'Parecer nao encontrado' });
  res.json(parecer.relacionados || []);
});

router.post('/:id/relacionados', requireAuth, async (req, res) => {
  try {
    const { relacionado_id, tipo_relacao } = req.body;
    await addRelacionado(parseInt(req.params.id), relacionado_id, tipo_relacao || 'cita');
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
