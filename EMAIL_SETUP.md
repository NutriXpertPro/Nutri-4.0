# Configuração de Envio de Emails - Nutri 4.0

Este documento explica como configurar o envio de emails no sistema Nutri 4.0, incluindo emails de boas-vindas para novos pacientes.

## Passo a Passo para Configurar o Envio de Emails

### 1. Crie o arquivo de configuração

Primeiro, você precisa criar um arquivo chamado `.env` no diretório `backend` com suas credenciais de email.

### 2. Configuração para Gmail (mais comum)

Se você usa Gmail, siga estes passos:

#### Passo 2.1: Ative a verificação em duas etapas
1. Acesse sua conta Gmail
2. Vá para "Gerenciar sua conta do Google"
3. Vá para "Segurança"
4. Ative a "Verificação em duas etapas" (se ainda não estiver ativada)

#### Passo 2.2: Gere uma senha de app
1. Na mesma página de "Segurança"
2. Procure por "Senha de app" (pode estar em "Como você se conecta ao Google")
3. Clique em "Senha de app"
4. Selecione "Outro (nome personalizado)" e digite "Nutri 4.0"
5. Clique em "Gerar"
6. Uma senha de 16 caracteres será gerada (ex: `abcd efgh ijkl mnop`)

**Importante:** Anote esta senha, pois você só a verá uma vez.

### 3. Configure o arquivo .env

Agora, crie ou edite o arquivo `.env` no diretório `C:\Nutri 4.0\backend\.env` com o seguinte conteúdo:

```
# Configurações de Banco de Dados
DATABASE_URL=mysql://root:Nutri@localhost:3306/nutri_xpert_dev

# Chave Secreta (mude para algo seguro em produção)
SECRET_KEY=dev-secret-key-change-in-production-!!!

# Modo Debug (deixe True para desenvolvimento)
DEBUG=True

# Configurações de Email - ALTERE ESTAS LINHAS COM SUAS CREDENCIAIS
EMAIL_HOST_USER=seuemail@gmail.com
EMAIL_HOST_PASSWORD=sua_senha_de_app_gerada_no_passo_anterior
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
DEFAULT_FROM_EMAIL=NutriXpertPro <seuemail@gmail.com>

# URLs
BACKEND_URL=http://localhost:8000
FRONTEND_URL=http://localhost:3000

# Outras configurações
ALLOWED_HOSTS=*
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
CSRF_TRUSTED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

**Substitua:**
- `seuemail@gmail.com` pelo seu email real
- `sua_senha_de_app_gerada_no_passo_anterior` pela senha de app que você gerou (removendo os espaços)

### 4. Testando a Configuração

Após configurar as credenciais, você pode testar a configuração usando este comando:

```bash
"C:\Nutri 4.0\backend\.venv\Scripts\python" "C:\Nutri 4.0\diagnose_email.py"
```

Este script verificará se as credenciais estão configuradas e se é possível se conectar ao servidor SMTP.

### 5. Reinicie o Servidor

Após fazer as alterações no arquivo `.env`, é importante reiniciar o servidor do Django para que as novas configurações sejam carregadas.

## Exemplo Prático

Se o seu email é `meunutri@gmail.com` e a senha de app gerada é `abcd efgh ijkl mnop`, seu arquivo `.env` deve conter:

```
EMAIL_HOST_USER=meunutri@gmail.com
EMAIL_HOST_PASSWORD=abcdefghijklmnop
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
DEFAULT_FROM_EMAIL=NutriXpertPro <meunutri@gmail.com>
```

## Solução de Problemas

### Se ainda não funcionar:

1. Verifique se você gerou a senha de app corretamente
2. Confirme que não há espaços na senha de app
3. Verifique se o email e senha estão escritos corretamente
4. Execute o diagnóstico para ver mensagens de erro específicas

### Se receber erro de autenticação:
- Certifique-se de que está usando a senha de app e não sua senha normal do Gmail
- Verifique se a verificação em duas etapas está ativada

## Funcionalidades Afetadas

Com o envio de emails configurado corretamente, os seguintes recursos do sistema funcionarão:

- Envio de email de boas-vindas para novos pacientes com link de definição de senha
- Recuperação de senha por email
- Outros emails automatizados do sistema

## Segurança

- Guarde sua senha de app com segurança
- Não compartilhe suas credenciais
- Revogue a senha de app se achar que foi comprometida