import api from "./api"

// Types
export interface Food {
    id: number | string
    nome: string
    grupo: string
    source: 'TACO' | 'TBCA' | 'USDA' | 'IBGE'
    energia_kcal: number
    proteina_g: number
    lipidios_g: number
    carboidrato_g: number
    fibra_g: number | null
    unidade_caseira?: string | null
    peso_unidade_caseira_g?: number | null
    medidas?: Array<{ label: string; weight: number }>
    is_favorite?: boolean
}

export interface FoodSearchResponse {
    count: number
    results: Food[]
}

export interface FoodGruposResponse {
    grupos: string[]
}

export interface Diet {
    id: number
    patient: number
    name: string
    goal?: string
    instructions?: string
    tmb?: number
    gcdt?: number
    target_calories?: number
    diet_type: string
    target_protein?: number
    target_carbs?: number
    target_fats?: number
    meals?: any[] // JSON structure
    is_active: boolean
    created_at: string
    updated_at: string
}

export interface CreateDietDTO {
    patient: number
    name: string
    goal?: string
    instructions?: string
    diet_type?: string
    target_calories?: number
    target_protein?: number
    target_carbs?: number
    target_fats?: number
}

// Food Service
export const foodService = {
    /**
     * Search foods across all databases (TACO, TBCA, USDA)
     */
    search: async (query: string, options?: { source?: string; grupo?: string; limit?: number; page?: number; page_size?: number }) => {
        const params = new URLSearchParams({ search: query })
        if (options?.source) params.append('source', options.source)
        if (options?.grupo) params.append('grupo', options.grupo)
        if (options?.limit) params.append('limit', options.limit.toString())
        if (options?.page) params.append('page', options.page.toString())
        if (options?.page_size) params.append('page_size', options.page_size.toString())

        const { data } = await api.get<FoodSearchResponse>(`/diets/foods/?${params}`)
        return data
    },

    toggleFavorite: async (source: string, id: string | number, nome: string) => {
        const { data } = await api.post('/diets/toggle-favorite/', { source, id, nome })
        return data
    },

    getFavorites: async () => {
        const { data } = await api.get<FoodSearchResponse>('/diets/foods/favorites/')
        return data
    },

    /**
     * Get all available food groups/categories
     */
    getGrupos: async () => {
        const { data } = await api.get<FoodGruposResponse>('/foods/grupos/')
        return data.grupos
    }
}

// Diet Service
export const dietService = {
    /**
     * List diets for a patient
     */
    listByPatient: async (patientId: number) => {
        const { data } = await api.get<Diet[]>(`/diets/?patient=${patientId}`)
        return data
    },

    /**
     * Get diet by ID
     */
    getById: async (id: number) => {
        const { data } = await api.get<Diet>(`/diets/${id}/`)
        return data
    },

    /**
     * Create a new diet
     */
    create: async (dietData: CreateDietDTO) => {
        const { data } = await api.post<Diet>('/diets/', dietData)
        return data
    },

    /**
     * Update a diet
     */
    update: async (id: number, dietData: Partial<CreateDietDTO>) => {
        const { data } = await api.patch<Diet>(`/diets/${id}/`, dietData)
        return data
    },

    /**
     * Delete a diet
     */
    delete: async (id: number) => {
        await api.delete(`/diets/${id}/`)
    }
}
