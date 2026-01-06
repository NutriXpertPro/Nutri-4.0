@echo off
setlocal

echo Verificando configuracao de email para Nutri 4.0
echo ===============================================

echo.
echo Executando diagnostico de email...
echo.

"C:\Nutri 4.0\backend\.venv\Scripts\python" "C:\Nutri 4.0\diagnose_email.py"

echo.
echo Verificacao concluida.
echo.
echo Pressione qualquer tecla para sair...
pause >nul