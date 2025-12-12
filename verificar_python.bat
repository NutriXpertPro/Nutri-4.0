@echo off
echo ================================================
echo  VERIFICAÇÃO E INSTALAÇÃO DO PYTHON PARA NUTRI 4.0
echo ================================================
echo.
echo Este script irá:
echo 1. Verificar se o Python está instalado
echo 2. Se não estiver, fornecer instruções para instalação
echo.
echo Verificando Python...
python --version >nul 2>&1
if %errorlevel% == 0 (
    echo ✅ Python já está instalado
    python --version
    echo.
    echo Verificando dependências...
    python -c "import selenium, requests, bs4, pandas, PyPDF2; print('✅ Todas as dependências estão instaladas')" >nul 2>&1
    if %errorlevel% == 0 (
        echo ✅ Todas as dependências já estão instaladas
    ) else (
        echo ⚠ Algumas dependências estão faltando
        echo Executando script de instalação...
        call instalar_dependencias.bat
    )
) else (
    echo ❌ Python não está instalado ou não está no PATH
    echo.
    echo Para instalar o Python, siga estes passos:
    echo 1. Baixe o instalador do Python em: https://www.python.org/downloads/
    echo 2. Execute o instalador
    echo 3. MARQUE a opção "Add Python to PATH" durante a instalação
    echo 4. Reinicie este terminal após a instalação
    echo.
    echo Após instalar o Python, execute novamente este script
    pause
    exit /b
)
echo.
echo ================================================
echo  PRONTO PARA USAR O AGENTE DE IA AVANÇADO
echo ================================================
echo.
echo Comandos disponíveis:
echo.
echo 1. Pesquisa inteligente:
echo    python main_ai_agent.py --search "sua pesquisa"
echo.
echo 2. Análise de websites:
echo    python main_ai_agent.py --analyze "https://site.com"
echo.
echo 3. Extração de dados nutricionais:
echo    python main_ai_agent.py --nutrition taco tbca ibge
echo.
echo 4. Análise integrada Nutri 4.0:
echo    python integrated_nutrition_agent.py
echo.
echo 5. Análise avançada completa:
echo    python analise_avancada_nutri40.py
echo.
echo 6. Interface interativa (fácil para iniciantes):
echo    python agente_interativo.py
echo.
echo 7. Execução automatizada do agente interativo:
echo    iniciar_agente_interativo.bat
echo.
pause