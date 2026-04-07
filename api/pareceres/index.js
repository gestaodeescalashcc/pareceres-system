const { createParecer } = require('../../lib/services/indexService');
const { requireAuth } = require('../../lib/auth');
const { validateParecer } = require('../../lib/validate');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const user = requireAuth(req, res);
  if (!user) return;

  const validation = validateParecer(req.body);
  if (!validation.valid) {
    return res.status(400).json({ error: validation.error, code: 'VALIDATION_ERROR' });
  }

  try {
    const parecer = await createParecer(req.body);
    res.status(201).json(parecer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
