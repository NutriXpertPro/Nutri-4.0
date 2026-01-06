import api from "./api"

export interface Patient {
    id: number
    name: string
    email: string
}

export interface Evaluation {
    id: number
    patient: Patient
    date: string
    weight: number | null
    height: number | null
    body_fat: number | null
    muscle_mass: number | null
    waist_circumference: number | null
    hip_circumference: number | null
    arm_circumference: number | null
    method?: 'ADIPOMETRO' | 'BIOIMPEDANCIA' | 'FITA_METRICA'
    body_measurements?: Record<string, number | null>
    photos: EvaluationPhoto[]
    notes?: string
    created_at?: string
}

export interface EvaluationPhoto {
    id: number
    image: string
    label: 'FRENTE' | 'LADO' | 'COSTAS'
    uploaded_at: string
}

export interface CreateEvaluationDTO {
    patient: number
    date: string
    method?: string
    height?: number
    weight?: number
    body_fat?: number
    muscle_mass?: number
    body_measurements?: Record<string, number | null>
}

export const evaluationService = {
    listByPatient: async (patientId: number) => {
        // Filtra avaliações por paciente
        const { data } = await api.get<Evaluation[]>(`/evaluations/?patient=${patientId}`)
        return data
    },

    listAll: async () => {
        // Retorna todas as avaliações para a página de avaliações
        const { data } = await api.get<Evaluation[]>(`/evaluations/`)
        return data
    },

    create: async (data: CreateEvaluationDTO) => {
        const { data: response } = await api.post<Evaluation>("/evaluations/", data)
        return response
    },

    uploadPhoto: async (evaluationId: number, file: File, label: string) => {
        const formData = new FormData()
        formData.append("image", file)
        formData.append("label", label)

        const { data } = await api.post(`/evaluations/${evaluationId}/upload_photo/`, formData, {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        })
        return data
    },

    delete: async (id: number) => {
        await api.delete(`/evaluations/${id}/`)
    }
}
