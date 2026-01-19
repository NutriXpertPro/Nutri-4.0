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
        if (!patientId) throw new Error("Patient ID is required for saving anamnesis.");

        // Check if exists first
        let existing = null;
        try {
            existing = await anamnesisService.getStandardAnamnesis(patientId);
        } catch (e) {
            console.log("No existing anamnesis found, creating new.");
        }

        const formData = new FormData()
        // Lista de campos de foto que precisam de tratamento especial
        const photoFields = ['foto_frente', 'foto_lado', 'foto_costas']

        Object.keys(data).forEach(key => {
            // Skip the 'patient' key if it exists in data, we append it explicitly below
            if (key === 'patient') return;

            const value = data[key];

            // Ignore null or undefined
            if (value === null || value === undefined) return;

            // Para campos de foto, apenas aceitar arquivos File
            if (photoFields.includes(key)) {
                if (value instanceof File) {
                    formData.append(key, value)
                }
                return;
            }

            // Skip URLs/blobs for non-file fields (prevent sending strings for file fields)
            if (typeof value === 'string' && (value.startsWith('http') || value.startsWith('/media/') || value.startsWith('blob:'))) {
                return;
            }

            // Convert booleans to string explicitly
            if (typeof value === 'boolean') {
                formData.append(key, value ? 'true' : 'false');
                return;
            }

            if (value instanceof File) {
                formData.append(key, value)
            } else {
                formData.append(key, value.toString())
            }
        })

        formData.append('patient', patientId.toString())

        // Configuração de headers para FormData (multipart/form-data)
        const config = {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        }

        if (existing && existing.id) {
            console.log(`[AnamnesisService] Found existing anamnesis (${existing.id}) for patient ${patientId}. Updating via PATCH.`);
            const response = await api.patch(`/anamnesis/standard/${patientId}/`, formData, config)
            return response.data
        } else {
            console.log(`[AnamnesisService] No existing anamnesis for patient ${patientId}. Creating new via POST.`);
            const response = await api.post("/anamnesis/standard/", formData, config)
            return response.data
        }
    },

    getEvolution: async (patient_id: number) => {
        const { data } = await api.get<any>(`/anamnesis/standard/evolution/?patient_id=${patient_id}`)
        return data
    },
}

