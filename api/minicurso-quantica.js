const { createClient } = require('@supabase/supabase-js');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ success: false, message: 'Método não permitido' });

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return res.status(500).json({ success: false, message: 'Configurações do Supabase ausentes' });
  }

  const parseBody = (body) => {
    if (!body) return {};
    if (typeof body === 'object' && !Buffer.isBuffer(body)) return body;
    const text = Buffer.isBuffer(body) ? body.toString('utf-8') : String(body);
    return Object.fromEntries(new URLSearchParams(text));
  };

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    const data = parseBody(req.body || req.rawBody);

    const sanitize = (value, max = 200) => {
      if (typeof value !== 'string') return '';
      return value.trim().slice(0, max);
    };

    if (data._hp) {
      return res.status(400).json({ success: false, message: 'Erro de validação' });
    }

    const nome = sanitize(data.nome, 150);
    const telefone = sanitize(data.telefone, 50);
    const email = sanitize(data.email, 160);
    const nusp = sanitize(data.nusp, 30);

    if (!nome || !telefone || !email) {
      return res.status(400).json({ success: false, message: 'Nome, telefone e e-mail são obrigatórios.' });
    }

    const insertData = {
      nome,
      telefone,
      email,
      nusp: nusp || null
    };

    const { data: result, error } = await supabase
      .from('minicurso_quantica_inscricoes')
      .insert(insertData)
      .select();

    if (error) {
      return res.status(500).json({ success: false, message: error.message });
    }

    return res.status(200).json({ success: true, message: 'Inscrição registrada com sucesso!', id: result?.[0]?.id });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
