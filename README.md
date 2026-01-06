# Nutri 4.0

Sistema de gestão nutricional completo.

## Configuração de Email

Para que o sistema envie emails de boas-vindas e outros emails automaticamente, é necessário configurar as credenciais de email.

### Configuração para Gmail

1. Ative a verificação em duas etapas na sua conta Google
2. Gere uma "senha de app" no Google
3. Execute o script de configuração:
   ```
   configurar_email.bat
   ```
4. Siga as instruções para inserir seu email e senha de app
5. Para verificar a configuração, execute:
   ```
   verificar_configuracao.bat
   ```

Para mais detalhes, consulte o arquivo `EMAIL_SETUP.md`.

## Execução

Para executar o sistema, siga as instruções normais de inicialização do backend.