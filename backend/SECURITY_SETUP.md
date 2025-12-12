# Configuração de Segurança - Backend Nutri 4.0

## Variáveis de Ambiente Obrigatórias

Para garantir a segurança adequada da aplicação, é essencial configurar corretamente as variáveis de ambiente.

### Produção

Para executar a aplicação em modo de produção, você deve definir:

```bash
DJANGO_ENV=production
DJANGO_SECRET_KEY=sua-chave-secreta-aqui
DJANGO_DEBUG=False
DB_NAME=nome-do-banco
DB_USER=usuario-do-banco
DB_PASSWORD=senha-segura-do-banco
```

### Desenvolvimento

Para desenvolvimento, você pode usar os valores padrão ou definir variáveis personalizadas:

```bash
DJANGO_ENV=development
DJANGO_SECRET_KEY=django-insecure-dev-key (apenas para desenvolvimento!)
DJANGO_DEBUG=True
```

## Configurações de Segurança Implementadas

### 1. Proteção contra vazamento de informações
- A SECRET_KEY é obrigatória em produção
- Mensagens de erro específicas impedem enumeração de contas
- Validações de ambiente impedem configurações inseguras

### 2. Proteções para produção
- Headers de segurança adicionados (XSS, HSTS, etc.)
- Configurações de cookie seguros
- Redirecionamento HTTPS obrigatório

### 3. Proteção contra DoS
- Limites configuráveis para paginação
- Middleware de segurança adicionais
- Verificação de variáveis críticas

## Verificação de Segurança

O sistema realiza verificações automáticas:
- Se a SECRET_KEY está definida em produção
- Se as credenciais de banco de dados estão definidas em produção
- Se o DEBUG está desativado em produção
- Se ALLOWED_HOSTS não contém valores de desenvolvimento em produção

## Boas Práticas Recomendadas

1. **Nunca commite informações sensíveis**: Use `.env` para armazenar secrets e adicione ao `.gitignore`
2. **Use chaves fortes**: A SECRET_KEY deve ter pelo menos 50 caracteres e ser gerada randomicamente
3. **Atualize regularmente**: Mantenha as dependências atualizadas para evitar vulnerabilidades
4. **Monitore logs**: Implemente monitoramento adequado para detectar tentativas de ataque