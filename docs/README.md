# NutriXpertPro - Sistema Completo de Gestão Nutricional

## 🚀 Sobre o Projeto

NutriXpertPro é uma aplicação web completa para nutricionistas gerenciarem seus pacientes, consultas, planos alimentares e avaliações corporais. O sistema oferece uma experiência integrada para profissionais da área de nutrição e seus pacientes.

## ✨ Funcionalidades

### Para Nutricionistas:
- **Gestão de Pacientes**: Cadastro, perfil e histórico
- **Agendamento de Consultas**: Calendário integrado com Google Calendar
- **Editor de Dietas**: Criação de planos alimentares personalizados com banco de alimentos
- **Avaliação Física**: Registro de medidas antropométricas, fotos e evolução
- **Página de Avaliações**: Histórico completo com:
  - Gráficos evolutivos de peso, água, gordura e massa muscular
  - Protocolos de antropometria padronizados (Jackson & Pollock, Durnin & Womersley, Petroski, ISAK)
  - Antropometria com gráfico e histórico de medidas
  - Integração com dados de bioimpedância
  - Cálculos metabólicos automáticos (TMB, necessidades calóricas, distribuição de macronutrientes)
  - Perfis metabólicos e físicos completos dos pacientes
  - Gráficos de progresso com data inicial do atendimento, estado atual e meta
  - Distinção entre pacientes presenciais e online (protocolos diferenciados)
  - Opção para criar ficha antropométrica personalizada
  - Upload de exames externos
  - Integração com app do paciente para acompanhamento
  - Compartilhamento de evolução nas redes sociais
- **Anamnese Completa**: 7 seções com 50+ campos para histórico detalhado
- **Mensagens & Chat**: Comunicação segura com pacientes
- **Exames Laboratoriais**: Upload e histórico de exames
- **Automação de Mensagens**: Templates configuráveis
- **Integração Google Calendar**: Sincronização bidirecional
- **Dashboard Avançado**: Estatísticas e métricas em tempo real

### Para Pacientes:
- **Acompanhamento de Dieta**: Visualização do plano alimentar
- **Diário de Progresso**: Registro de refeições, exercícios e sentimentos
- **Comunidade**: Feed de outros pacientes (opt-in)
- **Dashboard Pessoal**: Gráficos de evolução e metas
- **Comunicação**: Mensagens com o nutricionista

## 🛠️ Tecnologia

### Backend
- **Django 5.2** com **Python 3.10+**
- **Django REST Framework** para API REST
- **JWT Authentication** para autenticação segura
- **MariaDB/MySQL** para persistência de dados
- **Redis** para cache e sessions
- **Celery** para tarefas assíncronas
- **Google Calendar API** para integração

### Frontend
- **Next.js 14+** com **TypeScript 5+**
- **Tailwind CSS 3.4+** para estilização
- **Shadcn/UI** para componentes acessíveis
- **Zustand** para gerenciamento de estado
- **React Query** para data fetching
- **Zod** para validações
- **React Hook Form** para formulários

### Infraestrutura
- **Docker Compose** para ambiente de desenvolvimento
- **Redis** para cache e sessões
- **Google OAuth** para autenticação social
- **APIs de Alimentos** (TACO, TBCA, USDA)

## 📋 Pré-requisitos

- Python 3.10+
- Node.js 18+
- MariaDB/MySQL
- Redis
- Docker (opcional)

## 🚀 Instalação

### Backend Setup
1. Clone este repositório
2. Navegue até o diretório `backend`
3. Crie um ambiente virtual: `python -m venv venv`
4. Ative o ambiente: `source venv/bin/activate` (Linux/Mac) ou `venv\Scripts\activate` (Windows)
5. Instale as dependências: `pip install -r requirements.txt`
6. Configure o arquivo `.env` com as credenciais de banco de dados
7. Execute as migrações: `python manage.py migrate`
8. Inicie o servidor: `python manage.py runserver`

### Frontend Setup
1. Navegue até o diretório `frontend`
2. Instale as dependências: `npm install`
3. Configure o arquivo `.env` com as variáveis de ambiente
4. Inicie o servidor de desenvolvimento: `npm run dev`

## 🔐 Autenticação

O sistema suporta:
- Login tradicional (email/senha)
- Login com Google OAuth
- Recuperação de senha via email
- Tokens JWT com refresh

## 📊 APIs Disponíveis

Todas as APIs estão documentadas com **drf-spectacular** em `/api/v1/schema/swagger-ui/`

Principais endpoints:
- `/api/v1/auth/` - Autenticação
- `/api/v1/patients/` - Gestão de pacientes
- `/api/v1/appointments/` - Agendamento de consultas
- `/api/v1/diets/` - Planos alimentares
- `/api/v1/evaluations/` - Avaliações físicas
- `/api/v1/anamnesis/` - Anamnese
- `/api/v1/messages/` - Mensagens
- `/api/v1/lab-exams/` - Exames laboratoriais
- `/api/v1/dashboard/` - Dashboard
- `/api/v1/integrations/google-calendar/` - Integração com Google Calendar

## 🔧 Configuração de Integrações

### Google Calendar
Para usar a integração com Google Calendar:
1. Crie um projeto no Google Cloud Console
2. Habilite a Google Calendar API
3. Crie credenciais OAuth2
4. Configure os redirect URIs:
   - `http://localhost:8000/api/v1/integrations/google-calendar/callback/`
5. Adicione as credenciais no `.env`:
   ```
   GOOGLE_OAUTH2_CLIENT_ID=seu_client_id
   GOOGLE_OAUTH2_CLIENT_SECRET=seu_client_secret
   ```

### Google OAuth (Login Social)
1. Siga os passos acima para criar credenciais OAuth2
2. Adicione os redirect URIs:
   - `http://localhost:8000/api/v1/auth/google/`

## 🧪 Testes

### Backend
Execute os testes com:
```
python manage.py test
```

### Frontend
Execute os testes com:
```
npm test
```

## 🚀 Deploy

### Backend
- Use o Dockerfile para criar uma imagem
- Configure variáveis de ambiente para produção
- Use um serviço gerenciado (Railway, Fly.io, AWS)
- Configure banco de dados gerenciado (RDS, PlanetScale)

### Frontend
- Execute `npm run build` para criar a versão de produção
- Faça o deploy para Vercel, Netlify ou serviço similar

## 📈 Performance

- **Cache Redis** para consultas frequentes
- **Lazy loading** de rotas
- **Otimização de imagens** com WebP
- **Paginação** em todas as listagens
- **CDN** para assets estáticos (configuração pendente)

## 🔒 Segurança

- HTTPS obrigatório em produção
- HSTS, XSS, CSRF protegidos
- Rate limiting em endpoints críticos
- Criptografia de dados sensíveis (LGPD)
- JWT com refresh tokens
- Auditoria de ações críticas (em implementação)

## 🌐 Acessibilidade

- Navegação por teclado
- Atributos ARIA em componentes
- Contraste WCAG 2.1 AA
- Suporte a leitores de tela

## 📱 PWA (Progressive Web App)

- Service Workers configurados
- Manifest.json para instalação
- Cache offline para dados de leitura
- Notificações push
- Ícones e splash screens

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/NovaFeature`)
3. Commit suas alterações (`git commit -m 'Adiciona nova feature'`)
4. Faça push para a branch (`git push origin feature/NovaFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está licenciado sob os termos descritos no contrato de desenvolvimento.

## 📞 Suporte

Para suporte técnico, entre em contato com a equipe de desenvolvimento.

---

**Desenvolvido com ❤️ por [Nome da Equipe]**