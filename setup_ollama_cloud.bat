@echo off
rem Script para configurar e testar a integração com Ollama Cloud

echo Configurando integração com Ollama Cloud...
echo.

echo Instalando dependencias...
pip install -r backend\requirements.txt
echo.

echo Verificando conexao com a API do Ollama Cloud...
python test_ollama_connection.py
echo.

if errorlevel 1 (
    echo.
    echo Erros encontrados durante a configuracao.
    pause
    exit /b 1
) else (
    echo.
    echo Configuracao concluida com sucesso!
    echo.
    echo Voce pode agora usar os recursos do Ollama Cloud no seu projeto.
    pause
)