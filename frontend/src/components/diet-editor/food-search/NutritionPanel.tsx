"use client"

import React, { useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Star, Clock, Plus, Info, X } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { foodService, Food } from '@/services/food-service'
import { useDietEditorStore } from '@/stores/diet-editor-store'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState(value)

    React.useEffect(() => {
        const handler = setTimeout(() => setDebouncedValue(value), delay)
        return () => clearTimeout(handler)
    }, [value, delay])

    return debouncedValue
}

export function NutritionPanel() {
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedFood, setSelectedFood] = useState<Food | null>(null)
    const [quantity, setQuantity] = useState(100)
    const [unit, setUnit] = useState('g')

    const debouncedQuery = useDebounce(searchQuery, 300)
    const { selectedMealId, addFoodToMeal } = useDietEditorStore()

    const { data: searchResults, isLoading } = useQuery({
        queryKey: ['food-search', debouncedQuery],
        queryFn: () => foodService.search(debouncedQuery),
        enabled: debouncedQuery.length >= 2,
    })

    const handleAddFood = () => {
        if (!selectedFood || !selectedMealId) return

        const multiplier = quantity / 100
        addFoodToMeal(selectedMealId, {
            food: selectedFood,
            quantity,
            unit,
            calories: selectedFood.energia_kcal * multiplier,
            protein: selectedFood.proteina_g * multiplier,
            carbs: selectedFood.carboidrato_g * multiplier,
            fats: selectedFood.lipidios_g * multiplier,
            fiber: (selectedFood.fibra_g || 0) * multiplier,
        })

        // Reset
        setSelectedFood(null)
        setQuantity(100)
        setSearchQuery('')
    }

    return (
        <div className="h-full flex flex-col">
            {/* Search Header */}
            <div className="p-4 border-b border-white/10">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                        type="text"
                        placeholder="Buscar alimentos..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 bg-white/5 border-white/10 text-foreground placeholder:text-slate-500"
                    />
                </div>
                <div className="flex gap-2 mt-2">
                    <button className="px-2 py-1 rounded-full bg-indigo-500/20 text-indigo-400 text-xs">
                        TACO
                    </button>
                    <button className="px-2 py-1 rounded-full bg-white/5 text-slate-400 text-xs hover:bg-white/10">
                        TBCA
                    </button>
                    <button className="px-2 py-1 rounded-full bg-white/5 text-slate-400 text-xs hover:bg-white/10">
                        USDA
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
                <AnimatePresence mode="wait">
                    {selectedFood ? (
                        <FoodDetailView
                            food={selectedFood}
                            quantity={quantity}
                            unit={unit}
                            onQuantityChange={setQuantity}
                            onUnitChange={setUnit}
                            onAdd={handleAddFood}
                            onClose={() => setSelectedFood(null)}
                            canAdd={!!selectedMealId}
                        />
                    ) : searchQuery.length >= 2 ? (
                        <SearchResultsList
                            results={(() => {
                                if (!searchResults?.results) return [];
                                const term = debouncedQuery.toLowerCase().trim();
                                return [...searchResults.results].sort((a, b) => {
                                    const nameA = a.nome.toLowerCase().trim();
                                    const nameB = b.nome.toLowerCase().trim();

                                    // 1. Exact matches first
                                    if (nameA === term && nameB !== term) return -1;
                                    if (nameB === term && nameA !== term) return 1;

                                    // 2. "Starting with" matches second
                                    if (nameA.startsWith(term) && !nameB.startsWith(term)) return -1;
                                    if (nameB.startsWith(term) && !nameA.startsWith(term)) return 1;

                                    // 3. Shorter names third (complexity logic)
                                    return nameA.length - nameB.length;
                                });
                            })()}
                            isLoading={isLoading}
                            onSelect={setSelectedFood}
                        />
                    ) : (
                        <QuickAccessView onSelect={setSelectedFood} />
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}

interface SearchResultsListProps {
    results: Food[]
    isLoading: boolean
    onSelect: (food: Food) => void
}

function SearchResultsList({ results, isLoading, onSelect }: SearchResultsListProps) {
    if (isLoading) {
        return (
            <div className="p-4 space-y-2">
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="h-16 rounded-lg bg-white/5 animate-pulse" />
                ))}
            </div>
        )
    }

    if (results.length === 0) {
        return (
            <div className="p-8 text-center text-slate-500">
                <p>Nenhum alimento encontrado</p>
                <p className="text-xs mt-1">Tente outro termo de busca</p>
            </div>
        )
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-2"
        >
            {results.map((food, index) => (
                <motion.button
                    key={`${food.source}-${food.id}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                    onClick={() => onSelect(food)}
                    className="w-full text-left p-3 rounded-lg hover:bg-white/5 transition-colors"
                >
                    <div className="flex justify-between items-start">
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{food.nome}</p>
                            <p className="text-xs text-slate-400">{food.grupo}</p>
                        </div>
                        <span className={`text-xs px-1.5 py-0.5 rounded ${food.source === 'TACO' ? 'bg-green-500/20 text-green-400' :
                            food.source === 'TBCA' ? 'bg-blue-500/20 text-blue-400' :
                                'bg-purple-500/20 text-purple-400'
                            }`}>
                            {food.source}
                        </span>
                    </div>
                    <div className="flex gap-4 mt-2 text-xs text-slate-400">
                        <span>{food.energia_kcal} kcal</span>
                        <span>C: {food.carboidrato_g}g</span>
                        <span>P: {food.proteina_g}g</span>
                        <span>G: {food.lipidios_g}g</span>
                    </div>
                </motion.button>
            ))}
        </motion.div>
    )
}

interface FoodDetailViewProps {
    food: Food
    quantity: number
    unit: string
    onQuantityChange: (qty: number) => void
    onUnitChange: (unit: string) => void
    onAdd: () => void
    onClose: () => void
    canAdd: boolean
}

function FoodDetailView({
    food,
    quantity,
    unit,
    onQuantityChange,
    onUnitChange,
    onAdd,
    onClose,
    canAdd
}: FoodDetailViewProps) {
    const multiplier = quantity / 100

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-4"
        >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div>
                    <h3 className="font-medium text-foreground">{food.nome}</h3>
                    <p className="text-xs text-slate-400">{food.grupo} • {food.source}</p>
                </div>
                <button onClick={onClose} className="p-1 rounded hover:bg-white/10">
                    <X className="h-4 w-4 text-slate-400" />
                </button>
            </div>

            {/* Quantity Selector */}
            <div className="flex gap-2 mb-4">
                <Input
                    type="number"
                    value={quantity}
                    onChange={(e) => onQuantityChange(Number(e.target.value))}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && canAdd) {
                            onAdd();
                        }
                    }}
                    className="flex-1 bg-white/5 border-white/10 text-foreground [-webkit-appearance:none] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-inner-spin-button]:m-0 [&::-webkit-outer-spin-button]:m-0"
                />
                <select
                    value={unit}
                    onChange={(e) => onUnitChange(e.target.value)}
                    className="px-3 rounded-lg bg-white/5 border border-white/10 text-foreground"
                >
                    <option value="g">gramas</option>
                    <option value="ml">ml</option>
                    {food.unidade_caseira && (
                        <option value="porcao">{food.unidade_caseira}</option>
                    )}
                </select>
            </div>

            {/* Quick Portions */}
            <div className="flex gap-2 mb-6">
                {[50, 100, 150, 200].map((qty) => (
                    <button
                        key={qty}
                        onClick={() => onQuantityChange(qty)}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${quantity === qty
                            ? 'bg-indigo-500 text-foreground'
                            : 'bg-white/5 text-slate-400 hover:bg-white/10'
                            }`}
                    >
                        {qty}g
                    </button>
                ))}
            </div>

            {/* Nutritional Info */}
            <div className="rounded-xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-white/10 p-4 mb-4">
                <div className="text-center mb-4">
                    <p className="text-2xl font-bold text-foreground">
                        {(food.energia_kcal * multiplier).toFixed(0)}
                    </p>
                    <p className="text-xs text-slate-400">kcal</p>
                </div>

                <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                        <p className="text-lg font-semibold text-blue-400">
                            {(food.carboidrato_g * multiplier).toFixed(1)}g
                        </p>
                        <p className="text-xs text-slate-400">Carbs</p>
                    </div>
                    <div>
                        <p className="text-lg font-semibold text-green-400">
                            {(food.proteina_g * multiplier).toFixed(1)}g
                        </p>
                        <p className="text-xs text-slate-400">Proteína</p>
                    </div>
                    <div>
                        <p className="text-lg font-semibold text-orange-400">
                            {(food.lipidios_g * multiplier).toFixed(1)}g
                        </p>
                        <p className="text-xs text-slate-400">Gordura</p>
                    </div>
                </div>

                {food.fibra_g && (
                    <div className="mt-4 pt-4 border-t border-white/10 text-center">
                        <p className="text-sm text-slate-300">
                            Fibras: {(food.fibra_g * multiplier).toFixed(1)}g
                        </p>
                    </div>
                )}
            </div>

            {/* Add Button */}
            <Button
                onClick={onAdd}
                disabled={!canAdd}
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-foreground border-0"
            >
                <Plus className="h-4 w-4 mr-2" />
                {canAdd ? 'Adicionar à Refeição' : 'Selecione uma refeição primeiro'}
            </Button>
        </motion.div>
    )
}

interface QuickAccessViewProps {
    onSelect: (food: Food) => void
}

function QuickAccessView({ onSelect }: QuickAccessViewProps) {
    return (
        <div className="p-4 space-y-6">
            {/* Favorites */}
            <div>
                <h4 className="flex items-center gap-2 text-sm font-medium text-foreground mb-3">
                    <Star className="h-4 w-4 text-yellow-400" />
                    Favoritos
                </h4>
                <div className="text-center py-6 text-slate-500 text-sm bg-white/5 rounded-lg">
                    <p>Nenhum favorito ainda</p>
                    <p className="text-xs mt-1">Marque alimentos como favoritos para acesso rápido</p>
                </div>
            </div>

            {/* Recent */}
            <div>
                <h4 className="flex items-center gap-2 text-sm font-medium text-foreground mb-3">
                    <Clock className="h-4 w-4 text-blue-400" />
                    Usados Recentemente
                </h4>
                <div className="text-center py-6 text-slate-500 text-sm bg-white/5 rounded-lg">
                    <p>Nenhum alimento recente</p>
                    <p className="text-xs mt-1">Alimentos usados aparecerão aqui</p>
                </div>
            </div>

            {/* Tips */}
            <div className="rounded-lg bg-indigo-500/10 border border-indigo-500/30 p-4">
                <div className="flex items-start gap-3">
                    <Info className="h-5 w-5 text-indigo-400 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm text-foreground">Dica</p>
                        <p className="text-xs text-slate-400 mt-1">
                            Use Ctrl+F para focar na busca rapidamente.
                            Digite pelo menos 2 caracteres para buscar.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
