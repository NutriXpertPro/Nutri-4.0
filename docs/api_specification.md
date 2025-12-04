# 🔌 API SPECIFICATION
## NutriXpertPro REST API v1

**Versão:** 1.0  
**Base URL:** `https://api.nutrixpertpro.com.br/api/v1/`  
**Autenticação:** JWT Bearer Token  
**Data:** 03/12/2025

---

## 📋 SUMÁRIO

Total de Endpoints: **36**

1. [Autenticação](#autenticação) - 7 endpoints
2. [Usuários](#usuários) - 3 endpoints
3. [Pacientes](#pacientes) - 6 endpoints
4. [Dietas](#dietas) - 5 endpoints
5. [Alimentos](#alimentos) - 2 endpoints
6. [Consultas](#consultas) - 5 endpoints
7. [Anamnese](#anamnese) - 3 endpoints
8. [Avaliações](#avaliações) - 3 endpoints
9. [Mensagens](#mensagens) - 4 endpoints
10. [Exames Lab](#exames-laboratoriais) - 2 endpoints
11. [Notificações](#notificações) - 3 endpoints
12. [Dashboard](#dashboard) - 3 endpoints

---

## 🔐 AUTENTICAÇÃO

### POST /auth/login/
**Descrição:** Login com email e senha

**Request:**
```json
{
  "email": "nutri@example.com",
  "password": "senha123"
}
```

**Response 200:**
```json
{
  "user": {
    "id": 1,
    "email": "nutri@example.com",
    "name": "Dr. João Silva",
    "user_type": "nutritionist",
    "profile_picture": "https://..."
  },
  "tokens": {
    "access": "eyJ0eXAiOiJKV1Q...",
    "refresh": "eyJ0eXAiOiJKV1Q..."
  }
}
```

**Errors:**
- 400: Invalid credentials
- 429: Too many attempts

---

### POST /auth/register/nutritionist/
**Descrição:** Registro de nutricionista

**Request:**
```json
{
  "name": "Dr. João Silva",
  "email": "joao@example.com",
  "password": "SenhaForte123!",
  "professional_title": "Dr.",
  "gender": "M"
}
```

**Response 201:**
```json
{
  "id": 1,
  "email": "joao@example.com",
  "name": "Dr. João Silva",
  "message": "Registro realizado com sucesso"
}
```

---

### POST /auth/google/
**Descrição:** OAuth Google

**Request:**
```json
{
  "token": "google_oauth_token_here"
}
```

**Response:** Mesmo que /auth/login/

---

### POST /auth/refresh/
**Descrição:** Renovar access token

**Request:**
```json
{
  "refresh": "eyJ0eXAiOiJKV1Q..."
}
```

**Response 200:**
```json
{
  "access": "novo_token_aqui"
}
```

---

### POST /auth/logout/
**Descrição:** Invalidar token

**Request:** (Bearer token no header)

**Response 204:** No content

---

### POST /auth/password-reset/
**Descrição:** Solicitar reset de senha

**Request:**
```json
{
  "email": "nutri@example.com"
}
```

**Response 200:**
```json
{
  "message": "Email enviado com instruções"
}
```

---

### POST /auth/password-reset/confirm/
**Descrição:** Confirmar nova senha

**Request:**
```json
{
  "token": "reset_token_from_email",
  "password": "NovaSenha123!"
}
```

**Response 200:**
```json
{
  "message": "Senha alterada com sucesso"
}
```

---

## 👥 USUÁRIOS

### GET /users/me/
**Descrição:** Dados do usuário autenticado

**Response 200:**
```json
{
  "id": 1,
  "email": "nutri@example.com",
  "name": "Dr. João Silva",
  "user_type": "nutritionist",
  "professional_title": "Dr.",
  "gender": "M",
  "profile_picture": "https://...",
  "created_at": "2025-01-01T10:00:00Z",
  "settings": {
    "notifications_email": true,
    "notifications_push": true,
    "theme": "dark",
    "language": "pt-BR"
  }
}
```

---

### PATCH /users/me/
**Descrição:** Atualizar perfil

**Request:**
```json
{
  "name": "Dr. João Pedro Silva",
  "profile_picture": "base64_image_or_url"
}
```

**Response 200:** Mesmo que GET /users/me/

---

### POST /users/me/change-password/
**Descrição:** Trocar senha (logado)

**Request:**
```json
{
  "old_password": "SenhaAntiga123!",
  "new_password": "NovaSenha456!"
}
```

**Response 200:**
```json
{
  "message": "Senha alterada com sucesso"
}
```

---

## 👤 PACIENTES

### GET /patients/
**Descrição:** Listar pacientes do nutricionista

**Query Params:**
- `search` (string): Busca por nome/email
- `sort` (string): `created_at`, `-created_at`, `name`, `-name`
- `page` (int): Página (padrão 1)
- `page_size` (int): Itens por página (padrão 20)
- `is_active` (bool): Filtrar ativos/inativos

**Response 200:**
```json
{
  "count": 125,
  "next": "https://api.../patients/?page=2",
  "previous": null,
  "results": [
    {
      "id": 1,
      "user": {
        "name": "Maria Silva",
        "email": "maria@example.com",
        "profile_picture": "https://..."
      },
      "phone": "(11) 99999-9999",
      "created_at": "2025-01-15T10:00:00Z",
      "is_active": true,
      "last_appointment": "2025-12-01T14:00:00Z"
    }
  ]
}
```

---

### POST /patients/
**Descrição:** Criar paciente

**Request:**
```json
{
  "name": "Maria Silva",
  "email": "maria@example.com",
  "password": "Senha123!",
  "date_of_birth": "1990-05-15",
  "phone": "(11) 99999-9999",
  "address": "Rua Exemplo, 123"
}
```

**Response 201:**
```json
{
  "id": 1,
  "user": {
    "id": 50,
    "name": "Maria Silva",
    "email": "maria@example.com"
  },
  "message": "Paciente cadastrado com sucesso"
}
```

---

### GET /patients/{id}/
**Descrição:** Detalhes do paciente

**Response 200:**
```json
{
  "id": 1,
  "user": {
    "name": "Maria Silva",
    "email": "maria@example.com",
    "profile_picture": "https://..."
  },
  "phone": "(11) 99999-9999",
  "date_of_birth": "1990-05-15",
  "age": 35,
  "address": "Rua Exemplo, 123",
  "created_at": "2025-01-15T10:00:00Z",
  "goals": "Perder 10kg em 6 meses",
  "current_metrics": {
    "weight": 78.0,
    "body_fat": 22.8,
    "muscle_mass": 59.5,
    "bmi": 26.4,
    "waist": 85.0
  },
  "initial_metrics": {
    "weight": 85.0,
    "body_fat": 28.0,
    "muscle_mass": 58.0,
    "bmi": 28.8,
    "waist": 95.0
  },
  "goal_metrics": {
    "weight": 72.0,
    "body_fat": 18.0,
    "muscle_mass": 62.0,
    "bmi": 24.0,
    "waist": 75.0
  },
  "total_appointments": 12,
  "total_diets": 3,
  "total_evaluations": 5
}
```

---

### PATCH /patients/{id}/
**Descrição:** Atualizar paciente

**Request:** (campos parciais)
```json
{
  "phone": "(11) 88888-8888",
  "address": "Nova Rua, 456"
}
```

**Response 200:** Mesmo que GET /patients/{id}/

---

### DELETE /patients/{id}/
**Descrição:** Deletar paciente (soft delete)

**Response 204:** No content

---

### GET /patients/{id}/compare-photos/
**Descrição:** Primeira vs última avaliação

**Response 200:**
```json
{
  "first_evaluation": {
    "date": "2025-01-15",
    "photos": {
      "front": "https://...",
      "side": "https://...",
      "back": "https://..."
    },
    "weight": 85.0
  },
  "latest_evaluation": {
    "date": "2025-11-30",
    "photos": {
      "front": "https://...",
      "side": "https://...",
      "back": "https://..."
    },
    "weight": 78.0
  },
  "progress": {
    "weight_lost": -7.0,
    "percentage": 8.2
  }
}
```

---

## 🍽️ DIETAS

### GET /diets/
**Descrição:** Listar dietas

**Query Params:**
- `search` (string): Nome dieta ou paciente
- `patient` (int): Filtrar por ID paciente
- `is_active` (bool): Ativas/inativas
- `page`, `page_size`

**Response 200:**
```json
{
  "count": 45,
  "results": [
    {
      "id": 1,
      "name": "Low-Carb 1800cal",
      "patient": {
        "id": 1,
        "name": "Maria Silva"
      },
      "created_at": "2025-11-01",
      "is_active": true,
      "total_meals": 6,
      "daily_calories": 1800,
      "macros": {
        "protein": 150,
        "carbs": 120,
        "fat": 60
      }
    }
  ]
}
```

---

### POST /diets/
**Descrição:** Criar dieta

**Request:**
```json
{
  "patient_id": 1,
  "name": "Low-Carb 1800cal",
  "duration_days": 30,
  "start_date": "2025-12-04",
  "meals": [
    {
      "name": "Café da Manhã",
      "time": "07:00",
      "foods": [
        {
          "food_id": 123,
          "quantity": 150,
          "unit": "g"
        }
      ]
    }
  ],
  "notes": "Paciente com restrição a lactose"
}
```

**Response 201:**
```json
{
  "id": 1,
  "message": "Dieta criada com sucesso",
  "pdf_url": "https://.../diets/1/pdf/"
}
```

---

### GET /diets/{id}/
**Descrição:** Detalhes da dieta

**Response 200:** Estrutura completa com todas meals e foods

---

### PATCH /diets/{id}/
**Descrição:** Atualizar dieta

**Response 200:** Dieta atualizada

---

### POST /diets/{id}/generate-pdf/
**Descrição:** Gerar PDF da dieta

**Response 200:**
```json
{
  "pdf_url": "https://cdn.../diets/1.pdf"
}
```

---

## 🥗 ALIMENTOS

### GET /foods/
**Descrição:** Buscar alimentos

**Query Params:**
- `search` (string): Nome do alimento
- `category` (string): Categoria (frutas, carnes, etc)
- `page`, `page_size`

**Response 200:**
```json
{
  "count": 3500,
  "results": [
    {
      "id": 123,
      "name": "Peito de Frango Grelhado",
      "category": "Carnes",
      "default_portion": 100,
      "unit": "g",
      "nutrition": {
        "calories": 165,
        "protein": 31,
        "carbs": 0,
        "fat": 3.6,
        "fiber": 0
      },
      "source": "TACO"
    }
  ]
}
```

---

### POST /foods/
**Descrição:** Criar alimento customizado

**Request:**
```json
{
  "name": "Minha Receita Especial",
  "category": "Custom",
  "default_portion": 150,
  "unit": "g",
  "nutrition": {
    "calories": 200,
    "protein": 15,
    "carbs": 20,
    "fat": 8
  }
}
```

**Response 201:** Alimento criado

---

## 📅 CONSULTAS

### GET /appointments/
**Descrição:** Listar consultas

**Query Params:**
- `start_date` (date): Filtro início
- `end_date` (date): Filtro fim
- `patient` (int): ID paciente
- `status` (string): scheduled, confirmed, completed, cancelled, no_show

**Response 200:**
```json
{
  "count": 25,
  "results": [
    {
      "id": 1,
      "patient": {
        "id": 1,
        "name": "Maria Silva",
        "profile_picture": "https://..."
      },
      "date": "2025-12-04",
      "time": "09:00",
      "duration_minutes": 60,
      "type": "presential",
      "status": "scheduled",
      "notes": "Primeira consulta - Avaliação",
      "meeting_link": null
    }
  ]
}
```

---

### POST /appointments/
**Descrição:** Criar consulta

**Request:**
```json
{
  "patient_id": 1,
  "date": "2025-12-04",
  "time": "09:00",
  "duration_minutes": 60,
  "type": "online",
  "meeting_link": "https://zoom.us/...",
  "notes": "Retorno - ajuste de dieta"
}
```

**Response 201:** Consulta criada

---

### GET /appointments/{id}/
**Descrição:** Detalhes da consulta

---

### PATCH /appointments/{id}/
**Descrição:** Atualizar (incluindo reagendar)

---

### PATCH /appointments/{id}/status/
**Descrição:** Mudar status

**Request:**
```json
{
  "status": "confirmed"
}
```

**Response 200:** Consulta atualizada

---

## 📝 ANAMNESE

### GET /anamnesis/
**Descrição:** Listar anamneses

**Response:** Lista com progresso %

---

### POST /anamnesis/
**Descrição:** Criar anamnese

**Request:**
```json
{
  "patient_id": 1,
  "data": {
    "personal": {...},
    "medical_history": {...},
    "diet_restrictions": ["lactose", "gluten"],
    "allergies": ["camarão"],
    "is_vegetarian": false,
    // ~50 campos
  }
}
```

**Response 201:** Anamnese criada

---

### PATCH /anamnesis/{id}/
**Descrição:** Atualizar (salvar rascunho)

**Request:** Campos parciais

---

## 📊 AVALIAÇÕES

### POST /evaluations/
**Descrição:** Criar avaliação física

**Request:** (multipart/form-data)
```
patient_id: 1
date: 2025-12-04
weight: 78.0
height: 165
body_fat: 22.8
muscle_mass: 59.5
measurements: {"waist": 85, "hip": 100, ...}
photo_front: [FILE]
photo_side: [FILE]
photo_back: [FILE]
notes: "Progresso excelente"
```

**Response 201:** Avaliação criada

---

### GET /patients/{id}/evaluations/
**Descrição:** Histórico de avaliações

**Response 200:**
```json
{
  "count": 5,
  "results": [
    {
      "id": 5,
      "date": "2025-11-30",
      "weight": 78.0,
      "body_fat": 22.8,
      "muscle_mass": 59.5,
      "bmi": 26.4,
      "photos": {
        "front": "https://...",
        "side": "https://...",
        "back": "https://..."
      }
    }
  ]
}
```

---

### GET /evaluations/{id}/
**Descrição:** Detalhes de 1 avaliação

---

## 💬 MENSAGENS

### GET /conversations/
**Descrição:** Listar conversas

**Response 200:**
```json
{
  "results": [
    {
      "id": 1,
      "participants": [
        {"id": 1, "name": "Dr. João", "status": "online"},
        {"id": 50, "name": "Maria Silva", "status": "offline"}
      ],
      "last_message": {
        "content": "Obrigada!",
        "timestamp": "2025-12-03T15:30:00Z",
        "sender_id": 50
      },
      "unread_count": 2
    }
  ]
}
```

---

### GET /conversations/{id}/messages/
**Descrição:** Listar mensagens de uma conversa

**Response 200:**
```json
{
  "results": [
    {
      "id": 1,
      "sender": {"id": 1, "name": "Dr. João"},
      "content": "Tudo bem?",
      "timestamp": "2025-12-03T15:00:00Z",
      "is_read": true
    }
  ]
}
```

---

### POST /conversations/{id}/messages/
**Descrição:** Enviar mensagem

**Request:**
```json
{
  "content": "Olá! Como está a dieta?"
}
```

**Response 201:** Mensagem criada

---

### WebSocket: /ws/chat/{conversation_id}/
**Descrição:** Real-time chat

**Mensagens:**
```json
{
  "type": "message",
  "data": {
    "id": 123,
    "sender_id": 1,
    "content": "Nova mensagem",
    "timestamp": "2025-12-03T16:00:00Z"
  }
}
```

---

## 🔬 EXAMES LABORATORIAIS

### POST /lab-exams/
**Descrição:** Upload de exame

**Request:** (multipart/form-data)
```
patient_id: 1
exam_type: "Hemograma"
exam_date: "2025-11-15"
file: [PDF_FILE]
notes: "Valores dentro da normalidade"
```

**Response 201:** Exame criado

---

### GET /patients/{id}/lab-exams/
**Descrição:** Histórico de exames

**Response 200:**
```json
{
  "results": [
    {
      "id": 1,
      "exam_type": "Hemograma",
      "exam_date": "2025-11-15",
      "file_url": "https://.../exams/1.pdf",
      "notes": "Valores dentro da normalidade"
    }
  ]
}
```

---

## 🔔 NOTIFICAÇÕES

### GET /notifications/
**Descrição:** Listar notificações

**Query Params:**
- `is_read` (bool): Filtrar lidas/não lidas

**Response 200:**
```json
{
  "count": 15,
  "unread_count": 3,
  "results": [
    {
      "id": 1,
      "type": "new_message",
      "title": "Nova mensagem de Maria Silva",
      "message": "Maria enviou uma mensagem",
      "is_read": false,
      "created_at": "2025-12-03T15:30:00Z",
      "action_url": "/messages/1"
    }
  ]
}
```

---

### PATCH /notifications/{id}/mark-read/
**Descrição:** Marcar como lida

**Response 200:** Notificação atualizada

---

### POST /notifications/settings/
**Descrição:** Configurar preferências

**Request:**
```json
{
  "email": true,
  "push": true,
  "sms": false,
  "types": {
    "new_message": true,
    "appointment_reminder": true,
    "diet_expiring": false
  }
}
```

**Response 200:** Configurações salvas

---

## 📊 DASHBOARD

### GET /dashboard/stats/
**Descrição:** Estatísticas do dashboard

**Response 200:**
```json
{
  "total_patients": 125,
  "patients_trend": 12.5,
  "appointments_today": 8,
  "next_appointment": "2025-12-04T09:00:00Z",
  "active_diets": 98,
  "diets_expiring_soon": 12,
  "average_rating": 4.9,
  "new_feedbacks": 3
}
```

---

### GET /appointments/today/
**Descrição:** Agenda do dia

**Response 200:** Lista de consultas do dia

---

### GET /patients/featured/
**Descrição:** Paciente em foco (aleatório ou configurado)

**Response 200:** Dados completos de 1 paciente

---

## 📋 PADRÕES GERAIS

### Autenticação
```
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc...
```

### Paginação
```json
{
  "count": 125,
  "next": "https://api.../resource/?page=2",
  "previous": null,
  "results": [...]
}
```

### Erros
```json
{
  "error": "validation_error",
  "message": "Os dados fornecidos são inválidos",
  "details": {
    "email": ["Este campo é obrigatório"],
    "password": ["Senha muito fraca"]
  }
}
```

### HTTP Status Codes
- `200` OK
- `201` Created
- `204` No Content
- `400` Bad Request
- `401` Unauthorized
- `403` Forbidden
- `404` Not Found
- `429` Too Many Requests
- `500` Internal Server Error

---

## 🔒 RATE LIMITING

- **Geral:** 100 requests/minuto por IP
- **Auth:** 5 tentativas/minuto
- **Upload:** 10 uploads/hora

Headers de resposta:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1638360000
```

---

## 🧪 AMBIENTE DE TESTE

**Base URL:** `https://api-staging.nutrixpertpro.com.br/api/v1/`

**Usuário Teste:**
```
Email: demo@nutrixpert.com
Senha: Demo123!
```

---

**Criado por:** Backend Team  
**Data:** 03/12/2025  
**Próxima Atualização:** Quando houver mudanças
