# Documentação da API - NutriXpertPro

## 📘 Visão Geral

A API do NutriXpertPro é uma API REST baseada em JSON que segue os princípios RESTful. A autenticação é feita via JWT (JSON Web Tokens).

### Base URL
```
https://api.nutrixpertpro.com.br/api/v1/
```

### Autenticação

A autenticação é feita via Bearer Token JWT. Para obter um token, envie credenciais para `/auth/token/`.

**Exemplo de request com token:**
```
Authorization: Bearer <seu-token-jwt>
```

### Formato de Dados

Todos os dados são enviados e recebidos no formato JSON.

## 🔐 Autenticação

### Obter Token
```
POST /api/v1/auth/token/
```

**Body:**
```json
{
  "email": "seu@email.com",
  "password": "sua-senha"
}
```

**Response:**
```json
{
  "access": "token-jwt-access",
  "refresh": "token-jwt-refresh",
  "user": {
    "id": 1,
    "email": "seu@email.com",
    "name": "Nome do Usuário",
    "user_type": "nutricionista"
  }
}
```

### Refresh Token
```
POST /api/v1/auth/token/refresh/
```

**Body:**
```json
{
  "refresh": "token-jwt-refresh"
}
```

**Response:**
```json
{
  "access": "novo-token-jwt-access"
}
```

### Logout
```
POST /api/v1/auth/logout/
```

**Headers:**
```
Authorization: Bearer <seu-token-jwt>
```

## 👥 Usuários

### Obter Dados do Usuário Autenticado
```
GET /api/v1/users/me/
```

**Response:**
```json
{
  "id": 1,
  "email": "exemplo@nutricionista.com",
  "name": "Dr. João Silva",
  "professional_title": "NUT",
  "gender": "M",
  "settings": {
    "theme": "light",
    "language": "pt-BR",
    "notifications_email": true,
    "notifications_push": true
  }
}
```

### Atualizar Dados do Usuário
```
PATCH /api/v1/users/me/
```

## 🧍 Pacientes

### Listar Pacientes
```
GET /api/v1/patients/
```

**Parâmetros de Query:**
- `search`: Busca por nome do paciente
- `page`: Número da página (padrão: 1)
- `page_size`: Tamanho da página (padrão: 20)

**Response:**
```json
{
  "count": 50,
  "next": "http://api.nutrixpertpro.com.br/api/v1/patients/?page=2",
  "previous": null,
  "results": [
    {
      "id": 1,
      "user": {
        "id": 2,
        "name": "Maria Oliveira",
        "email": "maria@email.com"
      },
      "birth_date": "1985-03-15",
      "phone": "+5511999999999",
      "address": "Rua Exemplo, 123 - São Paulo/SP",
      "goal": "PERDA_GORDURA",
      "service_type": "ONLINE",
      "start_date": "2025-01-01",
      "is_active": true,
      "created_at": "2025-01-01T12:00:00Z"
    }
  ]
}
```

### Criar Paciente
```
POST /api/v1/patients/
```

**Body:**
```json
{
  "user": {
    "name": "Novo Paciente",
    "email": "paciente@email.com",
    "password": "senha-segura"
  },
  "birth_date": "1990-01-01",
  "phone": "+5511988887777",
  "address": "Rua do Paciente, 456 - Cidade/UF",
  "goal": "GANHO_MASSA",
  "service_type": "PRESENCIAL"
}
```

### Obter Detalhes de Paciente
```
GET /api/v1/patients/{id}/
```

### Atualizar Paciente
```
PATCH /api/v1/patients/{id}/
```

### Deletar Paciente
```
DELETE /api/v1/patients/{id}/
```

## 📅 Consultas

### Listar Consultas
```
GET /api/v1/appointments/
```

**Parâmetros de Query:**
- `patient`: Filtrar por ID do paciente
- `date_after`: Filtrar por datas após (formato: YYYY-MM-DD)
- `date_before`: Filtrar por datas antes (formato: YYYY-MM-DD)
- `status`: Filtrar por status (AGENDADA, CONFIRMADA, CONCLUIDA, CANCELADA, FALTOU)

**Response:**
```json
{
  "count": 10,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 1,
      "patient": {
        "id": 1,
        "user": {
          "id": 2,
          "name": "Maria Oliveira"
        }
      },
      "date": "2025-12-20T10:00:00Z",
      "duration": 60,
      "type": "online",
      "status": "agendada",
      "notes": "Consulta de retorno",
      "meeting_link": "https://exemplo.zoom.us/...",
      "created_at": "2025-12-01T09:00:00Z"
    }
  ]
}
```

### Criar Consulta
```
POST /api/v1/appointments/
```

**Body:**
```json
{
  "patient": 1,
  "date": "2025-12-20T10:00:00Z",
  "duration": 60,
  "type": "online",
  "notes": "Consulta de retorno"
}
```

## 🍽️ Dietas

### Listar Dietas
```
GET /api/v1/diets/
```

**Parâmetros de Query:**
- `patient`: Filtrar por ID do paciente
- `is_active`: Filtrar por dietas ativas (true/false)

### Criar Dieta
```
POST /api/v1/diets/
```

**Body:**
```json
{
  "patient": 1,
  "name": "Dieta Low Carb 1800kcal",
  "description": "Dieta para perda de peso",
  "is_active": true,
  "meals": [
    {
      "name": "Café da Manhã",
      "items": [
        {
          "food_id": 123,
          "quantity": 2,
          "unit": "unidade",
          "food_type": "alimentotaco"
        }
      ]
    }
  ]
}
```

## 📋 Anamnese

### Obter Anamnese Padrão
```
GET /api/v1/anamnesis/standard/
```

### Criar Anamnese Padrão
```
POST /api/v1/anamnesis/standard/
```

## 📊 Avaliações Físicas

### Listar Avaliações
```
GET /api/v1/evaluations/
```

**Parâmetros de Query:**
- `patient`: Filtrar por ID do paciente

### Criar Avaliação
```
POST /api/v1/evaluations/
```

**Body (multipart/form-data):**
```
patient: 1
weight: 75.2
height: 170
body_fat: 24.5
muscle_mass: 35.0
arm_circumference: 28.5
waist_circumference: 85.0
hip_circumference: 98.0
photo_frente: <file>
photo_lado: <file>
photo_costas: <file>
notes: Observações adicionais
```

## 💬 Mensagens

### Listar Conversas
```
GET /api/v1/messages/conversations/
```

### Listar Mensagens de Conversa
```
GET /api/v1/messages/?conversation={conversation_id}
```

### Enviar Mensagem
```
POST /api/v1/messages/
```

**Body:**
```json
{
  "conversation": 1,
  "content": "Sua mensagem aqui"
}
```

## 🔔 Notificações

### Listar Notificações
```
GET /api/v1/notifications/
```

### Marcar Notificação como Lida
```
PATCH /api/v1/notifications/{id}/mark-read/
```

## 🧪 Exames Laboratoriais

### Listar Exames
```
GET /api/v1/lab-exams/
```

### Criar Exame
```
POST /api/v1/lab-exams/ (multipart/form-data)
```

**Fields:**
```
patient: 1
name: "Hemograma Completo"
exam_type: "Sangue"
date: "2025-11-30"
notes: "Jejum necessário"
file: <arquivo-pdf>
```

## 📈 Dashboard

### Estatísticas do Dashboard
```
GET /api/v1/dashboard/stats/
```

**Response:**
```json
{
  "active_patients": 25,
  "appointments_today": 5,
  "active_diets": 18,
  "adhesion_rate": 87
}
```

### Consultas do Dia
```
GET /api/v1/dashboard/appointments/today/
```

### Paciente em Foco
```
GET /api/v1/dashboard/patients/featured/
```

## 🤖 Automação de Mensagens

### Listar Templates
```
GET /api/v1/automation/templates/
```

### Criar Template
```
POST /api/v1/automation/templates/
```

**Body:**
```json
{
  "name": "Confirmação de Consulta",
  "trigger": "appointment_confirmation",
  "content": "Olá {patient_name}, sua consulta com {nutritionist_name} foi confirmada para {appointment_date} às {appointment_time}.",
  "is_active": true
}
```

## 🎨 Configurações de Branding

### Obter Configurações de Branding
```
GET /api/v1/branding/branding/me/
```

### Atualizar Configurações de Branding
```
PATCH /api/v1/branding/branding/me/ (multipart/form-data)
```

## 📅 Integração com Google Calendar

### Obter URL de Autenticação
```
GET /api/v1/integrations/google-calendar/auth/
```

### Sincronizar Consulta
```
POST /api/v1/integrations/google-calendar/sync/sync_appointment/
```

**Body:**
```json
{
  "appointment_id": 1,
  "calendar_id": "primary"
}
```

## 📦 Respostas de Erro

Todas as respostas de erro seguem o formato:

```json
{
  "error": "Descrição do erro",
  "details": {
    "campo": ["Mensagem de erro específica"]
  }
}
```

## 🚀 Rate Limiting

A API tem limites de rate limiting:
- Autenticação: 5 tentativas por minuto por IP
- Demais endpoints: 1000 requisições por hora por token

## 🛡️ Segurança

- SSL obrigatório em todas as requisições
- CSRF proteção em endpoints apropriados
- Validação rigorosa de entradas
- Proteção contra injeção de SQL e XSS

---

**Versão da API**: 1.0  
**Última Atualização**: 16/12/2025