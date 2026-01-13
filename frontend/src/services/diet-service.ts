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
        const response = await api.get<Diet[]>(`/diets/?patient=${patientId}&is_active=true`)
        return response.data[0] || null; // Retorna a primeira dieta ativa encontrada
    },
    
    create: async (dietData: any) => {
        const response = await api.post<Diet>('/diets/', dietData);
        return response.data;
    }
}

export default dietService
