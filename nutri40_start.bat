@echo off
echo **********************************************
echo *      Bem-vindo ao Projeto Nutri 4.0        *
echo *          Ambiente Virtual Ativado!         *
echo **********************************************

cd /d "C:\Nutri 4.0"
call "C:\Nutri 4.0\backend\.venv\Scripts\activate.bat"

echo.
echo Ambiente virtual ativado com sucesso!
echo Diretorio atual: %cd%
echo.
echo Comandos abreviados disponiveis:
echo   dj-check            - Verificar o status do projeto Django
echo   dj-migrate          - Aplicar migrações do banco de dados
echo   dj-runserver        - Iniciar o servidor de desenvolvimento
echo   dj-createsuperuser  - Criar um superusuario
echo   dj-test             - Executar os testes
echo.
echo Exemplo: digite 'dj-migrate' para aplicar migrações
echo.

REM Adicionando funções para os comandos abreviados
doskey dj-check=python C:\Nutri 4.0\backend\manage.py check $*
doskey dj-migrate=python C:\Nutri 4.0\backend\manage.py migrate $*
doskey dj-runserver=python C:\Nutri 4.0\backend\manage.py runserver $*
doskey dj-createsuperuser=python C:\Nutri 4.0\backend\manage.py createsuperuser $*
doskey dj-test=python C:\Nutri 4.0\backend\manage.py test $*

cmd /k