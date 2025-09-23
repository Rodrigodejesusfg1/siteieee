# Sanca Week Site

Este repositório contém o site do evento com páginas estáticas e APIs para inscrições, agora preparado para deploy no Render (Flask + Gunicorn).

## Deploy no Render

1. Faça login no Render e crie um novo Web Service a partir deste repositório.
2. O Render detectará `render.yaml` com as instruções de build e start:
	- Build: `pip install -r requirements.txt`
	- Start: `gunicorn server:app --bind 0.0.0.0:$PORT --timeout 120`
3. Configure as variáveis de ambiente no Render (Settings > Environment):
	- `SUPABASE_URL` (obrigatória)
	- `SUPABASE_KEY` (anon/public) ou `SUPABASE_SERVICE_ROLE_KEY` (recomendada para servidor)
4. Acesse a URL pública do serviço. As rotas disponíveis:
	- Frontend: `/` (servido via Flask – arquivos estáticos da raiz)
	- API: `POST /api/inscricao`
	- API: `POST /api/hackathon`
	- Health: `GET /api/health`

> Observação: Rotas não-API sem extensão `.html` (ex.: `/palestrantes`) são resolvidas automaticamente para o arquivo `.html` correspondente.

## Variáveis de Ambiente

- `SUPABASE_URL`: URL do projeto Supabase
- `SUPABASE_KEY`: chave anônima (client) – use apenas se não tiver a service role configurada
- `SUPABASE_SERVICE_ROLE_KEY`: chave de service role (server) – preferida no backend

Mantenha o arquivo `.env` fora do versionamento ou sem segredos sensíveis quando for público.

## Como rodar localmente

1. Crie e ative um virtualenv (opcional)
2. Instale dependências: `pip install -r requirements.txt`
3. Defina as variáveis de ambiente (`.env` ou via shell)
4. Rode o servidor: `python server.py`
5. Acesse `http://127.0.0.1:5000`

## Endpoints

- `POST /api/inscricao` – cria inscrição no Supabase (tabela `inscricoes`)
- `POST /api/hackathon` – cria inscrição do hackathon (tabela `hackathon_inscricoes`)
- `GET /api/health` – verifica conectividade com o banco

## Notas

- O projeto também contém uma configuração anterior para Vercel em `api/` (serverless). Para Render, a aplicação usa Flask diretamente (`server.py`).
- Se precisar de rota estática adicional, basta adicionar o arquivo `.html` na raiz. O servidor irá servir automaticamente.
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
