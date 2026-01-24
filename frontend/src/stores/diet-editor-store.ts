import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
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
    avatar?: string
    status: boolean
    gender: string
    age?: number
    weight?: number
    initial_weight?: number
    height?: number
    bodyFat?: number
    muscleMass?: number
    sex?: 'M' | 'F'
    goal?: string
    restrictions?: string[]
    allergies?: string[]
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

    // Diet Persistence
    saveDiet: () => Promise<void>
    loadPatientDiet: (patientId: number) => Promise<void>
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
export const useDietEditorStore = create<DietEditorState>()(
    persist(
        (set, get) => ({
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
                const updatedMeals = [...currentMeals];

                updatedMeals.forEach((meal, index) => {
                    const typeId = normalizeMealType(meal.name);

                    const defaultPreset = defaultPresets.find(dp =>
                        dp.meal_type === typeId && dp.diet_type === dietType && dp.is_active
                    );

                    if (defaultPreset) {
                        const preset = mealPresets.find(p => p.id === defaultPreset.preset);
                        if (preset) {
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
                                items: newItems
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

                const isEER = calculationMethod.startsWith('eer_iom')
                let getVal = isEER ? Math.round(tmb) : Math.round(tmb * activityLevel)

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
                    fiber: 25,
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
                set({ history: newHistory.slice(-50), historyIndex: newHistory.length - 1 })
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
                            qty: 100,
                            unit: 'g',
                            measure: 'default',
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

            saveDiet: async () => {
                const { toast } = await import('sonner')

                set({ isSaving: true })
                try {
                    const state = get()
                    const dietService = (await import('@/services/diet-service')).default

                    if (!state.patient?.id) {
                        toast.warning("Selecione um paciente antes de salvar a dieta.", {
                            description: "Vá até a aba de pacientes e escolha para quem será essa dieta."
                        })
                        set({ isSaving: false })
                        return
                    }

                    // Prepare Meal Data (Flatten WeekPlan)
                    // Backend expects a flat list of meals with day_of_week
                    const mealsPayload = []
                    for (const dayPlan of state.weekPlan) {
                        for (const meal of dayPlan.meals) {
                            // Only include meals that have items or content
                            if (meal.items.length > 0) {
                                mealsPayload.push({
                                    name: meal.name,
                                    time: meal.time,
                                    order: meal.order,
                                    day_of_week: dayPlan.dayOfWeek,
                                    notes: meal.notes || "",
                                    items: meal.items.map(item => ({
                                        food_name: item.customName || item.food?.nome || "Item desconhecido",
                                        quantity: item.quantity,
                                        unit: item.unit,
                                        calories: item.calories,
                                        protein: item.protein,
                                        carbs: item.carbs,
                                        fats: item.fats,
                                        // fiber: item.fiber // Check if backend supports fiber
                                    }))
                                })
                            }
                        }
                    }

                    // Se o payload do weekPlan estiver vazio, tenta usar o workspaceMeals (Workflow do DietEcosystem)
                    if (mealsPayload.length === 0) {
                        // Replicamos a dieta para todos os dias da semana (0-6) para garantir
                        // que apareça no app do paciente todos os dias.
                        for (let day = 0; day <= 6; day++) {
                            state.workspaceMeals.forEach((meal, idx) => {
                                if (meal.foods.length > 0) {
                                    mealsPayload.push({
                                        name: meal.type,
                                        time: meal.time || "00:00",
                                        order: idx,
                                        day_of_week: day,
                                        notes: meal.observation || "",
                                        items: meal.foods.map(food => ({
                                            food_name: food.name,
                                            quantity: Number(food.qty) || 0,
                                            unit: food.unit || "g",
                                            calories: Math.round(((food.ptn * 4) + (food.cho * 4) + (food.fat * 9)) * (Number(food.qty) / 100)),
                                            protein: Number((food.ptn * (Number(food.qty) / 100)).toFixed(1)),
                                            carbs: Number((food.cho * (Number(food.qty) / 100)).toFixed(1)),
                                            fats: Number((food.fat * (Number(food.qty) / 100)).toFixed(1)),
                                        }))
                                    });
                                }
                            });
                        }
                    }

                    // Validate that there's at least some content to save
                    if (mealsPayload.length === 0) {
                        toast.warning("Adicione alimentos à dieta antes de salvar.", {
                            description: "A dieta precisa ter pelo menos uma refeição com alimentos."
                        })
                        set({ isSaving: false })
                        return
                    }

                    const dietData = {
                        patient: state.patient.id,
                        name: state.dietName || `Dieta para ${state.patient.name}`,
                        goal: state.patient.goal,
                        diet_type: state.dietType,
                        target_calories: Math.round(state.targetCalories || 0),
                        target_protein: Number(state.targetMacros.protein) || 0,
                        target_carbs: Number(state.targetMacros.carbs) || 0,
                        target_fats: Number(state.targetMacros.fats) || 0,
                        tmb: Math.round(state.tmb || 0),
                        gcdt: Math.round(state.get || 0),
                        calculation_method: state.calculationMethod,
                        meals_data: mealsPayload,
                        is_active: true
                    }

                    // Decide whether to create or update (if dietId exists)
                    // Currently only Create is fully supported by this flow logic
                    // If we had dietId, we might call update
                    const savedDiet = await dietService.create(dietData)

                    set({
                        dietId: savedDiet.id,
                        isDirty: false,
                        isSaving: false
                    })

                    toast.success("Dieta salva com sucesso!")
                    return Promise.resolve()
                } catch (error: any) {
                    console.error("Erro ao salvar dieta:", error)
                    set({ isSaving: false })
                    toast.error("Erro ao salvar dieta", {
                        description: error?.message || "Tente novamente mais tarde."
                    })
                }
            },

            // Meal Preset Actions
            loadMealPresets: async () => {
                set({ presetsLoading: true });
                try {
                    const data = await import('@/services/diet-service').then(m => m.default.getMealPresets());
                    // Transform backend data if necessary, or ensure backend matches frontend interface
                    // Assuming backend returns array of MealPreset matching the interface

                    // Also load favorites from local storage as they are user preference UI state mostly
                    // Or backend could store favorites. For now, let's keep favorites in local storage or simple state
                    let favoriteIds: number[] = [];
                    if (typeof window !== 'undefined') {
                        const savedFavorites = localStorage.getItem('favorite_preset_ids');
                        if (savedFavorites) favoriteIds = JSON.parse(savedFavorites);
                    }

                    set({
                        mealPresets: data,
                        favoritePresetIds: favoriteIds,
                        presetsLoading: false
                    });
                } catch (error) {
                    console.error('Erro ao carregar presets:', error);
                    set({ mealPresets: [], presetsLoading: false });
                }
            },

            createMealPreset: async (presetData) => {
                set({ presetsLoading: true });
                try {
                    const dietService = (await import('@/services/diet-service')).default;
                    const newPreset = await dietService.createMealPreset(presetData);

                    const updatedPresets = [...get().mealPresets, newPreset];
                    set({ mealPresets: updatedPresets });

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
                    const dietService = (await import('@/services/diet-service')).default;
                    const updatedPreset = await dietService.updateMealPreset(id, updates);

                    const updatedPresets = get().mealPresets.map(p =>
                        p.id === id ? updatedPreset : p
                    );
                    set({ mealPresets: updatedPresets });
                } catch (error) {
                    console.error('Erro ao atualizar preset:', error);
                    throw error;
                }
            },

            deleteMealPreset: async (id) => {
                try {
                    const dietService = (await import('@/services/diet-service')).default;
                    await dietService.deleteMealPreset(id);

                    const updatedPresets = get().mealPresets.filter(p => p.id !== id);
                    set({ mealPresets: updatedPresets });
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
                    const data = await import('@/services/diet-service').then(m => m.default.getDefaultPresets());
                    set({ defaultPresets: data, defaultPresetsLoading: false });
                } catch (error) {
                    console.error('Erro ao carregar presets padrão:', error);
                    set({ defaultPresets: [], defaultPresetsLoading: false });
                }
            },

            setDefaultPreset: async (mealType, dietType, presetId) => {
                try {
                    const dietService = (await import('@/services/diet-service')).default;

                    // Check if already exists in state
                    const currentDefaults = get().defaultPresets;
                    const existing = currentDefaults.find(dp =>
                        dp.meal_type === mealType && dp.diet_type === dietType
                    );

                    let newDefault;
                    if (existing) {
                        // Update existing using PATCH
                        newDefault = await dietService.updateDefaultPreset(existing.id, {
                            preset: presetId,
                            is_active: true
                        });
                    } else {
                        // Create new using POST
                        newDefault = await dietService.createDefaultPreset({
                            meal_type: mealType,
                            diet_type: dietType,
                            preset: presetId,
                            is_active: true
                        });
                    }

                    // Update local state - replace if it was an update or add if it was new
                    const updatedDefaults = existing
                        ? currentDefaults.map(dp => dp.id === existing.id ? newDefault : dp)
                        : [...currentDefaults, newDefault];

                    set({ defaultPresets: updatedDefaults });
                } catch (error) {
                    console.error('Erro ao definir preset padrão:', error);
                    throw error;
                }
            },

            removeDefaultPreset: async (mealType, dietType) => {
                try {
                    const presetToRemove = get().defaultPresets.find(dp =>
                        dp.meal_type === mealType && dp.diet_type === dietType
                    );

                    if (presetToRemove) {
                        const dietService = (await import('@/services/diet-service')).default;
                        await dietService.deleteDefaultPreset(presetToRemove.id);

                        const updatedDefaults = get().defaultPresets.filter(dp => dp.id !== presetToRemove.id);
                        set({ defaultPresets: updatedDefaults });
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
            },

            loadPatientDiet: async (patientId) => {
                try {
                    const dietService = (await import('@/services/diet-service')).default;
                    const diet = await dietService.getActiveByPatient(patientId);

                    if (diet) {
                        // Map diet to workspaceMeals
                        // Group by day to handle multi-day diets if any (taking first day available)
                        const mealsByDay = diet.meals_rel.reduce((acc, meal) => {
                            if (!acc[meal.day_of_week]) acc[meal.day_of_week] = [];
                            acc[meal.day_of_week].push(meal);
                            return acc;
                        }, {} as Record<number, any[]>);

                        const dayToUse = Object.keys(mealsByDay).sort()[0];
                        const sourceMeals = mealsByDay[Number(dayToUse)] || [];

                        const mappedWorkspaceMeals = sourceMeals.map((m: any, idx: number) => ({
                            id: m.id || idx + 1,
                            type: m.name,
                            time: m.time.substring(0, 5),
                            observation: m.notes || '',
                            isCollapsed: false,
                            foods: m.items.map((i: any) => ({
                                id: i.id || Date.now() + Math.random(),
                                name: i.food_name,
                                qty: Number(i.quantity),
                                unit: i.unit,
                                ptn: Number(i.protein),
                                cho: Number(i.carbs),
                                fat: Number(i.fats),
                                fib: Number(i.fiber || 0),
                                preferred: false,
                                source: 'CUSTOM'
                            }))
                        }));

                        set({
                            dietId: diet.id,
                            dietName: diet.name,
                            dietType: diet.diet_type as DietType,
                            targetCalories: diet.target_calories,
                            targetMacros: {
                                carbs: Number(diet.target_carbs),
                                protein: Number(diet.target_protein),
                                fats: Number(diet.target_fats),
                                fiber: 25
                            },
                            workspaceMeals: mappedWorkspaceMeals.length > 0 ? mappedWorkspaceMeals : initialState.workspaceMeals,
                            isDirty: false
                        });
                    } else {
                        // Reset if no diet found to avoid showing previous patient's diet
                        set({
                            dietId: null,
                            dietName: '',
                            workspaceMeals: initialState.workspaceMeals,
                            isDirty: false
                        });
                    }
                } catch (error) {
                    console.error('Erro ao carregar dieta do paciente:', error);
                }
            }
        }),
        {
            name: 'diet-editor-storage',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                patient: state.patient,
                dietId: state.dietId,
                dietName: state.dietName,
                calculationMethod: state.calculationMethod,
                dietType: state.dietType,
                activityLevel: state.activityLevel,
                goalAdjustment: state.goalAdjustment,
                customTargets: state.customTargets,
                tmb: state.tmb,
                get: state.get,
                targetCalories: state.targetCalories,
                targetMacros: state.targetMacros,
                customMacros: state.customMacros,
                weekPlan: state.weekPlan,
                workspaceMeals: state.workspaceMeals,
                activeWorkspaceDay: state.activeWorkspaceDay,
                validityStartDate: state.validityStartDate,
                validityEndDate: state.validityEndDate,
                favorites: state.favorites,
                mealPresets: state.mealPresets,
                favoritePresetIds: state.favoritePresetIds,
                defaultPresets: state.defaultPresets,
            })
        }
    )
)

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