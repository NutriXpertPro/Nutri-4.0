@echo off
setlocal

echo Configuracao de Email para Nutri 4.0
echo ====================================

echo.
echo Este script ira criar ou atualizar o arquivo .env com as configuracoes de email.
echo.

set /p email=Digite seu email Gmail: 
set /p senha_app=Digite sua senha de app (gerada no Google): 

echo.
echo Criando arquivo .env com as configuracoes...

echo # Configuracoes de Banco de Dados > C:\Nutri 4.0\backend\.env
echo DATABASE_URL=mysql://root:Nutri@localhost:3306/nutri_xpert_dev >> C:\Nutri 4.0\backend\.env
echo. >> C:\Nutri 4.0\backend\.env
echo # Chave Secreta >> C:\Nutri 4.0\backend\.env
echo SECRET_KEY=dev-secret-key-change-in-production-!!! >> C:\Nutri 4.0\backend\.env
echo. >> C:\Nutri 4.0\backend\.env
echo # Modo Debug >> C:\Nutri 4.0\backend\.env
echo DEBUG=True >> C:\Nutri 4.0\backend\.env
echo. >> C:\Nutri 4.0\backend\.env
echo # Configuracoes de Email >> C:\Nutri 4.0\backend\.env
echo EMAIL_HOST_USER=%email% >> C:\Nutri 4.0\backend\.env
echo EMAIL_HOST_PASSWORD=%senha_app% >> C:\Nutri 4.0\backend\.env
echo EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend >> C:\Nutri 4.0\backend\.env
echo DEFAULT_FROM_EMAIL=NutriXpertPro ^<%email%^> >> C:\Nutri 4.0\backend\.env
echo. >> C:\Nutri 4.0\backend\.env
echo # URLs >> C:\Nutri 4.0\backend\.env
echo BACKEND_URL=http://localhost:8000 >> C:\Nutri 4.0\backend\.env
echo FRONTEND_URL=http://localhost:3000 >> C:\Nutri 4.0\backend\.env
echo. >> C:\Nutri 4.0\backend\.env
echo # Outras configuracoes >> C:\Nutri 4.0\backend\.env
echo ALLOWED_HOSTS=* >> C:\Nutri 4.0\backend\.env
echo CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000 >> C:\Nutri 4.0\backend\.env
echo CSRF_TRUSTED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000 >> C:\Nutri 4.0\backend\.env

echo.
echo Arquivo .env criado com sucesso em C:\Nutri 4.0\backend\.env
echo.
echo Para testar a configuracao, execute:
echo "C:\Nutri 4.0\backend\.venv\Scripts\python" "C:\Nutri 4.0\diagnose_email.py"
echo.
echo Pressione qualquer tecla para sair...
pause >nul