const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabase;

function getDb() {
  if (!supabase) {
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY devem estar definidos');
    }
    supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false }
    });
    seedDefaultAdmin().catch(err => console.error('[SEED ERROR]', err.message));
  }
  return supabase;
}

async function seedDefaultAdmin() {
  const sb = getDb();
  const { count } = await sb.from('admin_users').select('*', { count: 'exact', head: true });
  if (count === 0) {
    const hash = bcrypt.hashSync('admin123', 10);
    await sb.from('admin_users').insert({
      nome: 'Administrador',
      email: 'admin@pareceres.gov.br',
      senha_hash: hash
    });
    console.log('[SEED] Admin padrao criado: admin@pareceres.gov.br / admin123');
  }
}

module.exports = { getDb };
