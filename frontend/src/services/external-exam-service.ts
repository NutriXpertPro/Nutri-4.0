import api from './api'

export interface ExternalExam {
    id: number
    patient: number
    patient_name: string
    file: string
    file_url: string
    file_name: string
    file_type: 'PDF' | 'JPG' | 'PNG' | 'JPEG'
    notes: string
    uploaded_at: string
    uploaded_by: number | null
    uploaded_by_name: string
}

const externalExamService = {
    /**
     * Faz upload de um exame externo
     */
    upload: async (patientId: number, file: File, notes: string = ''): Promise<ExternalExam> => {
        const formData = new FormData()
        formData.append('patient', patientId.toString())
        formData.append('file', file)
        formData.append('notes', notes)

        const response = await api.post<ExternalExam>(
            '/evaluations/external-exams/upload/',
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        )
        return response.data
    },

    /**
     * Lista todos os exames de um paciente
     */
    list: async (patientId?: number): Promise<ExternalExam[]> => {
        const params = patientId ? { patient_id: patientId } : {}
        const response = await api.get<ExternalExam[]>('/evaluations/external-exams/', { params })
        return response.data
    },

    /**
     * Retorna a URL para visualizar/baixar um exame
     */
    getFileUrl: (exam: ExternalExam): string => {
        return exam.file_url
    },
}

export default externalExamService
