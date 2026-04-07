const bcrypt = require('bcryptjs');
const { getDb } = require('../../lib/database');
const { requireAuth, signToken } = require('../../lib/auth');

function getPath(req) {
  const url = req.url.split('?')[0];
  return url.replace(/^\/api\/auth\/?/, '').split('/').filter(Boolean).join('/');
}

module.exports = async function handler(req, res) {
  const path = getPath(req);

  if (path === 'login' && req.method === 'POST') {
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
    return res.json({ token, user: { id: user.id, nome: user.nome, email: user.email } });
  }

  if (path === 'me' && req.method === 'GET') {
    const userPayload = requireAuth(req, res);
    if (!userPayload) return;

    const supabase = getDb();
    const { data: dbUser, error } = await supabase
      .from('admin_users')
      .select('id, nome, email')
      .eq('id', userPayload.id)
      .eq('ativo', true)
      .single();

    if (error || !dbUser) return res.status(401).json({ error: 'Usuario nao encontrado' });
    return res.json({ user: dbUser });
  }

  if (path === 'change-password' && req.method === 'POST') {
    const userPayload = requireAuth(req, res);
    if (!userPayload) return;

    const { senhaAtual, novaSenha } = req.body;
    if (!senhaAtual || !novaSenha || novaSenha.length < 6) {
      return res.status(400).json({ error: 'Senha atual e nova senha (min 6 caracteres) sao obrigatorias' });
    }

    const supabase = getDb();
    const { data: dbUser, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('id', userPayload.id)
      .single();

    if (error || !dbUser || !bcrypt.compareSync(senhaAtual, dbUser.senha_hash)) {
      return res.status(401).json({ error: 'Senha atual incorreta' });
    }

    const hash = bcrypt.hashSync(novaSenha, 10);
    await supabase
      .from('admin_users')
      .update({ senha_hash: hash, updated_at: new Date().toISOString() })
      .eq('id', userPayload.id);

    return res.json({ success: true, message: 'Senha alterada com sucesso' });
  }

  return res.status(404).json({ error: 'Endpoint nao encontrado' });
};
