// Simple test endpoint for debugging Vercel deployment
module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  return res.status(200).json({
    success: true,
    message: 'Vercel API is working!',
    method: req.method,
    url: req.url,
    timestamp: new Date().toISOString(),
    env_check: {
      supabase_url: process.env.SUPABASE_URL ? 'configured' : 'missing',
      supabase_key: process.env.SUPABASE_KEY ? 'configured' : 'missing',
      supabase_service_key: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'configured' : 'missing'
    }
  });
};