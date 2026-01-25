import api from './api';

export interface CustomFood {
    id: number;
    nome: string;
    grupo: string;
    energia_kcal: number;
    proteina_g: number;
    lipidios_g: number;
    carboidrato_g: number;
    fibra_g: number;
    unidade_caseira: string | null;
    peso_unidade_caseira_g: number | null;
    source: 'TACO' | 'TBCA' | 'USDA' | 'IBGE' | 'CUSTOM' | 'Sua Tabela'
    created_at: string;
    updated_at: string;
}

export const customFoodService = {
    getAll: async () => {
        const response = await api.get<CustomFood[]>('/diets/custom-foods/');
        return response.data;
    },

    getById: async (id: number) => {
        const response = await api.get<CustomFood>(`/diets/custom-foods/${id}/`);
        return response.data;
    },

    create: async (data: Partial<CustomFood>) => {
        const response = await api.post<CustomFood>('/diets/custom-foods/', data);
        return response.data;
    },

    update: async (id: number, data: Partial<CustomFood>) => {
        const response = await api.patch<CustomFood>(`/diets/custom-foods/${id}/`, data);
        return response.data;
    },

    delete: async (id: number) => {
        await api.delete(`/diets/custom-foods/${id}/`);
    },

    getGroups: async () => {
        const response = await api.get<string[]>('/diets/custom-foods/groups/');
        return response.data;
    }
};
