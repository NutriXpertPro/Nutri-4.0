import api from './api'

export interface FoodItem {
    id: number;
    food_name: string;
    quantity: number;
    unit: string;
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
}

export interface Meal {
    id: number;
    name: string;
    time: string;
    day_of_week: number;
    order: number;
    notes?: string;
    items: FoodItem[];
}

export interface Diet {
    id: number;
    name: string;
    goal?: string;
    diet_type: string;
    target_calories: number;
    target_protein: number;
    target_carbs: number;
    target_fats: number;
    meals_rel: Meal[];
    pdf_file?: string;
}

const dietService = {
    getActiveByPatient: async (patientId: number) => {
        const response = await api.get<Diet[]>(`diets/?patient=${patientId}&is_active=true`)
        return response.data[0] || null; // Retorna a primeira dieta ativa encontrada
    },

    create: async (dietData: any) => {
        const response = await api.post<Diet>('diets/', dietData);
        return response.data;
    },

    // --- Meal Presets ---
    getMealPresets: async () => {
        const response = await api.get('diets/meal-presets/');
        return response.data;
    },

    createMealPreset: async (presetData: any) => {
        const response = await api.post('diets/meal-presets/', presetData);
        return response.data;
    },

    updateMealPreset: async (id: number, presetData: any) => {
        const response = await api.patch(`diets/meal-presets/${id}/`, presetData);
        return response.data;
    },

    deleteMealPreset: async (id: number) => {
        await api.delete(`diets/meal-presets/${id}/`);
    },

    // --- Default Presets ---
    getDefaultPresets: async () => {
        const response = await api.get('diets/default-presets/');
        return response.data;
    },

    createDefaultPreset: async (data: any) => {
        const response = await api.post('diets/default-presets/', data);
        return response.data;
    },

    updateDefaultPreset: async (id: number, data: any) => {
        const response = await api.patch(`diets/default-presets/${id}/`, data);
        return response.data;
    },

    deleteDefaultPreset: async (id: number) => {
        await api.delete(`diets/default-presets/${id}/`);
    }
}

export default dietService
