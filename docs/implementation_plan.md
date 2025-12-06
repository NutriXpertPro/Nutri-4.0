# Integração Backend: Lista de Pacientes

## User Review Required
> [!IMPORTANT]
> A API de pacientes requer autenticação. O frontend deve estar logado (token no localStorage) para funcionar.

## Proposed Changes

### Backend (Já realizado)
- [x] Implementar `patient_list` (GET/POST) em `patients/views.py`
- [x] Atualizar `PatientProfileSerializer` para incluir dados do User
- [x] Configurar rotas em `config/urls.py`

### Frontend - Services
#### [NEW] [patient-service.ts](file:///c:/Nutri 4.0/frontend/src/services/patient-service.ts)
- Criar serviço para chamadas HTTP (`/api/v1/patients/`)
- Tipagem robusta (Patient, CreatePatientDTO)

### Frontend - Hooks
#### [NEW] [usePatients.ts](file:///c:/Nutri 4.0/frontend/src/hooks/usePatients.ts)
- React Query hook para buscar lista de pacientes e gerenciar cache.

### Frontend - Pages
#### [MODIFY] [patients/page.tsx](file:///c:/Nutri 4.0/frontend/src/app/patients/page.tsx)
- Substituir `MOCK_PATIENTS` pelo hook `usePatients`.
- Adicionar estados de loading e error.

## Verification Plan
### Automated Tests
- Verificar se `GET /api/v1/patients/` retorna 200 (via curl ou browser).

### Manual Verification
- Acessar `/patients` e ver se carrega a lista vazia (ou populada se tiver dados).
- Criar um paciente via Postman/Curl e ver se aparece na lista.
