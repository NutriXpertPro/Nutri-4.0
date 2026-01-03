import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import patientService, { CreatePatientDTO, Patient } from '@/services/patient-service'
import { useAuth } from '@/contexts/auth-context'

export function usePatients() {
    const queryClient = useQueryClient()
    const { isAuthenticated, isLoading: isAuthLoading } = useAuth()

    const { data: patients, isLoading, error } = useQuery({
        queryKey: ['patients'],
        queryFn: patientService.getAll,
        enabled: isAuthenticated && !isAuthLoading
    })

    const createPatient = useMutation({
        mutationFn: (newPatient: CreatePatientDTO) => patientService.create(newPatient),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['patients'] })
        },
    })

    const updatePatient = useMutation({
        mutationFn: ({ id, data }: { id: number; data: Partial<CreatePatientDTO> }) =>
            patientService.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['patients'] })
            queryClient.invalidateQueries({ queryKey: ['patient'] })
        },
    })

    const deletePatient = useMutation({
        mutationFn: ({ id, hardDelete }: { id: number; hardDelete?: boolean }) =>
            patientService.delete(id, hardDelete),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['patients'] })
        },
    })

    return {
        patients,
        isLoading,
        error,
        createPatient,
        updatePatient,
        deletePatient,
    }
}

// Hook para buscar um único paciente por ID
export function usePatient(patientId: number) {
    const { isAuthenticated, isLoading: isAuthLoading } = useAuth()

    const { data: patient, isLoading, error } = useQuery({
        queryKey: ['patient', patientId],
        queryFn: () => patientService.getById(patientId),
        enabled: isAuthenticated && !isAuthLoading && patientId > 0
    })

    return {
        patient,
        isLoading,
        error,
    }
}

