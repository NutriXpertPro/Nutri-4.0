import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import patientService, { CreatePatientDTO } from '@/services/patient-service'
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
