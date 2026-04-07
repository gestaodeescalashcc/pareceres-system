const { getDb } = require('../../lib/database');
const { requireAuth } = require('../../lib/auth');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const user = requireAuth(req, res);
  if (!user) return;

  const supabase = getDb();
  const { data: dbUser, error } = await supabase
    .from('admin_users')
    .select('id, nome, email')
    .eq('id', user.id)
    .eq('ativo', true)
    .single();

  if (error || !dbUser) return res.status(401).json({ error: 'Usuario nao encontrado' });
  res.json({ user: dbUser });
};
