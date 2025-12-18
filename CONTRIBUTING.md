# Guia de Contribuição - NutriXpertPro

Olá! Agradecemos seu interesse em contribuir para o NutriXpertPro. Esta aplicação é uma plataforma completa de gestão nutricional e todas as contribuições são bem-vindas.

## 📋 Índice

- [Ambiente de Desenvolvimento](#ambiente-de-desenvolvimento)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Padrões de Código](#padrões-de-código)
- [Testes](#testes)
- [Commits e Pull Requests](#commits-e-pull-requests)
- [Relatórios de Bugs](#relatórios-de-bugs)
- [Sugestões de Funcionalidades](#sugestões-de-funcionalidades)
- [Estilo de Documentação](#estilo-de-documentação)

## Ambiente de Desenvolvimento

### Pré-requisitos

- Python 3.10+
- Node.js 18+
- MariaDB/MySQL 8.0+
- Redis 6+
- Git

### Setup Inicial

1. Fork o repositório
2. Clone seu fork:
```bash
git clone https://github.com/seu-usuario/nutrixpertpro.git
cd nutrixpertpro
```

3. Backend:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Linux/Mac
# ou
venv\Scripts\activate  # Windows

pip install -r requirements.txt
cp .env.example .env
# Configure as variáveis no .env
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

4. Frontend:
```bash
cd frontend
npm install
cp .env.example .env
# Configure as variáveis no .env
npm run dev
```

## Estrutura do Projeto

### Backend (Django)
```
backend/
├── setup/                 # Configurações do projeto Django
├── users/                 # Autenticação e usuários
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
frontend/
├── public/                # Arquivos estáticos
├── src/
│   ├── app/              # Páginas Next.js
│   ├── components/       # Componentes reutilizáveis
│   │   ├── ui/          # Componentes base (Shadcn)
│   │   ├── layout/      # Componentes de layout
│   │   └── ...          # Outros componentes
│   ├── services/         # Serviços de API
│   ├── contexts/         # Contextos React
│   ├── hooks/            # Hooks personalizados
│   ├── types/            # Tipos TypeScript
│   └── lib/              # Utilitários
```

## Padrões de Código

### Backend (Python/Django)

- Siga o estilo [PEP 8](https://pep8.org/)
- Use type hints em todos os métodos públicos
- Docstrings devem usar formato Google
- Nomes de variáveis e funções devem ser claros e descritivos

```python
def calculate_patient_bmi(weight: float, height: float) -> float:
    """Calcula o IMC do paciente.
    
    Args:
        weight: Peso do paciente em kg
        height: Altura do paciente em metros
        
    Returns:
        Valor do IMC (kg/m²)
        
    Raises:
        ValueError: Se peso ou altura forem negativos
    """
    if weight <= 0 or height <= 0:
        raise ValueError("Peso e altura devem ser positivos")
    
    return weight / (height ** 2)
```

### Frontend (TypeScript/React)

- Siga o [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript)
- Use componentes funcionais com hooks
- Tipos TypeScript para todas as props
- Componentes devem ser pequenos e com única responsabilidade

```typescript
interface PatientCardProps {
  patient: Patient;
  onEdit: (patientId: number) => void;
  onDelete: (patientId: number) => void;
}

const PatientCard: React.FC<PatientCardProps> = ({ patient, onEdit, onDelete }) => {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle>{patient.name}</CardTitle>
        <CardDescription>{patient.email}</CardDescription>
      </CardHeader>
      <CardContent>
        <p>ID: {patient.id}</p>
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button onClick={() => onEdit(patient.id)}>Editar</Button>
        <Button variant="destructive" onClick={() => onDelete(patient.id)}>
          Excluir
        </Button>
      </CardFooter>
    </Card>
  );
};
```

## Testes

### Backend
- Todos os novos recursos devem ter testes unitários
- Use pytest para testes backend
- Objetivo: Cobertura > 80%

```python
# Exemplo de teste
def test_calculate_patient_bmi():
    # Teste normal
    result = calculate_patient_bmi(70, 1.75)
    assert result == 22.86
    
    # Teste exceção
    with pytest.raises(ValueError):
        calculate_patient_bmi(-70, 1.75)
```

### Frontend
- Use Vitest para testes unitários
- Use React Testing Library para testes de integração
- Teste todos os componentes interativos

## Commits e Pull Requests

### Commits
- Use o formato: `tipo(scope): descrição`
- Tipo: feat, fix, docs, style, refactor, test, chore
- Scope: módulo afetado (ex: auth, patients, diets)
- Descrição: imperativo, minúsculo, sem ponto final

```
feat(patients): adiciona campo de telefone em perfil do paciente

Adiciona campo de telefone ao modelo e formulário de edição
de perfil do paciente, com validação de formato brasileiro.
```

### Pull Requests
- Título: seguir formato de commits
- Descrição: explicar o porquê e como da mudança
- Referenciar issues relevantes
- Passar em todos os testes
- Seguir padrões de código

## Relatórios de Bugs

Quando reportar bugs, por favor inclua:

- Versão do sistema
- Passos para reproduzir
- Comportamento esperado
- Comportamento atual
- Screenshots se relevantes
- Log de erros se disponível

## Sugestões de Funcionalidades

- Abra uma issue com a tag `enhancement`
- Descreva o problema que a funcionalidade resolveria
- Explique como a funcionalidade funcionaria
- Liste alternativas consideradas

## Estilo de Documentação

- Use o padrão Markdown
- Documente novas funções com docstrings
- Atualize documentação existente quando necessário
- Inclua exemplos quando apropriado

## Perguntas?

Se tiver dúvidas, abra uma issue com a tag `question`.

---

**Agradecemos novamente por sua contribuição!** ❤️