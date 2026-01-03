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
        weight: number;
        body_fat: number;
        bmi: number;
        muscle_mass: number;
        weight_trend: number; // diff from last measurement
        body_fat_trend: number;
        bmi_trend: number;
        muscle_mass_trend: number;
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
    }
};
