const { autocomplete } = require('../../lib/services/searchService');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { q, tipo, orgao, materia, ano } = req.query;
    const results = await autocomplete(q, { tipo, orgao, materia, ano });
    res.json(results);
  } catch {
    res.json([]);
  }
};
