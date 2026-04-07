const bcrypt = require('bcryptjs');
const { getDb } = require('../../lib/database');
const { requireAuth } = require('../../lib/auth');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const user = requireAuth(req, res);
  if (!user) return;

  const { senhaAtual, novaSenha } = req.body;
  if (!senhaAtual || !novaSenha || novaSenha.length < 6) {
    return res.status(400).json({ error: 'Senha atual e nova senha (min 6 caracteres) sao obrigatorias' });
  }

  const supabase = getDb();
  const { data: dbUser, error } = await supabase
    .from('admin_users')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error || !dbUser || !bcrypt.compareSync(senhaAtual, dbUser.senha_hash)) {
    return res.status(401).json({ error: 'Senha atual incorreta' });
  }

  const hash = bcrypt.hashSync(novaSenha, 10);
  await supabase
    .from('admin_users')
    .update({ senha_hash: hash, updated_at: new Date().toISOString() })
    .eq('id', user.id);

  res.json({ success: true, message: 'Senha alterada com sucesso' });
};
