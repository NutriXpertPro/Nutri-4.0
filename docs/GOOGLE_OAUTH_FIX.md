# CORREÇÃO DO ERRO OAUTH DO GOOGLE CALENDAR

## PROBLEMA IDENTIFICADO
Erro: `The OAuth client was not found. Erro 401: invalid_client`

## CAUSAS POSSÍVEIS

1. **Client ID/Secret inválidos ou não correspondentes**
2. **Aplicativo OAuth não configurado no Google Cloud Console**
3. **URIs de redirecionamento não configuradas**
4. **Aplicativo não publicado/testado**

## SOLUÇÃO COMPLETA

### PASSO 1: Verificar Configurações Atuais
```bash
# Verificar se as variáveis estão configuradas
echo $GOOGLE_OAUTH2_CLIENT_ID
echo $GOOGLE_OAUTH2_CLIENT_SECRET
```

### PASSO 2: Configurar Google Cloud Console

1. Acesse: https://console.cloud.google.com/
2. Selecione seu projeto
3. Vá para: APIs & Services > Credentials
4. Crie ou edite um "OAuth 2.0 Client ID"

#### Configurações Obrigatórias:
- **Application type**: Web application
- **Name**: NutriXpertPro Calendar Integration
- **Authorized JavaScript origins**: 
  - `http://localhost:3000`
  - `http://127.0.0.1:3000`
  - `https://seudominio.com` (produção)
- **Authorized redirect URIs**:
  - `http://localhost:8000/api/v1/integrations/google-calendar/callback/`
  - `http://127.0.0.1:8000/api/v1/integrations/google-calendar/callback/`
  - `https://seuapi.com/api/v1/integrations/google-calendar/callback/` (produção)

### PASSO 3: Habilitar APIs Necessárias
Em APIs & Services > Library, habilite:
- Google Calendar API
- Google+ API

### PASSO 4: Atualizar Variáveis de Ambiente
No arquivo `backend/.env`:
```env
GOOGLE_OAUTH2_CLIENT_ID=SEU_NOVO_CLIENT_ID
GOOGLE_OAUTH2_CLIENT_SECRET=SEU_NOVO_CLIENT_SECRET
BACKEND_URL=http://localhost:8000
FRONTEND_URL=http://localhost:3000
```

### PASSO 5: Verificar Configurações de Callback
O backend espera o callback em:
```
{BACKEND_URL}/api/v1/integrations/google-calendar/callback/
```

### PASSO 6: Testar a Integração
1. Reinicie o backend Django
2. Acesse a página de integrações
3. Tente conectar com o Google Calendar

## SOLUÇÃO ALTERNATIVA (Temporária)

Se não conseguir configurar OAuth imediatamente, desabilite temporariamente:

No componente `GoogleCalendarIntegration.tsx`:
```tsx
const connectToGoogle = async () => {
  toast.info("Integração temporariamente desabilitada para configuração");
  return;
}
```

## VERIFICAÇÃO FINAL

Após configurar, teste a URL de autorização:
```
https://accounts.google.com/o/oauth2/auth?
  client_id=SEU_CLIENT_ID&
  redirect_uri=http://localhost:8000/api/v1/integrations/google-calendar/callback/&
  response_type=code&
  scope=https://www.googleapis.com/auth/calendar&
  access_type=offline
```

## DEBUGGING

Se o erro persistir:
1. Verifique se o Client ID está correto no Google Cloud Console
2. Confirme as URIs de redirecionamento
3. Verifique se o aplicativo está "Published" (não "Testing")
4. Limpe cookies e cache do navegador
5. Use uma janela de navegação anônima

## CONTATO

Se precisar de ajuda adicional:
- Google Cloud Console: https://console.cloud.google.com/
- OAuth 2.0 Playground: https://developers.google.com/oauthplayground/
