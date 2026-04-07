require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const pareceresRouter = require('./routes/pareceres');
const importRouter = require('./routes/import');
const authRouter = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 3001;

// Security headers (CSP disabled for SPA)
app.use(helmet({ contentSecurityPolicy: false }));

// Gzip compression
app.use(compression());

app.use(cors({
  origin: function (origin, callback) {
    const allowed = [
      'http://localhost:5174',
      'http://localhost:3001'
    ];
    if (!origin || allowed.includes(origin) || /\.vercel\.app$/.test(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS not allowed'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.options('*', cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Muitas requisicoes. Tente novamente em 1 minuto.', code: 'RATE_LIMIT' }
});
app.use('/api/', apiLimiter);

// Serve frontend static files in production
app.use(express.static(path.join(__dirname, '..', '..', 'frontend', 'dist')));

// Login rate limiter (stricter)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Muitas tentativas de login. Tente novamente em 15 minutos.', code: 'RATE_LIMIT' }
});
app.use('/api/auth/login', loginLimiter);

// API routes
app.use('/api/auth', authRouter);
app.use('/api/pareceres', pareceresRouter);
app.use('/api/import', importRouter);

// Health check
app.get('/api/health', async (req, res) => {
  const { getDb } = require('./database');
  try {
    const supabase = getDb();
    const { error } = await supabase.from('admin_users').select('id', { count: 'exact', head: true });
    if (error) throw error;
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  } catch {
    res.status(503).json({ status: 'error', message: 'Database unavailable' });
  }
});

// 404 handler for API routes
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'Endpoint nao encontrado', code: 'NOT_FOUND' });
});

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', '..', 'frontend', 'dist', 'index.html'));
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(`[ERROR] ${req.method} ${req.path}:`, err.message);
  const status = err.status || 500;
  res.status(status).json({
    error: status === 500 ? 'Erro interno do servidor' : err.message,
    code: err.code || 'INTERNAL_ERROR'
  });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
  console.log(`API disponivel em http://localhost:${PORT}/api/pareceres`);
});
