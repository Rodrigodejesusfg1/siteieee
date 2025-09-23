const { createClient } = require('@supabase/supabase-js');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ success: false });

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;
  
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return res.status(500).json({ success: false, message: 'Config missing' });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    const data = req.body || {};
    
    if (!data.nome || !data.email || !data.telefone || !data.faculdade || !data.ingresso) {
      return res.status(400).json({ success: false, message: 'Campos obrigatórios faltando' });
    }

    if (data._hp) {
      return res.status(400).json({ success: false, message: 'Erro de validação' });
    }

    const insertData = {
      nome: data.nome,
      email: data.email,
      telefone: data.telefone,
      faculdade: data.faculdade,
      nusp: data.nusp || '',
      ano_ingresso: parseInt(data.ingresso, 10),
      membro_ieee: data.membro_ieee || '',
      voluntario_ieee: data.voluntario_ieee || '',
      divulgacao: data.divulgacao || '',
      indicacao: data.indicacao || ''
    };

    const { data: result, error } = await supabase.from('hackathon_inscricoes').insert(insertData).select();

    if (error) {
      return res.status(500).json({ success: false, message: error.message });
    }

    return res.status(200).json({ success: true, message: 'Inscrição enviada com sucesso!', id: result?.[0]?.id });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};