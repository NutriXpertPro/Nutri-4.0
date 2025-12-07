import api from "./api"

export interface AnamnesisTemplate {
    id: number
    title: string
    description: string
    questions: Question[]
    is_active: boolean
    created_at: string
}

export interface Question {
    id: string
    type: 'text' | 'long_text' | 'number' | 'select' | 'multiselect'
    label: string
    options?: string[] // For select types
    required: boolean
}

export interface AnamnesisResponse {
    id: number
    patient: number
    template: number
    template_title: string
    answers: Record<string, any>
    filled_date: string
    status?: 'PENDING' | 'COMPLETED'
    completed_at?: string
}

export const anamnesisService = {
    // Templates
    listTemplates: async () => {
        const { data } = await api.get<AnamnesisTemplate[]>("/anamnesis/templates/")
        return data
    },
    createTemplate: async (template: Omit<AnamnesisTemplate, "id" | "created_at" | "is_active">) => {
        const { data } = await api.post<AnamnesisTemplate>("/anamnesis/templates/", template)
        return data
    },
    updateTemplate: async (id: number, template: Partial<AnamnesisTemplate>) => {
        const { data } = await api.patch<AnamnesisTemplate>(`/anamnesis/templates/${id}/`, template)
        return data
    },
    deleteTemplate: async (id: number) => {
        await api.delete(`/anamnesis/templates/${id}/`)
    },

    // Responses
    listResponses: async (patientId?: number) => {
        const url = patientId
            ? `/anamnesis/responses/?patient=${patientId}`
            : `/anamnesis/responses/`
        const { data } = await api.get<AnamnesisResponse[]>(url)
        return data
    },
    createResponse: async (response: { patient: number, template: number, answers: Record<string, any> }) => {
        const { data } = await api.post<AnamnesisResponse>("/anamnesis/responses/", response)
        return data
    }
}

