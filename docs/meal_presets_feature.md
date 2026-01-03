# Funcionalidade de Presets de Refeições Personalizados

## Visão Geral

A nova funcionalidade de presets de refeições permite que nutricionistas criem, gerenciem e apliquem refeições pré-configuradas em seus planos alimentares. Os presets podem ser organizados por tipo de refeição (café da manhã, almoço, lanche, etc.) e tipo de dieta (low carb, cetogênica, etc.).

## Componentes Implementados

### Backend
- **Modelo `MealPreset`**: Armazena os presets de refeições com informações como nome, tipo de refeição, tipo de dieta, alimentos, calorias, etc.
- **Serializer `MealPresetSerializer`**: Serializa os dados do modelo para API
- **ViewSet `MealPresetViewSet`**: Fornece endpoints CRUD para gerenciamento de presets
- **Endpoints da API**:
  - `GET /api/v1/meal-presets/` - Listar presets
  - `POST /api/v1/meal-presets/` - Criar preset
  - `GET /api/v1/meal-presets/{id}/` - Obter preset específico
  - `PUT /api/v1/meal-presets/{id}/` - Atualizar preset
  - `DELETE /api/v1/meal-presets/{id}/` - Deletar preset

### Frontend
- **Componente `MealPresetsManager`**: Interface completa para gerenciamento de presets
- **Componente `MealPresetSelector`**: Seletor de presets para uso dentro do editor de dietas
- **Atualização do `ExpressSelectorModal`**: Adiciona aba para seleção de presets personalizados
- **Atualização do `DietMealCard`**: Integração com a funcionalidade de presets
- **Atualização do `diet-editor-store`**: Adiciona estado e ações para gerenciamento de presets

## Tipos de Refeição Suportados
- Café da Manhã
- Almoço
- Jantar
- Lanche da Manhã
- Lanche da Tarde
- Ceia
- Suplemento

## Tipos de Dieta Suportados
- Balanceado
- Low Carb
- High Carb
- Cetogênico
- Vegetariano
- Vegano
- Hipertrofia
- Perda de Peso
- Ganho de Peso
- Personalizado

## Funcionalidades

### Gerenciamento de Presets
- Criar novos presets com nome, tipo de refeição, tipo de dieta e alimentos
- Editar presets existentes
- Excluir presets
- Filtrar presets por tipo de refeição e tipo de dieta
- Buscar presets por nome ou descrição
- Ativar/desativar presets

### Aplicação de Presets
- Selecionar presets por tipo de refeição e dieta
- Aplicar presets diretamente a refeições no editor de dietas
- Visualização de informações nutricionais (calorias, proteínas, carboidratos, gorduras)

## Integração com o Editor de Dietas
- Novo botão "Gerenciar Templates" no editor de refeições
- Aba adicional "Meus Presets" no modal de seleção de templates
- Aplicação direta de presets à refeição atual
- Filtros por tipo de refeição e tipo de dieta

## Benefícios
- **Agilidade**: Reduz significativamente o tempo de criação de dietas
- **Consistência**: Garante padrões consistentes nas recomendações
- **Personalização**: Permite adaptação às preferências e necessidades específicas
- **Organização**: Classificação por tipo de refeição e tipo de dieta
- **Reutilização**: Presets podem ser reaproveitados em múltiplas dietas

## Exemplo de Uso
1. Um nutricionista cria um preset "Café da Manhã Low Carb" com ovos, abacate e café
2. Quando estiver criando uma dieta para um paciente low carb, ele pode selecionar esse preset para a refeição de café da manhã
3. A refeição é preenchida automaticamente com os alimentos configurados no preset
4. O nutricionista pode fazer ajustes finos se necessário

## Considerações Técnicas
- Todos os presets são específicos para cada nutricionista
- Presets podem ser marcados como ativos/inativos
- Sistema de busca e filtragem para fácil localização
- Integração completa com o sistema de autenticação
- Validação de dados no backend