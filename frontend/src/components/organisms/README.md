# Componente de Chat NutriXpertPro

## Descrição
Componente de mensagens similar ao WhatsApp implementado para o sistema NutriXpertPro, permitindo comunicação entre nutricionistas e pacientes.

## Funcionalidades

### Chat Individual
- Interface similar ao WhatsApp Web
- Envio e recebimento de mensagens em tempo real (com polling)
- Status de leitura (enviado, entregue, lido)
- Timestamps das mensagens
- Design responsivo com modo escuro

### Lista de Conversas
- Visualização de todas as conversas ativas
- Indicadores de mensagens não lidas
- Última mensagem e horário
- Status online/offline
- Campo de pesquisa

## Tecnologias Utilizadas

- **Frontend**: Next.js 14+, React, TypeScript
- **Estilização**: Tailwind CSS
- **Componentes**: Shadcn/UI
- **Ícones**: Lucide React
- **Gerenciamento de Estado**: React Query
- **Backend**: APIs REST existentes de mensagens
- **Autenticação**: JWT

## Estrutura de Arquivos

```
src/
├── components/
│   └── organisms/
│       ├── Chat.tsx          # Componente principal do chat
│       ├── ConversationList.tsx # Lista de conversas
│       └── NotificationBadge.tsx # Indicador de notificações
├── types/
│   └── chat.ts               # Tipos TypeScript
└── app/
    └── messages/
        ├── page.tsx          # Página principal de mensagens
        └── layout.tsx        # Layout da seção de mensagens
```

## Funcionamento

O sistema utiliza as APIs REST existentes para mensagens:
- `GET /api/v1/messages/conversations/` - Listar conversas
- `GET /api/v1/messages/conversations/{id}/messages/` - Obter mensagens
- `POST /api/v1/messages/conversations/{id}/messages/` - Enviar mensagem

As atualizações são feitas via polling a cada 5 segundos para simular real-time.

## Integração

O componente já está integrado ao menu lateral do sistema e utiliza o contexto de autenticação existente.

## Instalação

Não é necessário instalação adicional, pois utiliza as bibliotecas já presentes no projeto.

## Personalização

A interface pode ser personalizada alterando os estilos CSS e os componentes conforme necessário para se adaptar à identidade visual do NutriXpertPro.