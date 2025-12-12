@echo off
echo Configurando e instalando dependências para os Agentes de IA Avançados...

set VENV_PATH=%~dp0ai_agent_venv

REM Verifica se o ambiente virtual existe, se não, cria
if not exist "%VENV_PATH%" (
    echo Criando ambiente virtual em "%VENV_PATH%"...
    python -m venv "%VENV_PATH%"
    if errorlevel 1 (
        echo Erro ao criar ambiente virtual. Certifique-se de que o Python esteja no PATH.
        pause
        exit /b 1
    )
    echo Ambiente virtual criado com sucesso!
)

REM Ativa o ambiente virtual
echo Ativando ambiente virtual...
call "%VENV_PATH%\Scripts\activate.bat"
if errorlevel 1 (
    echo Erro ao ativar ambiente virtual.
    pause
    exit /b 1
)

echo Instalando/Atualizando dependências no ambiente virtual...
pip install -r requirements_ai_agent.txt
if errorlevel 1 (
    echo Erro ao instalar dependências.
    pause
    exit /b 1
)

echo.
echo Verificando se o ChromeDriver está disponível...
REM Garante que o python do venv está sendo usado
python -c "from webdriver_manager.chrome import ChromeDriverManager; print('ChromeDriver pronto!')"
echo.
echo Instalação concluída e ambiente virtual '%VENV_PATH%' configurado!

echo.
echo Para executar o agente com este ambiente ativado, use:
echo call "%VENV_PATH%\Scripts\activate.bat"
echo python main_ai_agent.py --search "sua pesquisa" --analyze "https://exemplo.com"
echo.
echo Para extrair dados nutricionais:
echo python nutritional_data_extractor.py
echo.
echo Para análise completa Nutri 4.0:
echo python integrated_nutrition_agent.py
echo.
pause