const { parseRawText } = require('../../lib/services/indexService');
const { requireAuth } = require('../../lib/auth');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const user = requireAuth(req, res);
  if (!user) return;

  try {
    const { texto } = req.body;
    if (!texto || !texto.trim()) {
      return res.status(400).json({ error: 'Texto nao pode ser vazio' });
    }

    const parsed = parseRawText(texto);
    res.json({
      modo: 'paste',
      detectado: parsed,
      mensagem: 'Dados extraidos automaticamente. Revise e confirme para salvar.'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
