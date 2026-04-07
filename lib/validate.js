function validateParecer(body) {
  // Sanitize
  ['numero', 'orgao', 'assunto'].forEach(f => {
    if (body[f] && typeof body[f] === 'string') body[f] = body[f].trim();
  });

  // Required
  const required = ['numero', 'orgao', 'assunto', 'data_emissao'];
  for (const field of required) {
    if (!body[field] && body[field] !== 0) {
      return { valid: false, error: `Campo obrigatorio: ${field}` };
    }
  }

  // Max lengths
  const maxLens = {
    numero: 100, orgao: 200, assunto: 500, ementa: 5000,
    texto_completo: 100000, fundamentacao_legal: 10000, conclusao: 10000
  };
  for (const [field, max] of Object.entries(maxLens)) {
    if (body[field] && String(body[field]).length > max) {
      return { valid: false, error: `${field} excede ${max} caracteres` };
    }
  }

  // Date
  if (body.data_emissao) {
    const d = body.data_emissao;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(d) || isNaN(Date.parse(d))) {
      return { valid: false, error: 'data_emissao deve ser uma data valida (YYYY-MM-DD)' };
    }
  }

  // Enums
  if (body.tipo && !['consultivo', 'normativo', 'sistemico'].includes(body.tipo)) {
    return { valid: false, error: 'tipo deve ser um de: consultivo, normativo, sistemico' };
  }
  if (body.status && !['vigente', 'revogado', 'suspenso', 'parcialmente vigente'].includes(body.status)) {
    return { valid: false, error: 'status deve ser um de: vigente, revogado, suspenso, parcialmente vigente' };
  }

  return { valid: true };
}

module.exports = { validateParecer };
