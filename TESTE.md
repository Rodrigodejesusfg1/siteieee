# Teste do Sistema de Inscrições

Para testar se tudo está funcionando corretamente:

## 1. Servidor Flask
✅ O servidor deve estar rodando na porta 5000
✅ Logs mostram conexão com Supabase OK

## 2. Teste manual
1. Abra `inscricoes.html` no navegador
2. Preencha o formulário com dados de teste:
   - Nome: "João Teste"
   - Email: "teste@email.com" 
   - Telefone: "(16) 99999-9999"
   - Faculdade: "USP"
   - Curso: "Engenharia Elétrica"
   - Ano de ingresso: "2023"
   - Membro IEEE: "Não"
   - Voluntário IEEE: "Não"
   - Como soube: Marque alguma opção

3. Clique em "Enviar inscrição"

## 3. Verificar logs
### No console do navegador (F12):
```
[FORM SUBMIT] Enviando dados: {...}
[FORM SUBMIT] Response status: 200
[FORM SUBMIT] Response data: {...}
[FORM STATUS] SUCCESS: ✅ Inscrição enviada com sucesso! (ID: X)
```

### No terminal do servidor:
```
INFO:__main__:Received inscription request from IP: 127.0.0.1
INFO:__main__:Successfully saved inscription ID: X for João Teste (teste@email.com)
```

## 4. Verificar no Supabase
1. Acesse: https://supabase.com/dashboard/project/cddyvmkvgstfkpuejjpq
2. Vá para Table Editor
3. Abra a tabela `inscricoes`
4. Deve aparecer uma nova linha com os dados do teste

## 5. Possíveis mensagens de erro:
- ❌ "Erro de conexão": Servidor não está rodando
- ❌ "Campos obrigatórios": Algum campo não foi preenchido
- ❌ "Erro ao salvar dados": Problema no Supabase

## Status Atual:
✅ Supabase conectado e funcionando
✅ Tabela `inscricoes` acessível  
✅ Servidor Flask rodando
✅ Cliente Python Supabase configurado
✅ Logs detalhados implementados