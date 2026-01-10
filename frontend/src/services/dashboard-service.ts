import api from "./api";

export interface DashboardStats {
    active_patients: number;
    appointments_today: number;
    active_diets: number;
    adhesion_rate: number;
}

export interface DashboardAppointment {
    id: number;
    patient_name: string;
    time: string;
    type: string;
    duration: number;
    status: string;
    avatar: string | null;
}

export interface DashboardFeaturedPatient {
    id: number;
    name: string;
    goal: string;
    metrics: {
        weight: number | null;
        body_fat: number | null;
        bmi: number | null;
        muscle_mass: number | null;
        weight_trend: number | null;
        body_fat_trend: number | null;
        bmi_trend: number | null;
        muscle_mass_trend: number | null;
    };
    avatar: string | null;
}

export const dashboardService = {
    getStats: async (): Promise<DashboardStats> => {
        const response = await api.get<DashboardStats>("/dashboard/stats/");
        return response.data;
    },

    getAppointmentsToday: async (): Promise<DashboardAppointment[]> => {
        const response = await api.get<DashboardAppointment[]>("/dashboard/appointments/today/");
        return response.data;
    },

    getFeaturedPatient: async (): Promise<DashboardFeaturedPatient> => {
        const response = await api.get<DashboardFeaturedPatient>("/dashboard/patients/featured/");
        return response.data;
    },

    getBirthdaysToday: async (): Promise<any[]> => {
        const response = await api.get<any[]>("/dashboard/patients/birthdays/");
        return response.data;
    }
};
