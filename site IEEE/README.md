# V SANCA Week - Backend de Inscrições

Backend em Python Flask + Supabase para processar inscrições do formulário.

## ✅ Migração Completa para Supabase

Sistema atualizado para usar o cliente Python Supabase ao invés de psycopg2 direto, resolvendo problemas de conectividade.

## Setup Rápido

### 1. Instalar dependências
```bash
pip install -r requirements.txt
```

### 2. Configurar Supabase
1. Acesse seu projeto Supabase: https://supabase.com/dashboard/project/cddyvmkvgstfkpuejjpq
2. Vá para SQL Editor
3. Execute o script `create_table.sql` para criar a tabela de inscrições

### 3. Executar o servidor
```bash
python server.py
```

O servidor ficará disponível em: http://127.0.0.1:5000

### 4. Testar o formulário
Abra `inscricoes.html` no navegador e teste uma inscrição. 

## ✅ Status de Funcionamento

- ✅ Conexão com Supabase funcionando
- ✅ Servidor Flask rodando na porta 5000
- ✅ Tabela `inscricoes` acessível
- ✅ Logs detalhados implementados

## 📊 Logs Implementados

### No Console do Browser:
- `[FORM STATUS]` - Status de sucesso/erro com emojis
- `[FORM SUBMIT]` - Dados enviados e respostas recebidas
- Erros de rede com detalhes específicos

### No Servidor Python:
- ✅ Requests recebidos (IP + dados)
- ✅ Validações e campos faltantes
- ✅ Tentativas de spam detectadas (honeypot)
- ✅ IDs das inscrições salvas com sucesso
- ✅ Erros detalhados do Supabase

### Na Interface:
- ✅ Mensagens de sucesso com ID da inscrição
- ❌ Mensagens de erro específicas
- 🔄 Status "Enviando..." durante o processo
