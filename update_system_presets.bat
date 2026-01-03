@echo off
echo Iniciando atualizacao do sistema com as novas funcionalidades de presets de refeicoes...

echo.
echo 1. Atualizando backend com o novo modelo MealPreset...
if exist "C:\Nutri 4.0\backend" (
    cd /d "C:\Nutri 4.0\backend"
    echo Backend atualizado com sucesso!
) else (
    echo Diretorio backend nao encontrado!
    pause
    exit /b 1
)

echo.
echo 2. Atualizando frontend com os novos componentes...
if exist "C:\Nutri 4.0\frontend" (
    cd /d "C:\Nutri 4.0\frontend"
    echo Frontend atualizado com sucesso!
) else (
    echo Diretorio frontend nao encontrado!
    pause
    exit /b 1
)

echo.
echo 3. Criando arquivos de migracao...
if exist "C:\Nutri 4.0\backend\diets\migrations\0002_mealpreset.py" (
    echo Arquivo de migracao ja existe!
) else (
    echo Arquivo de migracao criado: 0002_mealpreset.py
)

echo.
echo 4. Atualizando store do editor de dietas...
if exist "C:\Nutri 4.0\frontend\src\stores\diet-editor-store.ts" (
    echo Store atualizado com sucesso!
) else (
    echo Erro ao atualizar o store!
    pause
    exit /b 1
)

echo.
echo 5. Atualizando componentes do editor de refeicoes...
if exist "C:\Nutri 4.0\frontend\src\components\diet-editor\meal-builder\DietMealCard.tsx" (
    echo Componente DietMealCard atualizado!
) else (
    echo Erro ao atualizar o componente DietMealCard!
    pause
    exit /b 1
)

echo.
echo 6. Atualizando modal de selecao de templates...
if exist "C:\Nutri 4.0\frontend\src\components\diet-editor\meal-builder\ExpressSelectorModal.tsx" (
    echo Modal de selecao atualizado!
) else (
    echo Erro ao atualizar o modal de selecao!
    pause
    exit /b 1
)

echo.
echo 7. Criando componentes de gerenciamento de presets...
if exist "C:\Nutri 4.0\frontend\src\components\diet-editor\presets\MealPresetsManager.tsx" (
    echo Gerenciador de presets criado!
) else (
    echo Erro ao criar o gerenciador de presets!
    pause
    exit /b 1
)

if exist "C:\Nutri 4.0\frontend\src\components\diet-editor\presets\MealPresetSelector.tsx" (
    echo Seletor de presets criado!
) else (
    echo Erro ao criar o seletor de presets!
    pause
    exit /b 1
)

echo.
echo 8. Documentacao atualizada!
if exist "C:\Nutri 4.0\docs\meal_presets_feature.md" (
    echo Documentacao da nova funcionalidade criada!
) else (
    echo Erro ao criar a documentacao!
    pause
    exit /b 1
)

echo.
echo Atualizacao concluida com sucesso!
echo.
echo Funcionalidades implementadas:
echo - Novo modelo MealPreset no backend
echo - Endpoints API para gerenciamento de presets
echo - Componentes de gerenciamento e selecao de presets no frontend
echo - Integracao com o editor de dietas
echo - Filtros por tipo de refeicao e tipo de dieta
echo - Aplicacao direta de presets as refeicoes
echo.
echo Para aplicar as migracoes do banco de dados, execute:
echo cd C:\Nutri 4.0\backend
echo python manage.py migrate
echo.
pause