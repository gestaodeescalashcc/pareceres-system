const { getDb } = require('../database');

async function createParecer(data) {
  const supabase = getDb();
  const ano = data.ano || (data.data_emissao ? parseInt(data.data_emissao.substring(0, 4)) : new Date().getFullYear());

  const row = {
    numero: data.numero,
    tipo: data.tipo || 'consultivo',
    orgao: data.orgao,
    orgao_solicitante: data.orgao_solicitante || null,
    autor: data.autor || null,
    assunto: data.assunto,
    ementa: data.ementa || null,
    texto_completo: data.texto_completo || null,
    fundamentacao_legal: data.fundamentacao_legal || null,
    conclusao: data.conclusao || null,
    materia: data.materia || null,
    status: data.status || 'vigente',
    parecer_revogador: data.parecer_revogador || null,
    data_emissao: data.data_emissao,
    ano: ano,
    nup: data.nup || null,
    palavras_chave: data.palavras_chave || null
  };

  const { data: created, error } = await supabase
    .from('pareceres')
    .insert(row)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return created;
}

async function updateParecer(id, data) {
  const supabase = getDb();
  const allowedFields = [
    'numero', 'tipo', 'orgao', 'orgao_solicitante', 'autor', 'assunto', 'ementa',
    'texto_completo', 'fundamentacao_legal', 'conclusao', 'materia', 'status',
    'parecer_revogador', 'data_emissao', 'ano', 'nup', 'palavras_chave'
  ];

  const updates = {};
  for (const field of allowedFields) {
    if (data[field] !== undefined) {
      updates[field] = data[field];
    }
  }

  if (Object.keys(updates).length === 0) return null;

  updates.updated_at = new Date().toISOString();

  const { data: updated, error } = await supabase
    .from('pareceres')
    .update(updates)
    .eq('id', id)
    .is('deleted_at', null)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return updated;
}

async function deleteParecer(id) {
  const supabase = getDb();
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from('pareceres')
    .update({ deleted_at: now, updated_at: now })
    .eq('id', id)
    .is('deleted_at', null)
    .select('id')
    .single();

  if (error || !data) return false;
  return true;
}

async function getParecerById(id) {
  const supabase = getDb();

  const { data: parecer, error } = await supabase
    .from('pareceres')
    .select('*')
    .eq('id', id)
    .is('deleted_at', null)
    .single();

  if (error || !parecer) return null;

  // Log access (fire-and-forget)
  supabase.from('acessos_log').insert({ parecer_id: id, acao: 'visualizacao' }).then();

  // Get related
  const { data: relacionados } = await supabase
    .from('pareceres_relacionados')
    .select('tipo_relacao, relacionado_id')
    .eq('parecer_id', id);

  let relacionadosCompletos = [];
  if (relacionados && relacionados.length > 0) {
    const ids = relacionados.map(r => r.relacionado_id);
    const { data: pareceres } = await supabase
      .from('pareceres')
      .select('id, numero, assunto, orgao, data_emissao, status')
      .in('id', ids);

    if (pareceres) {
      relacionadosCompletos = relacionados.map(r => {
        const p = pareceres.find(p => p.id === r.relacionado_id);
        return p ? { tipo_relacao: r.tipo_relacao, ...p } : null;
      }).filter(Boolean);
    }
  }

  return { ...parecer, relacionados: relacionadosCompletos };
}

async function addRelacionado(parecerId, relacionadoId, tipoRelacao) {
  const supabase = getDb();
  await supabase
    .from('pareceres_relacionados')
    .upsert({
      parecer_id: parecerId,
      relacionado_id: relacionadoId,
      tipo_relacao: tipoRelacao
    }, { onConflict: 'parecer_id,relacionado_id' });
}

async function getStats() {
  const supabase = getDb();
  const { data, error } = await supabase.rpc('get_stats');
  if (error) throw new Error(error.message);
  return data;
}

function parseRawText(rawText) {
  const result = {
    numero: null,
    assunto: null,
    ementa: null,
    texto_completo: rawText,
    orgao: null,
    autor: null,
    data_emissao: null,
    fundamentacao_legal: null,
    conclusao: null,
    materia: null
  };

  const numMatch = rawText.match(/PARECER\s*(?:N[°ºo.]?\s*)?(\d+[\/.]\d+[\/.]\d*[\w-]*)/i)
    || rawText.match(/(?:PARECER|PARECER\s+NORMATIVO|PARECER\s+CONSULTIVO)\s+[Nn][°ºo.]?\s*(\S+)/i);
  if (numMatch) result.numero = numMatch[1];

  const dateMatch = rawText.match(/(\d{1,2})\s*(?:de\s*)?(janeiro|fevereiro|mar[çc]o|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro)\s*(?:de\s*)?(\d{4})/i);
  if (dateMatch) {
    const months = { janeiro: '01', fevereiro: '02', 'março': '03', 'marco': '03', abril: '04', maio: '05', junho: '06', julho: '07', agosto: '08', setembro: '09', outubro: '10', novembro: '11', dezembro: '12' };
    const m = months[dateMatch[2].toLowerCase()] || '01';
    const d = dateMatch[1].padStart(2, '0');
    result.data_emissao = `${dateMatch[3]}-${m}-${d}`;
  }
  if (!result.data_emissao) {
    const dateMatch2 = rawText.match(/(\d{2})\/(\d{2})\/(\d{4})/);
    if (dateMatch2) result.data_emissao = `${dateMatch2[3]}-${dateMatch2[2]}-${dateMatch2[1]}`;
  }

  const ementaMatch = rawText.match(/EMENTA[:\s]*(.+?)(?=\n\n|\nI[\s-]|RELAT[OÓ]RIO|FUNDAMENTA[ÇC][ÃA]O)/is);
  if (ementaMatch) result.ementa = ementaMatch[1].trim();

  const orgaoMatch = rawText.match(/(?:PROCURADORIA|ADVOCACIA|CONSULTORIA|ASSESSORIA)\s+[\w\s]+(?:DO\s+ESTADO|GERAL|JUR[IÍ]DICA)/i);
  if (orgaoMatch) result.orgao = orgaoMatch[0].trim();

  const assuntoMatch = rawText.match(/ASSUNTO[:\s]*(.+?)(?:\n)/i);
  if (assuntoMatch) result.assunto = assuntoMatch[1].trim();

  const fundMatch = rawText.match(/FUNDAMENTA[ÇC][ÃA]O[:\s]*(.+?)(?=CONCLUS[ÃA]O|RECOMENDA|$)/is);
  if (fundMatch) result.fundamentacao_legal = fundMatch[1].trim().substring(0, 5000);

  const concMatch = rawText.match(/CONCLUS[ÃA]O[:\s]*(.+?)(?=\n\n\n|ASSINATURA|$)/is);
  if (concMatch) result.conclusao = concMatch[1].trim().substring(0, 3000);

  return result;
}

module.exports = { createParecer, updateParecer, deleteParecer, getParecerById, addRelacionado, getStats, parseRawText };
