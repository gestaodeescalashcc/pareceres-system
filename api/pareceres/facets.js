const { getFacets } = require('../../lib/services/searchService');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const facets = await getFacets(req.query);
    res.json(facets);
  } catch {
    res.json({ tipos: [], orgaos: [], materias: [], anos: [], statuses: [] });
  }
};
