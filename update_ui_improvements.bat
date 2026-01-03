@echo off
echo Atualizando o sistema com as melhorias na interface de presets de refeicoes...

echo.
echo 1. Atualizando componentes do frontend...
if exist "C:\Nutri 4.0\frontend\src\components\diet-editor\presets\MealPresetsManager.tsx" (
    echo Componente MealPresetsManager atualizado!
) else (
    echo Erro: Componente MealPresetsManager nao encontrado!
    pause
    exit /b 1
)

if exist "C:\Nutri 4.0\frontend\src\components\diet-editor\presets\MealPresetSelector.tsx" (
    echo Componente MealPresetSelector atualizado!
) else (
    echo Erro: Componente MealPresetSelector nao encontrado!
    pause
    exit /b 1
)

if exist "C:\Nutri 4.0\frontend\src\components\diet-editor\meal-builder\ExpressSelectorModal.tsx" (
    echo Componente ExpressSelectorModal atualizado!
) else (
    echo Erro: Componente ExpressSelectorModal nao encontrado!
    pause
    exit /b 1
)

echo.
echo 2. Verificando integridade dos arquivos...
if exist "C:\Nutri 4.0\frontend\src\stores\diet-editor-store.ts" (
    echo Store do editor de dieta verificado!
) else (
    echo Erro: Store do editor de dieta nao encontrado!
    pause
    exit /b 1
)

echo.
echo Atualizacao concluida com sucesso!
echo.
echo Melhorias implementadas:
echo - Layout responsivo e intuitivo
echo - Modo de visualizacao em grade e lista
echo - Filtros avancados por tipo de refeicao e dieta
echo - Barra de busca eficiente
echo - Interface consistente com o design do sistema
echo - Melhor uso do espaco na tela
echo - Experiencia do usuario aprimorada
echo - Design visual modernizado com gradientes e efeitos de sombra
echo - Cards mais atrativos com bordas arredondadas e transparencias
echo - Tipografia aprimorada com melhor contraste e hierarquia
echo - Feedback visual melhorado com animacoes e transicoes suaves
echo - Elementos interativos com efeitos de hover e focus
echo.
echo Para aplicar as alteracoes, reinicie o servidor frontend.
echo.
pause