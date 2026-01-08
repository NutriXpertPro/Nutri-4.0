'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import patientService from '@/services/patient-service';
import { useAuth } from '@/contexts/auth-context';

interface Patient {
  id: number;
  name: string;
  email: string;
  goal?: string;
  avatar?: string;
  service_type?: 'ONLINE' | 'PRESENCIAL';
  gender?: string;
  age?: number;
  weight?: number;
  height?: number;
  nutritionist_name?: string;
  nutritionist_title?: string;
  nutritionist_gender?: string;
  nutritionist_avatar?: string;
}


interface PatientContextType {
  patient: Patient | null;
  setPatient: (patient: Patient) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

const PatientContext = createContext<PatientContextType>({
  patient: null,
  setPatient: () => { },
  loading: true,
  setLoading: () => { }
});

export const PatientProvider = ({ children }: { children: React.ReactNode }) => {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);

  const { isAuthenticated, isLoading: authLoading } = useAuth();

  // Simular carregamento do paciente
  useEffect(() => {
    // Only fetch patient profile if authenticated and auth loading is done
    if (!isAuthenticated && !authLoading) {
      setLoading(false);
      return;
    }

    if (!isAuthenticated) return;

    const loadPatient = async () => {
      try {
        const data = await patientService.getMe();
        setPatient(data);
      } catch (error: any) {
        // If 404, it just means the user doesn't have a patient profile yet (e.g. nutritionist viewing as patient)
        if (error?.response?.status !== 404) {
          console.error('Failed to load patient profile:', error);
        }
      } finally {
        setLoading(false);
      }
    };

    loadPatient();
  }, [isAuthenticated, authLoading]);

  return (
    <PatientContext.Provider value={{ patient, setPatient, loading, setLoading }}>
      {children}
    </PatientContext.Provider>
  );
};

export const usePatient = () => {
  const context = useContext(PatientContext);
  if (!context) {
    throw new Error('usePatient must be used within a PatientProvider');
  }
  return context;
};