import { create } from 'zustand'
import { Patient } from '@/services/patient-service'

interface PatientState {
    activePatient: Patient | null
    setActivePatient: (patient: Patient | null) => void
}

export const usePatientStore = create<PatientState>((set) => ({
    activePatient: null,
    setActivePatient: (patient) => set({ activePatient: patient }),
}))
