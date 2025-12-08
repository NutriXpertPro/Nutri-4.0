"use client"

import React, { useState } from 'react'
import {
    Search,
    Plus,
    Loader2
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { foodService, Food } from '@/services/food-service'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

interface InlineFoodInputProps {
    onAddFood: (food: Food, quantity: number, unit: string) => void
}

export function InlineFoodInput({ onAddFood }: InlineFoodInputProps) {
    const [query, setQuery] = useState('')
    const [isOpen, setIsOpen] = useState(false)
    const [selectedFood, setSelectedFood] = useState<Food | null>(null)
    const [quantity, setQuantity] = useState(100)
    const [unit, setUnit] = useState('g')

    const { data: searchResults, isLoading } = useQuery({
        queryKey: ['food-search', query],
        queryFn: () => foodService.search(query),
        enabled: query.length >= 2,
    })

    const handleSelectFood = (food: Food) => {
        setSelectedFood(food)
        setQuery(food.nome)
        setIsOpen(false)
        // Focus quantity input automatically would be nice here using refs
    }

    const handleAdd = () => {
        if (selectedFood) {
            onAddFood(selectedFood, quantity, unit)
            // Reset
            setQuery('')
            setSelectedFood(null)
            setQuantity(100)
            // Keep focus on input for next item
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            if (selectedFood) {
                handleAdd()
            }
        }
    }

    return (
        <div className="flex items-center gap-2 p-2 rounded-lg group focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
            <div className="relative flex-1">
                <Popover open={isOpen && (searchResults?.results?.length ?? 0) > 0} onOpenChange={setIsOpen}>
                    <PopoverTrigger asChild>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-indigo-500" />
                            <Input
                                value={query}
                                onChange={(e) => {
                                    setQuery(e.target.value)
                                    setIsOpen(true)
                                    if (selectedFood) setSelectedFood(null) // Clear selection if typing again
                                }}
                                onKeyDown={handleKeyDown}
                                placeholder="Adicionar alimento (digite 'arroz'...)"
                                className="pl-9 border-0 bg-transparent shadow-none focus-visible:ring-0 placeholder:text-slate-400 text-slate-200"
                            />
                        </div>
                    </PopoverTrigger>
                    <PopoverContent className="w-[400px] p-0 bg-slate-900 border-slate-800 text-slate-200" align="start">
                        <div className="max-h-[300px] overflow-y-auto">
                            {isLoading ? (
                                <div className="p-4 text-center text-slate-500">
                                    <Loader2 className="h-4 w-4 animate-spin mx-auto mb-2" />
                                    Buscando...
                                </div>
                            ) : (
                                <div className="p-1">
                                    {searchResults?.results.map((food) => (
                                        <button
                                            key={food.id}
                                            onClick={() => handleSelectFood(food)}
                                            className="w-full text-left px-3 py-2 rounded-md hover:bg-slate-800 flex items-center justify-between group transition-colors"
                                        >
                                            <div className="flex-1 min-w-0 mr-4">
                                                <p className="text-sm font-medium text-slate-300 truncate group-hover:text-indigo-400">
                                                    {food.nome}
                                                </p>
                                                <div className="flex gap-3 text-xs text-slate-500">
                                                    <span>{food.energia_kcal} kcal</span>
                                                    <span>P: {food.proteina_g}g</span>
                                                    <span>C: {food.carboidrato_g}g</span>
                                                </div>
                                            </div>
                                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${food.source === 'TACO' ? 'bg-green-900/30 text-green-400' :
                                                    food.source === 'TBCA' ? 'bg-blue-900/30 text-blue-400' :
                                                        'bg-purple-900/30 text-purple-400'
                                                }`}>
                                                {food.source}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </PopoverContent>
                </Popover>
            </div>

            {selectedFood && (
                <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2">
                    <Input
                        type="number"
                        value={quantity}
                        onChange={(e) => setQuantity(Number(e.target.value))}
                        onKeyDown={handleKeyDown}
                        className="w-20 h-9 bg-slate-800 border-slate-700 text-slate-200"
                    />
                    <select
                        value={unit}
                        onChange={(e) => setUnit(e.target.value)}
                        className="h-9 rounded-md border border-slate-700 bg-slate-800 text-slate-200 text-sm px-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    >
                        <option value="g">g</option>
                        <option value="ml">ml</option>
                        {selectedFood.unidade_caseira && (
                            <option value="porcao">{selectedFood.unidade_caseira}</option>
                        )}
                    </select>
                    <Button
                        size="sm"
                        onClick={handleAdd}
                        className="h-9 w-9 p-0 bg-indigo-600 hover:bg-indigo-700 text-white"
                    >
                        <Plus className="h-4 w-4" />
                    </Button>
                </div>
            )}
        </div>
    )
}
