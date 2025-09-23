-- SQL para criar tabela no Supabase
-- Execute no SQL Editor do painel Supabase

CREATE TABLE IF NOT EXISTS inscricoes (
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

-- Opcional: Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_inscricoes_email ON inscricoes(email);
CREATE INDEX IF NOT EXISTS idx_inscricoes_created_at ON inscricoes(created_at);

-- Opcional: Habilitar RLS (Row Level Security)
ALTER TABLE inscricoes ENABLE ROW LEVEL SECURITY;

-- Política para permitir inserções (se necessário)
-- CREATE POLICY "Allow public inserts" ON inscricoes FOR INSERT TO public WITH CHECK (true);