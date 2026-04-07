const { createParecer } = require('../../lib/services/indexService');
const { requireAuth } = require('../../lib/auth');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const user = requireAuth(req, res);
  if (!user) return;

  try {
    const required = ['numero', 'orgao', 'assunto', 'data_emissao'];
    for (const field of required) {
      if (!req.body[field]) return res.status(400).json({ error: `Campo obrigatorio: ${field}` });
    }
    const parecer = await createParecer(req.body);
    res.status(201).json(parecer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
