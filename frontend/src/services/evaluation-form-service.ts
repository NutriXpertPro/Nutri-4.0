import api from "./api"

export interface EvaluationFormField {
    id: string
    name: string
    label: string
    type: 'number' | 'text' | 'select' | 'checkbox' | 'date'
    required: boolean
    unit?: string
    options?: string[]
    order: number
}

export interface EvaluationForm {
    id: number
    name: string
    description: string
    fields: EvaluationFormField[]
    isActive: boolean
    isDefault: boolean
    createdAt: string
    updatedAt: string
}

export interface CreateEvaluationFormDTO {
    name: string
    description: string
    fields: Omit<EvaluationFormField, 'id'>[]
    isActive?: boolean
    isDefault?: boolean
}

export interface UpdateEvaluationFormDTO extends CreateEvaluationFormDTO {
    id: number
}

export const evaluationFormService = {
    listAll: async () => {
        const { data } = await api.get<EvaluationForm[]>(`/evaluation-forms/`)
        return data
    },

    getById: async (id: number) => {
        const { data } = await api.get<EvaluationForm>(`/evaluation-forms/${id}/`)
        return data
    },

    create: async (data: CreateEvaluationFormDTO) => {
        const { data: response } = await api.post<EvaluationForm>("/evaluation-forms/", data)
        return response
    },

    update: async (id: number, data: UpdateEvaluationFormDTO) => {
        const { data: response } = await api.put<EvaluationForm>(`/evaluation-forms/${id}/`, data)
        return response
    },

    delete: async (id: number) => {
        await api.delete(`/evaluation-forms/${id}/`)
    },

    activate: async (id: number) => {
        const { data } = await api.patch<EvaluationForm>(`/evaluation-forms/${id}/activate/`, {})
        return data
    },

    deactivate: async (id: number) => {
        const { data } = await api.patch<EvaluationForm>(`/evaluation-forms/${id}/deactivate/`, {})
        return data
    }
}