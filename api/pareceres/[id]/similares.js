const { findSimilares } = require('../../../lib/services/searchService');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const id = parseInt(req.query.id);
  if (isNaN(id)) return res.status(400).json({ error: 'ID invalido' });

  try {
    const limit = Math.min(parseInt(req.query.limit) || 5, 20);
    const results = await findSimilares(id, limit);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
