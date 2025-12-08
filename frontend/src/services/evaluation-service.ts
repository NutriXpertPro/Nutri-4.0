import api from "./api"

export interface Evaluation {
    id: number
    patient: number
    date: string
    method: 'ADIPOMETRO' | 'BIOIMPEDANCIA' | 'FITA_METRICA' | null
    height: number | null
    weight: number | null
    body_fat: number | null
    muscle_mass: number | null
    body_measurements: Record<string, number> | null
    photos: EvaluationPhoto[]
    created_at: string
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
    body_measurements?: Record<string, number>
}

export const evaluationService = {
    listByPatient: async (patientId: number) => {
        // We might need to filter by patient in the list endpoint
        // Assuming the backend supports ?patient=ID filter based on the standard convention
        // However, I didn't explicitly implement filter backend on list action yet BUT the get_queryset filters by nutritionist.
        // I need to add filter_backends or manual filtering in get_queryset. 
        // Let's rely on client side filtering or update backend if needed.
        // ACTUALLY, I should update backend to allow filtering by patient_id query param like I did for Anamnesis.
        const { data } = await api.get<Evaluation[]>(`/evaluations/?patient=${patientId}`)
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
