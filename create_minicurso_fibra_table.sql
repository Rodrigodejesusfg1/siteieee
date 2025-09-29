-- Tabela para inscrições do Minicurso de Fibra Óptica
-- Execute no SQL Editor do Supabase antes de ativar o formulário

CREATE TABLE IF NOT EXISTS public.minicurso_fibra_inscricoes (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(200) NOT NULL,
    telefone VARCHAR(50) NOT NULL,
    nusp VARCHAR(30),
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('UTC', NOW())
);

-- Índices auxiliares para buscas rápidas
CREATE INDEX IF NOT EXISTS idx_minicurso_fibra_nome ON public.minicurso_fibra_inscricoes (nome);
CREATE INDEX IF NOT EXISTS idx_minicurso_fibra_created_at ON public.minicurso_fibra_inscricoes (created_at);

-- Caso utilize Row Level Security
ALTER TABLE public.minicurso_fibra_inscricoes ENABLE ROW LEVEL SECURITY;

-- Política simples permitindo inserções anônimas (ajuste o role conforme necessário)
-- CREATE POLICY "Allow inserts from anon" ON public.minicurso_fibra_inscricoes
--   FOR INSERT TO anon
--   WITH CHECK (true);
