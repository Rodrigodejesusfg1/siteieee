-- Tabela para inscrições do hackathon
CREATE TABLE IF NOT EXISTS hackathon_inscricoes (
  id SERIAL PRIMARY KEY,
  team_name VARCHAR(255) NOT NULL,
  leader_name VARCHAR(255) NOT NULL,
  leader_email VARCHAR(255) NOT NULL,
  leader_university VARCHAR(255) NOT NULL,
  member2_name VARCHAR(255),
  member2_email VARCHAR(255),
  member2_university VARCHAR(255),
  member3_name VARCHAR(255),
  member3_email VARCHAR(255),
  member3_university VARCHAR(255),
  terms_accepted BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Garantir que tabelas legadas recebam as novas colunas obrigatórias/opcionais
ALTER TABLE hackathon_inscricoes
  ADD COLUMN IF NOT EXISTS team_name VARCHAR(255) DEFAULT 'Equipe sem nome' NOT NULL,
  ADD COLUMN IF NOT EXISTS leader_name VARCHAR(255) DEFAULT 'N/A' NOT NULL,
  ADD COLUMN IF NOT EXISTS leader_email VARCHAR(255) DEFAULT 'N/A' NOT NULL,
  ADD COLUMN IF NOT EXISTS leader_university VARCHAR(255) DEFAULT 'N/A' NOT NULL,
  ADD COLUMN IF NOT EXISTS member2_name VARCHAR(255),
  ADD COLUMN IF NOT EXISTS member2_email VARCHAR(255),
  ADD COLUMN IF NOT EXISTS member2_university VARCHAR(255),
  ADD COLUMN IF NOT EXISTS member3_name VARCHAR(255),
  ADD COLUMN IF NOT EXISTS member3_email VARCHAR(255),
  ADD COLUMN IF NOT EXISTS member3_university VARCHAR(255),
  ADD COLUMN IF NOT EXISTS terms_accepted BOOLEAN DEFAULT FALSE NOT NULL;

-- Migrar dados dos campos antigos (nome1, email, etc.) para as novas colunas
DO $$
DECLARE
  has_nome1 BOOLEAN := EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'hackathon_inscricoes' AND column_name = 'nome1'
  );
  has_nome2 BOOLEAN := EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'hackathon_inscricoes' AND column_name = 'nome2'
  );
  has_nome3 BOOLEAN := EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'hackathon_inscricoes' AND column_name = 'nome3'
  );
  has_email BOOLEAN := EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'hackathon_inscricoes' AND column_name = 'email'
  );
BEGIN
  IF has_nome1 THEN
    EXECUTE $$
      UPDATE hackathon_inscricoes
      SET leader_name = COALESCE(NULLIF(leader_name, ''), NULLIF(nome1, '')), 
          team_name = CASE
                        WHEN team_name IS NULL OR team_name = '' OR team_name = 'Equipe sem nome' THEN
                          CONCAT('Equipe de ', COALESCE(NULLIF(nome1, ''), 'Participante'))
                        ELSE team_name
                      END
      WHERE nome1 IS NOT NULL AND nome1 <> '';
    $$;
  END IF;

  IF has_email THEN
    EXECUTE $$
      UPDATE hackathon_inscricoes
      SET leader_email = COALESCE(NULLIF(leader_email, ''), email)
      WHERE (leader_email IS NULL OR leader_email = '' OR leader_email = 'N/A')
        AND email IS NOT NULL AND email <> '';
    $$;
  END IF;

  IF has_nome2 THEN
    EXECUTE $$
      UPDATE hackathon_inscricoes
      SET member2_name = COALESCE(NULLIF(member2_name, ''), NULLIF(nome2, ''))
      WHERE nome2 IS NOT NULL AND nome2 <> '';
    $$;
  END IF;

  IF has_nome3 THEN
    EXECUTE $$
      UPDATE hackathon_inscricoes
      SET member3_name = COALESCE(NULLIF(member3_name, ''), NULLIF(nome3, ''))
      WHERE nome3 IS NOT NULL AND nome3 <> '';
    $$;
  END IF;
END $$;

-- Remover índices antigos e colunas obsoletas
DROP INDEX IF EXISTS idx_hackathon_email;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'hackathon_inscricoes' AND column_name = 'nome1'
  ) THEN
    EXECUTE 'ALTER TABLE hackathon_inscricoes DROP COLUMN nome1';
  END IF;
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'hackathon_inscricoes' AND column_name = 'nome2'
  ) THEN
    EXECUTE 'ALTER TABLE hackathon_inscricoes DROP COLUMN nome2';
  END IF;
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'hackathon_inscricoes' AND column_name = 'nome3'
  ) THEN
    EXECUTE 'ALTER TABLE hackathon_inscricoes DROP COLUMN nome3';
  END IF;
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'hackathon_inscricoes' AND column_name = 'nusp1'
  ) THEN
    EXECUTE 'ALTER TABLE hackathon_inscricoes DROP COLUMN nusp1';
  END IF;
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'hackathon_inscricoes' AND column_name = 'nusp2'
  ) THEN
    EXECUTE 'ALTER TABLE hackathon_inscricoes DROP COLUMN nusp2';
  END IF;
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'hackathon_inscricoes' AND column_name = 'nusp3'
  ) THEN
    EXECUTE 'ALTER TABLE hackathon_inscricoes DROP COLUMN nusp3';
  END IF;
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'hackathon_inscricoes' AND column_name = 'celular'
  ) THEN
    EXECUTE 'ALTER TABLE hackathon_inscricoes DROP COLUMN celular';
  END IF;
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'hackathon_inscricoes' AND column_name = 'email'
  ) THEN
    EXECUTE 'ALTER TABLE hackathon_inscricoes DROP COLUMN email';
  END IF;
END $$;

-- Remover defaults automáticos usados na migração para forçar preenchimento explícito
ALTER TABLE hackathon_inscricoes
  ALTER COLUMN team_name DROP DEFAULT,
  ALTER COLUMN leader_name DROP DEFAULT,
  ALTER COLUMN leader_email DROP DEFAULT,
  ALTER COLUMN leader_university DROP DEFAULT;

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

CREATE INDEX IF NOT EXISTS idx_hackathon_leader_email ON hackathon_inscricoes(leader_email);
CREATE INDEX IF NOT EXISTS idx_hackathon_team_name ON hackathon_inscricoes(team_name);
CREATE INDEX IF NOT EXISTS idx_hackathon_created ON hackathon_inscricoes(created_at);
