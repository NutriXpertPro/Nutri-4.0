'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface Patient {
  id: number;
  name: string;
  email: string;
  goal: string;
  avatar?: string;
  service_type?: 'ONLINE' | 'PRESENCIAL';
  gender?: 'male' | 'female';
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

  // Simular carregamento do paciente
  useEffect(() => {
    const loadPatient = async () => {
      // Em uma implementação real, isso viria de uma API
      setTimeout(() => {
        const mockPatient: Patient = {
          id: 1,
          name: 'Maria Silva',
          email: 'maria.silva@email.com',
          goal: 'Perda de peso saudável',
          avatar: undefined,
          service_type: 'ONLINE',
          gender: 'female'
        };

        setPatient(mockPatient);
        setLoading(false);
      }, 500);
    };

    loadPatient();
  }, []);

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