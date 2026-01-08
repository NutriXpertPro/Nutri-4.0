"use client"

import React, { useState, useRef, useEffect } from 'react'
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
    const [quantity, setQuantity] = useState<number | ''>('') // Começa vazio
    const [unit, setUnit] = useState('g')
    const [shouldFocusSearch, setShouldFocusSearch] = useState(false)
    const searchInputRef = useRef<HTMLInputElement>(null)

    const { data: searchResults, isLoading } = useQuery({
        queryKey: ['food-search', query],
        queryFn: () => foodService.search(query),
        enabled: query.length >= 2,
    })

    const quantityInputRef = useRef<HTMLInputElement>(null)

    // Calcular automaticamente medida caseira quando quantidade em gramas muda
    const calculateHomemadeMeasure = () => {
        if (selectedFood && quantity && typeof quantity === 'number') {
            if (selectedFood.peso_unidade_caseira_g && selectedFood.unidade_caseira) {
                const convertedValue = quantity / selectedFood.peso_unidade_caseira_g;
                return { value: convertedValue, unit: selectedFood.unidade_caseira };
            }
        }
        return null;
    };

    const handleSelectFood = (food: Food) => {
        setSelectedFood(food)
        setQuery(food.nome)
        setIsOpen(false)
        setQuantity('') // Garante que a quantidade comece vazia
        setUnit('g') // Garante que a unidade comece como 'g'
        // Focus quantity input automatically
        setTimeout(() => {
            if (quantityInputRef.current) {
                quantityInputRef.current.focus()
                // Não selecionar texto pois está vazio, apenas colocar cursor no início
                quantityInputRef.current.select()
            }
        }, 10) // Slightly longer timeout to ensure DOM update
    }

    // Effect to handle focus after state changes
    useEffect(() => {
        if (shouldFocusSearch) {
            // Focus back on the search input for the next item
            setTimeout(() => {
                setShouldFocusSearch(false);
                if (searchInputRef.current) {
                    searchInputRef.current.focus()
                    searchInputRef.current.select() // Select all text to make it easier to type
                }
            }, 10) // Slightly shorter timeout for more responsive focus
        }
    }, [shouldFocusSearch]) // Re-run only when shouldFocusSearch changes

    const handleAdd = () => {
        if (selectedFood) {
            // Só adiciona se a quantidade for um número positivo
            if (typeof quantity === 'number' && quantity > 0) {
                onAddFood(selectedFood, quantity, unit)
            }
            // Reset independentemente de ter adicionado ou não
            setQuery('')
            setSelectedFood(null)
            setQuantity('') // Agora reseta como vazio
            setUnit('g') // Also reset unit
            // Trigger the effect to focus back on search input
            setShouldFocusSearch(true);
        }
    }

    const homemadeMeasure = calculateHomemadeMeasure();

    return (
        <div className="flex items-center gap-2 p-2 rounded-lg group focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
            <div className="relative flex-1">
                <Popover open={isOpen && (searchResults?.results?.length ?? 0) > 0} onOpenChange={setIsOpen}>
                    <PopoverTrigger asChild>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-indigo-500" />
                            <Input
                                ref={searchInputRef}
                                value={query}
                                onChange={(e) => {
                                    setQuery(e.target.value)
                                    setIsOpen(true)
                                    if (selectedFood) setSelectedFood(null) // Clear selection if typing again
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        if (selectedFood) {
                                            // Se um alimento está selecionado, adicionar normalmente
                                            // mesmo que a quantidade esteja vazia (irá apenas resetar sem adicionar)
                                            handleAdd()
                                        } else if (query.trim() !== '') {
                                            // If there's a query but no selected food, try to select the first result
                                            if (searchResults?.results && searchResults.results.length > 0) {
                                                handleSelectFood(searchResults.results[0])
                                            }
                                        }
                                        // Prevent default to avoid page reload
                                        e.preventDefault()
                                    }
                                }}
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
                                                <p className="text-sm text-slate-300 truncate group-hover:text-indigo-400">
                                                    {food.nome}
                                                </p>
                                                <div className="flex gap-3 text-xs text-slate-500">
                                                    <span>{food.energia_kcal} kcal</span>
                                                    <span>P: {food.proteina_g}g</span>
                                                    <span>C: {food.carboidrato_g}g</span>
                                                </div>
                                            </div>
                                            <span className={`text-[10px] px-1.5 py-0.5 rounded ${food.source === 'TACO' ? 'bg-green-900/30 text-green-400' :
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
                        ref={quantityInputRef}
                        type="number"
                        value={quantity === '' ? '' : quantity}
                        onChange={(e) => {
                            const value = e.target.value;
                            setQuantity(value === '' ? '' : Number(value));
                        }}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                handleAdd();
                                // Prevent default to avoid form submission
                                e.preventDefault();
                            } else if (e.key === 'Escape') {
                                // If esc is pressed, clear selection and focus back to search
                                setQuery('');
                                setSelectedFood(null);
                                setQuantity(''); // Agora vazio
                                setTimeout(() => {
                                    if (searchInputRef.current) {
                                        searchInputRef.current.focus();
                                    }
                                }, 10);
                            }
                        }}
                        className="w-20 h-9 bg-slate-800 border-slate-700 text-slate-200 [-webkit-appearance:none] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-inner-spin-button]:m-0 [&::-webkit-outer-spin-button]:m-0"
                    />
                    <select
                        value={unit}
                        onChange={(e) => setUnit(e.target.value)}
                        className="h-9 rounded-md border border-slate-700 bg-slate-800 text-slate-200 text-sm px-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    >
                        <option value="g">g</option>
                        <option value="ml">ml</option>
                    </select>
                    {homemadeMeasure && (
                        <div className="text-xs text-slate-400 bg-slate-800 px-2 py-2 rounded-md">
                            ≈ {(Math.round(homemadeMeasure.value * 100) / 100)} {homemadeMeasure.unit}
                        </div>
                    )}
                    <Button
                        size="sm"
                        onClick={handleAdd}
                        disabled={quantity === '' || (typeof quantity === 'number' && quantity <= 0)}
                        className={`h-9 w-9 p-0 text-white ${(quantity === '' || (typeof quantity === 'number' && quantity <= 0))
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-indigo-600 hover:bg-indigo-700'
                            }`}
                    >
                        <Plus className="h-4 w-4" />
                    </Button>
                </div>
            )}
        </div>
    )
}

export default InlineFoodInput