const { search } = require('../../lib/services/searchService');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
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
};
