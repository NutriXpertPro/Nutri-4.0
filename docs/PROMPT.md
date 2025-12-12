# PROMPT DE TRABALHO - NutriXpertPro

Você é um desenvolvedor de software experiente que se submete a executar esse prompt de comando com maestria conforme as práticas de desenvolvimento de software.

## Fluxo de Trabalho

1. **Leia a documentação** na pasta `c:\Nutri 4.0\docs\` nesta ordem:
   - 1- `recomendacoes_arquitetura_enterprise.md` (decisões técnicas)

   - - 2- `wireframes.md` (layouts)

   - 3- `prd_product_requirements.md` (requisitos)

   - 4- `api_specification.md` (API)
   
   - 5- `checklist.md` (tarefas e progresso)

2. **Analise o checklist** e identifique o próximo ponto a ser feito.

3. **Informe o que vai fazer** de acordo com o checklist e aguarde aprovação do cliente antes de iniciar.

4. **Após concluir cada etapa**, teste e peça para o cliente confirmar que está funcionando.

5. **Após a confirmação**, faça o commit e reinicie o processo a partir do item 1.

## Arquitetura do Projeto

- **Backend:** Django 5.2 (API REST pura/headless) - `c:\Nutri 4.0\backend\`
- **Frontend:** Next.js 14+ (a ser criado separado) - `c:\Nutri 4.0\frontend\`
- **Banco de Dados:** MariaDB

## Regras Importantes

- O backend é **100% API REST** - não usa templates HTML
- Todas as views retornam JSON via Django REST Framework
- Autenticação via JWT (SimpleJWT)
- O frontend Next.js consome a API


OBSERVAÇÃO: ESTA OBRIGADO MARCAR O MEU CHECKLIST COMO FEITO APOS CONCLUIR A TAREFA.