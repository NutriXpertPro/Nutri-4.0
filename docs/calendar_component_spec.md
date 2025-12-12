# Documentação do Componente de Calendário - NutriXpertPro

## Visão Geral
O componente de calendário é uma parte essencial da aplicação NutriXpertPro, permitindo que nutricionistas gerenciam suas consultas de forma eficiente e visualmente atraente. O componente oferece múltiplas vistas e funcionalidades avançadas para melhorar a experiência do usuário.

## Funcionalidades

### Vistas do Calendário
- **Vista Mensal**: Grade 7x5 com indicadores visuais para consultas
- **Vista Semanal**: Timeline hora a hora para visualização detalhada
- **Vista Diária**: Lista expandida com todos os horários do dia

### Navegação
- Botões de navegação (anterior/próximo)
- Botão "Hoje" para retorno rápido
- Atalhos de teclado para navegação
- Indicadores visuais da data atual

### Gestão de Consultas
- Criação de novas consultas via modal
- Edição de consultas existentes
- Cancelamento com confirmação
- Atualização de status
- Verificação de conflito de horários

### Visualização de Informações
- Cards de consultas com gradientes por status
- Ícones intuitivos para tipo de consulta (presencial/online)
- Informações do paciente (nome, horário, duração)
- Badges de status coloridos

## Estrutura de Componentes

### Componentes Principais
- `CalendarViewElegant` - Componente principal do calendário
- `AppointmentCard` - Exibição individual de consultas
- `CreateAppointmentModal` - Modal para criação de consultas
- `AppointmentDetailsModal` - Modal para detalhes e edição

### Componentes de Apoio
- `TimeSlotPicker` - Seletor de horários disponíveis
- `StatusBadge` - Badge colorido de status
- `NavigationControls` - Controles de navegação do calendário

## API e Integração

### Endpoints Utilizados
- `GET /api/v1/appointments/` - Listar consultas
- `POST /api/v1/appointments/` - Criar consulta
- `PATCH /api/v1/appointments/{id}/` - Atualizar consulta
- `PATCH /api/v1/appointments/{id}/status/` - Atualizar status
- `DELETE /api/v1/appointments/{id}/` - Cancelar consulta

### Parâmetros de Filtro
- `date_from` e `date_to` para intervalo de datas
- `patient` para filtrar por paciente específico
- `status` para filtrar por status da consulta

## Design e Experiência do Usuário

### Padrões Visuais
- Gradientes sutis por status (agendada, confirmada, realizada, cancelada, faltou)
- Efeitos de transparência e blur para profundidade
- Animações suaves de entrada e hover
- Cores temáticas configuráveis
- Modo claro/escuro integrado

### Responsividade
- Design adaptável para mobile, tablet e desktop
- Layouts otimizados para diferentes tamanhos de tela
- Interações touch para dispositivos móveis

## Estados e Transições

### Estados de Consulta
- **Agendada**: Consulta criada, aguardando confirmação
- **Confirmada**: Paciente confirmou presença
- **Realizada**: Consulta ocorreu conforme planejado
- **Cancelada**: Consulta cancelada por qualquer parte
- **Faltou**: Paciente não compareceu

### Feedback Visual
- Animações para ações do usuário
- Indicadores de carregamento
- Mensagens de confirmação
- Feedback de erro apropriado

## Testes e Qualidade

### Testes Unitários
- Validação de regras de negócio
- Verificação de formatação de datas
- Testes de integração com API

### Testes de Interface
- Navegação entre vistas
- Criação e edição de consultas
- Atualização de status
- Verificação de conflitos de horário

## Padrões de Código

### Estrutura
- Componentes modulares e reutilizáveis
- Props bem definidas e documentadas
- Tipagem TypeScript para segurança
- Hooks para lógica de negócios

### Estilização
- Utilização de shadcn/ui para componentes básicos
- Classes do Tailwind para estilização avançada
- `cn` helper para composição de classes condicionais
- Variáveis CSS para temas e cores

## Acessibilidade
- Navegação por teclado completa
- Atributos ARIA apropriados
- Contraste adequado para leitura
- Labels e descrições para leitores de tela

## Desempenho
- Virtualização para vistas com muitos itens
- Memoização de componentes pesados
- Carregamento sob demanda
- Lazy loading de dados

## Futuras Implementações
- Integração com calendário externo (Google, Outlook)
- Recursos de notificação avançados
- Visualizações personalizadas
- Relatórios e estatísticas detalhadas