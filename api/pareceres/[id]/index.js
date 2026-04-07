const { getParecerById, updateParecer, deleteParecer } = require('../../../lib/services/indexService');
const { requireAuth } = require('../../../lib/auth');

module.exports = async function handler(req, res) {
  const id = parseInt(req.query.id);
  if (isNaN(id)) return res.status(400).json({ error: 'ID invalido' });

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

  return res.status(405).json({ error: 'Method not allowed' });
};
