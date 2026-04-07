const { checkDuplicate } = require('../../lib/services/searchService');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  const { numero } = req.query;
  if (!numero) return res.json({ exists: false });
  const existing = await checkDuplicate(numero);
  res.json({ exists: !!existing, parecer: existing });
};
