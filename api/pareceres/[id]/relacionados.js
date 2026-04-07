const { getParecerById, addRelacionado } = require('../../../lib/services/indexService');
const { requireAuth } = require('../../../lib/auth');

module.exports = async function handler(req, res) {
  const id = parseInt(req.query.id);
  if (isNaN(id)) return res.status(400).json({ error: 'ID invalido' });

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

  return res.status(405).json({ error: 'Method not allowed' });
};
