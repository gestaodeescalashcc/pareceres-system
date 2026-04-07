-- ============================================================
-- Schema para Supabase (PostgreSQL) — Sistema de Pareceres
-- Execute este script no SQL Editor do Supabase
-- ============================================================

-- 1. Tabela principal: pareceres
CREATE TABLE IF NOT EXISTS pareceres (
  id SERIAL PRIMARY KEY,
  numero TEXT NOT NULL,
  tipo TEXT NOT NULL DEFAULT 'consultivo',
  orgao TEXT NOT NULL,
  orgao_solicitante TEXT,
  autor TEXT,
  assunto TEXT NOT NULL,
  ementa TEXT,
  texto_completo TEXT,
  fundamentacao_legal TEXT,
  conclusao TEXT,
  materia TEXT,
  status TEXT DEFAULT 'vigente',
  parecer_revogador TEXT,
  data_emissao TEXT NOT NULL,
  ano INTEGER NOT NULL,
  nup TEXT,
  palavras_chave TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ DEFAULT NULL,
  -- Coluna FTS (tsvector)
  fts_vector TSVECTOR
);

-- Indices
CREATE INDEX IF NOT EXISTS idx_pareceres_ano ON pareceres(ano);
CREATE INDEX IF NOT EXISTS idx_pareceres_tipo ON pareceres(tipo);
CREATE INDEX IF NOT EXISTS idx_pareceres_orgao ON pareceres(orgao);
CREATE INDEX IF NOT EXISTS idx_pareceres_materia ON pareceres(materia);
CREATE INDEX IF NOT EXISTS idx_pareceres_status ON pareceres(status);
CREATE INDEX IF NOT EXISTS idx_pareceres_numero ON pareceres(numero);
CREATE INDEX IF NOT EXISTS idx_pareceres_fts ON pareceres USING GIN(fts_vector);

-- 2. Tabela de relacionados
CREATE TABLE IF NOT EXISTS pareceres_relacionados (
  id SERIAL PRIMARY KEY,
  parecer_id INTEGER NOT NULL REFERENCES pareceres(id) ON DELETE CASCADE,
  relacionado_id INTEGER NOT NULL REFERENCES pareceres(id) ON DELETE CASCADE,
  tipo_relacao TEXT NOT NULL DEFAULT 'cita',
  UNIQUE(parecer_id, relacionado_id)
);

CREATE INDEX IF NOT EXISTS idx_relacionados_parecer ON pareceres_relacionados(parecer_id);
CREATE INDEX IF NOT EXISTS idx_relacionados_relacao ON pareceres_relacionados(relacionado_id);

-- 3. Log de acessos
CREATE TABLE IF NOT EXISTS acessos_log (
  id SERIAL PRIMARY KEY,
  parecer_id INTEGER,
  acao TEXT NOT NULL,
  termo_busca TEXT,
  ip TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_acessos_parecer ON acessos_log(parecer_id);
CREATE INDEX IF NOT EXISTS idx_acessos_created ON acessos_log(created_at);

-- 4. Usuarios admin
CREATE TABLE IF NOT EXISTS admin_users (
  id SERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  senha_hash TEXT NOT NULL,
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- FTS: Funcao e Trigger para atualizar tsvector automaticamente
-- ============================================================

CREATE OR REPLACE FUNCTION pareceres_fts_update() RETURNS TRIGGER AS $$
BEGIN
  NEW.fts_vector :=
    setweight(to_tsvector('portuguese', COALESCE(NEW.numero, '')), 'A') ||
    setweight(to_tsvector('portuguese', COALESCE(NEW.assunto, '')), 'A') ||
    setweight(to_tsvector('portuguese', COALESCE(NEW.ementa, '')), 'B') ||
    setweight(to_tsvector('portuguese', COALESCE(NEW.palavras_chave, '')), 'B') ||
    setweight(to_tsvector('portuguese', COALESCE(NEW.fundamentacao_legal, '')), 'C') ||
    setweight(to_tsvector('portuguese', COALESCE(NEW.conclusao, '')), 'C') ||
    setweight(to_tsvector('portuguese', COALESCE(NEW.texto_completo, '')), 'D');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS pareceres_fts_trigger ON pareceres;
CREATE TRIGGER pareceres_fts_trigger
  BEFORE INSERT OR UPDATE ON pareceres
  FOR EACH ROW EXECUTE FUNCTION pareceres_fts_update();

-- ============================================================
-- RPC: Busca full-text com ranking, snippets e filtros
-- ============================================================

CREATE OR REPLACE FUNCTION search_pareceres(
  search_query TEXT DEFAULT NULL,
  filter_tipo TEXT DEFAULT NULL,
  filter_orgao TEXT DEFAULT NULL,
  filter_materia TEXT DEFAULT NULL,
  filter_ano INTEGER DEFAULT NULL,
  filter_status TEXT DEFAULT NULL,
  filter_autor TEXT DEFAULT NULL,
  filter_data_inicio TEXT DEFAULT NULL,
  filter_data_fim TEXT DEFAULT NULL,
  sort_by TEXT DEFAULT 'relevancia',
  page_num INTEGER DEFAULT 1,
  page_limit INTEGER DEFAULT 20
)
RETURNS JSON AS $$
DECLARE
  tsq TSQUERY;
  result JSON;
  total_count INTEGER;
  off_val INTEGER;
BEGIN
  off_val := (page_num - 1) * page_limit;

  -- Build tsquery from search terms
  IF search_query IS NOT NULL AND TRIM(search_query) != '' THEN
    -- Replace PT operators
    search_query := REGEXP_REPLACE(search_query, '\mE\M', '&', 'gi');
    search_query := REGEXP_REPLACE(search_query, '\mOU\M', '|', 'gi');
    search_query := REGEXP_REPLACE(search_query, '\mNAO\M', '!', 'gi');
    search_query := REGEXP_REPLACE(search_query, '\mNÃO\M', '!', 'gi');

    BEGIN
      -- Try plainto_tsquery first (handles most user input safely)
      tsq := plainto_tsquery('portuguese', search_query);
      -- If it produces an empty query, try websearch
      IF tsq::TEXT = '' THEN
        tsq := websearch_to_tsquery('portuguese', search_query);
      END IF;
    EXCEPTION WHEN OTHERS THEN
      tsq := plainto_tsquery('portuguese', search_query);
    END;
  END IF;

  -- Count total
  SELECT COUNT(*) INTO total_count
  FROM pareceres p
  WHERE p.deleted_at IS NULL
    AND (tsq IS NULL OR p.fts_vector @@ tsq)
    AND (filter_tipo IS NULL OR p.tipo = filter_tipo)
    AND (filter_orgao IS NULL OR p.orgao = filter_orgao)
    AND (filter_materia IS NULL OR p.materia = filter_materia)
    AND (filter_ano IS NULL OR p.ano = filter_ano)
    AND (filter_status IS NULL OR p.status = filter_status)
    AND (filter_autor IS NULL OR p.autor ILIKE '%' || filter_autor || '%')
    AND (filter_data_inicio IS NULL OR p.data_emissao >= filter_data_inicio)
    AND (filter_data_fim IS NULL OR p.data_emissao <= filter_data_fim);

  -- Get results
  SELECT json_build_object(
    'resultados', COALESCE((
      SELECT json_agg(row_to_json(t))
      FROM (
        SELECT
          p.id, p.numero, p.tipo, p.orgao, p.autor, p.assunto,
          p.ementa, p.materia, p.status, p.data_emissao, p.ano, p.nup,
          p.palavras_chave, p.created_at,
          CASE
            WHEN tsq IS NOT NULL THEN ts_headline('portuguese', COALESCE(p.ementa, p.assunto, ''), tsq, 'StartSel=<mark>, StopSel=</mark>, MaxFragments=2, MaxWords=80, MinWords=30')
            ELSE SUBSTRING(p.ementa FROM 1 FOR 200)
          END AS snippet,
          CASE
            WHEN tsq IS NOT NULL THEN ts_rank(p.fts_vector, tsq)
            ELSE 0
          END AS rank
        FROM pareceres p
        WHERE p.deleted_at IS NULL
          AND (tsq IS NULL OR p.fts_vector @@ tsq)
          AND (filter_tipo IS NULL OR p.tipo = filter_tipo)
          AND (filter_orgao IS NULL OR p.orgao = filter_orgao)
          AND (filter_materia IS NULL OR p.materia = filter_materia)
          AND (filter_ano IS NULL OR p.ano = filter_ano)
          AND (filter_status IS NULL OR p.status = filter_status)
          AND (filter_autor IS NULL OR p.autor ILIKE '%' || filter_autor || '%')
          AND (filter_data_inicio IS NULL OR p.data_emissao >= filter_data_inicio)
          AND (filter_data_fim IS NULL OR p.data_emissao <= filter_data_fim)
        ORDER BY
          CASE
            WHEN sort_by = 'data_desc' THEN NULL
            WHEN sort_by = 'data_asc' THEN NULL
            WHEN sort_by = 'numero' THEN NULL
            ELSE CASE WHEN tsq IS NOT NULL THEN ts_rank(p.fts_vector, tsq) ELSE 0 END
          END DESC NULLS LAST,
          CASE WHEN sort_by = 'data_desc' THEN p.data_emissao END DESC,
          CASE WHEN sort_by = 'data_asc' THEN p.data_emissao END ASC,
          CASE WHEN sort_by = 'numero' THEN p.numero END ASC,
          p.data_emissao DESC
        LIMIT page_limit OFFSET off_val
      ) t
    ), '[]'::json),
    'total', total_count,
    'pagina', page_num,
    'limite', page_limit,
    'totalPaginas', CEIL(total_count::FLOAT / page_limit)
  ) INTO result;

  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- RPC: Facets (agrupamentos para filtros)
-- ============================================================

CREATE OR REPLACE FUNCTION get_facets(
  search_query TEXT DEFAULT NULL,
  filter_tipo TEXT DEFAULT NULL,
  filter_orgao TEXT DEFAULT NULL,
  filter_materia TEXT DEFAULT NULL,
  filter_status TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  tsq TSQUERY;
  result JSON;
BEGIN
  IF search_query IS NOT NULL AND TRIM(search_query) != '' THEN
    BEGIN
      tsq := plainto_tsquery('portuguese', search_query);
      IF tsq::TEXT = '' THEN
        tsq := websearch_to_tsquery('portuguese', search_query);
      END IF;
    EXCEPTION WHEN OTHERS THEN
      tsq := plainto_tsquery('portuguese', search_query);
    END;
  END IF;

  SELECT json_build_object(
    'tipos', COALESCE((
      SELECT json_agg(json_build_object('valor', tipo, 'contagem', cnt))
      FROM (
        SELECT tipo, COUNT(*) as cnt FROM pareceres
        WHERE deleted_at IS NULL AND tipo IS NOT NULL AND tipo != ''
          AND (tsq IS NULL OR fts_vector @@ tsq)
          AND (filter_tipo IS NULL OR tipo = filter_tipo)
          AND (filter_orgao IS NULL OR orgao = filter_orgao)
          AND (filter_materia IS NULL OR materia = filter_materia)
          AND (filter_status IS NULL OR status = filter_status)
        GROUP BY tipo ORDER BY cnt DESC LIMIT 20
      ) sub
    ), '[]'::json),
    'orgaos', COALESCE((
      SELECT json_agg(json_build_object('valor', orgao, 'contagem', cnt))
      FROM (
        SELECT orgao, COUNT(*) as cnt FROM pareceres
        WHERE deleted_at IS NULL AND orgao IS NOT NULL AND orgao != ''
          AND (tsq IS NULL OR fts_vector @@ tsq)
          AND (filter_tipo IS NULL OR tipo = filter_tipo)
          AND (filter_orgao IS NULL OR orgao = filter_orgao)
          AND (filter_materia IS NULL OR materia = filter_materia)
          AND (filter_status IS NULL OR status = filter_status)
        GROUP BY orgao ORDER BY cnt DESC LIMIT 20
      ) sub
    ), '[]'::json),
    'materias', COALESCE((
      SELECT json_agg(json_build_object('valor', materia, 'contagem', cnt))
      FROM (
        SELECT materia, COUNT(*) as cnt FROM pareceres
        WHERE deleted_at IS NULL AND materia IS NOT NULL AND materia != ''
          AND (tsq IS NULL OR fts_vector @@ tsq)
          AND (filter_tipo IS NULL OR tipo = filter_tipo)
          AND (filter_orgao IS NULL OR orgao = filter_orgao)
          AND (filter_materia IS NULL OR materia = filter_materia)
          AND (filter_status IS NULL OR status = filter_status)
        GROUP BY materia ORDER BY cnt DESC LIMIT 20
      ) sub
    ), '[]'::json),
    'anos', COALESCE((
      SELECT json_agg(json_build_object('valor', ano, 'contagem', cnt))
      FROM (
        SELECT ano, COUNT(*) as cnt FROM pareceres
        WHERE deleted_at IS NULL AND ano IS NOT NULL
          AND (tsq IS NULL OR fts_vector @@ tsq)
          AND (filter_tipo IS NULL OR tipo = filter_tipo)
          AND (filter_orgao IS NULL OR orgao = filter_orgao)
          AND (filter_materia IS NULL OR materia = filter_materia)
          AND (filter_status IS NULL OR status = filter_status)
        GROUP BY ano ORDER BY ano DESC LIMIT 20
      ) sub
    ), '[]'::json),
    'statuses', COALESCE((
      SELECT json_agg(json_build_object('valor', status, 'contagem', cnt))
      FROM (
        SELECT status, COUNT(*) as cnt FROM pareceres
        WHERE deleted_at IS NULL AND status IS NOT NULL AND status != ''
          AND (tsq IS NULL OR fts_vector @@ tsq)
          AND (filter_tipo IS NULL OR tipo = filter_tipo)
          AND (filter_orgao IS NULL OR orgao = filter_orgao)
          AND (filter_materia IS NULL OR materia = filter_materia)
          AND (filter_status IS NULL OR status = filter_status)
        GROUP BY status ORDER BY cnt DESC LIMIT 20
      ) sub
    ), '[]'::json)
  ) INTO result;

  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- RPC: Autocomplete
-- ============================================================

CREATE OR REPLACE FUNCTION autocomplete_pareceres(
  search_term TEXT,
  filter_tipo TEXT DEFAULT NULL,
  filter_orgao TEXT DEFAULT NULL,
  filter_materia TEXT DEFAULT NULL,
  filter_ano INTEGER DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  tsq TSQUERY;
  result JSON;
BEGIN
  IF search_term IS NULL OR TRIM(search_term) = '' THEN
    RETURN '[]'::json;
  END IF;

  -- Prefix search: add :* to each word for prefix matching
  tsq := to_tsquery('portuguese',
    array_to_string(
      array(SELECT word || ':*' FROM unnest(string_to_array(TRIM(search_term), ' ')) AS word WHERE word != ''),
      ' & '
    )
  );

  SELECT COALESCE(json_agg(row_to_json(t)), '[]'::json) INTO result
  FROM (
    SELECT p.id, p.numero, p.assunto, p.orgao, p.tipo
    FROM pareceres p
    WHERE p.deleted_at IS NULL
      AND p.fts_vector @@ tsq
      AND (filter_tipo IS NULL OR p.tipo = filter_tipo)
      AND (filter_orgao IS NULL OR p.orgao = filter_orgao)
      AND (filter_materia IS NULL OR p.materia = filter_materia)
      AND (filter_ano IS NULL OR p.ano = filter_ano)
    ORDER BY ts_rank(p.fts_vector, tsq) DESC
    LIMIT 10
  ) t;

  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- RPC: Pareceres similares
-- ============================================================

CREATE OR REPLACE FUNCTION find_similares(
  target_id INTEGER,
  result_limit INTEGER DEFAULT 5
)
RETURNS JSON AS $$
DECLARE
  target_keywords TEXT;
  target_materia TEXT;
  tsq TSQUERY;
  result JSON;
BEGIN
  SELECT palavras_chave, materia INTO target_keywords, target_materia
  FROM pareceres WHERE id = target_id;

  IF target_keywords IS NOT NULL AND TRIM(target_keywords) != '' THEN
    -- Build tsquery from first 5 keywords
    BEGIN
      tsq := to_tsquery('portuguese',
        array_to_string(
          (SELECT array_agg(TRIM(kw))
           FROM (SELECT unnest(string_to_array(target_keywords, ',')) AS kw LIMIT 5) sub
           WHERE TRIM(kw) != ''),
          ' | '
        )
      );
    EXCEPTION WHEN OTHERS THEN
      tsq := NULL;
    END;
  END IF;

  SELECT COALESCE(json_agg(row_to_json(t)), '[]'::json) INTO result
  FROM (
    (
      -- FTS-based similarity
      SELECT p.id, p.numero, p.assunto, p.orgao, p.materia, p.status, p.data_emissao, p.tipo
      FROM pareceres p
      WHERE p.id != target_id
        AND p.deleted_at IS NULL
        AND tsq IS NOT NULL
        AND p.fts_vector @@ tsq
      ORDER BY ts_rank(p.fts_vector, tsq) DESC
      LIMIT result_limit
    )
    UNION
    (
      -- Same materia fallback
      SELECT p.id, p.numero, p.assunto, p.orgao, p.materia, p.status, p.data_emissao, p.tipo
      FROM pareceres p
      WHERE p.id != target_id
        AND p.deleted_at IS NULL
        AND p.materia = target_materia
        AND p.materia IS NOT NULL
      ORDER BY p.data_emissao DESC
      LIMIT result_limit
    )
    LIMIT result_limit
  ) t;

  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- RPC: Analytics de busca
-- ============================================================

CREATE OR REPLACE FUNCTION get_search_analytics()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'trending', COALESCE((
      SELECT json_agg(json_build_object('termo', termo, 'contagem', cnt))
      FROM (
        SELECT LOWER(termo_busca) as termo, COUNT(*) as cnt
        FROM acessos_log
        WHERE acao = 'busca' AND termo_busca IS NOT NULL AND termo_busca != ''
          AND created_at >= NOW() - INTERVAL '7 days'
        GROUP BY LOWER(termo_busca)
        ORDER BY cnt DESC
        LIMIT 10
      ) sub
    ), '[]'::json),
    'totalSearches', (
      SELECT COUNT(*) FROM acessos_log
      WHERE acao = 'busca' AND created_at >= NOW() - INTERVAL '30 days'
    ),
    'totalViews', (
      SELECT COUNT(*) FROM acessos_log
      WHERE acao = 'visualizacao' AND created_at >= NOW() - INTERVAL '30 days'
    )
  ) INTO result;

  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- RPC: Estatisticas do dashboard
-- ============================================================

CREATE OR REPLACE FUNCTION get_stats()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total', (SELECT COUNT(*) FROM pareceres WHERE deleted_at IS NULL),
    'porTipo', COALESCE((
      SELECT json_agg(json_build_object('label', tipo, 'value', cnt))
      FROM (SELECT tipo as tipo, COUNT(*) as cnt FROM pareceres WHERE deleted_at IS NULL GROUP BY tipo ORDER BY cnt DESC) sub
    ), '[]'::json),
    'porOrgao', COALESCE((
      SELECT json_agg(json_build_object('label', orgao, 'value', cnt))
      FROM (SELECT orgao, COUNT(*) as cnt FROM pareceres WHERE deleted_at IS NULL GROUP BY orgao ORDER BY cnt DESC LIMIT 10) sub
    ), '[]'::json),
    'porAno', COALESCE((
      SELECT json_agg(json_build_object('label', ano, 'value', cnt))
      FROM (SELECT ano, COUNT(*) as cnt FROM pareceres WHERE deleted_at IS NULL GROUP BY ano ORDER BY ano DESC) sub
    ), '[]'::json),
    'porStatus', COALESCE((
      SELECT json_agg(json_build_object('label', status, 'value', cnt))
      FROM (SELECT status, COUNT(*) as cnt FROM pareceres WHERE deleted_at IS NULL GROUP BY status) sub
    ), '[]'::json),
    'porMateria', COALESCE((
      SELECT json_agg(json_build_object('label', materia, 'value', cnt))
      FROM (SELECT materia, COUNT(*) as cnt FROM pareceres WHERE deleted_at IS NULL AND materia IS NOT NULL GROUP BY materia ORDER BY cnt DESC) sub
    ), '[]'::json),
    'recentes', COALESCE((
      SELECT json_agg(row_to_json(t))
      FROM (SELECT id, numero, assunto, orgao, data_emissao, tipo FROM pareceres WHERE deleted_at IS NULL ORDER BY created_at DESC LIMIT 5) t
    ), '[]'::json)
  ) INTO result;

  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- Habilitar RLS (Row Level Security) — opcional mas recomendado
-- Para este sistema, vamos desabilitar RLS pois usamos service_role key
-- ============================================================

ALTER TABLE pareceres ENABLE ROW LEVEL SECURITY;
ALTER TABLE pareceres_relacionados ENABLE ROW LEVEL SECURITY;
ALTER TABLE acessos_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Politicas permissivas para service_role (bypass automatico)
-- Se quiser acesso publico de leitura via anon key, adicione:
CREATE POLICY "Leitura publica de pareceres" ON pareceres FOR SELECT USING (deleted_at IS NULL);
CREATE POLICY "Leitura publica de relacionados" ON pareceres_relacionados FOR SELECT USING (true);
CREATE POLICY "Service role full access pareceres" ON pareceres FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access relacionados" ON pareceres_relacionados FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access acessos" ON acessos_log FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access admin" ON admin_users FOR ALL USING (true) WITH CHECK (true);
