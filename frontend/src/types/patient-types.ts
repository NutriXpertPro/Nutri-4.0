// Definições de tipos para as páginas do paciente

export interface PatientProfile {
  id: number;
  name: string;
  goal: string;
  photo?: string;
  allergies?: string[];
  dietary_restrictions?: string[];
}

export interface Appointment {
  id: number;
  date: string;
  time: string;
  nutritionist_name: string;
}

export interface Diet {
  id: number;
  name: string;
  start_date: string;
}

export interface EvolutionData {
  date: string;
  weight?: number;
  body_fat?: number;
  muscle_mass?: number;
  bmi?: number;
}

export interface ProgressMetrics {
  weight_change: number;
  body_fat_change: number;
  adherence_rate: number;
}

export interface PatientDashboardData {
  patient_profile: PatientProfile;
  next_appointment?: Appointment;
  current_diet?: Diet;
  evolution_data: EvolutionData[];
  progress_metrics: ProgressMetrics;
  daily_summary: DailySummary;
  upcoming_meals: Meal[];
}

export interface DailySummary {
  meals_completed: number;
  meals_total: number;
  water_intake: number;
  water_goal: number;
  steps: number;
  calories_burned: number;
}

export interface Meal {
  id: number;
  name: string;
  time: string;
  completed: boolean;
}

export interface Recipe {
  id: number;
  name: string;
  description: string;
  category: string;
  prepTime: number;
  cookTime: number;
  servings: number;
  difficulty: 'fácil' | 'médio' | 'difícil';
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  ingredients: string[];
  instructions: string[];
  liked: boolean;
  rating: number;
  image?: string;
}

export interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'appointment' | 'diet' | 'system' | 'message' | 'reminder' | 'achievement' | 'evaluation';
  timestamp: string;
  read: boolean;
  action?: string;
}

export interface Reminder {
  id: number;
  title: string;
  time: string;
  type: 'meal' | 'water' | 'appointment' | 'evaluation';
  completed: boolean;
}

export interface DailyEntry {
  id: number;
  date: string;
  water_intake: number;
  weight?: number;
  measurements?: {
    bust: number;
    waist: number;
    hip: number;
  };
  meals: {
    id: number;
    name: string;
    completed: boolean;
  }[];
  mood: 'feliz' | 'triste' | 'ansioso' | 'calmo' | 'energizado' | 'cansado' | 'motivado' | 'desanimado';
  mood_note?: string; // Campo para observações sobre o humor
  notes: string;
  photos: string[]; // URLs das fotos
}