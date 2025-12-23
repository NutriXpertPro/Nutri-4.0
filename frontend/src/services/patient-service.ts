import api from './api'

export interface Patient {
    id: number
    name: string
    email: string
    status: boolean
    gender?: string
    phone?: string
    birth_date?: string
    goal?: string
    service_type?: 'ONLINE' | 'PRESENCIAL'
    start_date?: string
    created_at: string
    target_weight?: number
    target_body_fat?: number
}

export interface CreatePatientDTO {
    name: string
    email: string
    phone: string
    birth_date: string
    gender?: string
    goal: string
    service_type: 'ONLINE' | 'PRESENCIAL'
    start_date: string
}

const patientService = {
    getAll: async () => {
        const response = await api.get<Patient[]>('/patients/')
        return response.data
    },

    getById: async (id: number) => {
        const response = await api.get<Patient>(`/patients/${id}/`)
        return response.data
    },

    create: async (data: CreatePatientDTO) => {
        const payload = {
            name: data.name,
            email: data.email,
            gender: data.gender || 'F',
            phone: data.phone,
            address: '', // Optional
            goal: data.goal,
            service_type: data.service_type,
            start_date: data.start_date,
            birth_date: data.birth_date
        }

        const response = await api.post<Patient>('/patients/', payload)
        return response.data
    },

    update: async (id: number, data: Partial<CreatePatientDTO>) => {
        const response = await api.patch<Patient>(`/patients/${id}/`, data)
        return response.data
    },

    delete: async (id: number) => {
        const response = await api.delete(`/patients/${id}/`)
        return response.data
    },

    search: async (query: string): Promise<{ id: number; name: string }[]> => {
        if (query.length < 2) return Promise.resolve([]);
        const response = await api.get<{ id: number; name: string }[]>(`/patients/search/?q=${encodeURIComponent(query)}`);
        return response.data;
    }
}

export default patientService
