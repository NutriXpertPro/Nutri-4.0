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

    return {
        patients,
        isLoading,
        error,
        createPatient,
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

