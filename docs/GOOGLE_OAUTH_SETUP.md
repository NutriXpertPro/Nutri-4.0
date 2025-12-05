# Configuração do Google OAuth 2.0

Este guia descreve como criar as credenciais necessárias para habilitar o Login com Google no NutriXpertPro.

## Passo 1: Criar um Projeto no Google Cloud

1.  Acesse o [Google Cloud Console](https://console.cloud.google.com/).
2.  Faça login com sua conta Google.
3.  No topo da página, clique no seletor de projetos e depois em **"Novo Projeto"**.
4.  Dê um nome ao projeto (ex: `NutriXpertPro-Dev`) e clique em **"Criar"**.
5.  Selecione o projeto recém-criado.

## Passo 2: Configurar a Tela de Consentimento OAuth

1.  No menu lateral esquerdo, vá em **"APIs e Serviços"** > **"Tela de permissão OAuth"**.
2.  Escolha o tipo de usuário:
    *   **Externo:** Disponível para qualquer usuário com conta Google (Recomendado para testes e produção).
3.  Clique em **"Criar"**.
4.  **Informações do App:**
    *   **Nome do App:** `NutriXpertPro`
    *   **Email de suporte:** Seu email.
    *   **Dados de contato do desenvolvedor:** Seu email.
5.  Clique em **"Salvar e Continuar"**.
6.  **Escopos:** Não é necessário adicionar escopos sensíveis agora. Clique em **"Salvar e Continuar"**.
7.  **Usuários de Teste:** Adicione seu próprio email e de outros testadores. Clique em **"Salvar e Continuar"**.
8.  Revise e volte para o painel.

## Passo 3: Criar Credenciais

1.  No menu lateral, vá em **"Credenciais"**.
2.  Clique em **"+ CRIAR CREDENCIAIS"** > **"ID do cliente OAuth"**.
3.  **Tipo de aplicativo:** Selecione **"Aplicativo da Web"**.
4.  **Nome:** `NutriXpertPro Frontend`.
5.  **Origens JavaScript autorizadas:**
    *   Adicione a URL do seu frontend local: `http://localhost:3000`
    *   Adicione também: `http://127.0.0.1:3000`
6.  **URIs de redirecionamento autorizados:**
    *   Para este fluxo (login via token ID no frontend), você pode não precisar de um redirect URI específico se usar a biblioteca padrão do Google, mas é bom adicionar: `http://localhost:3000` e `http://localhost:3000/api/auth/callback/google` (caso use NextAuth depois).
7.  Clique em **"Criar"**.

## Passo 4: Obter o Client ID

1.  Uma janela pop-up aparecerá com "Cliente OAuth criado".
2.  Copie o valor de **"Seu ID de cliente"**. (Começa com números e termina com `.apps.googleusercontent.com`).
3.  **Não** é necessário o "Segredo do cliente" (Client Secret) para este fluxo específico de verificação de token no backend, apenas o Client ID é suficiente para validar a assinatura.

## Passo 5: Configurar no Projeto

1.  Abra o arquivo `.env` na raiz do projeto `backend` (ou crie se não existir).
2.  Adicione a variável:

```env
GOOGLE_OAUTH2_CLIENT_ID=seu-id-de-cliente-copiado-aqui.apps.googleusercontent.com
```

3.  Reinicie o servidor backend se estiver rodando.
