# ✅ CHECKLIST DE DESENVOLVIMENTO
## NutriXpertPro SPA - Ordem Cronológica

**Versão:** 1.1 (Atualizado com status atual)  
**Data:** 04/12/2025  
**Baseado em:** recomendacoes_arquitetura_enterprise.md, prd_product_requirements.md, api_specification.md, wireframes.md

---

## 📋 SUMÁRIO EXECUTIVO

Este checklist organiza todo o desenvolvimento do NutriXpertPro em **5 fases principais**, seguindo a ordem lógica de dependências e prioridades definidas nos documentos de especificação.

> **⚠️ STATUS ATUAL:** O backend está ~80% implementado com models, serializers e views. O foco principal agora é a migração para API REST pura e construção do frontend SPA.

**Estimativa Restante:** 4-6 meses (foco em frontend e polimento)

---

## 🏗️ FASE 1: FUNDAÇÃO (2-3 meses)

### 1.1 Setup do Ambiente de Desenvolvimento
- [x] Configurar repositório Git
- [x] Setup MariaDB/MySQL com configurações de desenvolvimento
- [x] Configurar Docker Compose para ambiente local
- [x] Configurar Redis para cache e sessions
- [x] Criar documentação inicial

### 1.2 Backend - Estrutura Base Django
- [x] Inicializar projeto Django 5.2
- [x] Configurar Django REST Framework 3.14+
- [x] Configurar drf-spectacular para documentação OpenAPI/Swagger
- [x] Configurar django-cors-headers para CORS
- [x] Configurar SimpleJWT para autenticação JWT
- [x] Configurar django-filter para filtros avançados
- [x] Configurar django-redis para cache
- [x] Criar estrutura de apps: `users`, `patients`, `diets`, `appointments`, `anamnesis`, `evaluations`, `messages`, `notifications`, `lab_exams`, `payments`

### 1.3 Frontend - Estrutura Base Next.js
- [x] Inicializar projeto Next.js 14+ com TypeScript 5+
- [x] Configurar Tailwind CSS 3.4+
- [x] Instalar e configurar Shadcn/UI
- [x] Configurar Zustand para state management
- [x] Configurar React Query v5 para data fetching
- [x] Configurar Zod para validações
- [x] Configurar React Hook Form 7+
- [x] Setup Axios como cliente HTTP
- [x] Criar estrutura Atomic Design: `atoms/`, `molecules/`, `organisms/`, `templates/`, `pages/`

### 1.4 Design System
- [x] Criar arquivo `design-system/tokens.ts` (cores, tipografia, espaçamentos, sombras)
- [x] Definir tema primário (Dinâmico: Monochrome/Teal/Blue/Violet/Pink + Dark/Light)
- [x] Configurar variáveis CSS no Tailwind
- [x] Criar componentes base: Button, Input, Badge, Avatar, Card
- [x] Documentar design system (Showcase interativo em /design)

### 1.5 CI/CD Pipeline
- [x] Configurar GitHub Actions ou GitLab CI
- [x] Etapa 1: Lint (ESLint + Prettier)
- [x] Etapa 2: Type check (TypeScript)
- [x] Etapa 3: Unit tests
- [x] Etapa 4: Build
- [x] Configurar Husky + lint-staged para pre-commit hooks
- [ ] Setup ambiente de staging

---

## 🔐 FASE 2: AUTENTICAÇÃO & CORE (2-3 meses)

### 2.1 Sistema de Autenticação - Backend
- [x] Modelo User customizado (nutricionista, paciente, admin)
- [x] API `POST /api/token/` - Obter par de tokens JWT
- [x] API `POST /api/token/refresh/` - Renovar access token
- [x] API `POST /api/token/verify/` - Verificar token
- [x] API `POST /api/v1/auth/register/nutritionist/` - Registro de nutricionista (converter de Django form para API REST)
- [x] API `POST /api/v1/auth/google/` - OAuth Google
- [x] API `POST /api/v1/auth/logout/` - Invalidar token (blacklist)
- [x] API `POST /api/v1/auth/password-reset/` - Solicitar reset de senha
- [x] API `POST /api/v1/auth/password-reset/confirm/` - Confirmar nova senha
- [x] API `POST /api/v1/auth/log/` - Registrar log de autenticação
- [x] Configurar rate limiting (5 tentativas/minuto para auth)

### 2.2 Sistema de Autenticação - Frontend
- [x] Página Landing Page (conforme wireframe)
- [x] Página Login Nutricionista (conforme wireframe)
- [x] Página Login Paciente
- [x] Página Registro Nutricionista
- [x] Componente Toggle de visibilidade de senha
- [x] Funcionalidade "Lembrar-me"
- [x] Página Esqueceu a senha
- [x] Integração OAuth Google (Botão Visual)
- [x] Contexto de autenticação (AuthContext)
- [x] Proteção de rotas (middleware)
- [x] Persistência de sessão (tokens no cookies/localStorage) localStorage/cookies)

### 2.3 Layout Principal 

#### Header Completo
- [x] Logo NutriXpertPro à esquerda
- [x] Busca Global (Command Palette estilo Ctrl+K)
  - [x] Autocomplete para pacientes, dietas, consultas
  - [x] Navegação por teclado (↑↓ Enter)
- [x] Sino de Notificações com badge
  - [x] Dropdown com 5 últimas notificações
  - [x] Destaque para mensagens não respondidas 24h+
- [x] Perfil do usuário com dropdown
- [x] Toggle tema (dark/light)
- [x] Seletor de cor do tema

#### Sidebar de Navegação (10 itens)
- [x] 🏠 Dashboard (`/dashboard`)
- [x] 👥 Pacientes (`/patients`) - badge: total
- [x] 🍽️ Dietas (`/diets`)
- [x] 📅 Agenda (`/calendar`) - badge: consultas hoje
- [x] 💬 Mensagens (`/messages`) - badge: não lidas (vermelho pulsante se 24h+)
- [x] 📋 Anamneses (`/anamnesis`) - badge: incompletas
- [x] 📊 Avaliações (`/evaluations`)
- [x] 🧪 Exames (`/lab-exams`)
- [x] — Divisor —
- [x] 🔔 Notificações (`/notifications`) - badge: total não lidas
- [x] ⚙️ Configurações (`/settings`)

#### Responsividade
- [x] Desktop (>1024px): Sidebar fixa 240px
- [x] Tablet (768-1024px): Sidebar colapsada 60px (apenas ícones)
- [x] Mobile (<768px): Sidebar em overlay (hamburger menu)

#### Layouts
- [x] Layout Dashboard (header + sidebar + main content)
- [x] Layout Auth (centralizado, sem sidebar)

### 2.4 Dashboard Nutricionista - Backend
- [x] API `GET /api/v1/dashboard/stats/` - Estatísticas do dashboard
- [x] API `GET /api/v1/appointments/today/` - Agenda do dia (criar endpoint específico)
- [x] API `GET /api/v1/patients/featured/` - Paciente em foco

### 2.5 Dashboard Nutricionista - Frontend

#### Saudação e Data
- [x] Componente saudação dinâmica (Bom dia/tarde/noite + título + nome)
- [x] Data atual formatada (Sexta-feira, 06 de Dezembro de 2025)

#### Stats Cards Premium (4 cards)
- [x] Pacientes Ativos (badge: +N este mês, ícone azul)
- [x] Consultas Hoje (badge: próxima às HH:MM, ícone âmbar)
- [x] Dietas Ativas (badge: N vencem em breve, ícone verde)
- [x] Taxa de Adesão (badge: +N% vs mês anterior, ícone violeta)
- [x] Design Premium:
  - [x] Glassmorphism (vidro fosco)
  - [x] Gradientes sutis por tipo
  - [x] Hover effects com elevação
  - [x] Números animados (contador)
  - [x] Ícones coloridos por contexto
  - [x] Skeleton loading enquanto carrega

#### Agenda do Dia
- [x] Timeline visual com linha conectando consultas
- [x] Cards de consulta: horário, paciente, tipo (📍/💻), duração
- [x] Indicador "AGORA" para consulta atual
- [x] Ações: Ligar, Mensagem, Entrar (se online)
- [x] Link "Ver Agenda Completa" → `/calendar`

#### Paciente em Foco
- [x] Card destacado com próximo paciente ou paciente especial
- [x] Foto do paciente
- [x] Nome e objetivo principal
- [x] 4 mini métricas: IMC, Gordura, Músculo, Peso (com trends ↑↓)
- [x] Botões: Ver Perfil, Mensagem

#### Indicador de Adesão (Sistema de Cores)
> **PENDENTE:** Depende do cálculo da `adhesion_rate` no backend.
- [ ] Verde (>80% adesão)
- [ ] Âmbar (50-80% adesão)
- [ ] Vermelho (<50% adesão)

#### Ações Rápidas
- [x] 4 botões: + Novo Paciente, + Criar Dieta, + Agendar Consulta, + Anamnese

#### Notificações de Mensagens
> **PENDENTE:** Depende da implementação no backend para contar mensagens urgentes.
- [ ] Badge de mensagens não respondidas há 24h+ (vermelho pulsante)
- [ ] Preview no dropdown de notificações

### 2.6 Perfil do Usuário - Backend
- [ ] API `GET /api/v1/users/me/` - Dados do usuário autenticado
- [ ] API `PATCH /api/v1/users/me/` - Atualizar perfil
- [ ] API `POST /api/v1/users/me/change-password/` - Trocar senha

### 2.7 Perfil do Usuário - Frontend
- [ ] Página de Perfil/Configurações
- [ ] Upload de foto de perfil
- [ ] Configurações de notificações

---

## 👥 FASE 3: MÓDULOS PRINCIPAIS (2-3 meses)

### 3.1 Gestão de Pacientes - Backend
- [x] Modelo PatientProfile com campos completos
- [x] Views de CRUD (Django tradicional - converter para API REST)
- [x] API `GET /api/v1/patients/` - Listar pacientes (paginação, busca, filtros)
- [x] API `POST /api/v1/patients/` - Criar paciente
- [x] API `GET /api/v1/patients/{id}/` - Detalhes do paciente
- [x] API `PATCH /api/v1/patients/{id}/` - Atualizar paciente
- [x] API `DELETE /api/v1/patients/{id}/` - Deletar paciente (soft delete)
- [ ] API `GET /api/v1/patients/{id}/compare-photos/` - Comparar fotos antes/depois

### 3.2 Gestão de Pacientes - Frontend
- [x] Página Lista de Pacientes (grid de cards, busca, paginação)
- [x] Componente PatientCard
- [x] Modal/Página Criar Paciente (formulário multi-seção)
- [ ] Validações de formulário (email único, telefone BR, data nascimento)
- [x] Página Detalhes do Paciente - Vista Dashboard
  - [x] Seção de fotos (3 ângulos: frente, lateral, costas)
  - [x] 5 cards de métricas (peso, gordura, músculo, IMC, abdômen)
  - [x] Gráfico evolução corporal (Recharts - linha)
  - [x] Gráfico radar composição
- [ ] Página Detalhes do Paciente - Vista Timeline
- [x] Correções visuais e temas em Detalhes do Paciente (Responsividade, Dark Mode)
- [x] Integração Visual Premium em todas as abas (Visão Geral, Análise, Dieta)

### Próximos Passos (Backend Integration)
- [x] Conectar Lista de Pacientes com API Real
- [x] Implementar formulário completo de Anamnese
- [x] Integração do Dashboard com dados reais
- [x] Página Editar Paciente (Modal via Header)

### 3.3 Avaliações Físicas - Backend
- [x] Modelo Evaluation (peso, altura, gordura, massa magra, circunferências)
- [x] Modelo EvaluationPhoto (frente, lado, costas)
- [x] API `POST /api/v1/evaluations/` - Criar avaliação (multipart/form-data)
- [x] API `GET /api/v1/evaluations/?patient={id}` - Histórico de avaliações
- [x] API `GET /api/v1/evaluations/{id}/` - Detalhes de 1 avaliação
- [ ] Cálculo automático de IMC
- [ ] Storage para fotos (configurar django-storages + S3/CloudFlare R2)

### 3.4 Avaliações Físicas - Frontend
- [x] Modal/Página Criar Avaliação (formulário com upload de fotos)
- [x] Componente de upload de múltiplas fotos
- [ ] Histórico de avaliações na página do paciente
- [ ] Visualização de fotos em modal (galeria)

### 3.5 Anamnese - Backend
- [x] Modelo Anamnesis com 7 seções completas (~50 campos)
- [x] Serializer já existe
- [x] API `GET /api/v1/anamnesis/` - Listar anamneses (geral)
- [x] API `POST /api/v1/anamnesis/standard/` - Criar anamnese padrão
- [x] API `PATCH /api/v1/anamnesis/standard/{id}/` - Atualizar anamnese padrão
- [x] API `GET /api/v1/anamnesis/standard/?patient={id}` - Carregar do paciente
- [x] Auto-save a cada 30 segundos

### 3.6 Anamnese - Frontend
- [x] Página Lista de Anamneses
- [x] Componente Wizard multi-etapa (7 seções conforme modelo)
  - [x] Seção 1: Identificação
  - [x] Seção 2: Rotina
  - [x] Seção 3: Nutrição e Hábitos
  - [x] Seção 4: Histórico de Saúde
  - [x] Seção 5: Objetivos
  - [x] Seção 6: Medidas
  - [x] Seção 7: Fotos
- [x] Barra de progresso visual (usar `get_progresso()`)
- [x] Navegação entre seções
- [x] Validação por seção
- [x] Auto-save com indicador visual

### 3.7 Calendário/Agendamento - Backend
- [x] Modelo Appointment (paciente, data, notas)
- [x] Adicionar campos: duration, type (presencial/online), status, meeting_link
- [x] API `GET /api/v1/appointments/` - Listar consultas (filtros: data, paciente, status)
- [x] API `POST /api/v1/appointments/` - Criar consulta
- [x] API `GET /api/v1/appointments/{id}/` - Detalhes da consulta
- [x] API `PATCH /api/v1/appointments/{id}/` - Atualizar/reagendar
- [x] API `PATCH /api/v1/appointments/{id}/status/` - Mudar status
- [x] Validação de conflito de horário (double-booking)
- [x] Workflow de estados: Agendada → Confirmada → Concluída/Cancelada/Faltou

### 3.8 Calendário/Agendamento - Frontend
- [x] Página Calendário com 3 vistas (conforme wireframe)
  - [x] Vista Mês (grid 7x5 com indicadores)
  - [x] Vista Semana (timeline hora a hora)
  - [x] Vista Dia (lista expandida)
- [x] Componente de navegação de datas (hoje, anterior, próximo)
- [x] Modal Criar Consulta
  - [x] Select de paciente com busca
  - [x] Date picker
  - [x] Time picker com horários disponíveis
  - [x] Select de duração (30/45/60/90 min)
  - [x] Select de tipo (Presencial/Online)
  - [x] Campo para link de meeting
- [x] Cards de consultas com ações (detalhes, editar, cancelar)
- [x] Badges de status coloridos

---

## 🍽️ FASE 4: EDITOR DE DIETAS & INTEGRAÇÕES (2-3 meses)

### 4.1 Banco de Alimentos - Backend
- [x] Modelo AlimentoTACO (tabela TACO)
- [x] Modelo AlimentoTBCA (tabela TBCA - USP)
- [x] Modelo AlimentoUSDA (USDA FoodData Central)
- [ ] Importar dados das tabelas (verificar se já foi feito)
- [ ] API `GET /api/v1/foods/` - Buscar alimentos (autocomplete, filtros por categoria)
- [ ] API `POST /api/v1/foods/` - Criar alimento customizado
- [ ] Indexação para busca rápida (já existe Index no modelo)

### 4.2 Editor de Dietas - Backend
- [x] Modelo Diet com meals em JSON
- [x] Validadores de schema JSON para meals e substitutions
- [ ] API `GET /api/v1/diets/` - Listar dietas
- [ ] API `POST /api/v1/diets/` - Criar dieta
- [ ] API `GET /api/v1/diets/{id}/` - Detalhes da dieta
- [ ] API `PATCH /api/v1/diets/{id}/` - Atualizar dieta
- [ ] API `POST /api/v1/diets/{id}/generate-pdf/` - Gerar PDF
- [ ] API `GET /api/v1/diet-templates/` - Templates pré-definidos
- [ ] Cálculos automáticos de macros por refeição e total diário
- [ ] Geração de PDF profissional (weasyprint ou similar)

### 4.3 Editor de Dietas - Frontend
- [ ] Página Editor de Dietas com 5 abas (conforme wireframe)
  - [ ] Aba Contexto do Paciente
    - [ ] Dados básicos do paciente
    - [ ] Objetivo
    - [ ] Restrições alimentares (badges coloridos da anamnese)
    - [ ] Alergias
  - [ ] Aba Análise Nutricional
    - [ ] TMB calculada
    - [ ] GET sugerido
    - [ ] Macros recomendados
  - [ ] Aba Histórico
    - [ ] Dietas anteriores
    - [ ] O que funcionou/não funcionou
  - [ ] Aba Dieta (editor principal)
    - [ ] 6 seções de refeições
    - [ ] Busca e adição de alimentos
    - [ ] Cálculos automáticos por refeição
    - [ ] Resumo diário com barras de progresso
  - [ ] Aba Preview PDF
- [ ] Modal de Busca de Alimentos
  - [ ] Autocomplete
  - [ ] Filtros por categoria
  - [ ] Informações nutricionais
  - [ ] Ajuste de quantidade
- [ ] Componente Template Selector
  - [ ] Low-Carb 1800cal
  - [ ] Keto 1500cal
  - [ ] Mediterrânea 2000cal
  - [ ] Vegetariana 1700cal
  - [ ] Hipertrofia 2500cal
- [ ] Funcionalidade salvar rascunho
- [ ] Funcionalidade gerar e baixar PDF

### 4.4 Mensagens/Chat - Backend
- [x] Modelo Conversation (participantes)
- [x] Modelo Message (conversa, remetente, conteúdo, timestamp, is_read)
- [x] Serializers já existem
- [ ] API `GET /api/v1/conversations/` - Listar conversas
- [ ] API `GET /api/v1/conversations/{id}/messages/` - Listar mensagens
- [ ] API `POST /api/v1/conversations/{id}/messages/` - Enviar mensagem
- [ ] WebSocket `/ws/chat/{conversation_id}/` - Chat real-time (Django Channels)

### 4.5 Mensagens/Chat - Frontend
- [ ] Página Inbox (2 colunas: conversas | mensagens)
- [ ] Lista de conversas com busca e status online/offline
- [ ] Thread de mensagens (bubbles)
- [ ] Input de texto com envio
- [ ] Indicador de mensagens não lidas
- [ ] Conexão WebSocket para real-time
- [ ] Notificação de nova mensagem

### 4.6 Exames Laboratoriais - Backend
- [x] Modelo LabExam (paciente, nome, data, arquivo, notas)
- [ ] API `POST /api/v1/lab-exams/` - Upload de exame (multipart/form-data)
- [ ] API `GET /api/v1/patients/{id}/lab-exams/` - Histórico de exames

### 4.7 Exames Laboratoriais - Frontend
- [ ] Modal Upload de Exame
  - [ ] Select de paciente
  - [ ] Select de tipo de exame
  - [ ] Date picker
  - [ ] Upload de PDF
- [ ] Lista de exames na página do paciente
- [ ] Download de PDF

### 4.8 Notificações - Backend
- [x] Modelo Notification (usuário, tipo, mensagem, is_read)
- [x] Serializers já existem
- [ ] API `GET /api/v1/notifications/` - Listar notificações
- [ ] API `PATCH /api/v1/notifications/{id}/mark-read/` - Marcar como lida
- [ ] API `POST /api/v1/notifications/settings/` - Configurar preferências
- [ ] Celery tasks para notificações automáticas
  - [ ] Consulta em 1 hora
  - [ ] Dieta a vencer em 7 dias
  - [ ] Nova mensagem

### 4.9 Notificações - Frontend
- [ ] Componente Badge no sino (header)
- [ ] Dropdown de notificações
- [ ] Página de configurações de notificações
- [ ] Push notifications (PWA)

### 4.10 Busca Global
- [ ] API `GET /api/v1/search/?q={query}` - Busca em pacientes, dietas, consultas
- [ ] Componente SearchBar com autocomplete
- [ ] Resultados agrupados por tipo
- [ ] Navegação por teclado (↑↓ Enter)
- [ ] Highlight de termos

### 4.11 Integração Google Calendar
- [ ] Configurar OAuth Google Calendar API
- [ ] API `POST /api/v1/integrations/google-calendar/sync/` - Sincronização
- [ ] Exportar consultas para Google Calendar
- [ ] Importar eventos do Google Calendar

### 4.12 Configurações de Branding
- [ ] Backend: Modelo UserBranding (logo, assinatura, crn)
- [ ] API `POST /api/v1/users/me/branding/` - Upload e configurações
- [ ] Frontend: Página de Branding em Configurações
- [ ] Preview de Logo e Assinatura
- [ ] Integração com gerador de PDF (aplicar nos documentos)

### 4.13 Automação de Mensagens
- [ ] Backend: Modelo AutomationTemplate (trigger, content, is_active)
- [ ] API `GET/POST /api/v1/automation/templates/` - CRUD Templates
- [ ] Editor de Templates (Frontend) com variáveis dinâmicas
- [ ] Implementar Triggers (Celery):
  - [ ] Confirmação de Agendamento
  - [ ] Lembrete 24h
  - [ ] Aniversário
  - [ ] Follow-up pós-consulta

---

## 🚀 FASE 5: ENTERPRISE & POLISH (2-3 meses)

### 5.1 Dashboard do Paciente
- [ ] API `GET /api/v1/dashboard/patient/` - Dashboard simplificado
- [ ] Página Dashboard Paciente
  - [ ] Progresso de metas
  - [ ] Próxima consulta
  - [ ] Plano alimentar atual
  - [ ] Gráfico de evolução

### 5.2 Diário & Comunidade (App Paciente)
- [ ] Backend: Modelo PatientDiaryEntry (paciente, tipo, foto, texto, timestamp)
- [ ] Backend: Modelo SocialLike (quem curtiu)
- [ ] Backend: Modelo SocialComment (quem comentou - restrito ao dono)
- [ ] API `POST /api/v1/patient-diary/` - Postar entrada
- [ ] API `GET /api/v1/community/feed/` - Feed da comunidade (apenas opt-in)
- [ ] Frontend Mobile/App:
  - [ ] Tela Diário (Upload rápido de foto)
  - [ ] Tela Feed Comunidade
  - [ ] Lógica de interação restrita (Like all, Comment self only)
  - [ ] Notificações de engajamento

### 5.2 2FA (Two-Factor Auth)
- [ ] API `POST /api/v1/auth/2fa/enable/` - Habilitar 2FA
- [ ] Geração de QR code para TOTP
- [ ] Verificação de código no login
- [ ] Página de configuração 2FA

### 5.3 IA Insights (Básico)
- [ ] API `GET /api/v1/patients/{id}/ai-insights/` - Sugestões automáticas
- [ ] Algoritmo de análise de progresso
- [ ] Componente de exibição de insights
- [ ] Exemplos: "Gordura reduzindo consistentemente", "Músculo estagnado"

### 5.4 Performance & Otimização
- [ ] Implementar lazy loading de rotas (Next.js dynamic imports)
- [ ] Configurar cache Redis para queries frequentes
- [ ] Otimizar imagens (Next.js Image component, WebP)
- [ ] Implementar paginação em todas as listas
- [ ] Configurar CDN para assets estáticos
- [ ] Profiling com django-silk (dev only)

### 5.5 Testes
- [x] Estrutura de testes existe (users/tests.py, diets/tests.py, notifications/tests.py)
- [ ] Aumentar cobertura de testes backend (pytest, coverage > 80%)
- [ ] Unit tests frontend (Vitest)
- [ ] Integration tests (React Testing Library)
- [ ] E2E tests jornadas críticas (Playwright)
  - [ ] Login completo
  - [ ] Criar paciente
  - [ ] Criar dieta
  - [ ] Agendar consulta

### 5.6 Segurança
- [x] Configurações de segurança em produção (HTTPS, HSTS, XSS, CSRF)
- [ ] Revisar rate limiting em todas as APIs
- [ ] Implementar audit logs para ações críticas
- [ ] Criptografia de dados sensíveis (LGPD)

### 5.7 Acessibilidade
- [ ] Navegação por teclado em todos os componentes
- [ ] Atributos ARIA corretos
- [ ] Contraste mínimo 4.5:1
- [ ] Screen reader support
- [ ] Validação WCAG 2.1 AA

### 5.8 PWA (Progressive Web App)
- [ ] Configurar Service Workers
- [ ] Manifest.json para instalação
- [ ] Cache offline (dados de leitura)
- [ ] Push notifications
- [ ] Ícones e splash screens

### 5.9 Deploy Produção
- [ ] Configurar ambiente de produção
- [ ] Setup frontend (Vercel ou Netlify)
- [ ] Setup backend (Railway, Fly.io, ou AWS)
- [ ] Configurar banco de dados managed (PlanetScale, AWS RDS)
- [ ] Configurar backups automáticos
- [ ] Configurar Sentry para error tracking
- [ ] Configurar monitoring (uptime, APM)

### 5.10 Documentação Final
- [ ] README.md atualizado
- [ ] ARCHITECTURE.md (decisões arquiteturais)
- [ ] API.md ou Swagger UI configurado (drf-spectacular)
- [ ] DEPLOYMENT.md (guia de deploy)
- [ ] CONTRIBUTING.md

---

## 📊 RESUMO DO STATUS ATUAL

### ✅ O QUE JÁ ESTÁ PRONTO (Backend):

| Módulo | Models | Serializers | APIs REST | Views Django |
|--------|--------|-------------|-----------|--------------|
| Users | ✅ | - | ✅ JWT | ✅ Login/Register |
| Patients | ✅ | ✅ | ⚠️ Parcial | ✅ CRUD |
| Diets | ✅ (3 tabelas alimentos) | - | ⚠️ Parcial | ✅ |
| Appointments | ✅ | - | ❌ | ✅ |
| Anamnesis | ✅ (7 seções) | ✅ | ⚠️ Parcial | ✅ |
| Evaluations | ✅ + Photos | - | ❌ | ✅ |
| Messages | ✅ | ✅ | ⚠️ Parcial | - |
| Notifications | ✅ | ✅ | ⚠️ Parcial | - |
| Lab Exams | ✅ | - | ❌ | ✅ |

### 🔄 PRÓXIMOS PASSOS RECOMENDADOS:

1. **Decisão Frontend:** Manter Vite ou migrar para Next.js?
2. **Completar APIs REST:** Converter views Django tradicionais para APIs REST
3. **Começar Frontend SPA:** Criar estrutura base e design system
4. **Integrar Frontend + Backend:** Conectar via APIs REST com JWT

---

## 📋 FORA DO ESCOPO (V1)

Os seguintes itens estão explicitamente fora do escopo da V1:

- ❌ Pagamentos integrados (Stripe/Mercado Pago) - app existe mas não prioritário
- ❌ Videochamada nativa
- ❌ Integração com wearables (Fitbit, Apple Health)
- ❌ App mobile nativo (React Native)
- ❌ Multi-tenancy (clínicas)
- ❌ RBAC avançado (permissões granulares)
- ❌ API pública
- ❌ Marketplace de templates
- ❌ Internacionalização (i18n)
- ❌ Drag & Drop para reagendamento

---

**Criado por:** Análise AI  
**Data:** 04/12/2025  
**Última Atualização:** 04/12/2025 (v1.1 - adicionado status atual)  
**Próxima Revisão:** Após conclusão de cada fase
