# 📄 PRD - Product Requirements Document
## NutriXpertPro SPA - Sistema Enterprise de Gestão Nutricional

**Versão:** 1.0  
**Data:** 03/12/2025  
**Status:** Especificação Completa

---

## 📋 SUMÁRIO EXECUTIVO

### Visão do Produto
Sistema web moderno (SPA) para nutricionistas gerenciarem pacientes, dietas, consultas e avaliações com recursos de IA, real-time chat e analytics avançados.

### Objetivos de Negócio
1. Substituir sistema híbrido fragmentado por SPA consistente
2. Reduzir tempo de criação de dietas em 50%
3. Aumentar retenção de pacientes em 30%
4. Permitir escalar para 10k+ usuários

### Personas Principais
- **Nutricionista Solo** - Profissional independente
- **Nutricionista Clínica** - Parte de equipe multi-profissional
- **Paciente** - Cliente do nutricionista

---

## 🎯 REQUISITOS FUNCIONAIS

### 1. AUTENTICAÇÃO & USUÁRIOS

#### RF-001: Login Dual
- **Descrição:** Sistema deve ter páginas de login separadas para Nutricionista e Paciente
- **Prioridade:** P0 (Crítico)
- **Critérios de Aceite:**
  - Formulário com email + senha
  - Toggle de visibilidade de senha
  - Checkbox "Lembrar-me"
  - Redirect correto após autenticação
  - Mensagens de erro claras
- **API:** `POST /api/v1/auth/login/`

#### RF-002: OAuth Google
- **Descrição:** Login via conta Google
- **Prioridade:** P1 (Alto)
- **Critérios de Aceite:**
  - Botão "Entrar com Google" visível
  - Flow OAuth correto
  - Criar usuário se não existe
  - Sincronizar dados básicos (nome, email, foto)
- **API:** `POST /api/v1/auth/google/`

#### RF-003: Registro de Nutricionista
- **Descrição:** Cadastro de novo nutricionista
- **Prioridade:** P0
- **Campos:**
  - Nome completo (obrigatório)
  - Email (obrigatório, único, validado)
  - Senha (obrigatório, min 8 chars, 1 número, 1 especial)
  - Confirmar senha (match)
  - Título profissional (select: Dr./Dra./PhD/Mestre/Especialista/Nutricionista)
  - Gênero (radio: M/F)
- **API:** `POST /api/v1/users/register/nutritionist/`

#### RF-004: 2FA (Two-Factor Auth)
- **Descrição:** Autenticação em 2 fatores via SMS ou app
- **Prioridade:** P1
- **Critérios:** TOTP support, QR code generation
- **API:** `POST /api/v1/auth/2fa/enable/`

#### RF-005: Recuperação de Senha
- **Descrição:** Reset de senha via email
- **Prioridade:** P0
- **Flow:** Email → Token → Nova senha
- **API:** `POST /api/v1/auth/password-reset/`

---

### 2. DASHBOARD

#### RF-006: Dashboard Nutricionista
- **Descrição:** Página inicial do nutricionista
- **Prioridade:** P0
- **Componentes:**
  - Saudação dinâmica (Bom dia/tarde/noite + nome)
  - 4 cards de estatísticas:
    - Pacientes ativos (total + trend)
    - Consultas hoje (número + próxima)
    - Dietas ativas (total + a vencer)
    - Rating médio (estrelas + feedback novos)
  - Agenda do dia (lista de consultas)
  - Paciente em foco (card destacado)
- **APIs:**
  - `GET /api/v1/dashboard/stats/`
  - `GET /api/v1/appointments/today/`
  - `GET /api/v1/patients/featured/`

#### RF-007: Dashboard Paciente
- **Descrição:** Visão simplificada para pacientes
- **Prioridade:** P1
- **Componentes:**
  - Progresso de metas
  - Próxima consulta
  - Plano alimentar atual
  - Gráfico de evolução
- **API:** `GET /api/v1/dashboard/patient/`

#### RF-008: Busca Global
- **Descrição:** Busca inteligente no header
- **Prioridade:** P1
- **Funcionalidades:**
  - Autocomplete
  - Busca em pacientes, dietas, consultas
  - Navegação por teclado (↑↓ Enter)
  - Highlight de termos
- **API:** `GET /api/v1/search/?q={query}`

---

### 3. GESTÃO DE PACIENTES

#### RF-009: Listar Pacientes
- **Descrição:** Grid de cards com todos os pacientes
- **Prioridade:** P0
- **Funcionalidades:**
  - Busca por nome/email
  - Ordenação (data, nome A-Z)
  - Paginação (20 por página)
  - Filtros: ativo/inativo
  - Card: foto, nome, email, phone, data cadastro
- **API:** `GET /api/v1/patients/?search=&sort=&page=`

#### RF-010: Criar Paciente
- **Descrição:** Formulário de cadastro
- **Prioridade:** P0
- **Campos:**
  - Seção 1 (Pessoais): nome, email, data nasc
  - Seção 2 (Acesso): senha, confirmar senha
  - Seção 3 (Contato): telefone, endereço
  - Hints IA em cada campo
- **Validações:**
  - Email único
  - Senhas matching
  - Data nascimento válida
  - Telefone formato BR
- **API:** `POST /api/v1/patients/`

#### RF-011: Detalhes do Paciente
- **Descrição:** Página completa com 2 vistas
- **Prioridade:** P0
- **Vista 1 (Dashboard Analítico):**
  - Fotos progresso (antes/depois, 3 ângulos)
  - 5 cards de métricas (peso, gordura, músculo, IMC, abdômen)
  - Gráfico evolução corporal (linha)
  - Gráfico radar (medidas)
  - Histórico exames laboratoriais
  - Evolução planos nutricionais
- **Vista 2 (Timeline):**
  - Linha do tempo vertical
  - Consultas em ordem cronológica
  - Expandir para ver detalhes
- **Ações:** Comparar, IA Insights, Editar
- **API:** `GET /api/v1/patients/{id}/`

#### RF-012: Editar Paciente
- **Descrição:** Mesmo form de criação, pré-populado
- **Prioridade:** P0
- **API:** `PATCH /api/v1/patients/{id}/`

#### RF-013: Comparar Fotos
- **Descrição:** Página side-by-side antes/depois
- **Prioridade:** P1
- **Layout:** 2 colunas (primeira vs última avaliação)
- **Fotos:** Frente, Lateral, Costas
- **API:** `GET /api/v1/patients/{id}/compare-photos/`

#### RF-014: IA Insights (Paciente)
- **Descrição:** Sugestões automáticas baseadas em dados
- **Prioridade:** P2
- **Exemplos:**
  - "Gordura reduzindo consistentemente - manter dieta"
  - "Músculo estagnado - considerar treino força"
  - "IMC próximo do ideal - ajustar meta"
- **API:** `GET /api/v1/patients/{id}/ai-insights/`

---

### 4. EDITOR DE DIETAS

#### RF-015: Lista de Dietas
- **Descrição:** Tabela com todas as dietas
- **Prioridade:** P0
- **Colunas:** Nome, Paciente, Data criação, Status, Ações
- **Stats cards:** Total, Ativas, Esta semana
- **Ações:** Ver, Gerar PDF
- **API:** `GET /api/v1/diets/`

#### RF-016: Criar Dieta (Tab Sistema)
- **Descrição:** Editor modular com 4 abas
- **Prioridade:** P0
- **Aba 1 (Contexto do Paciente):**
  - Dados básicos
  - Objetivo
  - Restrições alimentares (integrado com anamnese)
  - Alergias
- **Aba 2 (Análise Nutricional):**
  - TMB calculada
  - GET sugerido
  - Macros recomendados
- **Aba 3 (Histórico):**
  - Dietas anteriores
  - O que funcionou/não funcionou
- **Aba 4 (Dieta - Editor Principal):**
  - 6 refeições customizáveis
  - Busca de alimentos (modal)
  - Add/remove alimentos
  - Cálculos automáticos (cal, prot, carb, gord)
  - Resumo diário com barras
  - Templates pré-definidos
- **APIs:**
  - `GET /api/v1/patients/{id}/context/`
  - `GET /api/v1/patients/{id}/nutritional-analysis/`
  - `GET /api/v1/patients/{id}/diet-history/`
  - `GET /api/v1/foods/search/?q={query}`
  - `POST /api/v1/diets/`

#### RF-017: Banco de Alimentos
- **Descrição:** Busca e seleção de alimentos
- **Prioridade:** P0
- **Fonte:** TACO + alimentos customizados
- **Campos por alimento:**
  - Nome
  - Categoria
  - Porção padrão (g/ml)
  - Calorias
  - Proteínas
  - Carboidratos
  - Gorduras
  - Fibras
- **Busca:** Autocomplete, filtros por categoria
- **API:** `GET /api/v1/foods/?search=&category=`

#### RF-018: Templates de Dieta
- **Descrição:** Dietas pré-montadas
- **Prioridade:** P1
- **Templates:**
  - Low-Carb 1800cal
  - Keto 1500cal
  - Mediterrânea 2000cal
  - Vegetariana 1700cal
  - Hipertrofia 2500cal
- **Ação:** Carregar template → Ajustar → Salvar
- **API:** `GET /api/v1/diet-templates/`

#### RF-019: Geração PDF
- **Descrição:** Export de dieta em PDF profissional
- **Prioridade:** P0
- **Conteúdo:**
  - Logo nutricionista
  - Dados paciente
  - Tabela de refeições
  - Observações
  - Assinatura digital
- **API:** `POST /api/v1/diets/{id}/generate-pdf/`

---

### 5. CALENDÁRIO/AGENDAMENTO

#### RF-020: Visualização de Calendário
- **Descrição:** 3 vistas (Mês, Semana, Dia)
- **Prioridade:** P0
- **Vista Mês:**
  - Grid 7x5
  - Indicadores (bolinhas) nos dias com consultas
  - Click no dia → mostra consultas
- **Vista Semana:**
  - Timeline hora a hora (7:00-20:00)
  - Blocos de consultas ajustam altura por duração
- **Vista Dia:**
  - Lista de consultas
  - Cards expandidos com todos os detalhes
- **API:** `GET /api/v1/appointments/?start_date=&end_date=&view=`

#### RF-021: Criar Consulta
- **Descrição:** Modal ou página de agendamento
- **Prioridade:** P0
- **Campos:**
  - Paciente (select com busca)
  - Data (date picker)
  - Horário (time picker bloqueando conflitos)
  - Duração (select: 30/45/60/90 min)
  - Tipo (select: Presencial/Online)
  - Link meeting (se online)
  - Notas
- **Validações:**
  - Não permitir double-booking
  - Respeitar horário de trabalho
- **API:** `POST /api/v1/appointments/`

#### RF-022: Drag & Drop Reagendamento
- **Descrição:** Arrastar consulta para outro horário
- **Prioridade:** P2
- **Funcionalidade:** Atualizar data/hora visual → Confirmar modal → Salvar
- **API:** `PATCH /api/v1/appointments/{id}/`

#### RF-023: Integração Google Calendar
- **Descrição:** Sync bi-direcional
- **Prioridade:** P1
- **Funcionalidades:**
  - Exportar para Google
  - Importar  de Google
  - Sincronização automática
- **API:** `POST /api/v1/integrations/google-calendar/sync/`

#### RF-024: Status de Consulta
- **Descrição:** Workflow de estados
- **Prioridade:** P0
- **Estados:**
  - Agendada (padrão)
  - Confirmada (paciente confirmou)
  - Cancelada (nutricionista ou paciente)
  - Concluída (após consulta)
  - Faltou (no-show)
- **Transições:** Agendada → Confirmada → Concluída
- **API:** `PATCH /api/v1/appointments/{id}/status/`

---

### 6. ANAMNESE

#### RF-025: Listar Anamneses
- **Descrição:** Tabela com todos os questionários
- **Prioridade:** P0
- **Colunas:** Paciente, Data, Progresso (%), Ações
- **Filtros:** Por paciente
- **API:** `GET /api/v1/anamnesis/`

#### RF-026: Questionário Multi-Etapa
- **Descrição:** Form wizard com ~50 perguntas
- **Prioridade:** P0
- **Seções:**
  1. Dados pessoais (idade, sexo, profissão)
  2. Histórico médico (doenças, medicamentos, cirurgias)
  3. Histórico familiar (doenças hereditárias)
  4. Hábitos alimentares (refeições/dia, preferências, aversões)
  5. Restrições (alergias, intolerâncias, dieta vegetariana, etc)
  6. Atividade física (tipo, frequência, duração)
  7. Estilo de vida (sono, estresse, fumo, álcool)
  8. Objetivos (perder peso, ganhar massa, performance)
- **Funcionalidades:**
  - Barra de progresso
  - Salvar rascunho (auto-save 30s)
  - Navegação entre seções
  - Validação por seção
- **API:**
  - `POST /api/v1/anamnesis/` (criar)
  - `PATCH /api/v1/anamnesis/{id}/` (atualizar)
  - `GET /api/v1/anamnesis/{id}/` (carregar)

#### RF-027: Integração com Editor de Dietas
- **Descrição:** Restrições da anamnese aparecem automaticamente
- **Prioridade:** P1
- **Funcionalidade:** Badges coloridos na aba "Contexto" do editor
- **Exemplo:** "🚫 Lactose", "🌱 Vegetariano", "⚠️ Diabetes"

---

### 7. AVALIAÇÕES FÍSICAS

#### RF-028: Criar Avaliação
- **Descrição:** Formulário com medidas e fotos
- **Prioridade:** P0
- **Campos:**
  - Data avaliação
  - Peso (kg)
  - Altura (cm)
  - Gordura corporal (%)
  - Massa magra (kg)
  - IMC (auto-calculado)
  - Circunferências (braço, antebraço, coxa, cintura, quadril, abdômen)
  - Dobras cutâneas (opcional)
  - Fotos (frente, lateral, costas)
  - Observações
- **API:** `POST /api/v1/evaluations/`

#### RF-029: Histórico de Avaliações
- **Descrição:** Timeline de todas as avaliações
- **Prioridade:** P0
- **Visualização:** Cards cronológicos com métricas principais
- **Navegação:** Na página de detalhes do paciente
- **API:** `GET /api/v1/patients/{id}/evaluations/`

---

### 8. MENSAGENS/CHAT

#### RF-030: Inbox
- **Descrição:** Interface de chat real-time
- **Prioridade:** P1
- **Layout:** 2 colunas (conversas | mensagens)
- **Funcionalidades:**
  - Lista de conversas (busca, status online/offline)
  - Thread de mensagens (bubbles)
  - Input de texto
  - Envio de anexos (futuro)
  - Emojis (futuro)
  - Markdown support (negrito, itálico)
- **Real-time:** WebSockets/Django Channels
- **APIs:**
  - `GET /api/v1/conversations/`
  - `GET /api/v1/conversations/{id}/messages/`
  - `POST /api/v1/conversations/{id}/messages/`
  - WebSocket: `/ws/chat/{conversation_id}/`

---

### 9. EXAMES LABORATORIAIS

#### RF-031: Upload de Exame
- **Descrição:** Form para anexar PDFs de exames
- **Prioridade:** P1
- **Campos:**
  - Paciente (select)
  - Tipo exame (select: Hemograma, Lipidograma, Glicemia, etc)
  - Data exame
  - Arquivo PDF
  - Observações
- **API:** `POST /api/v1/lab-exams/` (multipart/form-data)

#### RF-032: Visualizar Exames
- **Descrição:** Lista integrada no perfil do paciente
- **Prioridade:** P1
- **Funcionalidades:**
  - Download PDF
  - Visualização inline (futuro)
- **API:** `GET /api/v1/patients/{id}/lab-exams/`


### 11. PERSONALIZAÇÃO & DOCUMENTOS

#### RF-034: Identidade Visual e Assinatura
- **Descrição:** Personalização de documentos gerados
- **Prioridade:** P1
- **Funcionalidades:**
  - Upload de Logotipo do Nutricionista
  - Upload de Assinatura Digitalizada
  - Campo para CRN (obrigatório para assinatura)
  - Aplicação automática em PDFs: Dieta, Prescrições (manipulados/suplementos), Exames
- **API:** `POST /api/v1/users/me/branding/`

### 12. AUTOMAÇÃO
#### RF-035: Mensagens Automáticas
- **Descrição:** Sistema de mensagens transacionais editáveis
- **Prioridade:** P1
- **Funcionalidades:**
  - Templates editáveis pelo nutricionista
  - Triggers automáticos:
    - Confirmação de agendamento
    - Lembrete 24h antes
    - Boas-vindas (novo paciente)
    - Aniversário
    - Follow-up pós-consulta (30/60 dias)
  - Variáveis dinâmicas ({nome_paciente}, {data}, {hora})
- **API:** `GET/POST /api/v1/automation/templates/`

### 13. APP DO PACIENTE (ENGAGEMENT)

#### RF-036: Diário Alimentar e Físico
- **Descrição:** Registro diário para monitoramento e engajamento
- **Prioridade:** P1
- **Funcionalidades:**
  - Upload de fotos das refeições (café, almoço, etc)
  - Upload de fotos do físico (evolução)
  - Notas de texto sobre a refeição/dia
  - Notificação automática para o Nutricionista ao postar
  - Feedback rápido do Nutri (curtir/comentar no diário)
- **API:** `POST /api/v1/patient-diary/entries/`

#### RF-037: Rede Social Fechada (Comunidade)
- **Descrição:** Ambiente seguro para motivação mútua
- **Prioridade:** P2 (Inovação)
- **Regras:**
  - **Opt-in:** Paciente precisa aceitar participar
  - **Conteúdo:** Fotos de refeições e físico compartilhadas no feed
  - **Interação Própria:** Paciente pode comentar nas próprias fotos
  - **Interação com Outros:** Paciente pode APENAS CURTIR fotos de terceiros (sem comentários para evitar toxicidade)
  - **Moderação:** Nutricionista vê tudo e pode moderar
- **API:** `GET /api/v1/community/feed/`


#### RF-033: Sistema de Notificações
- **Descrição:** Alertas em tempo real
- **Prioridade:** P1
- **Tipos:**
  - Nova mensagem
  - Consulta em 1 hora
  - Dieta a vencer em 7 dias
  - Novo paciente cadastrado
  - Feedback recebido
- **Canais:**
  - In-app (badge no sino)
  - Push notification (PWA)
  - Email (configurável)
  - WhatsApp (configurável)
- **APIs:**
  - `GET /api/v1/notifications/` (listar)
  - `PATCH /api/v1/notifications/{id}/mark-read/`
  - `POST /api/v1/notifications/settings/`

---

## 🚫 REQUISITOS NÃO-FUNCIONAIS

### Performance
- **RNF-001:** First Contentful Paint < 1.5s
- **RNF-002:** Time to Interactive < 3s
- **RNF-003:** Lighthouse score > 90
- **RNF-004:** API response < 200ms (p95)

### Escalabilidade
- **RNF-005:** Suportar 10k usuários simultâneos
- **RNF-006:** Banco de dados: MariaDB com read replicas
- **RNF-007:** Cache Redis para queries frequentes
- **RNF-008:** CDN para assets estáticos

### Segurança
- **RNF-009:** HTTPS obrigatório
- **RNF-010:** JWT tokens com refresh
- **RNF-011:** CSRF protection
- **RNF-012:** Rate limiting (100 req/min por IP)
- **RNF-013:** Criptografia dados sensíveis (LGPD)
- **RNF-014:** Audit logs de ações críticas

### Acessibilidade
- **RNF-015:** WCAG 2.1 AA compliance
- **RNF-016:** Navegação por teclado
- **RNF-017:** Screen reader support
- **RNF-018:** Contraste mínimo 4.5:1

### Compatibilidade
- **RNF-019:** Chrome/Edge 90+
- **RNF-020:** Firefox 88+
- **RNF-021:** Safari 14+
- **RNF-022:** Responsivo (mobile/tablet/desktop)

### Disponibilidade
- **RNF-023:** Uptime > 99.9%
- **RNF-024:** Backups diários automáticos
- **RNF-025:** Disaster recovery plan

---

## 📊 MÉTRICAS DE SUCESSO

### Adoção
- 100 nutricionistas ativos em 6 meses
- 1000 pacientes cadastrados em 6 meses
- NPS > 50

### Engagement
- Nutricionista usa 4x/semana (média)
- Tempo médio de sessão > 15min
- Taxa de churn < 5%/mês

### Eficiência
- Criação de dieta: 15min → 7min (50% redução)
- Taxa de no-show consultas: 20% → 10%

### Técnicas
- 0 bugs críticos em produção
- Test coverage > 80%
- API p95 latency < 200ms

---

## 🗺️ ROADMAP DE RELEASES

### MVP (V1.0) - 3 meses
- Autenticação completa
- CRUD Pacientes
- Editor de dietas básico
- Calendário básico
- Anamnese
- Avaliações

### V1.1 - +1 mês
- Chat real-time
- Notificações push
- Templates de dieta
- Geração PDF (com Logo/Assinatura)
- Automação de Mensagens
- Diário do Paciente (v1)

### V1.2 - +1 mês
- Rede Social Fechada (Comunidade)
- Integração Google Calendar

### V1.2 - +1 mês
- Integração Google Calendar
- IA Insights básico
- Multi-tenancy (clínicas)

### V2.0 - +2 meses
- API pública
- Marketplace templates
- Analytics dashboard
- Mobile app Nativo (opcional, foco em PWA robusto)

---

## 📋 FORA DO ESCOPO (V1)

- ❌ Pagamentos integrados
- ❌ Videochamada nativa
- ❌ Integração wearables
- ❌ App mobile nativo (inicialmente PWA App Store/Play Store)
- ❌ Marketplace de profissionais
- ❌ Teleconsulta completa

---

**Aprovado por:** Equipe de Produto  
**Data:** 03/12/2025  
**Próxima Revisão:** 03/01/2026
