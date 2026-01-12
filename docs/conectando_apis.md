# Task: Conectando APIs (Fluxo de Paciente)

Objetivo: Corrigir a desconexão de dados entre o Backend (Django/Serializer) e o Frontend (Next.js), garantindo que os dados de anamnesis fundidos (merged) apareçam de forma consistente na interface.

## Plano de Ação Detalhado

### Fase 1: Fundações e Contratos

- [X] **Etapa 1: Correção de Contrato (TypeScript)**
    - [X] Atualizar interface `Patient` em `patient-service.ts` para incluir `answers`, `type`.
    - *Status:* Concluído.

### Fase 2: Correção do Fluxo Principal

- [ ] **Etapa 2: Unificação da Fonte de Dados (Lógica)**
    - [ ] Refatorar `PatientAnamnesisTab.tsx` para usar os dados de `patient.anamnesis` (props) como fonte primária.
    - *Objetivo:* Eliminar a dependência da chamada de API secundária e inconsistente.

- [ ] **Etapa 3: Mapeamento Visual dos Dados (UI)**
    - [ ] Garantir que os campos visuais (`DataField`, etc.) em `PatientAnamnesisTab.tsx` sejam populados a partir de `patient.anamnesis.answers`.
    - *Objetivo:* Fazer os dados da anamnese aparecerem na tela.

### Fase 3: Otimização e Verificação

- [ ] **Etapa 4: Refatoração e Limpeza de Código**
    - [ ] Remover a chamada `useQuery` para `getStandardAnamnesis` de `PatientAnamnesisTab.tsx`.
    - *Objetivo:* Deixar o código mais limpo e performático.

- [ ] **Etapa 5: Verificação Cruzada de Componentes**
    - [ ] Inspecionar `PatientOverviewTab` para garantir que cards (IMC, Peso) usam dados do `usePatient` sem refetch.
    - *Objetivo:* Garantir consistência em toda a página.

- [ ] **Etapa 6: Validação Final do Fluxo**
    - [ ] Teste de ponta a ponta do fluxo de dados do paciente.
    - *Objetivo:* Entregar a tarefa como 100% concluída.

## Histórico de Execução

- **12/01/2026:** Início da Análise e Execução da Etapa 1.