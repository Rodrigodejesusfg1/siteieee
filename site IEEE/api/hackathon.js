// Vercel Serverless Function: /api/hackathon
// Inserts hackathon team registration into Supabase
const { createClient } = require('@supabase/supabase-js');

function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function parseUrlEncoded(body) {
  const params = new URLSearchParams(body);
  const obj = {};
  for (const [k, v] of params.entries()) obj[k] = v;
  return obj;
}

async function getBody(req) {
  if (req.body && Object.keys(req.body).length) return req.body;
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => (data += chunk));
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
}

module.exports = async (req, res) => {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ success: false, message: 'Method not allowed' });

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return res.status(500).json({ success: false, message: 'Supabase env vars not configured' });
  }
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

  try {
    const contentType = (req.headers['content-type'] || '').toLowerCase();
    const raw = await getBody(req);
    let data = {};
    if (typeof raw === 'string' && contentType.includes('application/x-www-form-urlencoded')) {
      data = parseUrlEncoded(raw);
    } else if (typeof raw === 'string' && contentType.includes('application/json')) {
      data = JSON.parse(raw || '{}');
    } else if (typeof raw === 'object') {
      data = raw;
    }

    if (!data || Object.keys(data).length === 0) {
      return res.status(400).json({ success: false, message: 'Nenhum dado recebido' });
    }

    const required = ['nome1', 'nome2', 'nome3', 'celular', 'email'];
    const missing = required.filter((f) => !data[f]);
    if (missing.length) {
      return res.status(400).json({ success: false, message: `Campos obrigatórios faltando: ${missing.join(', ')}` });
    }
    if (data._hp) {
      return res.status(400).json({ success: false, message: 'Erro de validação' });
    }

    const payload = {
      nome1: data.nome1 || '',
      nome2: data.nome2 || '',
      nome3: data.nome3 || '',
      nusp1: data.nusp1 || '',
      nusp2: data.nusp2 || '',
      nusp3: data.nusp3 || '',
      celular: data.celular || '',
      email: data.email || ''
    };

    const { data: inserted, error } = await supabase.from('hackathon_inscricoes').insert(payload).select();
    if (error) {
      return res.status(500).json({ success: false, message: 'Erro ao salvar dados no banco', technical_error: error.message });
    }
    return res.status(200).json({ success: true, message: 'Inscrição do hackathon enviada com sucesso!', id: inserted?.[0]?.id });
  } catch (e) {
    return res.status(500).json({ success: false, message: 'Erro interno', technical_error: String(e) });
  }
}
