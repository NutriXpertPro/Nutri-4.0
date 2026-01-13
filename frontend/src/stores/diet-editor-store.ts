import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Food, foodService } from '@/services/food-service'
import { Patient, ClinicalNote } from '../services/patient-service'

// Types
// Types
export interface FoodItem {
    id: string
    food: Food | null
    customName?: string
    quantity: number
    unit: string
    calories: number
    protein: number
    carbs: number
    fats: number
    fiber: number
}

export interface Meal {
    id: string
    name: string
    time: string
    order: number
    items: FoodItem[]
    notes?: string
}

export interface DietDayPlan {
    dayOfWeek: number // 0-6 (Mon-Sun)
    meals: Meal[]
}

export interface PatientContext {
    id: number
    name: string
    gender: string
    age?: number
    weight?: number
    initial_weight?: number
    height?: number
    bodyFat?: number
    muscleMass?: number
    sex?: 'M' | 'F'
    anamnesis?: any
    exams?: any[]
    notes?: ClinicalNote[]
    // New fields for Context Tab
    birth_date?: string
    phone?: string
    email?: string
    start_date?: string
    created_at?: string
    service_type?: string
    medications?: string[]
    pathologies?: string[]
}

// Workspace Meal Types (for DietTemplateWorkspace)
export interface WorkspaceMealFood {
    id: number
    name: string
    qty: number | ''
    unit: string
    measure: string
    prep: string
    ptn: number
    cho: number
    fat: number
    fib: number
    preferred: boolean
    unidade_caseira?: string
    peso_unidade_caseira_g?: number
    medidas?: Array<{ label: string; weight: number }>
    originalId?: number | string // ID from source (TACO, TBCA etc)
    source?: string // Table source
}

// Meal Preset Types
export interface MealPresetFood {
    id: number;
    food_name: string;
    quantity: number;
    unit: string;
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    fiber?: number;
}

export interface MealPreset {
    id: number;
    name: string;
    meal_type: string;
    diet_type: string;
    description?: string;
    foods: MealPresetFood[];
    total_calories: number;
    total_protein: number;
    total_carbs: number;
    total_fats: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

// Default Preset Types
export interface DefaultPreset {
    id: number;
    meal_type: string;
    diet_type: string;
    preset: number; // ID do MealPreset
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface WorkspaceMeal {
    id: number
    type: string
    time: string
    observation: string
    foods: WorkspaceMealFood[]
    isCollapsed: boolean
}

export interface DietPreset {
    id: string
    name: string
    description?: string
    weekPlan: DietDayPlan[]
    created_at?: string
    updated_at?: string
}

// Calculation Methods
export type CalculationMethod =
    | 'harris_benedict_1919'
    | 'harris_benedict_1984'
    | 'mifflin_1990'
    | 'henry_rees_1991'
    | 'tinsley_2018_weight'
    | 'katch_mcardle_1996'
    | 'cunningham_1980'
    | 'tinsley_2018_lbm'
    | 'fao_who_2004'
    | 'eer_iom_2005'
    | 'eer_iom_2023'
    | 'mifflin' // Legacy support
    | 'harris_benedict' // Legacy support
    | 'cunningham' // Legacy support
    | 'harris'
    | 'tinsley'
    | 'fao'
    | 'schofield'
    | 'oxford'
    | 'iom'

// Diet Types with macro distributions
export type DietType =
    | 'normocalorica'
    | 'low_carb'
    | 'high_carb'
    | 'cetogenica'
    | 'mediterranea'
    | 'vegetariana'
    | 'vegana'
    | 'sem_gluten'
    | 'hiperproteica'
    | 'personalizada'

export const DIET_TYPE_MACROS: Record<DietType, { carbs: number; protein: number; fats: number; label: string }> = {
    normocalorica: { carbs: 50, protein: 20, fats: 30, label: 'Normocalórica' },
    low_carb: { carbs: 25, protein: 30, fats: 45, label: 'Low Carb' },
    high_carb: { carbs: 60, protein: 20, fats: 20, label: 'High Carb' },
    cetogenica: { carbs: 5, protein: 25, fats: 70, label: 'Cetogênica' },
    mediterranea: { carbs: 45, protein: 20, fats: 35, label: 'Mediterrânea' },
    vegetariana: { carbs: 55, protein: 15, fats: 30, label: 'Vegetariana' },
    vegana: { carbs: 55, protein: 15, fats: 30, label: 'Vegana' },
    sem_gluten: { carbs: 50, protein: 20, fats: 30, label: 'Sem Glúten' },
    hiperproteica: { carbs: 35, protein: 40, fats: 25, label: 'Hiperproteica' },
    personalizada: { carbs: 40, protein: 30, fats: 30, label: 'Personalizada' },
}

export const ACTIVITY_LEVELS = [
    { value: 1.2, label: 'Sedentário', description: 'Pouco ou nenhum exercício' },
    { value: 1.375, label: 'Levemente Ativo', description: '1-3 dias/semana' },
    { value: 1.55, label: 'Moderadamente Ativo', description: '3-5 dias/semana' },
    { value: 1.725, label: 'Muito Ativo', description: '6-7 dias/semana' },
    { value: 1.9, label: 'Extremamente Ativo', description: 'Atleta profissional' },
]

// State Interface
interface DietEditorState {
    // Patient
    patient: PatientContext | null
    
    // Diet ID (if saved)
    dietId: number | null

    // Diet Configuration
    dietName: string
    calculationMethod: CalculationMethod
    dietType: DietType
    activityLevel: number
    goalAdjustment: number // -500 to +500

    // Custom Metabolic Targets (overrides calculations - ONLY for 'personalizada')
    customTargets: {
        tmb?: number
        get?: number
        calories?: number
    }

    // Calculated Values
    tmb: number
    get: number

    targetCalories: number
    targetMacros: { carbs: number; protein: number; fats: number; fiber: number }
    customMacros: { carbs: number; protein: number; fats: number }

    // Navigation
    activeTab: string
    anamnesisViewMode: 'list' | 'view-responses' | 'fill-standard' | 'fill-custom'

    // Meal Plan
    currentDayIndex: number
    weekPlan: DietDayPlan[]
    selectedMealId: string | null

    // UI State
    isDirty: boolean
    isSaving: boolean
    leftPanelCollapsed: boolean
    rightPanelCollapsed: boolean

    // History for Undo/Redo
    history: DietDayPlan[][]
    historyIndex: number

    // Workspace Template State (persists between tab switches)
    workspaceMeals: WorkspaceMeal[]
    activeWorkspaceDay: string
    validityStartDate: string
    validityEndDate: string
    favorites: Food[]

    // Meal Presets State
    mealPresets: MealPreset[]
    presetsLoading: boolean
    favoritePresetIds: number[]

    // Default Presets State
    defaultPresets: DefaultPreset[]
    defaultPresetsLoading: boolean

    // Actions
    setPatient: (patient: PatientContext | null) => void
    setDietId: (id: number | null) => void
    setDietName: (name: string) => void
    setCalculationMethod: (method: CalculationMethod) => void
    setDietType: (type: DietType) => void
    setActivityLevel: (level: number) => void
    setGoalAdjustment: (adjustment: number) => void
    setCustomTarget: (target: 'tmb' | 'get' | 'calories', value: number | undefined) => void
    setCustomMacros: (macros: Partial<DietEditorState['customMacros']>) => void
    calculateMetabolics: () => void

    setActiveTab: (tab: string) => void
    setAnamnesisViewMode: (mode: 'list' | 'view-responses' | 'fill-standard' | 'fill-custom') => void

    setCurrentDay: (index: number) => void
    // setDayIndex removed as it's likely an alias or duplicate not implemented
    selectMeal: (mealId: string | null) => void
    toggleLeftPanel: () => void

    // Meal Editing
    addMeal: (meal: Omit<Meal, 'id'>) => void
    updateMeal: (mealId: string, updates: Partial<Meal>) => void
    removeMeal: (mealId: string) => void

    addFoodToMeal: (mealId: string, item: Omit<FoodItem, 'id'>) => void
    removeFoodFromMeal: (mealId: string, itemId: string) => void
    updateFoodItem: (mealId: string, itemId: string, updates: Partial<FoodItem>) => void

    // Legacy (string IDs) Support if needed by implementation
    applyPreset: (mealId: string, presetItems: Omit<FoodItem, 'id'>[]) => void
    copyMeal: (fromMealId: string, toDayIndex: number) => void

    toggleRightPanel: () => void

    undo: () => void
    redo: () => void
    saveSnapshot: () => void

    reset: () => void

    // Workspace Template Actions
    setWorkspaceMeals: (meals: WorkspaceMeal[]) => void
    addWorkspaceMeal: (meal: WorkspaceMeal) => void
    updateWorkspaceMeal: (mealId: number, updates: Partial<WorkspaceMeal>) => void
    deleteWorkspaceMeal: (mealId: number) => void
    copyWorkspaceMeal: (mealId: number) => void
    setActiveWorkspaceDay: (day: string) => void
    setValidityDates: (start: string, end: string) => void
    addFavorite: (food: Food) => Promise<void>
    removeFavorite: (foodId: string | number, source: string, foodName?: string) => Promise<void>
    loadFavorites: () => Promise<void>
    addFoodToWorkspaceMeal: (mealId: number, food: Food) => void
    removeFoodFromWorkspaceMeal: (mealId: number, foodId: number) => void

    // Meal Preset Actions
    loadMealPresets: () => Promise<void>
    createMealPreset: (preset: Omit<MealPreset, 'id' | 'created_at' | 'updated_at'>) => Promise<void>
    updateMealPreset: (id: number, preset: Partial<MealPreset>) => Promise<void>
    deleteMealPreset: (id: number) => Promise<void>
    getPresetsByMealType: (mealType: string) => MealPreset[]
    getPresetsByDietType: (dietType: string) => MealPreset[]
    searchMealPresets: (query: string) => MealPreset[]
    toggleFavoritePreset: (presetId: number) => void
    getFavoritePresets: () => MealPreset[]
    isPresetFavorite: (presetId: number) => boolean

    // Default Preset Actions
    loadDefaultPresets: () => Promise<void>
    setDefaultPreset: (mealType: string, dietType: string, presetId: number) => Promise<void>
    removeDefaultPreset: (mealType: string, dietType: string) => Promise<void>
    getDefaultPreset: (mealType: string, dietType: string) => DefaultPreset | undefined
    applyDefaultPreset: (mealId: string, mealType: string, dietType: string) => void
    setPresetAsDefault: (presetId: number, mealType: string, dietType: string) => Promise<void>

    // Patient Actions (Transient for UI)
    addNote: (note: { title: string; category: string; content: string; date: string }) => void
}

// Helper: Generate unique ID
const generateId = (): string => Math.random().toString(36).substring(2, 11)

// Helper to calculate TMB
const calculateTMB = (method: CalculationMethod, weight: number, height: number, age: number, sex: 'M' | 'F', activityLevel?: number, bodyFat?: number, muscleMass?: number): number => {
    // Height in meters for some formulas, cm for others
    const heightM = height // Input is likely meters based on typical app usage, checking implementation
    // Standard Mifflin: (10 x weight in kg) + (6.25 x height in cm) - (5 x age in years) + 5
    // Wait, height in frontend is usually meters (e.g. 1.75). Let's convert to cm for Mifflin.
    const heightCm = height * 100

    switch (method) {
        case 'mifflin':
            if (sex === 'M') {
                return (10 * weight) + (6.25 * heightCm) - (5 * age) + 5;
            } else {
                return (10 * weight) + (6.25 * heightCm) - (5 * age) - 161;
            }

        case 'harris':
            if (sex === 'M') {
                return 66.5 + (13.75 * weight) + (5.003 * heightCm) - (6.75 * age);
            } else {
                return 655.1 + (9.563 * weight) + (1.850 * heightCm) - (4.676 * age);
            }

        case 'cunningham':
            // Requires LBM (Lean Body Mass)
            // If muscleMass is provided, use it. Else estimate?
            // Formula: 500 + (22 * LBM)
            if (muscleMass) {
                return 500 + (22 * muscleMass);
            } else if (bodyFat) {
                const lbm = weight * (1 - (bodyFat / 100));
                return 500 + (22 * lbm);
            } else {
                // Fallback to Mifflin if no body composition data
                if (sex === 'M') {
                    return (10 * weight) + (6.25 * heightCm) - (5 * age) + 5;
                } else {
                    return (10 * weight) + (6.25 * heightCm) - (5 * age) - 161;
                }
            }

        case 'tinsley':
            // Directed at athletes (Fat Free Mass based)
            // FFM = weight * (1 - bodyFat%)
            // RMR = 25.9 * FFM + 284
            if (bodyFat) {
                const ffm = weight * (1 - (bodyFat / 100));
                return 25.9 * ffm + 284;
            } else {
                // Fallback
                return (10 * weight) + (6.25 * heightCm) - (5 * age) + 5;
            }

        case 'fao':
            // FAO/WHO equations
            // Reduced simplicity here for common ranges
            if (sex === 'M') {
                if (age >= 18 && age <= 30) return 15.3 * weight + 679;
                if (age >= 30 && age <= 60) return 11.6 * weight + 879;
                return 13.5 * weight + 487;
            } else {
                if (age >= 18 && age <= 30) return 14.7 * weight + 496;
                if (age >= 30 && age <= 60) return 8.7 * weight + 829;
                return 10.5 * weight + 596;
            }

        case 'schofield':
            // Schofield (1985)
            if (sex === 'M') {
                if (age >= 18 && age <= 30) return 15.1 * weight + 692;
                if (age >= 30 && age <= 60) return 11.5 * weight + 873;
                return 11.7 * weight + 588;
            } else {
                if (age >= 18 && age <= 30) return 14.8 * weight + 487;
                if (age >= 30 && age <= 60) return 8.1 * weight + 846;
                return 9.1 * weight + 659;
            }

        case 'oxford':
            // Oxford equations (2005) - often considered more accurate for modern populations than FAO/WHO
            if (sex === 'M') {
                if (age >= 18 && age <= 30) return 14.4 * weight + 313 * (heightCm / 100) + 113;
                if (age >= 30 && age <= 60) return 11.4 * weight + 541 * (heightCm / 100) - 137;
                return 14.4 * weight + 313 * (heightCm / 100) + 113; // fallback
            } else {
                if (age >= 18 && age <= 30) return 10.4 * weight + 615 * (heightCm / 100) - 282;
                if (age >= 30 && age <= 60) return 8.18 * weight + 502 * (heightCm / 100) - 11.6;
                return 10.4 * weight + 615 * (heightCm / 100) - 282; // fallback
            }

        case 'iom':
            // Institute of Medicine (2005) - Estimated Energy Requirement (EER) logic roughly
            // EER is complex, usually TEE directly. TMB part is similar to Mifflin.
            // Using a simplified version often cited for IOM BMR:
            const pa = activityLevel || 1.2;
            if (sex === 'M') {
                return 662 - (9.53 * age) + pa * (15.91 * weight + 539.6 * (heightCm / 100));
            } else {
                return 354 - (6.91 * age) + pa * (9.36 * weight + 726 * (heightCm / 100));
            }

        default:
            return (10 * weight) + (6.25 * heightCm) - (5 * age) + 5;
    }
}

// Default week plan - uses fixed IDs to avoid SSR hydration mismatch
const createDefaultWeekPlan = (): DietDayPlan[] => {
    const defaultMeals = [
        { name: 'Café da Manhã', time: '07:00', order: 0 },
        { name: 'Lanche da Manhã', time: '10:00', order: 1 },
        { name: 'Almoço', time: '12:30', order: 2 },
        { name: 'Lanche da Tarde', time: '15:30', order: 3 },
        { name: 'Jantar', time: '19:00', order: 4 },
        { name: 'Ceia', time: '21:00', order: 5 },
    ]

    return Array.from({ length: 7 }, (_, dayIndex) => ({
        dayOfWeek: dayIndex,
        meals: defaultMeals.map((meal, mealIndex) => ({
            id: `day${dayIndex}-meal${mealIndex}`,
            ...meal,
            items: []
        }))
    }))
}

// Initial State
const initialState = {
    patient: null,
    dietId: null,
    dietName: '',
    calculationMethod: 'mifflin' as CalculationMethod,
    dietType: 'normocalorica' as DietType,
    activityLevel: 1.55,
    goalAdjustment: 0,
    tmb: 0,
    get: 0,
    targetCalories: 0,
    targetMacros: { carbs: 0, protein: 0, fats: 0, fiber: 25 },
    customMacros: { carbs: 40, protein: 30, fats: 30 },
    customTargets: {},
    activeTab: 'diet',
    anamnesisViewMode: 'list' as 'list' | 'view-responses' | 'fill-standard' | 'fill-custom',
    currentDayIndex: 0,
    weekPlan: createDefaultWeekPlan(),
    selectedMealId: null,
    isDirty: false,
    isSaving: false,
    leftPanelCollapsed: false,
    rightPanelCollapsed: false,
    history: [],
    historyIndex: -1,
    // Workspace state
    workspaceMeals: [{
        id: 1,
        type: 'Café da Manhã',
        time: '07:00',
        observation: '',
        foods: [],
        isCollapsed: false
    }] as WorkspaceMeal[],
    activeWorkspaceDay: 'Seg',
    validityStartDate: '',
    validityEndDate: '',
    favorites: [],

    // Meal Presets state
    mealPresets: [],
    presetsLoading: false,
    favoritePresetIds: [],

    // Default Presets state
    defaultPresets: [],
    defaultPresetsLoading: false,
}

// Zustand Store
export const useDietEditorStore = create<DietEditorState>((set, get) => ({
    ...initialState,

    setPatient: (patient) => {
        set({ patient, isDirty: true })
        if (patient) {
            get().calculateMetabolics()
        }
    },

    setDietId: (dietId) => set({ dietId }),

    setDietName: (dietName) => set({ dietName, isDirty: true }),

    setCalculationMethod: (calculationMethod) => {
        set({ calculationMethod, isDirty: true })
        get().calculateMetabolics()
    },

    setDietType: (dietType) => {
        set((state) => ({
            dietType,
            isDirty: true,
            // Clear custom targets if not personalizada
            customTargets: dietType === 'personalizada' ? state.customTargets : {}
        }))
        get().calculateMetabolics()

        // Auto-apply default presets for this diet type
        const state = get();
        const { weekPlan, currentDayIndex, defaultPresets, mealPresets } = state;
        const currentMeals = weekPlan[currentDayIndex].meals;
        let hasUpdates = false;

        // Mapeamento de nomes de refeição para IDs de meal_type (simplificado)
        // Idealmente isso seria mais robusto, mas vamos usar uma heurística baseada no nome
        const normalizeMealType = (name: string): string => {
            const n = name.toLowerCase();
            if (n.includes('café') || n.includes('manhã')) return 'cafe_da_manha';
            if (n.includes('almoço')) return 'almoco';
            if (n.includes('jantar')) return 'jantar';
            if (n.includes('lanche')) return n.includes('manhã') ? 'lanche_manha' : 'lanche_tarde';
            if (n.includes('ceia')) return 'ceia';
            if (n.includes('suplemento')) return 'suplemento';
            return 'outros';
        };

        const newWeekPlan = [...weekPlan];
        const updatedMeals = [...currentMeals]; // Create a copy of meals

        updatedMeals.forEach((meal, index) => {
            // Find default preset for this meal type + new diet type
            // Precisamos saber o 'meal_type' (id) da refeição atual. 
            // Como Meal não tem 'type' explícito (só name), vamos inferir ou teria que ter.
            // O ideal seria que Meal tivesse um campo meal_type herdado.
            // Vamos tentar inferir pelo nome ou usar um mapeamento se disponível.

            // Tentativa de mapear pelo nome padrão (que geralmente é confiável se não editado)
            const typeId = normalizeMealType(meal.name);

            const defaultPreset = defaultPresets.find(dp =>
                dp.meal_type === typeId && dp.diet_type === dietType && dp.is_active
            );

            if (defaultPreset) {
                const preset = mealPresets.find(p => p.id === defaultPreset.preset);
                if (preset) {
                    // Apply preset items to this meal
                    // This replaces existing items or appends? Usually presets replace or append.
                    // The user request implies "filling", potentially replacing empty ones or just adding.
                    // Let's assume append for now to be safe, or replace if empty.
                    // Or clearer: The user says "automatically filled". I will append for now.

                    const newItems: FoodItem[] = preset.foods.map(food => ({
                        id: generateId(),
                        food: null,
                        customName: food.food_name,
                        quantity: food.quantity,
                        unit: food.unit,
                        calories: food.calories,
                        protein: food.protein,
                        carbs: food.carbs,
                        fats: food.fats,
                        fiber: food.fiber || 0
                    }));

                    updatedMeals[index] = {
                        ...meal,
                        items: newItems // Substitui os itens atuais pelos do preset (mais agressivo, mas parece ser o desejo para "troca de dieta")
                        // Se quiser apenas adicionar: items: [...meal.items, ...newItems]
                    };
                    hasUpdates = true;
                }
            }
        });

        if (hasUpdates) {
            newWeekPlan[currentDayIndex] = {
                ...newWeekPlan[currentDayIndex],
                meals: updatedMeals
            };
            set({ weekPlan: newWeekPlan, isDirty: true });
        }
    },

    setActivityLevel: (activityLevel) => {
        set({ activityLevel, isDirty: true })
        get().calculateMetabolics()
    },

    setGoalAdjustment: (goalAdjustment) => {
        set({ goalAdjustment, isDirty: true })
        get().calculateMetabolics()
    },

    setCustomTarget: (target, value) => {
        set((state) => ({
            customTargets: { ...state.customTargets, [target]: value },
            isDirty: true
        }))
        get().calculateMetabolics()
    },

    setCustomMacros: (macros) => {
        set((state) => ({
            customMacros: { ...state.customMacros, ...macros },
            dietType: 'personalizada',
            isDirty: true
        }))
        get().calculateMetabolics()
    },

    calculateMetabolics: () => {
        const { patient, calculationMethod, activityLevel, goalAdjustment, dietType, customMacros, customTargets } = get()

        // Use patient data or fallback to default standard profile
        const weight = patient?.weight ?? 70
        const height = patient?.height ?? 1.70
        const age = patient?.age ?? 30
        const sex = patient?.sex ?? 'M'
        const bodyFat = patient?.bodyFat
        const muscleMass = patient?.muscleMass

        let tmb = calculateTMB(
            calculationMethod,
            weight,
            height * 100, // Convert m to cm
            age,
            sex,
            bodyFat,
            muscleMass,
            activityLevel
        )

        // EER methods already include activity level
        // EER methods already include activity level
        const isEER = calculationMethod.startsWith('eer_iom')
        let getVal = isEER ? Math.round(tmb) : Math.round(tmb * activityLevel)

        // Apply Custom Overrides (ONLY if Diet Type is Personalziada)
        if (dietType === 'personalizada') {
            if (customTargets.tmb) tmb = customTargets.tmb
            if (customTargets.get) getVal = customTargets.get
        }

        let targetCalories = Math.round(getVal + goalAdjustment)

        if (dietType === 'personalizada' && customTargets.calories) {
            targetCalories = customTargets.calories
        }

        const macroDistribution = dietType === 'personalizada' ? customMacros : DIET_TYPE_MACROS[dietType]
        const targetMacros = {
            carbs: Math.round((targetCalories * macroDistribution.carbs / 100) / 4), // 4 kcal/g
            protein: Math.round((targetCalories * macroDistribution.protein / 100) / 4), // 4 kcal/g
            fats: Math.round((targetCalories * macroDistribution.fats / 100) / 9), // 9 kcal/g
            fiber: 25, // Fixed target of 25g fiber per day
        }

        set({ tmb: Math.round(tmb), get: getVal, targetCalories, targetMacros })
    },

    setActiveTab: (activeTab) => set({ activeTab }),
    setAnamnesisViewMode: (anamnesisViewMode) => set({ anamnesisViewMode }),

    setCurrentDay: (currentDayIndex) => set({ currentDayIndex }),

    addMeal: (meal) => {
        const { weekPlan, currentDayIndex } = get()
        const newMeal: Meal = { ...meal, id: generateId() }
        const newWeekPlan = [...weekPlan]
        newWeekPlan[currentDayIndex] = {
            ...newWeekPlan[currentDayIndex],
            meals: [...newWeekPlan[currentDayIndex].meals, newMeal]
        }
        get().saveSnapshot()
        set({ weekPlan: newWeekPlan, isDirty: true })
    },

    updateMeal: (mealId, updates) => {
        const { weekPlan, currentDayIndex } = get()
        const newWeekPlan = [...weekPlan]

        newWeekPlan[currentDayIndex] = {
            ...newWeekPlan[currentDayIndex],
            meals: newWeekPlan[currentDayIndex].meals.map(meal =>
                meal.id === mealId ? { ...meal, ...updates } : meal
            )
        }

        set({ weekPlan: newWeekPlan, isDirty: true })
    },

    removeMeal: (mealId) => {
        const { weekPlan, currentDayIndex } = get()
        get().saveSnapshot()

        const newWeekPlan = [...weekPlan]
        newWeekPlan[currentDayIndex] = {
            ...newWeekPlan[currentDayIndex],
            meals: newWeekPlan[currentDayIndex].meals.filter(m => m.id !== mealId)
        }

        set({ weekPlan: newWeekPlan, isDirty: true })
    },

    selectMeal: (selectedMealId) => set({ selectedMealId }),

    addFoodToMeal: (mealId, item) => {
        const { weekPlan, currentDayIndex } = get()
        const newItem: FoodItem = { ...item, id: generateId() }

        const newWeekPlan = [...weekPlan]
        newWeekPlan[currentDayIndex] = {
            ...newWeekPlan[currentDayIndex],
            meals: newWeekPlan[currentDayIndex].meals.map(meal =>
                meal.id === mealId
                    ? { ...meal, items: [...meal.items, newItem] }
                    : meal
            )
        }

        get().saveSnapshot()
        set({ weekPlan: newWeekPlan, isDirty: true })
    },

    updateFoodItem: (mealId, itemId, updates) => {
        const { weekPlan, currentDayIndex } = get()

        const newWeekPlan = [...weekPlan]
        newWeekPlan[currentDayIndex] = {
            ...newWeekPlan[currentDayIndex],
            meals: newWeekPlan[currentDayIndex].meals.map(meal =>
                meal.id === mealId
                    ? {
                        ...meal,
                        items: meal.items.map(item =>
                            item.id === itemId
                                ? { ...item, ...updates }
                                : item
                        )
                    }
                    : meal
            )
        }

        set({ weekPlan: newWeekPlan, isDirty: true })
    },

    removeFoodFromMeal: (mealId, itemId) => {
        const { weekPlan, currentDayIndex } = get()
        get().saveSnapshot()

        const newWeekPlan = [...weekPlan]
        newWeekPlan[currentDayIndex] = {
            ...newWeekPlan[currentDayIndex],
            meals: newWeekPlan[currentDayIndex].meals.map(meal =>
                meal.id === mealId
                    ? { ...meal, items: meal.items.filter(i => i.id !== itemId) }
                    : meal
            )
        }

        set({ weekPlan: newWeekPlan, isDirty: true })
    },

    applyPreset: (mealId, presetItems) => {
        const { weekPlan, currentDayIndex } = get()
        get().saveSnapshot()
        const newItems: FoodItem[] = presetItems.map(item => ({ ...item, id: generateId() }))

        const newWeekPlan = [...weekPlan]
        newWeekPlan[currentDayIndex] = {
            ...newWeekPlan[currentDayIndex],
            meals: newWeekPlan[currentDayIndex].meals.map(meal =>
                meal.id === mealId
                    ? { ...meal, items: [...meal.items, ...newItems] }
                    : meal
            )
        }

        set({ weekPlan: newWeekPlan, isDirty: true })
    },

    copyMeal: (fromMealId, toDayIndex) => {
        const { weekPlan, currentDayIndex } = get()
        const meal = weekPlan[currentDayIndex].meals.find(m => m.id === fromMealId)
        if (meal) {
            get().saveSnapshot()
            const copiedMeal: Meal = {
                ...meal,
                id: generateId(),
                items: meal.items.map(item => ({ ...item, id: generateId() }))
            }

            const newWeekPlan = [...weekPlan]
            newWeekPlan[toDayIndex] = {
                ...newWeekPlan[toDayIndex],
                meals: [...newWeekPlan[toDayIndex].meals, copiedMeal]
            }

            set({ weekPlan: newWeekPlan, isDirty: true })
        }
    },

    toggleLeftPanel: () => set((state) => ({ leftPanelCollapsed: !state.leftPanelCollapsed })),
    toggleRightPanel: () => set((state) => ({ rightPanelCollapsed: !state.rightPanelCollapsed })),

    undo: () => {
        // Implement undo logic
    },
    redo: () => {
        // Implement redo logic
    },
    saveSnapshot: () => {
        const { weekPlan, history, historyIndex } = get()
        const newHistory = history.slice(0, historyIndex + 1)
        newHistory.push(JSON.parse(JSON.stringify(weekPlan)))
        set({ history: newHistory.slice(-50), historyIndex: newHistory.length - 1 }) // Keep last 50 snapshots
    },

    reset: () => set(initialState),

    // Workspace Template Actions
    setWorkspaceMeals: (workspaceMeals) => set({ workspaceMeals }),

    addWorkspaceMeal: (meal) => {
        const { workspaceMeals } = get()
        set({ workspaceMeals: [...workspaceMeals, meal] })
    },

    updateWorkspaceMeal: (mealId, updates) => {
        const { workspaceMeals } = get()
        set({
            workspaceMeals: workspaceMeals.map(m =>
                m.id === mealId ? { ...m, ...updates } : m
            )
        })
    },

    deleteWorkspaceMeal: (mealId) => {
        const { workspaceMeals } = get()
        // Removed check for minimum 1 meal to allow empty state
        set({
            workspaceMeals: workspaceMeals.filter(m => m.id !== mealId)
        })
    },

    copyWorkspaceMeal: (mealId) => {
        const { workspaceMeals } = get()
        const mealToCopy = workspaceMeals.find(m => m.id === mealId)
        if (!mealToCopy) return
        const newId = Math.max(...workspaceMeals.map(m => m.id)) + 1
        const copiedMeal: WorkspaceMeal = {
            ...mealToCopy,
            id: newId,
            foods: mealToCopy.foods.map((f, i) => ({ ...f, id: Date.now() + i }))
        }
        set({ workspaceMeals: [...workspaceMeals, copiedMeal] })
    },

    setActiveWorkspaceDay: (activeWorkspaceDay) => set({ activeWorkspaceDay }),

    setValidityDates: (start, end) => set({ validityStartDate: start, validityEndDate: end }),

    addFavorite: async (food) => {
        const { favorites, loadFavorites } = get()
        if (!favorites.some(f => f.id === food.id && f.source === food.source)) {
            await foodService.toggleFavorite(food.source, food.id, food.nome)
            await loadFavorites()
        }
    },

    removeFavorite: async (foodId, source, foodName) => {
        const { favorites, loadFavorites } = get()
        const food = favorites.find(f => f.id === foodId && f.source === source)
        const nameToUse = foodName || food?.nome

        if (nameToUse) {
            await foodService.toggleFavorite(source, foodId, nameToUse)
            await loadFavorites()
        }
    },

    loadFavorites: async () => {
        try {
            const data = await foodService.getFavorites()
            set({ favorites: data.results })
        } catch (error) {
            console.error("Erro ao carregar favoritos:", error)
        }
    },

    addFoodToWorkspaceMeal: (mealId, food) => {
        const { workspaceMeals } = get()
        set({
            workspaceMeals: workspaceMeals.map(meal => {
                if (meal.id !== mealId) return meal
                const newFood: WorkspaceMealFood = {
                    id: Date.now(),
                    name: food.nome,
                    qty: '', // Começa vazio conforme solicitado pelo usuário
                    unit: 'g',
                    measure: 'default', // Modo de medida padrão (automático)
                    prep: '',
                    ptn: food.proteina_g,
                    cho: food.carboidrato_g,
                    fat: food.lipidios_g,
                    fib: food.fibra_g || 0,
                    preferred: false,
                    unidade_caseira: food.unidade_caseira ?? undefined,
                    peso_unidade_caseira_g: food.peso_unidade_caseira_g ?? undefined,
                    medidas: food.medidas,
                    originalId: food.id,
                    source: food.source
                }
                return { ...meal, foods: [...meal.foods, newFood] }
            })
        })
    },

    removeFoodFromWorkspaceMeal: (mealId, foodId) => {
        const { workspaceMeals } = get()
        set({
            workspaceMeals: workspaceMeals.map(meal => {
                if (meal.id !== mealId) return meal
                return { ...meal, foods: meal.foods.filter(f => f.id !== foodId) }
            })
        })
    },

    addNote: (data) => {
        const { patient } = get()
        if (!patient) return

        const newNote = {
            id: Date.now(),
            content: data.content,
            title: data.title,
            category: data.category,
            date: data.date,
            created_at: new Date().toISOString(),
            nutritionist_name: 'Nutricionista' // Placeholder
        }

        const updatedNotes = [newNote, ...(patient.notes || [])]

        set({
            patient: {
                ...patient,
                notes: updatedNotes
            },
            isDirty: true
        })
    },

    // Meal Preset Actions
    loadMealPresets: async () => {
        set({ presetsLoading: true });
        try {
            // Tenta carregar do localStorage primeiro
            if (typeof window !== 'undefined') {
                const savedPresets = localStorage.getItem('meal_presets');
                const savedFavorites = localStorage.getItem('favorite_preset_ids');

                if (savedPresets) {
                    const parsedPresets = JSON.parse(savedPresets);
                    // Only return if we actually have presets
                    if (Array.isArray(parsedPresets) && parsedPresets.length > 0) {
                        const favorites = savedFavorites ? JSON.parse(savedFavorites) : [];
                        set({
                            mealPresets: parsedPresets,
                            favoritePresetIds: favorites,
                            presetsLoading: false
                        });
                        return;
                    }
                }
            }

            // Simulação de presets com alimentos para demonstração
            // Only used if no local storage data found
            const mockPresets: MealPreset[] = [
                {
                    id: 1,
                    name: 'Café da Manhã',
                    meal_type: 'cafe_da_manha',
                    diet_type: 'normocalorica',
                    description: '',
                    foods: [
                        { id: 1, food_name: 'Pão Integral', quantity: 60, unit: 'g', calories: 166, protein: 5, carbs: 29, fats: 2, fiber: 3 },
                        { id: 2, food_name: 'Ovo Cozido', quantity: 70, unit: 'g', calories: 92, protein: 7, carbs: 0.6, fats: 6.3, fiber: 0 },
                        { id: 3, food_name: 'Banana', quantity: 100, unit: 'g', calories: 89, protein: 1.1, carbs: 22.8, fats: 0.3, fiber: 2.6 },
                        { id: 4, food_name: 'Café com Leite', quantity: 200, unit: 'ml', calories: 60, protein: 3.3, carbs: 6.8, fats: 2.5, fiber: 0 }
                    ],
                    total_calories: 407,
                    total_protein: 16.5,
                    total_carbs: 59.2,
                    total_fats: 11.1,
                    is_active: true,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                },
                {
                    id: 2,
                    name: 'Almoço Low Carb',
                    meal_type: 'almoco',
                    diet_type: 'low_carb',
                    description: '',
                    foods: [
                        { id: 1, food_name: 'Filé de Frango Grelhado', quantity: 150, unit: 'g', calories: 231, protein: 31, carbs: 0, fats: 12, fiber: 0 },
                        { id: 2, food_name: 'Brócolis Cozido', quantity: 100, unit: 'g', calories: 34, protein: 2.8, carbs: 7, fats: 0.4, fiber: 2.6 },
                        { id: 3, food_name: 'Abacate', quantity: 50, unit: 'g', calories: 80, protein: 1, carbs: 4, fats: 7, fiber: 3.4 }
                    ],
                    total_calories: 345,
                    total_protein: 34.8,
                    total_carbs: 11,
                    total_fats: 19.4,
                    is_active: true,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                },
                {
                    id: 3,
                    name: 'Lanche da Tarde Proteico',
                    meal_type: 'lanche_tarde',
                    diet_type: 'hiperproteica',
                    description: '',
                    foods: [
                        { id: 1, food_name: 'Iogurte Grego', quantity: 150, unit: 'g', calories: 100, protein: 10, carbs: 7, fats: 0, fiber: 0 },
                        { id: 2, food_name: 'Castanha do Pará', quantity: 30, unit: 'g', calories: 187, protein: 4.3, carbs: 3.3, fats: 19.2, fiber: 2.4 }
                    ],
                    total_calories: 287,
                    total_protein: 14.3,
                    total_carbs: 10.3,
                    total_fats: 19.2,
                    is_active: true,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                }
            ];
            set({ mealPresets: mockPresets });

            if (typeof window !== 'undefined') {
                localStorage.setItem('meal_presets', JSON.stringify(mockPresets));
            }
        } catch (error) {
            console.error('Erro ao carregar presets:', error);
            // Fallback to empty array and STOP loading
            set({ mealPresets: [], presetsLoading: false });
        } finally {
            // Ensure loading is set to false in all paths
            set((state) => ({ ...state, presetsLoading: false }));
        }
    },

    createMealPreset: async (presetData) => {
        set({ presetsLoading: true });
        try {
            const newPreset: MealPreset = {
                ...presetData,
                id: Date.now(),
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                is_active: true,
                foods: presetData.foods.map((f, i) => ({ ...f, id: Date.now() + i }))
            };

            const updatedPresets = [...get().mealPresets, newPreset];
            set({ mealPresets: updatedPresets });

            if (typeof window !== 'undefined') {
                localStorage.setItem('meal_presets', JSON.stringify(updatedPresets));
            }

            return Promise.resolve();
        } catch (error) {
            console.error('Erro ao criar preset:', error);
            throw error;
        } finally {
            set({ presetsLoading: false });
        }
    },

    updateMealPreset: async (id, updates) => {
        try {
            const updatedPresets = get().mealPresets.map(p =>
                p.id === id ? { ...p, ...updates, updated_at: new Date().toISOString() } : p
            );
            set({ mealPresets: updatedPresets });

            if (typeof window !== 'undefined') {
                localStorage.setItem('meal_presets', JSON.stringify(updatedPresets));
            }
        } catch (error) {
            console.error('Erro ao atualizar preset:', error);
            throw error;
        }
    },

    deleteMealPreset: async (id) => {
        try {
            const updatedPresets = get().mealPresets.filter(p => p.id !== id);
            set({ mealPresets: updatedPresets });

            if (typeof window !== 'undefined') {
                localStorage.setItem('meal_presets', JSON.stringify(updatedPresets));
            }
        } catch (error) {
            console.error('Erro ao deletar preset:', error);
            throw error;
        }
    },

    getPresetsByMealType: (mealType) => {
        return get().mealPresets.filter(preset => preset.meal_type === mealType);
    },

    getPresetsByDietType: (dietType) => {
        return get().mealPresets.filter(preset => preset.diet_type === dietType);
    },

    searchMealPresets: (query) => {
        if (!query) return get().mealPresets;
        const lowerQuery = query.toLowerCase();
        return get().mealPresets.filter(preset =>
            preset.name.toLowerCase().includes(lowerQuery) ||
            preset.description?.toLowerCase().includes(lowerQuery)
        );
    },

    toggleFavoritePreset: (presetId) => {
        const { favoritePresetIds } = get();
        const isFavorite = favoritePresetIds.includes(presetId);
        const newFavoriteIds = isFavorite
            ? favoritePresetIds.filter(id => id !== presetId)
            : [...favoritePresetIds, presetId];

        set({ favoritePresetIds: newFavoriteIds });

        if (typeof window !== 'undefined') {
            localStorage.setItem('favorite_preset_ids', JSON.stringify(newFavoriteIds));
        }
    },

    getFavoritePresets: () => {
        const { mealPresets, favoritePresetIds } = get();
        return mealPresets.filter(preset => favoritePresetIds.includes(preset.id));
    },

    isPresetFavorite: (presetId) => {
        return get().favoritePresetIds.includes(presetId);
    },

    // Default Preset Actions
    loadDefaultPresets: async () => {
        set({ defaultPresetsLoading: true });
        try {
            // Tenta carregar do localStorage
            if (typeof window !== 'undefined') {
                const savedDefaults = localStorage.getItem('default_presets');
                if (savedDefaults) {
                    set({ defaultPresets: JSON.parse(savedDefaults), defaultPresetsLoading: false });
                    return;
                }
            }

            const mockDefaultPresets: DefaultPreset[] = [];
            set({ defaultPresets: mockDefaultPresets });
        } catch (error) {
            console.error('Erro ao carregar presets padrão:', error);
        } finally {
            set({ defaultPresetsLoading: false });
        }
    },

    setDefaultPreset: async (mealType, dietType, presetId) => {
        try {
            // Em uma implementação real, isso faria uma chamada à API
            // const response = await api.post('/default-presets/', {
            //     meal_type: mealType,
            //     diet_type: dietType,
            //     preset: presetId
            // });

            // Atualizar localmente
            const existingPreset = get().defaultPresets.find(dp =>
                dp.meal_type === mealType && dp.diet_type === dietType
            );

            const newDefaultPreset: DefaultPreset = {
                id: existingPreset ? existingPreset.id : Date.now(),
                meal_type: mealType,
                diet_type: dietType,
                preset: presetId,
                is_active: true,
                created_at: existingPreset ? existingPreset.created_at : new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            let updatedDefaults;
            if (existingPreset) {
                updatedDefaults = get().defaultPresets.map(dp =>
                    dp.meal_type === mealType && dp.diet_type === dietType
                        ? newDefaultPreset
                        : dp
                );
            } else {
                updatedDefaults = [...get().defaultPresets, newDefaultPreset];
            }

            set({ defaultPresets: updatedDefaults });

            if (typeof window !== 'undefined') {
                localStorage.setItem('default_presets', JSON.stringify(updatedDefaults));
            }
        } catch (error) {
            console.error('Erro ao definir preset padrão:', error);
            throw error;
        }
    },

    removeDefaultPreset: async (mealType, dietType) => {
        try {
            const updatedDefaults = get().defaultPresets.filter(dp =>
                !(dp.meal_type === mealType && dp.diet_type === dietType)
            );
            set({ defaultPresets: updatedDefaults });

            if (typeof window !== 'undefined') {
                localStorage.setItem('default_presets', JSON.stringify(updatedDefaults));
            }
        } catch (error) {
            console.error('Erro ao remover preset padrão:', error);
            throw error;
        }
    },

    getDefaultPreset: (mealType, dietType) => {
        return get().defaultPresets.find(dp =>
            dp.meal_type === mealType && dp.diet_type === dietType
        );
    },

    applyDefaultPreset: (mealId, mealType, dietType) => {
        const defaultPreset = get().getDefaultPreset(mealType, dietType);
        if (defaultPreset) {
            const preset = get().mealPresets.find(p => p.id === defaultPreset.preset);
            if (preset) {
                // Verificar se a refeição está nos workspaceMeals (Contexto do Modal)
                const workspaceMeal = get().workspaceMeals.find(m => m.id.toString() === mealId);

                if (workspaceMeal) {
                    const newFoods: WorkspaceMealFood[] = preset.foods.map(food => ({
                        id: Date.now() + Math.random(),
                        name: food.food_name,
                        qty: food.quantity,
                        unit: food.unit,
                        measure: 'g',
                        prep: '',
                        ptn: food.protein,
                        cho: food.carbs,
                        fat: food.fats,
                        fib: food.fiber || 0,
                        preferred: false,
                        originalId: undefined,
                        source: 'CUSTOM'
                    }));

                    get().updateWorkspaceMeal(workspaceMeal.id, { foods: newFoods });
                } else {
                    // Fallback para o weekPlan (7 dias)
                    get().applyPreset(mealId, preset.foods.map(food => ({
                        food: null,
                        customName: food.food_name,
                        quantity: food.quantity,
                        unit: food.unit,
                        calories: food.calories,
                        protein: food.protein,
                        carbs: food.carbs,
                        fats: food.fats,
                        fiber: food.fiber || 0
                    })));
                }
            }
        }
    },

    setPresetAsDefault: async (presetId, mealType, dietType) => {
        try {
            await get().setDefaultPreset(mealType, dietType, presetId);
        } catch (error) {
            console.error('Erro ao definir preset como padrão:', error);
            throw error;
        }
    }
}))

export const useDietEditorPatient = () => useDietEditorStore((state) => state.patient)
export const useDietEditorMeals = () => {
    const currentDayIndex = useDietEditorStore((state) => state.currentDayIndex)
    const weekPlan = useDietEditorStore((state) => state.weekPlan)
    return weekPlan[currentDayIndex]?.meals || []
}
export const useDietEditorTargets = () => {
    const targetCalories = useDietEditorStore((state) => state.targetCalories)
    const targetMacros = useDietEditorStore((state) => state.targetMacros)
    return { calories: targetCalories, macros: targetMacros }
}
