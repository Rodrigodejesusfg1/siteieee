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

    const parseBody = (body) => {
      if (!body) return {};
      if (typeof body === 'object' && !Buffer.isBuffer(body)) return body;
      const text = Buffer.isBuffer(body) ? body.toString('utf-8') : String(body);
      return Object.fromEntries(new URLSearchParams(text));
    };

    const data = parseBody(req.body || req.rawBody);

    const sanitize = (value) => (typeof value === 'string' ? value.trim() : '').slice(0, 500);

    if (data._hp) {
      return res.status(400).json({ success: false, message: 'Erro de validação' });
    }

    const required = {
      team_name: sanitize(data.team_name),
      leader_name: sanitize(data.leader_name),
      leader_email: sanitize(data.leader_email),
      leader_university: sanitize(data.leader_university)
    };

    const missingFields = Object.entries(required)
      .filter(([, value]) => !value)
      .map(([key]) => key);

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Campos obrigatórios faltando: ${missingFields.join(', ')}`
      });
    }

  const termsValue = typeof data.terms === 'string' ? data.terms.toLowerCase() : '';
  const termsAccepted = ['true', 'on', '1', 'checked', 'yes'].includes(termsValue);
    if (!termsAccepted) {
      return res.status(400).json({ success: false, message: 'É necessário aceitar os termos de uso.' });
    }

    const optional = {
      member2_name: sanitize(data.member2_name),
      member2_email: sanitize(data.member2_email),
      member2_university: sanitize(data.member2_university),
      member3_name: sanitize(data.member3_name),
      member3_email: sanitize(data.member3_email),
      member3_university: sanitize(data.member3_university)
    };

    const insertData = {
      team_name: required.team_name,
      leader_name: required.leader_name,
      leader_email: required.leader_email,
      leader_university: required.leader_university,
      member2_name: optional.member2_name || null,
      member2_email: optional.member2_email || null,
      member2_university: optional.member2_university || null,
      member3_name: optional.member3_name || null,
      member3_email: optional.member3_email || null,
      member3_university: optional.member3_university || null,
      terms_accepted: termsAccepted
    };

    const { data: result, error } = await supabase
      .from('hackathon_inscricoes')
      .insert(insertData)
      .select();

    if (error) {
      return res.status(500).json({ success: false, message: error.message });
    }

    return res.status(200).json({ success: true, message: 'Inscrição enviada com sucesso!', id: result?.[0]?.id });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};