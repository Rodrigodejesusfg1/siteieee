# Instruções para Corrigir o Erro de Schema do Supabase

## Problema Identificado
O erro `Could not find the 'ano_ingresso' column of 'inscricoes' in the schema cache` indica que o Supabase não consegue encontrar a coluna na tabela. Isso geralmente acontece por:

1. A tabela não foi criada corretamente
2. O cache do schema está desatualizado
3. Problemas de sincronização no Supabase

## Solução Passo a Passo

### 1. Acessar o Supabase Dashboard
- Vá para https://app.supabase.com
- Entre no seu projeto
- Vá para "SQL Editor" no menu lateral

### 2. Executar o Script de Correção
Execute o conteúdo do arquivo `fix_supabase_schema.sql` no SQL Editor:

```sql
-- 1. Verificar estrutura atual
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'inscricoes' 
ORDER BY ordinal_position;

-- 2. Recriar a tabela (se necessário)
DROP TABLE IF EXISTS inscricoes CASCADE;

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

-- 3. Criar políticas de RLS
ALTER TABLE inscricoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public inserts" ON inscricoes 
FOR INSERT TO anon 
WITH CHECK (true);
```

### 3. Verificar a Correção
Após executar o script:

1. **Teste a API de saúde:**
   ```
   GET http://127.0.0.1:5000/api/health
   ```

2. **Teste o schema:**
   ```
   GET http://127.0.0.1:5000/api/test-schema
   ```

3. **Teste uma inscrição real** através do formulário

### 4. Se o Problema Persistir

#### Opção A: Cache do Schema
1. No Supabase Dashboard, vá para "Settings" > "API"
2. Clique em "Reload schema" ou "Restart"
3. Aguarde alguns minutos

#### Opção B: Verificar Configurações
1. Verifique se as variáveis de ambiente estão corretas:
   - `SUPABASE_URL`
   - `SUPABASE_KEY` (use a chave `anon` ou `service_role`)

2. No arquivo `.env`:
   ```
   SUPABASE_URL=https://seuprojectid.supabase.co
   SUPABASE_KEY=sua_chave_aqui
   ```

#### Opção C: Políticas de RLS
Se ainda houver problemas, temporariamente desabilite o RLS:
```sql
ALTER TABLE inscricoes DISABLE ROW LEVEL SECURITY;
```

### 5. Debugging Adicional

Use os logs do servidor Python para ver mais detalhes:
```bash
python server.py
```

Os logs mostrarão exatamente qual dados está sendo enviado e qual erro específico está acontecendo.

## Arquivos Modificados
- `server.py` - Adicionado endpoint de teste de schema e melhor tratamento de erros
- `fix_supabase_schema.sql` - Script completo para corrigir o problema de schema

## Endpoints de Teste Adicionados
- `GET /api/health` - Verifica conexão com Supabase
- `GET /api/test-schema` - Testa a estrutura da tabela

## Estrutura Correta da Tabela
A tabela `inscricoes` deve ter estas colunas:
- `id` (SERIAL PRIMARY KEY)
- `nome` (VARCHAR(255) NOT NULL)
- `email` (VARCHAR(255) NOT NULL)
- `telefone` (VARCHAR(50))
- `faculdade` (VARCHAR(100))
- `nusp` (VARCHAR(50))
- `curso` (VARCHAR(255))
- `ano_ingresso` (INTEGER) ⭐ Esta é a coluna problema
- `membro_ieee` (VARCHAR(50))
- `voluntario_ieee` (VARCHAR(50))
- `divulgacao` (TEXT)
- `indicacao` (VARCHAR(255))
- `created_at` (TIMESTAMP DEFAULT CURRENT_TIMESTAMP)