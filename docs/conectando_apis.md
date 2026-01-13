# Task: Conectando APIs (Fluxo de Paciente)

Objetivo: Corrigir a desconexão de dados entre o Backend (Django/Serializer) e o Frontend (Next.js), garantindo que os dados de anamnesis fundidos (merged) apareçam de forma consistente na interface.

## Plano de Ação Detalhado

### Fase 1: Fundações e Contratos

- [X] **Etapa 1: Correção de Contrato (TypeScript)**
    - [X] Atualizar interface `Patient` em `patient-service.ts` para incluir `answers`, `type`.
    - *Status:* Concluído.

### Fase 2: Correção do Fluxo Principal

- [X] **Etapa 2: Unificação da Fonte de Dados (Lógica)**
    - [X] Refatorar `PatientAnamnesisTab.tsx` para usar os dados de `patient.anamnesis` (props) como fonte primária.
    - [X] Extrair visualização para `AnamnesisReportView.tsx` para reuso.
    - *Status:* Concluído.

- [X] **Etapa 3: Mapeamento Visual dos Dados (UI)**
    - [X] Garantir que os campos visuais (`DataField`, etc.) sejam populados a partir de `patient.anamnesis.answers`.
    - [X] Implementar Modal de Visualização na listagem geral de anamneses.
    - [X] Corrigir contadores da Sidebar para refletir dados reais.
    - [X] Restaurar layout original da aba Anamnese (com botões e visualização integrada).
    - *Status:* Concluído.

### Fase 3: Otimização e Verificação

- [X] **Etapa 5: Verificação Cruzada de Componentes (Visão Geral)**
    - [X] Inspecionar `PatientOverviewTab.tsx`.
    - [X] Garantir que cards (IMC, Peso, Idade) usem os dados atualizados do `usePatient`.
    - [X] Adicionada invalidação de cache `['patient']` ao salvar anamnese.
    - *Status:* Concluído.

- [ ] **Etapa 6: Validação Final do Fluxo**
    - [ ] Teste de ponta a ponta do fluxo de dados do paciente.
    - *Objetivo:* Entregar a tarefa como 100% concluída.

## Histórico de Execução

- **12/01/2026:** Início da Análise e Execução da Etapa 1.