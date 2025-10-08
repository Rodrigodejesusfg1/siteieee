-- ============================================================
-- RECRIAÇÃO COMPLETA DA TABELA HACKATHON
-- ============================================================
-- Este script recria a tabela do zero apenas com os campos
-- que o FRONTEND envia, eliminando a dependência dos campos
-- antigos (nome1, nome2, nome3)
-- ============================================================

-- ATENÇÃO: Este script FAZ BACKUP e RECRIA a tabela!
-- ============================================================

-- PASSO 1: Fazer backup da tabela atual
-- ============================================================
CREATE TABLE IF NOT EXISTS hackathon_inscricoes_backup AS 
SELECT * FROM hackathon_inscricoes;

-- PASSO 2: Dropar a tabela antiga
-- ============================================================
DROP TABLE IF EXISTS hackathon_inscricoes CASCADE;

-- PASSO 3: Criar a tabela nova APENAS com campos que o frontend envia
-- ============================================================
CREATE TABLE hackathon_inscricoes (
    -- Campos de controle
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Campos obrigatórios do frontend
    team_name VARCHAR NOT NULL,
    leader_name VARCHAR NOT NULL,
    leader_email VARCHAR NOT NULL,
    celular VARCHAR NOT NULL,
    leader_university VARCHAR NOT NULL,
    
    -- Campos opcionais - membros 2 e 3
    member2_name VARCHAR,
    member2_email VARCHAR,
    member2_university VARCHAR,
    
    member3_name VARCHAR,
    member3_email VARCHAR,
    member3_university VARCHAR,
    
    -- Campos de compatibilidade com backend antigo
    -- Serão preenchidos AUTOMATICAMENTE por trigger
    nome1 VARCHAR DEFAULT 'Auto-preenchido',
    nome2 VARCHAR DEFAULT 'Não informado',
    nome3 VARCHAR DEFAULT 'Não informado',
    email VARCHAR,
    nusp1 VARCHAR,
    nusp2 VARCHAR,
    nusp3 VARCHAR,
    
    -- Controle
    terms_accepted BOOLEAN DEFAULT false
);

-- PASSO 4: Criar índices para performance
-- ============================================================
CREATE INDEX idx_hackathon_email ON hackathon_inscricoes(leader_email);
CREATE INDEX idx_hackathon_team ON hackathon_inscricoes(team_name);
CREATE INDEX idx_hackathon_created ON hackathon_inscricoes(created_at DESC);

-- PASSO 5: Criar trigger que preenche campos de compatibilidade
-- ============================================================
CREATE OR REPLACE FUNCTION sync_hackathon_compatibility_fields()
RETURNS TRIGGER AS $$
BEGIN
    -- Preenche campos antigos com base nos novos
    NEW.nome1 := COALESCE(NULLIF(NEW.leader_name, ''), 'Líder');
    NEW.nome2 := COALESCE(NULLIF(NEW.member2_name, ''), 'Não informado');
    NEW.nome3 := COALESCE(NULLIF(NEW.member3_name, ''), 'Não informado');
    NEW.email := COALESCE(NULLIF(NEW.leader_email, ''), 'nao-informado@placeholder.com');
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sync_hackathon_compatibility_trigger
BEFORE INSERT OR UPDATE ON hackathon_inscricoes
FOR EACH ROW
EXECUTE FUNCTION sync_hackathon_compatibility_fields();

-- PASSO 6: Habilitar Row Level Security (RLS)
-- ============================================================
ALTER TABLE hackathon_inscricoes ENABLE ROW LEVEL SECURITY;

-- PASSO 7: Criar policies permissivas
-- ============================================================
-- Policy para permitir SELECT público (leitura)
DROP POLICY IF EXISTS "Allow public read access" ON hackathon_inscricoes;
CREATE POLICY "Allow public read access" ON hackathon_inscricoes
FOR SELECT
TO public
USING (true);

-- Policy para permitir INSERT público (escrita)
DROP POLICY IF EXISTS "Allow public insert" ON hackathon_inscricoes;
CREATE POLICY "Allow public insert" ON hackathon_inscricoes
FOR INSERT
TO public
WITH CHECK (true);

-- Policy para authenticated users (se necessário)
DROP POLICY IF EXISTS "Allow authenticated all" ON hackathon_inscricoes;
CREATE POLICY "Allow authenticated all" ON hackathon_inscricoes
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- PASSO 8: Migrar dados do backup (se existirem)
-- ============================================================
INSERT INTO hackathon_inscricoes (
    team_name,
    leader_name,
    leader_email,
    celular,
    leader_university,
    member2_name,
    member2_email,
    member2_university,
    member3_name,
    member3_email,
    member3_university,
    created_at
)
SELECT 
    COALESCE(team_name, 'Equipe Migrada'),
    COALESCE(leader_name, nome1, 'Líder'),
    COALESCE(leader_email, email, 'migrado@placeholder.com'),
    COALESCE(celular, '00000000000'),
    COALESCE(leader_university, 'Não informado'),
    COALESCE(member2_name, nome2),
    member2_email,
    member2_university,
    COALESCE(member3_name, nome3),
    member3_email,
    member3_university,
    created_at
FROM hackathon_inscricoes_backup
WHERE EXISTS (SELECT 1 FROM hackathon_inscricoes_backup LIMIT 1);

-- PASSO 9: Verificar a nova estrutura
-- ============================================================
SELECT 
    column_name,
    data_type,
    column_default,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'hackathon_inscricoes'
ORDER BY ordinal_position;

-- PASSO 10: Verificar policies
-- ============================================================
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE tablename = 'hackathon_inscricoes';

-- PASSO 11: Teste de inserção
-- ============================================================
-- Descomente para testar manualmente
/*
INSERT INTO hackathon_inscricoes (
    team_name,
    leader_name,
    leader_email,
    celular,
    leader_university
) VALUES (
    'Equipe Teste Final',
    'João Silva',
    'joao@teste.com',
    '16999999999',
    'USP São Carlos'
);

-- Verifica se foi inserido corretamente
SELECT 
    id,
    team_name,
    leader_name,
    nome1,  -- deve ser 'João Silva'
    nome2,  -- deve ser 'Não informado'
    nome3,  -- deve ser 'Não informado'
    email,  -- deve ser 'joao@teste.com'
    celular
FROM hackathon_inscricoes
ORDER BY created_at DESC
LIMIT 1;
*/

-- ============================================================
-- IMPORTANTE: Como reverter se necessário
-- ============================================================
-- Se algo der errado, você pode restaurar o backup:
-- DROP TABLE hackathon_inscricoes;
-- ALTER TABLE hackathon_inscricoes_backup RENAME TO hackathon_inscricoes;
-- ============================================================

-- FIM DO SCRIPT
SELECT 'Tabela hackathon_inscricoes recriada com sucesso!' AS status;
