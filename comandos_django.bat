@echo off
setlocal
cd /d "C:\Nutri 4.0"
call "C:\Nutri 4.0\backend\.venv\Scripts\activate.bat"

if "%1"=="dj-check" (
    python .\backend\manage.py check
    goto end
)

if "%1"=="dj-migrate" (
    python .\backend\manage.py migrate
    goto end
)

if "%1"=="dj-runserver" (
    python .\backend\manage.py runserver
    goto end
)

if "%1"=="dj-createsuperuser" (
    python .\backend\manage.py createsuperuser
    goto end
)

if "%1"=="dj-test" (
    python .\backend\manage.py test
    goto end
)

echo Comando desconhecido. Comandos disponiveis:
echo   dj-check            - Verificar o status do projeto Django
echo   dj-migrate          - Aplicar migrações do banco de dados
echo   dj-runserver        - Iniciar o servidor de desenvolvimento
echo   dj-createsuperuser  - Criar um superusuario
echo   dj-test             - Executar os testes
echo.
echo Use um destes comandos como parametro para este script.

:end