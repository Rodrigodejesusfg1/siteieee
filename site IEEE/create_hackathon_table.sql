-- Tabela para inscrições do hackathon
CREATE TABLE IF NOT EXISTS hackathon_inscricoes (
  id SERIAL PRIMARY KEY,
  nome1 VARCHAR(255) NOT NULL,
  nome2 VARCHAR(255) NOT NULL,
  nome3 VARCHAR(255) NOT NULL,
  nusp1 VARCHAR(50),
  nusp2 VARCHAR(50),
  nusp3 VARCHAR(50),
  celular VARCHAR(50) NOT NULL,
  email VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE hackathon_inscricoes ENABLE ROW LEVEL SECURITY;
-- Resetar e recriar políticas de forma compatível
DROP POLICY IF EXISTS "Allow anon inserts hackathon" ON hackathon_inscricoes;
DROP POLICY IF EXISTS "Allow authenticated inserts hackathon" ON hackathon_inscricoes;
DROP POLICY IF EXISTS "Enable insert for public" ON hackathon_inscricoes;
DROP POLICY IF EXISTS "Enable select for public" ON hackathon_inscricoes;

-- Políticas permissivas para uso com chave anon (PostgREST usa role 'anon', que é membro de 'public')
CREATE POLICY "Enable insert for public" ON hackathon_inscricoes
  FOR INSERT TO public
  WITH CHECK (true);

-- (Opcional) permitir SELECT público (útil para debugging)
CREATE POLICY "Enable select for public" ON hackathon_inscricoes
  FOR SELECT TO public
  USING (true);

-- Garantir permissões explícitas
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT INSERT, SELECT ON hackathon_inscricoes TO anon, authenticated;

-- Atualizar cache do PostgREST (se necessário)
-- NOTIFY pgrst, 'reload schema';

CREATE INDEX IF NOT EXISTS idx_hackathon_email ON hackathon_inscricoes(email);
CREATE INDEX IF NOT EXISTS idx_hackathon_created ON hackathon_inscricoes(created_at);
