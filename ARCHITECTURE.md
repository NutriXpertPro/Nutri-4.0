# Documentação da Arquitetura - NutriXpertPro

## Visão Geral

NutriXpertPro é uma aplicação web full-stack com arquitetura de API REST headless. O backend é baseado em Django com Django REST Framework, enquanto o frontend é uma aplicação Next.js SPA (Single Page Application).

## Arquitetura Técnica

### Backend (Django)
```
Backend Structure:
├── setup/                 # Configuração do projeto Django
├── users/                 # Autenticação e gerenciamento de usuários
├── patients/              # Gestão de pacientes
├── appointments/          # Sistema de agendamento
├── diets/                 # Editor de dietas e banco de alimentos
├── anamnesis/             # Anamnese completa
├── evaluations/           # Avaliação física
├── messages/              # Sistema de mensagens
├── notifications/         # Sistema de notificações
├── lab_exams/             # Exames laboratoriais
├── automation/            # Automação de mensagens
├── branding/              # Configurações de branding
├── integrations/          # Integrações (Google Calendar, etc.)
└── dashboard/             # APIs do dashboard
```

### Frontend (Next.js)
```
Frontend Structure:
├── src/
│   ├── app/              # Pages Router do Next.js 13+
│   │   ├── dashboard/    # Dashboard do nutricionista
│   │   ├── patients/     # Gestão de pacientes
│   │   ├── calendar/     # Calendário de consultas
│   │   ├── diets/        # Editor de dietas
│   │   └── ...           # Outras páginas
│   ├── components/       # Componentes reutilizáveis
│   │   ├── ui/          # Componentes base (Shadcn)
│   │   ├── layout/      # Componentes de layout
│   │   ├── dashboard/   # Componentes do dashboard
│   │   └── ...          # Outros componentes
│   ├── services/         # Serviços de API
│   ├── contexts/         # Contextos React
│   ├── hooks/            # Hooks personalizados
│   ├── types/            # Tipos TypeScript
│   └── lib/              # Utilitários
```

## Tecnologias e Frameworks

### Backend
- **Django 5.2**: Framework web principal
- **Django REST Framework**: API REST
- **Django CORS Headers**: Comunicação entre frontend e backend
- **SimpleJWT**: Autenticação JWT
- **Django Filter**: Filtros avançados
- **Django Redis**: Cache e sessions
- **Django Silk**: Profiling (dev only)
- **MySQL/MariaDB**: Banco de dados principal
- **Redis**: Cache e sessões
- **Celery**: Tarefas assíncronas
- **Google APIs**: Integrações OAuth e Calendar

### Frontend
- **Next.js 14+**: Framework React
- **TypeScript 5+**: Tipagem estática
- **Tailwind CSS 3.4+**: Estilização
- **Shadcn/UI**: Componentes acessíveis
- **Zustand**: Gerenciamento de estado
- **React Query**: Data fetching e caching
- **Zod**: Validações de formulário
- **React Hook Form**: Formulários
- **Framer Motion**: Animações
- **Recharts**: Visualizações de dados

## Padrões de Projeto

### Backend
- **Model-View-ViewSet**: Padrão Django REST Framework
- **Serializers**: Serialização e validação de dados
- **Permissions**: Controle de acesso
- **API Views**: Endpoints REST
- **Signal Handlers**: Processamento pós-evento
- **Custom Managers**: Consultas especializadas

### Frontend
- **Atomic Design**: Estrutura de componentes
- **Custom Hooks**: Lógica compartilhável
- **Service Layer**: Abstração da API
- **Context API**: Gerenciamento de estado global
- **TypeScript Interfaces**: Tipagem rigorosa
- **Component Composition**: Reutilização de UI

## Segurança

### Autenticação
- JWT com refresh tokens
- OAuth2 com Google
- Rate limiting
- Hash de senhas (PBKDF2)
- CSRF protection

### Autorização
- Controle baseado em permissões
- Isolamento de dados por nutricionista
- Validação rigorosa de acesso

### Proteção de Dados
- Criptografia de dados sensíveis
- Conformidade com LGPD
- Auditorias de acesso
- Logs de atividade

## Performance

### Backend
- Cache Redis para consultas frequentes
- Indexação de banco de dados
- Paginação em listagens
- Consultas otimizadas (select_related, prefetch_related)
- Tarefas assíncronas com Celery

### Frontend
- Code splitting automático
- Lazy loading de componentes
- Caching de requisições
- Otimização de imagens
- Minificação de assets

## Escalabilidade

### Horizontal Scaling
- Componentes stateless
- Cache distribuído (Redis)
- Banco de dados replicável
- CDN para assets estáticos

### Vertical Scaling
- Profiling e otimização de queries
- Indexação apropriada
- Tarefas em background (Celery)

## Integrações Externas

### Google Services
- Google Calendar API
- Google OAuth2
- Google Drive (futuro)
- Google Sheets (futuro)

### Outras APIs
- APIs de alimentos (TACO, TBCA, USDA)
- Serviços de pagamento (futuro)
- Plataformas de notificação

## Deploy e Infraestrutura

### Backend Deploy
- Docker containers
- Gunicorn WSGI server
- Nginx reverse proxy
- Database managed (RDS, etc.)
- Redis cloud service

### Frontend Deploy
- Static site generation
- CDN distribution
- Client-side rendering
- Service workers (PWA)

## Monitoramento e Logging

- Django logging
- Error tracking (Sentry - pendente)
- Performance monitoring
- Uptime monitoring
- Audit logs

## Considerações de Acessibilidade

- Atributos ARIA em componentes
- Navegação por teclado
- Contraste WCAG 2.1 AA
- Suporte a leitores de tela
- Design responsivo

## Melhorias Futuras

### Técnicas
- Microserviços para módulos específicos
- GraphQL como complemento ao REST
- WebSockets para comunicação em tempo real
- ML para insights preditivos

### Funcionais
- App mobile nativo
- Videochamada integrada
- Wearables integration
- Marketplace de templates

## Equipe e Manutenção

### Código
- Estrutura modular
- Documentação integrada
- Testes automatizados
- CI/CD pipeline

### Documentação
- Inline documentation
- API documentation (Swagger)
- Architecture decision records
- Setup guides

---
**Versão da Documentação**: 1.0  
**Última Atualização**: 16/12/2025  
**Equipe**: NutriXpertPro Development Team