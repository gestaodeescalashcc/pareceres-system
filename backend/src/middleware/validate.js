function required(field) {
  return (req, res, next) => {
    if (!req.body[field] && req.body[field] !== 0) {
      return res.status(400).json({ error: `Campo obrigatorio: ${field}`, code: 'VALIDATION_ERROR' });
    }
    next();
  };
}

function maxLen(field, max) {
  return (req, res, next) => {
    if (req.body[field] && String(req.body[field]).length > max) {
      return res.status(400).json({ error: `${field} excede ${max} caracteres`, code: 'VALIDATION_ERROR' });
    }
    next();
  };
}

function isDate(field) {
  return (req, res, next) => {
    if (req.body[field]) {
      const d = req.body[field];
      if (!/^\d{4}-\d{2}-\d{2}$/.test(d) || isNaN(Date.parse(d))) {
        return res.status(400).json({ error: `${field} deve ser uma data valida (YYYY-MM-DD)`, code: 'VALIDATION_ERROR' });
      }
    }
    next();
  };
}

function isIn(field, allowed) {
  return (req, res, next) => {
    if (req.body[field] && !allowed.includes(req.body[field])) {
      return res.status(400).json({ error: `${field} deve ser um de: ${allowed.join(', ')}`, code: 'VALIDATION_ERROR' });
    }
    next();
  };
}

function sanitizeString(field) {
  return (req, res, next) => {
    if (req.body[field] && typeof req.body[field] === 'string') {
      req.body[field] = req.body[field].trim();
    }
    next();
  };
}

const validateParecer = [
  sanitizeString('numero'),
  sanitizeString('orgao'),
  sanitizeString('assunto'),
  required('numero'),
  required('orgao'),
  required('assunto'),
  required('data_emissao'),
  maxLen('numero', 100),
  maxLen('orgao', 200),
  maxLen('assunto', 500),
  maxLen('ementa', 5000),
  maxLen('texto_completo', 100000),
  maxLen('fundamentacao_legal', 10000),
  maxLen('conclusao', 10000),
  isDate('data_emissao'),
  isIn('tipo', ['consultivo', 'normativo', 'sistemico']),
  isIn('status', ['vigente', 'revogado', 'suspenso', 'parcialmente vigente']),
];

module.exports = { required, maxLen, isDate, isIn, sanitizeString, validateParecer };
