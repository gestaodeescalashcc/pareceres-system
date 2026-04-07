const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'pareceres-jwt-secret-change-in-production';
const JWT_EXPIRES = '8h';

function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token nao fornecido', code: 'UNAUTHORIZED' });
  }
  try {
    const token = header.split(' ')[1];
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch {
    return res.status(401).json({ error: 'Token invalido ou expirado', code: 'UNAUTHORIZED' });
  }
}

function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, nome: user.nome },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES }
  );
}

module.exports = { requireAuth, signToken, JWT_SECRET };
