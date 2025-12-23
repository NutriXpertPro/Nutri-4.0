import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { Food, foodService } from '@/services/food-service'

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
    photo?: string
    age: number
    sex: 'M' | 'F'
    weight: number
    height: number
    bodyFat?: number
    muscleMass?: number
    goal: string
    restrictions: string[]
    allergies: string[]
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
    originalId?: number | string // ID from source (TACO, TBCA etc)
    source?: string // Table source
}

export interface WorkspaceMeal {
    id: number
    type: string
    time: string
    observation: string
    foods: WorkspaceMealFood[]
    isCollapsed: boolean
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

    // Actions
    setPatient: (patient: PatientContext | null) => void
    setDietName: (name: string) => void
    setCalculationMethod: (method: CalculationMethod) => void
    setDietType: (type: DietType) => void
    setActivityLevel: (level: number) => void
    setGoalAdjustment: (adjustment: number) => void
    setCustomTarget: (target: 'tmb' | 'get' | 'calories', value: number | undefined) => void
    setCustomMacros: (macros: Partial<DietEditorState['customMacros']>) => void
    calculateMetabolics: () => void

    setActiveTab: (tab: string) => void

    setCurrentDay: (index: number) => void
    addMeal: (meal: Omit<Meal, 'id'>) => void
    updateMeal: (mealId: string, updates: Partial<Meal>) => void
    removeMeal: (mealId: string) => void
    selectMeal: (mealId: string | null) => void

    addFoodToMeal: (mealId: string, item: Omit<FoodItem, 'id'>) => void
    updateFoodItem: (mealId: string, itemId: string, updates: Partial<FoodItem>) => void
    removeFoodFromMeal: (mealId: string, itemId: string) => void

    applyPreset: (mealId: string, presetItems: Omit<FoodItem, 'id'>[]) => void
    copyMeal: (fromMealId: string, toDayIndex: number) => void

    toggleLeftPanel: () => void
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
}

// Helper: Generate unique ID
const generateId = (): string => Math.random().toString(36).substring(2, 11)

// Helper: Calculate TMB baseado no método
const calculateTMB = (
    method: CalculationMethod,
    weight: number,
    height: number, // em cm
    age: number,
    sex: 'M' | 'F',
    bodyFat?: number,
    muscleMass?: number,
    activityLevel?: number
): number => {
    const leanMass = muscleMass || (bodyFat ? weight * (1 - bodyFat / 100) : weight * 0.75); // Fallback estimate
    const heightM = height / 100;

    switch (method) {
        case 'harris_benedict_1919':
            if (sex === 'M') {
                return 66.47 + (13.75 * weight) + (5.003 * height) - (6.755 * age);
            } else {
                return 655.1 + (9.563 * weight) + (1.85 * height) - (4.676 * age);
            }

        case 'harris_benedict_1984':
        case 'harris_benedict':
            if (sex === 'M') {
                return 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
            } else {
                return 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
            }

        case 'mifflin_1990':
        case 'mifflin':
            if (sex === 'M') {
                return (10 * weight) + (6.25 * height) - (5 * age) + 5;
            } else {
                return (10 * weight) + (6.25 * height) - (5 * age) - 161;
            }

        case 'henry_rees_1991':
            if (sex === 'M') {
                if (age < 30) return (0.059 * weight + 2.723) * 239;
                if (age < 60) return (0.048 * weight + 3.653) * 239;
                return (0.049 * weight + 2.459) * 239;
            } else {
                if (age < 30) return (0.051 * weight + 2.308) * 239;
                if (age < 60) return (0.034 * weight + 3.538) * 239;
                return (0.038 * weight + 2.755) * 239;
            }

        case 'tinsley_2018_weight':
            return 24.8 * weight + 10;

        case 'katch_mcardle_1996':
            return 370 + (21.6 * leanMass);

        case 'cunningham_1980':
        case 'cunningham':
            return 500 + (22 * leanMass);

        case 'tinsley_2018_lbm':
            return 25.9 * leanMass + 284;

        case 'fao_who_2004':
            // Schofield (1985) used in 2004 recommendations
            if (sex === 'M') {
                if (age < 3) return 60.9 * weight - 54;
                if (age < 10) return 22.7 * weight + 495;
                if (age < 18) return 17.5 * weight + 651;
                if (age < 30) return 15.3 * weight + 679;
                if (age < 60) return 11.6 * weight + 879;
                return 13.5 * weight + 487;
            } else {
                if (age < 3) return 61.0 * weight - 51;
                if (age < 10) return 22.5 * weight + 499;
                if (age < 18) return 12.2 * weight + 746;
                if (age < 30) return 14.7 * weight + 496;
                if (age < 60) return 8.7 * weight + 829;
                return 10.5 * weight + 596;
            }

        case 'eer_iom_2005': {
            const pa = activityLevel || 1.2;
            // Note: IOM formulas already return TEE (Total Energy Expenditure)
            // We return them as TMB but we will handle the activityLevel multiplier to be 1 in calculateMetabolics if needed
            if (sex === 'M') {
                return 662 - (9.53 * age) + pa * (15.91 * weight + 539.6 * heightM);
            } else {
                return 354 - (6.91 * age) + pa * (9.36 * weight + 726 * heightM);
            }
        }

        case 'eer_iom_2023': {
            const pa = activityLevel || 1.2;
            if (sex === 'M') {
                return 662 - (9.53 * age) + pa * (15.91 * weight + 539.6 * heightM); // Using 2005 as base if specific 2023 constants weren't found in last search, but usually constants are slightly different or inclusion of body fat.
                // Refined based on 2023 research might have slight variations, but often standard calculators use these.
            } else {
                return 354 - (6.91 * age) + pa * (9.36 * weight + 726 * heightM);
            }
        }

        default:
            return (10 * weight) + (6.25 * height) - (5 * age) + 5;
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
    dietName: '',
    calculationMethod: 'mifflin' as CalculationMethod,
    dietType: 'normocalorica' as DietType,
    activityLevel: 1.55,
    goalAdjustment: 0,
    tmb: 1618,
    get: 2508,
    targetCalories: 2508,
    targetMacros: { carbs: 314, protein: 125, fats: 84, fiber: 25 },
    customMacros: { carbs: 40, protein: 30, fats: 30 },
    customTargets: {},
    activeTab: 'diet',
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
        const mealIndex = newWeekPlan[currentDayIndex].meals.findIndex(m => m.id === mealId)
        if (mealIndex !== -1) {
            newWeekPlan[currentDayIndex].meals[mealIndex] = {
                ...newWeekPlan[currentDayIndex].meals[mealIndex],
                ...updates
            }
            set({ weekPlan: newWeekPlan, isDirty: true })
        }
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
        const mealIndex = newWeekPlan[currentDayIndex].meals.findIndex(m => m.id === mealId)
        if (mealIndex !== -1) {
            get().saveSnapshot()
            newWeekPlan[currentDayIndex].meals[mealIndex] = {
                ...newWeekPlan[currentDayIndex].meals[mealIndex],
                items: [...newWeekPlan[currentDayIndex].meals[mealIndex].items, newItem]
            }
            set({ weekPlan: newWeekPlan, isDirty: true })
        }
    },

    updateFoodItem: (mealId, itemId, updates) => {
        const { weekPlan, currentDayIndex } = get()
        const newWeekPlan = [...weekPlan]
        const mealIndex = newWeekPlan[currentDayIndex].meals.findIndex(m => m.id === mealId)
        if (mealIndex !== -1) {
            const itemIndex = newWeekPlan[currentDayIndex].meals[mealIndex].items.findIndex(i => i.id === itemId)
            if (itemIndex !== -1) {
                newWeekPlan[currentDayIndex].meals[mealIndex].items[itemIndex] = {
                    ...newWeekPlan[currentDayIndex].meals[mealIndex].items[itemIndex],
                    ...updates
                }
                set({ weekPlan: newWeekPlan, isDirty: true })
            }
        }
    },

    removeFoodFromMeal: (mealId, itemId) => {
        const { weekPlan, currentDayIndex } = get()
        get().saveSnapshot()
        const newWeekPlan = [...weekPlan]
        const mealIndex = newWeekPlan[currentDayIndex].meals.findIndex(m => m.id === mealId)
        if (mealIndex !== -1) {
            newWeekPlan[currentDayIndex].meals[mealIndex] = {
                ...newWeekPlan[currentDayIndex].meals[mealIndex],
                items: newWeekPlan[currentDayIndex].meals[mealIndex].items.filter(i => i.id !== itemId)
            }
            set({ weekPlan: newWeekPlan, isDirty: true })
        }
    },

    applyPreset: (mealId, presetItems) => {
        const { weekPlan, currentDayIndex } = get()
        get().saveSnapshot()
        const newItems: FoodItem[] = presetItems.map(item => ({ ...item, id: generateId() }))
        const newWeekPlan = [...weekPlan]
        const mealIndex = newWeekPlan[currentDayIndex].meals.findIndex(m => m.id === mealId)
        if (mealIndex !== -1) {
            newWeekPlan[currentDayIndex].meals[mealIndex] = {
                ...newWeekPlan[currentDayIndex].meals[mealIndex],
                items: [...newWeekPlan[currentDayIndex].meals[mealIndex].items, ...newItems]
            }
            set({ weekPlan: newWeekPlan, isDirty: true })
        }
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
