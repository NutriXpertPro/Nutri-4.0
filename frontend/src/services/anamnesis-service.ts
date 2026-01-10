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
        // Lista de campos de foto que precisam de tratamento especial
        const photoFields = ['foto_frente', 'foto_lado', 'foto_costas']


        Object.keys(data).forEach(key => {
            // Skip the 'patient' key if it exists in data, we append it explicitly below
            if (key === 'patient') return;

            if (data[key] !== null && data[key] !== undefined) {
                // Para campos de foto, apenas aceitar arquivos File - ignorar qualquer string
                // (URLs http://, /media/, blob:, etc.) para evitar enviar dados inválidos
                if (photoFields.includes(key)) {
                    if (data[key] instanceof File) {
                        formData.append(key, data[key])
                    }
                    // Se não for um File, pular este campo (URL existente, blob URL, etc.)
                    return;
                }



                // Skip base64 strings if we have files, or handle them specifically
                // If it's a URL (already saved), we don't need to send it back as a file.
                // Works for absolute (http), relative (/media), and blob paths.
                if (typeof data[key] === 'string' && (data[key].startsWith('http') || data[key].startsWith('/media/') || data[key].startsWith('blob:'))) {
                    return;
                }

                // If it's an empty string, we should generally skip it to allow backend defaults/nulls
                // especially for Date/Time fields where "" is invalid
                if (typeof data[key] === 'string' && data[key] === "") {
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

        // Configuração de headers para FormData (multipart/form-data)
        const config = {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        }

        if (existing) {
            const response = await api.patch(`/anamnesis/standard/${existing.patient}/`, formData, config)
            return response.data
        } else {
            const response = await api.post("/anamnesis/standard/", formData, config)
            return response.data
        }
    },

    getEvolution: async (patient_id: number) => {
        const { data } = await api.get<any>(`/anamnesis/standard/evolution/?patient_id=${patient_id}`)
        return data
    },
}

