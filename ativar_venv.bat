@echo off
echo Ativando ambiente virtual do projeto Nutri 4.0...
cd /d "C:\Nutri 4.0"
call "C:\Nutri 4.0\backend\.venv\Scripts\activate.bat"
echo Ambiente virtual ativado!
echo Diretorio atual: %cd%
echo.
echo Agora voce pode usar o Python do ambiente virtual diretamente.
cmd /k