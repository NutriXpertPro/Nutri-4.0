import api from './api';

export interface SubstitutionMacros {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}

export interface SubstitutionOption {
  substitute_food_id: string;
  substitute_food_name: string;
  substitute_source: string;
  equivalent_quantity_g: number;
  equivalent_quantity_display: string;
  predominant_nutrient: 'carbs' | 'protein' | 'fat';
  macros: SubstitutionMacros;
  original_macros: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

export interface SubstitutionResponse {
  original_food: {
    name: string;
    quantity: number;
    unit: string;
    macros: SubstitutionMacros;
  };
  substitutions: SubstitutionOption[];
}

export interface ApplySubstitutionRequest {
  substitute_food_id: string;
  substitute_food_name: string;
  substitute_source: string;
  equivalent_quantity_g: number;
  macros: SubstitutionMacros;
}

export const substitutionService = {
  /**
   * GET /meals/{meal_id}/foods/{food_item_id}/substitutes/
   * Busca substitutos com equivalência nutricional calculada
   */
  async getSubstitutes(mealId: number, foodItemId: number): Promise<SubstitutionResponse> {
    const response = await api.get<SubstitutionResponse>(
      `meals/${mealId}/foods/${foodItemId}/substitutes/`
    );
    return response.data;
  },

  /**
   * POST /meals/{meal_id}/foods/{food_item_id}/apply-substitution/
   * Aplica uma substituição a um item de alimento
   */
  async applySubstitution(
    mealId: number,
    foodItemId: number,
    substitution: ApplySubstitutionRequest
  ): Promise<any> {
    const response = await api.post(
      `meals/${mealId}/foods/${foodItemId}/apply-substitution/`,
      substitution
    );
    return response.data;
  },
};

export default substitutionService;
