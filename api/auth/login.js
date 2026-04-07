const bcrypt = require('bcryptjs');
const { getDb } = require('../../lib/database');
const { signToken } = require('../../lib/auth');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email e senha sao obrigatorios' });
  }

  const supabase = getDb();
  const { data: user, error } = await supabase
    .from('admin_users')
    .select('*')
    .eq('email', email)
    .eq('ativo', true)
    .single();

  if (error || !user || !bcrypt.compareSync(password, user.senha_hash)) {
    return res.status(401).json({ error: 'Email ou senha incorretos' });
  }

  const token = signToken(user);
  res.json({ token, user: { id: user.id, nome: user.nome, email: user.email } });
};
