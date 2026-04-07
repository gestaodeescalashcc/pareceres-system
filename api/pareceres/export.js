const { search } = require('../../lib/services/searchService');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { q, tipo, orgao, materia, ano, status } = req.query;
    const result = await search({ q, tipo, orgao, materia, ano, status, page: 1, limit: 10000 });
    const header = 'Numero;Tipo;Orgao;Assunto;Ementa;Materia;Status;Data Emissao;Ano;Autor\n';
    const csv = result.resultados.map(r =>
      [r.numero, r.tipo, r.orgao, r.assunto, (r.ementa || '').replace(/;/g, ',').replace(/\n/g, ' '), r.materia, r.status, r.data_emissao, r.ano, r.autor].join(';')
    ).join('\n');
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename=pareceres.csv');
    res.send('\uFEFF' + header + csv);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
