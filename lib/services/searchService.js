const { getDb } = require('../database');

async function search({ q, tipo, orgao, materia, ano, status, autor, dataInicio, dataFim, page = 1, limit = 20, sort = 'relevancia' }) {
  const supabase = getDb();

  const { data, error } = await supabase.rpc('search_pareceres', {
    search_query: q || null,
    filter_tipo: tipo || null,
    filter_orgao: orgao || null,
    filter_materia: materia || null,
    filter_ano: ano ? parseInt(ano) : null,
    filter_status: status || null,
    filter_autor: autor || null,
    filter_data_inicio: dataInicio || null,
    filter_data_fim: dataFim || null,
    sort_by: sort,
    page_num: parseInt(page) || 1,
    page_limit: Math.min(parseInt(limit) || 20, 10000)
  });

  if (error) throw new Error(error.message);

  // Log search (fire-and-forget)
  supabase.from('acessos_log').insert({ acao: 'busca', termo_busca: q || '' }).then();

  return data;
}

async function autocomplete(q, filters = {}) {
  if (!q || q.trim().length < 2) return [];
  const supabase = getDb();

  const { data, error } = await supabase.rpc('autocomplete_pareceres', {
    search_term: q.trim(),
    filter_tipo: filters.tipo || null,
    filter_orgao: filters.orgao || null,
    filter_materia: filters.materia || null,
    filter_ano: filters.ano ? parseInt(filters.ano) : null
  });

  if (error) return [];
  return data || [];
}

async function getFacets(filters = {}) {
  const supabase = getDb();

  const { data, error } = await supabase.rpc('get_facets', {
    search_query: filters.q || null,
    filter_tipo: filters.tipo || null,
    filter_orgao: filters.orgao || null,
    filter_materia: filters.materia || null,
    filter_status: filters.status || null
  });

  if (error) return { tipos: [], orgaos: [], materias: [], anos: [], statuses: [] };
  return data;
}

async function checkDuplicate(numero) {
  const supabase = getDb();
  const { data } = await supabase
    .from('pareceres')
    .select('id, numero, assunto')
    .eq('numero', numero)
    .limit(1)
    .single();

  return data || null;
}

async function findSimilares(parecerId, limit = 5) {
  const supabase = getDb();
  const { data, error } = await supabase.rpc('find_similares', {
    target_id: parecerId,
    result_limit: limit
  });

  if (error) return [];
  return data || [];
}

async function getSearchAnalytics() {
  const supabase = getDb();
  const { data, error } = await supabase.rpc('get_search_analytics');
  if (error) throw new Error(error.message);
  return data;
}

module.exports = { search, autocomplete, getFacets, checkDuplicate, findSimilares, getSearchAnalytics };
