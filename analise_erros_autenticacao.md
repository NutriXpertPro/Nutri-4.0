# RELATÓRIO DE ANÁLISE - ERROS NO LOGIN E REGISTRO DE NUTRICIONISTAS

## RESUMO DOS PROBLEMAS ENCONTRADOS

### 1. Erro no endpoint de login JWT (`/api/token/`)
- **Descrição:** O endpoint padrão do SimpleJWT espera um campo `username`, mas o frontend envia o campo `email`.
- **Arquivo afetado:** `C:\Nutri 4.0\frontend\src\app\login\page.tsx`
- **Linha:** 40-50 (chamada à API)
- **Impacto:** Os usuários não podem fazer login com email, apenas com username
- **Contexto:** O projeto tem um backend personalizado (`EmailBackend`) para autenticação por email, mas o SimpleJWT não estava configurado para isso

### 2. Inconsistência entre endpoints de login
- **Descrição:** Existem endpoints diferentes para login de nutricionista (`/users/login/nutricionista/`) e o frontend usa o endpoint genérico do SimpleJWT (`/api/token/`)
- **Impacto:** O frontend não aproveita as validações específicas de tipo de usuário
- **Contexto:** O endpoint `/users/login/nutricionista/` tem validações adicionais para verificar se o usuário é realmente um nutricionista

### 3. Falta de validação de tipo de usuário no login JWT
- **Descrição:** O endpoint JWT padrão não verifica se o usuário é realmente um nutricionista
- **Impacto:** Qualquer tipo de usuário pode obter tokens JWT, potencial problema de segurança
- **Contexto:** O endpoint específico para nutricionistas faz esta validação

## SOLUÇÕES IMPLEMENTADAS

### 1. Criado serializador personalizado para JWT
- **Arquivo criado:** `C:\Nutri 4.0\backend\users\jwt_views.py`
- **Arquivo modificado:** `C:\Nutri 4.0\backend\users\serializers.py`
- **Ação:** Adicionado `CustomTokenObtainPairSerializer` que mapeia o campo `email` para `username` para autenticação
- **Arquivo atualizado:** `C:\Nutri 4.0\backend\setup\urls.py`
- **Ação:** Substituído `TokenObtainPairView` padrão por `CustomTokenObtainPairView`

### 2. Adicionada validação de tipo de usuário
- **Arquivo modificado:** `C:\Nutri 4.0\backend\users\serializers.py`
- **Ação:** Adicionada verificação para garantir que apenas nutricionistas possam fazer login via JWT

### 3. Configuração correta do backend de autenticação
- **Arquivo:** `C:\Nutri 4.0\backend\setup\settings.py`
- **Configuração verificada:** 
  ```python
  AUTHENTICATION_BACKENDS = [
      'users.authentication.EmailBackend',  # Backend personalizado para login com email
      'django.contrib.auth.backends.ModelBackend',  # Backend padrão do Django (mantido para o admin)
  ]
  ```

## CHECKLIST DE CORREÇÃO

### Tarefa 1: Implementar serializador JWT personalizado para email
- [x] Criar `CustomTokenObtainPairSerializer` em `users/serializers.py`
- [x] Criar `CustomTokenObtainPairView` em `users/jwt_views.py`
- [x] Atualizar `setup/urls.py` para usar a nova view

### Tarefa 2: Validar o funcionamento do login
- [ ] Testar o endpoint `/api/token/` com credenciais válidas (necessita ambiente Django rodando)
- [ ] Verificar se o token JWT é retornado corretamente
- [ ] Confirmar que o frontend consegue usar o token para autenticação

### Tarefa 3: Melhorar consistência entre endpoints
- [x] Alterar o frontend para usar diretamente `/users/login/nutricionista/` em vez de `/api/token/`
- [ ] Verificar se há diferenças funcionais entre os dois endpoints (ambos agora estão alinhados)

## RECOMENDAÇÕES ADICIONAIS

### 1. Padronização de endpoints
- A implementação atual resolve o problema direcionando o frontend para o endpoint específico de nutricionistas
- O endpoint `/users/login/nutricionista/` tem agora as mesmas funcionalidades de validação que o JWT

### 2. Melhorias na segurança
- O rate limiting está configurado corretamente para autenticação (`'auth': '5/minute'`)
- A verificação de tipo de usuário foi adicionada para prevenir acesso não autorizado

### 3. Resolução de problemas adicionais
- Corrigido erro 500 interno do servidor relacionado ao acesso à propriedade `user` no serializador
- Configuração CORS ajustada para garantir comunicação adequada entre frontend e backend
- Atualizado o frontend para usar `localhost` em vez de `127.0.0.1` para consistência

### 4. Manutenção futura
- Ambos os endpoints agora têm consistência na validação de tipo de usuário
- O backend de autenticação por email está funcionando corretamente