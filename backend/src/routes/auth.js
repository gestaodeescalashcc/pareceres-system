const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const { getDb } = require('../database');
const { requireAuth, signToken } = require('../middleware/auth');

// Login
router.post('/login', async (req, res) => {
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
});

// Verify current session
router.get('/me', requireAuth, async (req, res) => {
  const supabase = getDb();
  const { data: user, error } = await supabase
    .from('admin_users')
    .select('id, nome, email')
    .eq('id', req.user.id)
    .eq('ativo', true)
    .single();

  if (error || !user) return res.status(401).json({ error: 'Usuario nao encontrado' });
  res.json({ user });
});

// Change password
router.post('/change-password', requireAuth, async (req, res) => {
  const { senhaAtual, novaSenha } = req.body;
  if (!senhaAtual || !novaSenha || novaSenha.length < 6) {
    return res.status(400).json({ error: 'Senha atual e nova senha (min 6 caracteres) sao obrigatorias' });
  }
  const supabase = getDb();
  const { data: user, error } = await supabase
    .from('admin_users')
    .select('*')
    .eq('id', req.user.id)
    .single();

  if (error || !user || !bcrypt.compareSync(senhaAtual, user.senha_hash)) {
    return res.status(401).json({ error: 'Senha atual incorreta' });
  }
  const hash = bcrypt.hashSync(novaSenha, 10);
  await supabase
    .from('admin_users')
    .update({ senha_hash: hash, updated_at: new Date().toISOString() })
    .eq('id', req.user.id);

  res.json({ success: true, message: 'Senha alterada com sucesso' });
});

module.exports = router;
