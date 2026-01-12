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
    avatar?: string
    age?: number
    weight?: number
    initial_weight?: number
    height?: number
    nutritionist_name?: string
    nutritionist_title?: string
    nutritionist_avatar?: string
    anamnesis?: {
        type?: string
        template_title: string
        filled_date: string
        answers?: Record<string, any>
    }
    notes?: ClinicalNote[]
}

export interface ClinicalNote {
    id: number
    title?: string
    content: string
    created_at: string
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
    profile_picture?: File | null
}

const patientService = {
    getAll: async () => {
        const response = await api.get<Patient[]>('/patients/')
        return response.data
    },

    getMe: async () => {
        const response = await api.get<Patient>('/patients/me/profile/')
        return response.data
    },

    getById: async (id: number) => {
        const response = await api.get<Patient>(`/patients/${id}/`)
        return response.data
    },

    create: async (data: CreatePatientDTO) => {
        // Se houver foto, usar FormData
        if (data.profile_picture instanceof File) {
            const formData = new FormData()
            formData.append('name', data.name)
            formData.append('email', data.email)
            formData.append('gender', data.gender || 'F')
            formData.append('phone', data.phone)

            if (data.goal) formData.append('goal', data.goal)
            formData.append('service_type', data.service_type)
            formData.append('start_date', data.start_date)
            if (data.birth_date) formData.append('birth_date', data.birth_date)

            formData.append('profile_picture', data.profile_picture)

            const response = await api.post<Patient>('/patients/', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })
            return response.data
        }

        const payload = {
            name: data.name,
            email: data.email,
            gender: data.gender || 'F',
            phone: data.phone,
            address: '', // Optional
            goal: data.goal || null,
            service_type: data.service_type,
            start_date: data.start_date,
            birth_date: data.birth_date || null
        }

        const response = await api.post<Patient>('/patients/', payload)
        return response.data
    },

    update: async (id: number, data: any) => {
        // Se houver arquivo, usar FormData
        if (data.profile_picture instanceof File || data.profile_picture === null) {
            const formData = new FormData()
            Object.entries(data).forEach(([key, value]) => {
                if (value !== undefined) {
                    if (value === null) {
                        formData.append(key, '')
                    } else if (value instanceof File) {
                        formData.append(key, value)
                    } else {
                        formData.append(key, String(value))
                    }
                }
            })
            const response = await api.patch<Patient>(`/patients/${id}/`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })
            return response.data
        }

        const response = await api.patch<Patient>(`/patients/${id}/`, data)
        return response.data
    },

    delete: async (id: number, hardDelete: boolean = false) => {
        const response = await api.delete(`/patients/${id}/`, {
            params: { hard_delete: hardDelete }
        })
        return response.data
    },

    search: async (query: string): Promise<{ id: number; name: string; avatar?: string }[]> => {
        if (query.length < 2) return Promise.resolve([]);
        const response = await api.get<{ id: number; name: string; avatar?: string }[]>(`/patients/search/?q=${encodeURIComponent(query)}`);
        return response.data;
    },

    createClinicalNote: async (patientId: number, content: string, title?: string) => {
        const response = await api.post<ClinicalNote>(`/patients/${patientId}/notes/`, { content, title })
        return response.data
    },

    updateClinicalNote: async (noteId: number, content: string, title?: string) => {
        const response = await api.patch<ClinicalNote>(`/patients/me/notes/${noteId}/`, { content, title })
        return response.data
    },

    deleteClinicalNote: async (noteId: number) => {
        await api.delete(`/patients/me/notes/${noteId}/`)
    }
}

export default patientService
