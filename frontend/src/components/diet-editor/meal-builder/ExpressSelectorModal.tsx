"use client"

import React, { useState, useMemo } from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Coffee, UtensilsCrossed, Cookie, Moon, Pill, Star, Settings, Grid3X3, List, Flame, Apple, Wheat, Droplets } from "lucide-react"
import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import { MealPresetSelector } from '../presets/MealPresetSelector';
import { DefaultPresetsManager } from '../presets/DefaultPresetsManager';
import { PresetManager } from '../presets/PresetManager';
import { MealPreset, useDietEditorStore } from '@/stores/diet-editor-store';
import { PresetFoodItem } from '../presets/PresetFoodItem';

// Tipos de refeio
// Tipos de refeio
const MEAL_TYPES = [
    { id: 'cafe_da_manha', label: 'Café da Manhã', icon: Coffee },
    { id: 'lanche_manha', label: 'Lanche da Manhã', icon: Cookie },
    { id: 'almoco', label: 'Almoço', icon: UtensilsCrossed },
    { id: 'lanche_tarde', label: 'Lanche da Tarde', icon: Cookie },
    { id: 'jantar', label: 'Jantar', icon: UtensilsCrossed },
    { id: 'ceia', label: 'Ceia', icon: Moon },
    { id: 'pre_treino', label: 'Pré-treino', icon: Flame },
    { id: 'pos_treino', label: 'Pós-treino', icon: Pill },
    { id: 'suplemento', label: 'Suplemento', icon: Pill },
];

// Tipos de dieta - Sincronizado com diet-editor-store.ts
const DIET_TYPES = [
    { id: 'normocalorica', label: 'Normocalórica' },
    { id: 'low_carb', label: 'Low Carb' },
    { id: 'high_carb', label: 'High Carb' },
    { id: 'cetogenica', label: 'Cetogênica' },
    { id: 'mediterranea', label: 'Mediterrânea' },
    { id: 'vegetariana', label: 'Vegetariana' },
    { id: 'vegana', label: 'Vegana' },
    { id: 'sem_gluten', label: 'Sem Glúten' },
    { id: 'hiperproteica', label: 'Hiperproteica' },
    { id: 'personalizada', label: 'Personalizada' },
];

const getMealTypeLabel = (type: string) => {
    const meal = MEAL_TYPES.find(m => m.id === type);
    return meal ? meal.label : type;
};

const getDietTypeLabel = (type: string) => {
    const diet = DIET_TYPES.find(d => d.id === type);
    return diet ? diet.label : type;
};

const getMealTypeIcon = (type: string) => {
    const meal = MEAL_TYPES.find(m => m.id === type);
    return meal ? meal.icon : UtensilsCrossed;
};

interface ExpressSelectorModalProps {
    isOpen: boolean
    onClose: () => void
    onApplyTemplate: (templateName: string, items: any[]) => void
    mealTitle: string
    mealType: string  // Adicionando o tipo de refeio
    dietType: string  // Adicionando o tipo de dieta
    mealId?: string   // ID da refeição atual (opcional)
    onApplyPreset: (preset: MealPreset) => void  // Callback para aplicar preset com tipo correto
}

// Dummy Templates Data
const STANDARD_TEMPLATES = [
    { id: 'normo', label: 'Normocalórica', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-200' },
    { id: 'lowcarb', label: 'Low Carb', color: 'bg-blue-500/10 text-blue-600 border-blue-200' },
    { id: 'highcarb', label: 'High Carb', color: 'bg-orange-500/10 text-orange-600 border-orange-200' },
    { id: 'keto', label: 'Cetogênica', color: 'bg-purple-500/10 text-purple-600 border-purple-200' },
    { id: 'veg', label: 'Vegetariana', color: 'bg-green-500/10 text-green-600 border-green-200' },
    { id: 'vegan', label: 'Vegana', color: 'bg-green-600/10 text-green-700 border-green-300' },
    { id: 'bulk', label: 'Hipercalórica', color: 'bg-red-500/10 text-red-600 border-red-200' },
]

const SAVED_TEMPLATES = [
    { id: 1, name: 'Café Clássico (Ovo+Pão+Queijo)', kcal: 320, items: [] },
    { id: 2, name: 'Café Fit (Tapioca+Whey)', kcal: 280, items: [] },
    { id: 3, name: 'Café Low Carb (Ovos+Abacate)', kcal: 350, items: [] },
]

export function ExpressSelectorModal({ isOpen, onClose, onApplyTemplate, mealTitle, mealType, dietType, onApplyPreset, mealId }: ExpressSelectorModalProps) {
    const [activeTab, setActiveTab] = useState<'standard' | 'presets' | 'defaults'>('presets');
    const mealPresets = useDietEditorStore(state => state.mealPresets);

    const handlePresetSelect = (preset: MealPreset) => {
        onApplyPreset(preset);
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-[95vw] w-full sm:max-w-none max-h-[95vh] p-0 overflow-hidden border-none shadow-2xl rounded-2xl bg-background flex flex-col">
                <DialogHeader className="sr-only">
                    <DialogTitle>Seletor de Presets</DialogTitle>
                    <DialogDescription>Escolha um modelo de refeição para aplicar à sua dieta.</DialogDescription>
                </DialogHeader>
                <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
                    {activeTab === 'standard' ? (
                        <div className="p-6 flex-1 min-h-0 overflow-y-auto">
                            {/* Standard Templates Grid */}
                            <div className="space-y-6">
                                <div>
                                    <h4 className="text-sm font-normal text-foreground mb-4">Padrões Dietéticos</h4>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                        {STANDARD_TEMPLATES.map((tmpl) => (
                                            <button
                                                key={tmpl.id}
                                                className={cn(
                                                    "p-5 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95 shadow-sm group bg-card/50 backdrop-blur-sm",
                                                    tmpl.id === 'normo' && "bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 text-emerald-600 border-emerald-500/20 hover:from-emerald-500/15 hover:to-emerald-600/10",
                                                    tmpl.id === 'lowcarb' && "bg-gradient-to-br from-blue-500/10 to-blue-600/5 text-blue-600 border-blue-500/20 hover:from-blue-500/15 hover:to-blue-600/10",
                                                    tmpl.id === 'highcarb' && "bg-gradient-to-br from-orange-500/10 to-orange-600/5 text-orange-600 border-orange-500/20 hover:from-orange-500/15 hover:to-orange-600/10",
                                                    tmpl.id === 'keto' && "bg-gradient-to-br from-purple-500/10 to-purple-600/5 text-purple-600 border-purple-500/20 hover:from-purple-500/15 hover:to-purple-600/10",
                                                    tmpl.id === 'veg' && "bg-gradient-to-br from-green-500/10 to-green-600/5 text-green-600 border-green-500/20 hover:from-green-500/15 hover:to-green-600/10",
                                                    tmpl.id === 'vegan' && "bg-gradient-to-br from-green-600/10 to-green-700/5 text-green-700 border-green-600/20 hover:from-green-600/15 hover:to-green-700/10",
                                                    tmpl.id === 'bulk' && "bg-gradient-to-br from-red-500/10 to-red-600/5 text-red-600 border-red-500/20 hover:from-red-500/15 hover:to-red-600/10",
                                                )}
                                                onClick={() => onApplyTemplate(tmpl.label, [])}
                                            >
                                                <span className="text-xs font-normal uppercase tracking-tight">{tmpl.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="h-px bg-border/10 my-6" />

                                {/* Saved Templates List */}
                                <div>
                                    <div className="flex justify-between items-center mb-4">
                                        <h4 className="text-sm font-normal text-foreground">Templates Salvos pelo Nutricionista</h4>
                                        <Button variant="outline" size="sm" className="h-9 text-sm text-primary hover:bg-primary/10 rounded-lg">Gerenciar</Button>
                                    </div>
                                    <div className="max-h-[50vh] overflow-y-auto">
                                        <div className="grid grid-cols-1 gap-3">
                                            {SAVED_TEMPLATES.map((tmpl) => (
                                                <button
                                                    key={tmpl.id}
                                                    className="w-full flex items-center justify-between p-5 rounded-xl border border-border/10 bg-gradient-to-r from-card/50 to-muted/30 hover:from-primary/5 hover:to-primary/10 hover:border-primary/20 transition-all text-left group shadow-md backdrop-blur-sm"
                                                    onClick={() => onApplyTemplate(tmpl.name, tmpl.items)}
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center text-xl shadow-md group-hover:scale-110 transition-transform">
                                                            🥞
                                                        </div>
                                                        <div className="flex flex-col gap-1">
                                                            <span className="text-sm font-normal text-foreground group-hover:text-primary transition-colors">{tmpl.name}</span>
                                                            <span className="text-sm text-muted-foreground">Frequente no plano alimentar</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-5">
                                                        <div className="flex flex-col items-end">
                                                            <span className="text-lg font-normal text-foreground">{tmpl.kcal}</span>
                                                            <span className="text-xs text-muted-foreground">kcal total</span>
                                                        </div>
                                                        <Badge variant="default" className="h-10 px-4 rounded-lg text-sm font-normal bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70">
                                                            Aplicar
                                                        </Badge>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : activeTab === 'presets' ? (
                        // Tab de Presets Personalizados - Agora com layout full-screen
                        <div className="p-0 flex-1 min-h-0 overflow-hidden flex flex-col">
                            <PresetManager
                                onApplyPreset={handlePresetSelect}
                                targetMealId={mealId ?? undefined}
                                onPresetApplied={onClose}
                                initialMealType={mealType}
                                initialDietType={dietType}
                            />
                        </div>
                    ) : (
                        // Tab de Presets Padrão
                        <div className="p-0 flex-1 min-h-0 overflow-hidden flex flex-col">
                            <DefaultPresetsManager
                                targetMealId={mealId ?? undefined} // Passar o ID da refeição atual ou undefined
                                onPresetApplied={onClose} // Fecha o modal quando um preset é aplicado
                            />
                        </div>
                    )}
                </div>

                <div className="p-6 flex justify-end gap-3 mt-auto bg-transparent">
                    <Button
                        variant="default"
                        className="rounded-lg text-sm font-normal h-11 px-10 shadow-lg shadow-primary/20 hover:-translate-y-0.5 transition-all"
                        onClick={onClose}
                    >
                        Fechar
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
