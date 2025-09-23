const { createClient } = require('@supabase/supabase-js');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method !== 'GET') return res.status(405).json({ status: 'method_not_allowed' });

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return res.status(200).json({ status: 'healthy', database: 'env_missing' });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    // Lightweight check: attempt to select 1 row (will pass even if table missing with specific error)
    try {
      await supabase.from('inscricoes').select('id').limit(1);
      return res.status(200).json({ status: 'healthy', database: 'connected' });
    } catch (e) {
      return res.status(200).json({ status: 'healthy', database: 'connected_but_table_missing', error: String(e) });
    }
  } catch (e) {
    return res.status(500).json({ status: 'unhealthy', error: String(e) });
  }
};
