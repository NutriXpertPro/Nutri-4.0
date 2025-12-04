@echo off
echo **********************************************
echo *         Projeto Nutri 4.0 - Ambiente Virtual Ativado!        *
echo **********************************************
cd /d "C:\Nutri 4.0"
call "C:\Nutri 4.0\backend\.venv\Scripts\activate.bat"

echo.
echo Ambiente virtual ativado com sucesso!
echo Diretorio atual: %cd%
echo.
echo Comandos disponiveis:
echo   dj-check     - Verificar o status do projeto Django
echo   dj-migrate   - Aplicar migrações do banco de dados
echo   dj-runserver - Iniciar o servidor de desenvolvimento
echo   dj-createsuperuser - Criar um superusuario
echo.
cmd /k