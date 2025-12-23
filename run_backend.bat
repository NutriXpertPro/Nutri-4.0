@echo off
cd /d "c:\Nutri 4.0\backend"
if exist ".venv\Scripts\python.exe" (
    ".\venv\Scripts\python.exe" manage.py runserver
) else (
    echo Ambiente virtual nao encontrado em .venv\Scripts\python.exe
    echo Tentando usar python do sistema...
    python manage.py runserver
)
pause
