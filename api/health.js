const { getDb } = require('../lib/database');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const supabase = getDb();
    const { error } = await supabase.from('admin_users').select('id', { count: 'exact', head: true });
    if (error) throw error;
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  } catch {
    res.status(503).json({ status: 'error', message: 'Database unavailable' });
  }
};
