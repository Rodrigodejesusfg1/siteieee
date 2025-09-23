-- Script para corrigir problema de cache do schema no Supabase
-- Execute este script no SQL Editor do Supabase

-- 1. Primeiro, vamos ver se a tabela existe
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'inscricoes' 
ORDER BY ordinal_position;

-- 2. Se a tabela não existir ou não tiver a coluna ano_ingresso, execute:
DROP TABLE IF EXISTS inscricoes CASCADE;

-- 3. Recrie a tabela completa
CREATE TABLE inscricoes (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    telefone VARCHAR(50),
    faculdade VARCHAR(100),
    nusp VARCHAR(50),
    curso VARCHAR(255),
    ano_ingresso INTEGER,
    membro_ieee VARCHAR(50),
    voluntario_ieee VARCHAR(50),
    divulgacao TEXT,
    indicacao VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Criar índices para performance
CREATE INDEX idx_inscricoes_email ON inscricoes(email);
CREATE INDEX idx_inscricoes_created_at ON inscricoes(created_at);

-- 5. Habilitar RLS (Row Level Security)
ALTER TABLE inscricoes ENABLE ROW LEVEL SECURITY;

-- 6. Criar política para permitir inserções públicas
CREATE POLICY "Allow public inserts" ON inscricoes 
FOR INSERT TO anon 
WITH CHECK (true);

-- 7. Criar política para permitir seleção pública (opcional, para debugging)
CREATE POLICY "Allow public select" ON inscricoes 
FOR SELECT TO anon 
USING (true);

-- 8. Forçar refresh do cache do schema (se necessário)
-- NOTIFY pgrst, 'reload schema';

-- 9. Verificar se tudo foi criado corretamente
SELECT 
    table_name, 
    column_name, 
    data_type, 
    is_nullable 
FROM information_schema.columns 
WHERE table_name = 'inscricoes' 
ORDER BY ordinal_position;