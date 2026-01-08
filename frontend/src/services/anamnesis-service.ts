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
    },

    // Standard Anamnesis
    getStandardAnamnesis: async (patientId: number) => {
        const { data } = await api.get<any[]>(`/anamnesis/standard/?patient=${patientId}`)
        return data.length > 0 ? data[0] : null
    },

    listStandardAnamneses: async () => {
        const { data } = await api.get<any[]>("/anamnesis/")
        return data
    },

    saveStandardAnamnesis: async (patientId: number, data: any) => {
        // Check if exists first
        const existing = await anamnesisService.getStandardAnamnesis(patientId)

        const formData = new FormData()
        Object.keys(data).forEach(key => {
            if (data[key] !== null && data[key] !== undefined) {
                // Skip base64 strings if we have files, or handle them specifically
                // If it's a URL (already saved), we don't need to send it back as a file
                if (typeof data[key] === 'string' && data[key].startsWith('http')) {
                    // Don't append existing URLs to avoid issues, or append to keep it
                    return;
                }

                if (data[key] instanceof File) {
                    formData.append(key, data[key])
                } else {
                    formData.append(key, data[key].toString())
                }
            }
        })
        formData.append('patient', patientId.toString())

        if (existing) {
            const response = await api.patch(`/anamnesis/standard/${existing.id}/`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })
            return response.data
        } else {
            const response = await api.post("/anamnesis/standard/", formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })
            return response.data
        }
    }
}

