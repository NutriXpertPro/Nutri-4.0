# Documentação: Funções do Calendário - Nutri 4.0

## Visão Geral

O sistema de agenda do Nutri 4.0 é uma plataforma completa para gerenciamento de consultas de nutricionistas com foco em eficiência, usabilidade e experiência do usuário. Este documento detalha as funcionalidades atuais e planejadas para o módulo de agenda.

## Funcionalidades Atualmente Implementadas

### 1. Visualização de Calendário Mensal
- Exibição de compromissos por dia
- Visualização de diferentes meses
- Destaque para o dia atual
- Integração com agenda diária

### 2. Card de Consultas
- Exibição de nome do paciente
- Horário da consulta
- Tipo (presencial ou online)
- Status (agendada, confirmada, etc.)
- Duração e tipo de consulta

### 3. Criação de Novas Consultas
- Modal para agendamento
- Seleção de paciente
- Escolha de data e horário
- Escolha de duração e tipo de consulta
- Adição de observações e links de reunião

### 4. Agenda do Dia
- Listagem das consultas do dia
- Destaque para consultas atuais
- Visualização de consultas futuras
- Filtragem de próximas consultas

### 5. Indicadores de Desempenho
- Contadores de consultas agendadas, confirmadas, etc.
- Visualização de métricas por status

## Funcionalidades Avançadas Implementadas

### 6. Visualização Detalhada ao Passar o Mouse
- Ao passar o mouse sobre um dia com consultas agendadas, exibe cards com todas as informações dos pacientes
- Visualização detalhada independente da quantidade de consultas no dia
- Interface flutuante com informações completas dos pacientes
- Rolagem suave para visualização de consultas extras

### 7. Arrastar e Soltar de Consultas
- Permitir arrastar consultas para outras datas disponíveis
- Interface visual clara durante o processo de arrasto
- Verificação de disponibilidade no momento do arrasto
- Solicitação de confirmação de novo horário ao soltar
- Sistema de pré-visualização do horário selecionado

### 8. Geração de Link para Agendamento por Pacientes
- Geração automática de link personalizado para cada paciente
- Interface com calendário de disponibilidade do nutricionista
- Opção para paciente escolher data e horário disponíveis
- Limitação de alteração uma vez confirmada a escolha pelo paciente

### 9. Sistema de Confirmação de Agendamento
- Notificação automática ao nutricionista quando paciente escolher horário
- Sistema de aceitação ou rejeição do agendamento proposto
- Confirmação automática na agenda após aprovação
- Comunicação bidirecional entre paciente e nutricionista

### 10. Sistema de Notificações
- Notificações em tempo real para novas solicitações
- Alertas visuais e sonoros para eventos importantes
- Acompanhamento de status de solicitações pendentes

### 11. Histórico de Agendamentos
- Registro de todas as solicitações, alterações e cancelamentos
- Auditoria de ações realizadas por pacientes e profissionais
- Recuperação de histórico de consultas anteriores

### 12. Integração com Meios de Comunicação
- Envio automático de lembretes por e-mail e SMS
- Integração com WhatsApp Business para comunicação
- Lembretes personalizados com informações da consulta

## Componentes Principais

### CalendarViewElegant
- Componente principal de visualização do calendário
- Suporta vistas mensal, semanal e diária (semanal e diária em desenvolvimento)
- Funcionalidades de arrastar e soltar
- Visualização detalhada ao passar o mouse
- Botões de ação para edição e exclusão de consultas

### AgendaDoDia
- Painel lateral com agenda do dia
- Listagem das consultas do dia
- Destaque para consultas em andamento
- Próximas consultas (até 24h no futuro)
- Botão para adicionar nova consulta
- Ações rápidas (ligar, mensagem, ver agenda completa)

### CreateAppointmentModal
- Modal para criação e edição de consultas
- Formulário completo com todos os dados da consulta
- Suporte a edição de consultas existentes
- Integração com sistema de pacientes

### PatientScheduleLink
- Componente para geração de links personalizados para pacientes
- Interface para copiar e compartilhar links
- Integração com funcionalidades de compartilhamento do dispositivo

### AppointmentRequestNotification
- Componente para exibição de solicitações pendentes de agendamento
- Opções para aprovar ou rejeitar solicitações
- Integração com sistema de notificações

## Integrações

### Vídeo-Chamadas
- Integração com Google Meet para consultas online
- Geração automática de links de reunião
- Sincronização com agendas de pacientes

### Google Calendar
- Sincronização com Google Calendar
- Evita conflitos de horários
- Importação de eventos externos

## Navegação

A página faz parte do layout de dashboard do sistema e inclui:

- Menu lateral com todas as seções do sistema
- Barra superior com informações do usuário
- Integração com o tema claro/escuro do sistema

## Responsividade

A página se adapta a diferentes tamanhos de tela:

- Em telas menores, os painéis empilham verticalmente
- Layout otimizado para tablets e desktops
- Interface touch-friendly para dispositivos móveis

## Segurança e Permissões

- Acesso restrito a nutricionistas autenticados
- Controle de acesso baseado em papéis
- Proteção de dados de pacientes conforme LGPD
- Registro de auditoria de ações

## Considerações Técnicas

### Tecnologias Utilizadas

- Next.js com React
- TypeScript para tipagem
- Tailwind CSS para estilização
- date-fns para manipulação de datas
- Componentes UI personalizados
- Hooks de estado e efeitos
- Biblioteca sonner para notificações

### Performance

- Carregamento otimizado dos dados
- Virtualização de listas longas
- Cache de consultas frequentes
- Carregamento progressivo de informações

## APIs e Endpoints Relevantes

### Página de Agendamento para Pacientes
- Rota: `/patient-schedule/[id]`
- Permite que pacientes agendem consultas em horários disponíveis
- Interface intuitiva com seleção de data e horário

## Funcionalidades Futuras Planejadas

### Visualização Semanal e Diária
- Implementação completa das vistas semanal e diária
- Navegação fluida entre vistas
- Recursos de zoom e detalhamento

### Filtros Avançados
- Filtragem por status, tipo de consulta, paciente
- Busca por nome do paciente
- Filtros personalizáveis salvos

### Recursos de Acessibilidade
- Atalhos de teclado
- Suporte a leitores de tela
- Interface compatível com diferentes necessidades

## Considerações de Negócio

### Fluxo de Trabalho para Nutricionistas

1. Visualização da agenda principal
2. Agendamento de novas consultas
3. Recepção de solicitações de pacientes
4. Aprovação ou rejeição de solicitações
5. Acompanhamento diário de consultas
6. Alteração de status das consultas

### Fluxo de Trabalho para Pacientes

1. Recebimento de link personalizado
2. Seleção de data e horário disponíveis
3. Confirmação do agendamento
4. Aguardar aprovação do nutricionista

## Conclusão

O sistema de agenda do Nutri 4.0 oferece uma solução completa e moderna para gerenciamento de consultas de nutricionistas. Com as funcionalidades avançadas implementadas, o sistema proporciona uma experiência de usuário superior com recursos como arrastar e soltar, geração de links personalizados e sistema de aprovação de agendamentos.

O código está organizado em componentes reutilizáveis e bem estruturados, facilitando manutenção e expansão futura. A integração com outras ferramentas e serviços garante uma experiência coesa para todos os usuários do sistema.