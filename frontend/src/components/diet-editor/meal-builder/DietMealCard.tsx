"use client"

import React, { useState, useRef, useEffect, MutableRefObject } from 'react'
import { Food, foodService } from '@/services/food-service'
import { WorkspaceMeal } from '@/stores/diet-editor-store'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
    Clock, GripVertical, Trash2, Copy, Search, Loader2, X,
    MoreHorizontal, PieChart, ChevronDown, ChevronUp, RefreshCw,
    Utensils, Coffee, Salad, Apple, Moon, Soup
} from 'lucide-react'
import { useDebounce } from '@/hooks/use-debounce'
import { useQuery } from '@tanstack/react-query'
import { cn } from "@/lib/utils"
import { ExpressSelectorModal } from './ExpressSelectorModal'
import { SubstitutionModal } from './SubstitutionModal'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Diet Types Options
const DIET_TYPES = [
    'Normocalórica',
    'Low Carb',
    'High Carb',
    'Cetogênica',
    'Vegetariana',
    'Vegana',
    'Hipercalórica'
]

interface DietMealCardProps {
    meal: WorkspaceMeal
    index: number
    onUpdate: (updates: Partial<WorkspaceMeal>) => void
    onDelete: () => void
    onCopy: () => void
    onAddFood: (mealId: number, food: Food) => void
    onRemoveFood: (mealId: number, foodId: number) => void
    compact?: boolean
}

export function DietMealCard({
    meal, index, onUpdate, onDelete, onCopy, onAddFood, onRemoveFood, compact = false
}: DietMealCardProps) {
    const [searchQuery, setSearchQuery] = useState('')
    const [sourceFilter, setSourceFilter] = useState<string | null>(null)
    const [isSearchFocused, setIsSearchFocused] = useState(false)
    const [expanded, setExpanded] = useState(!compact)
    const [lastAddedFoodId, setLastAddedFoodId] = useState<number | null>(null)

    // Modals State
    const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false)
    const [isSubstitutionModalOpen, setIsSubstitutionModalOpen] = useState(false)
    const [selectedFoodForSub, setSelectedFoodForSub] = useState<string>('')

    const searchInputRef = useRef<HTMLInputElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const quantityInputRefs = useRef<Record<number, React.RefObject<HTMLInputElement | null>>>(
        meal.foods.reduce((acc, food) => {
            acc[food.id] = React.createRef<HTMLInputElement>()
            return acc
        }, {} as Record<number, React.RefObject<HTMLInputElement | null>>)
    )

    // Atualizar os refs quando a lista de alimentos mudar
    useEffect(() => {
        meal.foods.forEach(food => {
            if (!quantityInputRefs.current[food.id]) {
                quantityInputRefs.current[food.id] = React.createRef<HTMLInputElement>()
            }
        })
    }, [meal.foods]) // Mantém a dependência para garantir que novos alimentos tenham refs

    const debouncedQuery = useDebounce(searchQuery, 300)


    // Calculate Meal Totals
    const totals = meal.foods.reduce((acc, f) => {
        const ratio = f.qty / 100; // A quantidade já está em gramas
        return {
            kcal: acc.kcal + (f.ptn * 4 + f.cho * 4 + f.fat * 9) * ratio,
            ptn: acc.ptn + f.ptn * ratio,
            cho: acc.cho + f.cho * ratio,
            fat: acc.fat + f.fat * ratio,
            fib: acc.fib + (f.fib || 0) * ratio,
        }
    }, { kcal: 0, ptn: 0, cho: 0, fat: 0, fib: 0 })

    // Food Search Query
    const { data: searchResults, isLoading: isSearching } = useQuery({
        queryKey: ['food-search', debouncedQuery, sourceFilter],
        queryFn: () => foodService.search(debouncedQuery, {
            source: sourceFilter || undefined,
            limit: 10
        }),
        enabled: debouncedQuery.length >= 2,
    })

    const handleSelectFood = (food: Food) => {
        onAddFood(meal.id, food)
        setSearchQuery('')
        setIsSearchFocused(false)
        // Não limpar o filtro de fonte para manter a seleção do usuário
    }

    // Efeito para rastrear quando um novo alimento é adicionado
    useEffect(() => {
        if (meal.foods.length > 0) {
            // Atualizar o ID do último alimento adicionado
            const lastFood = meal.foods[meal.foods.length - 1]
            setLastAddedFoodId(lastFood.id)
        }
    }, [meal.foods.length]) // Apenas quando o número de alimentos mudar

    // Efeito para focar no campo de quantidade do último alimento adicionado
    useEffect(() => {
        if (lastAddedFoodId !== null) {
            // Usar setTimeout com timeout 0 para garantir que o DOM está completamente atualizado
            const timer = setTimeout(() => {
                // Garantir que o ref existe antes de tentar focar
                if (!quantityInputRefs.current[lastAddedFoodId]) {
                    quantityInputRefs.current[lastAddedFoodId] = React.createRef<HTMLInputElement>()
                }

                const foodRef = quantityInputRefs.current[lastAddedFoodId]
                if (foodRef?.current) {
                    foodRef.current.focus()
                    foodRef.current.select() // Seleciona o conteúdo para edição fácil
                }

                // Resetar o ID após focar para evitar foco repetido
                setLastAddedFoodId(null)
            }, 0)

            return () => clearTimeout(timer)
        }
    }, [lastAddedFoodId])

    // Close Dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsSearchFocused(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    if (!expanded) {
        // COMPACT MODE
        return (
            <div className="bg-card border border-border rounded-lg p-3 flex flex-col gap-2 hover:border-primary/50 transition-colors cursor-pointer group" onClick={() => setExpanded(true)}>
                <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm truncate">{meal.type || `Refeição ${index + 1}`}</span>
                    <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => { e.stopPropagation(); onDelete(); }}>
                        <Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive" />
                    </Button>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground/80">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{meal.time}</span>
                </div>
                <div className="mt-1 pt-2 border-t border-border/50 flex justify-between items-end">
                    <div className="text-xs">
                        <div className="font-medium text-foreground">{Math.round(totals.kcal)} kcal</div>
                        <div className="text-[10px] text-muted-foreground flex gap-1">
                            <span>P:{Math.round(totals.ptn)}</span>
                            <span>C:{Math.round(totals.cho)}</span>
                            <span>F:{Math.round(totals.fat)}</span>
                        </div>
                    </div>
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                </div>
            </div>
        )
    }

    // EXPANDED MODE (2 Columns)
    return (
        <div className="bg-card border border-border rounded-lg overflow-hidden shadow-sm flex flex-col md:flex-row transition-all min-h-[300px]">

            {/* COLUMN 1: LEFT (Settings) 20% */}
            <div className="w-full md:w-[20%] border-b md:border-b-0 md:border-r border-border bg-muted/20 p-3 flex flex-col gap-4">
                <div className="space-y-3">
                    <div className="flex justify-between items-start">
                        <Input
                            value={meal.type}
                            onChange={(e) => onUpdate({ type: e.target.value })}
                            className="h-8 font-semibold bg-transparent border-transparent hover:border-border hover:bg-background px-1 -ml-1 text-sm rounded transition-all focus:border-primary"
                            placeholder="Nome da Refeição"
                        />
                        <div className="flex gap-1">
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onCopy} title="Copiar">
                                <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-6 w-6 hover:text-destructive" onClick={onDelete} title="Excluir">
                                <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <Input
                            type="time"
                            value={meal.time}
                            onChange={(e) => onUpdate({ time: e.target.value })}
                            className="h-7 w-24 text-xs bg-background"
                        />
                    </div>

                    <Textarea
                        placeholder="Observações (ex: Comer devagar...)"
                        value={meal.observation}
                        onChange={(e) => onUpdate({ observation: e.target.value })}
                        className="text-xs resize-none h-20 bg-background/50 focus:bg-background"
                    />
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Seletores Rápidos</span>
                        <Button
                            variant="link"
                            className="h-auto p-0 text-[10px] text-primary"
                            onClick={() => setIsTemplateModalOpen(true)}
                        >
                            Ver Templates
                        </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-1.5">
                        {['Desjejum', 'Colação', 'Almoço', 'Lanche', 'Jantar', 'Ceia'].map(label => (
                            <button
                                key={label}
                                onClick={() => onUpdate({ type: label })}
                                className="text-[10px] px-2 py-1.5 rounded bg-background border border-border hover:border-primary/50 text-muted-foreground hover:text-foreground transition-colors text-left truncate"
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="mt-auto space-y-2">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Suplementos</span>
                    <div className="flex flex-wrap gap-1">
                        {['Pré-T', 'Pós-T', 'Whey', 'Creat'].map(label => (
                            <Badge key={label} variant="secondary" className="text-[9px] px-1.5 py-0.5 cursor-pointer hover:bg-primary/20 hover:text-primary">
                                {label}
                            </Badge>
                        ))}
                    </div>
                </div>
            </div>

            {/* COLUMN 2: CENTER (Food Table) - Expanded to fill remaining space */}
            <div className="flex-1 flex flex-col bg-background border-l border-border">
                {/* Search Bar Area */}
                <div className="p-3 border-b border-border bg-background/50 relative z-10" ref={containerRef}>
                    <div className="flex items-center justify-between gap-2 mb-2">
                        {/* Left: Source Toggles */}
                        <div className="flex items-center gap-2">
                            {['TACO', 'TBCA', 'USDA'].map(src => {
                                let activeClass = "bg-primary/10 text-primary border-primary/50"
                                let inactiveClass = "text-muted-foreground hover:text-foreground"

                                switch (src) {
                                    case 'TACO':
                                        activeClass = "bg-emerald-100 text-emerald-700 border-emerald-500 font-bold";
                                        inactiveClass = "text-emerald-600 border-border hover:bg-emerald-50";
                                        break;
                                    case 'TBCA':
                                        activeClass = "bg-orange-100 text-orange-700 border-orange-500 font-bold";
                                        inactiveClass = "text-orange-600 border-border hover:bg-orange-50";
                                        break;
                                    case 'USDA':
                                        activeClass = "bg-blue-100 text-blue-700 border-blue-500 font-bold";
                                        inactiveClass = "text-blue-600 border-border hover:bg-blue-50";
                                        break;
                                }

                                return (
                                    <button
                                        key={src}
                                        onClick={() => setSourceFilter(src === sourceFilter ? null : src)}
                                        className={cn(
                                            "text-[10px] px-2 py-0.5 rounded-full border transition-all",
                                            sourceFilter === src ? activeClass : inactiveClass
                                        )}
                                    >
                                        {src}
                                    </button>
                                )
                            })}
                        </div>

                        {/* Right: 5 Meal Selectors relative to buttons */}
                        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                            {['Café da Manhã', 'Almoço', 'Lanche', 'Jantar', 'Ceia'].map(label => {
                                let Icon = Utensils
                                let colorClass = "text-muted-foreground"

                                switch (label) {
                                    case 'Café da Manhã': Icon = Coffee; colorClass = "text-amber-500"; break;
                                    case 'Almoço': Icon = Salad; colorClass = "text-green-600"; break; // Changed to Salad (Broccoli proxy)
                                    case 'Lanche': Icon = Apple; colorClass = "text-emerald-500"; break;
                                    case 'Jantar': Icon = Soup; colorClass = "text-blue-500"; break;
                                    case 'Ceia': Icon = Moon; colorClass = "text-indigo-400"; break;
                                }

                                return (
                                    <DropdownMenu key={label}>
                                        <DropdownMenuTrigger asChild>
                                            <button className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted/40 hover:bg-muted/60 border border-border hover:border-border transition-all group whitespace-nowrap min-w-fit">
                                                <Icon className={cn("h-3.5 w-3.5 transition-colors", colorClass)} />
                                                <span className="text-[10px] font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                                                    {label}
                                                </span>
                                                <ChevronDown className="h-3 w-3 opacity-30" />
                                            </button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-48">
                                            <div className="px-2 py-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                                                Padrão Dietético
                                            </div>
                                            {DIET_TYPES.map(type => (
                                                <DropdownMenuItem
                                                    key={type}
                                                    className="text-xs cursor-pointer focus:bg-primary/10 focus:text-primary"
                                                    onClick={() => {
                                                        // Future: Apply template logic here
                                                        console.log(`Selected ${type} for ${label}`)
                                                    }}
                                                >
                                                    {type}
                                                </DropdownMenuItem>
                                            ))}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                )
                            })}
                        </div>
                    </div>

                    <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            ref={searchInputRef}
                            className="pl-9 h-9 text-sm"
                            placeholder="Digite o alimento... (ex: frango, arroz)"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onFocus={() => setIsSearchFocused(true)}
                        />
                        {/* Dropdown Results */}
                        {isSearchFocused && (searchQuery.length > 1) && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-md shadow-lg max-h-60 overflow-y-auto z-50">
                                {isSearching ? (
                                    <div className="flex justify-center p-4"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
                                ) : searchResults?.results && searchResults.results.length > 0 ? (
                                    <div className="py-1">
                                        {searchResults.results.map((food: Food) => (
                                            <button
                                                key={`${food.source}-${food.id}`}
                                                className="w-full px-3 py-2 text-left hover:bg-muted/50 flex items-center justify-between text-sm group"
                                                onClick={() => handleSelectFood(food)}
                                            >
                                                <div className="min-w-0">
                                                    <div className="font-medium truncate">{food.nome}</div>
                                                    <div className="text-[10px] text-muted-foreground truncate">{food.grupo} • {Math.round(food.energia_kcal)} kcal/100g</div>
                                                </div>
                                                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Badge variant="outline" className="text-[10px]">+ Add</Badge>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-3 text-center text-xs text-muted-foreground">Nenhum alimento encontrado.</div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Table */}
                <div className="flex-1 overflow-auto min-h-[200px]">
                    <table className="w-full text-xs">
                        <thead className="bg-muted/40 sticky top-0 z-0 text-muted-foreground font-medium">
                            <tr>
                                <th className="p-2 w-8 text-center"><GripVertical className="w-3 h-3 opacity-50" /></th>
                                <th className="p-2 text-left">Alimento</th>
                                <th className="p-2 text-center w-14">Qtd</th>
                                <th className="p-2 text-center w-14">Unid</th>
                                <th className="p-2 text-center w-20">
                                    <select className="text-xs bg-background border border-border rounded w-full">
                                        <option value="default">Medida</option>
                                        <option value="col_sopa">Col. Sopa</option>
                                        <option value="col_cha">Col. Chá</option>
                                        <option value="col_sobremesa">Col. Sobremesa</option>
                                        <option value="xicara">Xícara</option>
                                        <option value="copo">Copo</option>
                                        <option value="unidade">Unidade</option>
                                    </select>
                                </th>
                                <th className="p-2 text-center w-10">PTN</th>
                                <th className="p-2 text-center w-10">CHO</th>
                                <th className="p-2 text-center w-10">FAT</th>
                                <th className="p-2 text-center w-10">FIB</th>
                                <th className="p-2 text-center w-10">kcal</th>
                                <th className="p-2 text-center w-10">...</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/40">
                            {meal.foods.map((food) => (
                                <tr key={food.id} className="group hover:bg-muted/10 transition-colors">
                                    <td className="p-2 text-center"><GripVertical className="w-3 h-3 text-muted-foreground/30 group-hover:text-muted-foreground cursor-grab" /></td>
                                    <td className="p-2">
                                        <div className="font-medium truncate max-w-[250px]">{food.name}</div>
                                        <div className="text-[10px] text-muted-foreground truncate max-w-[250px]">{food.prep || 'Natural'}</div>
                                    </td>
                                    <td className="p-2">
                                        <Input
                                            type="number"
                                            value={food.qty}
                                            onChange={(e) => onUpdate({ foods: meal.foods.map(f => f.id === food.id ? { ...f, qty: Number(e.target.value) } : f) })}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    // Retorna o foco ao campo de busca de alimentos
                                                    if (searchInputRef.current) {
                                                        searchInputRef.current.focus()
                                                    }
                                                }
                                            }}
                                            ref={quantityInputRefs.current[food.id]}
                                            className="h-6 w-full text-center px-1 bg-transparent focus:bg-background"
                                        />
                                    </td>
                                    <td className="p-2 text-center text-[10px] text-muted-foreground">{food.unit}</td>
                                    <td className="p-2">
                                        <div className="flex flex-col items-center gap-1">
                                            <select
                                                value={food.measure}
                                                onChange={(e) => {
                                                    onUpdate({ foods: meal.foods.map(f =>
                                                        f.id === food.id ? { ...f, measure: e.target.value } : f)
                                                    });
                                                }}
                                                className="h-5 w-full text-[9px] bg-background border border-border rounded text-center"
                                            >
                                                <option value="default">Auto ({food.unidade_caseira || 'N/A'})</option>
                                                <option value="col_sopa">Col. Sopa</option>
                                                <option value="col_cha">Col. Chá</option>
                                                <option value="col_sobremesa">Col. Sobremesa</option>
                                                <option value="xicara">Xícara</option>
                                                <option value="copo">Copo</option>
                                                <option value="unidade">Unidade</option>
                                            </select>
                                            <div className="text-[9px] text-muted-foreground w-full text-center">
                                                {(() => {
                                                    if (food.measure === 'default' || food.measure === 'g' || !food.measure) {
                                                        if (food.unidade_caseira && food.peso_unidade_caseira_g && food.peso_unidade_caseira_g > 0) {
                                                            const equivalentQty = food.qty / food.peso_unidade_caseira_g;
                                                            return `${equivalentQty.toFixed(2)} ${food.unidade_caseira}`;
                                                        }
                                                        return 'N/A';
                                                    } else if (food.measure === 'col_sopa') {
                                                        return `${(food.qty / 10).toFixed(2)} col. sopa`;
                                                    } else if (food.measure === 'col_cha') {
                                                        return `${(food.qty / 5).toFixed(2)} col. chá`;
                                                    } else if (food.measure === 'col_sobremesa') {
                                                        return `${(food.qty / 15).toFixed(2)} col. sobremesa`;
                                                    } else if (food.measure === 'xicara') {
                                                        return `${(food.qty / 240).toFixed(2)} xícara`;
                                                    } else if (food.measure === 'copo') {
                                                        return `${(food.qty / 200).toFixed(2)} copo`;
                                                    } else if (food.measure === 'unidade' && food.peso_unidade_caseira_g) {
                                                        return `${(food.qty / food.peso_unidade_caseira_g).toFixed(2)} und.`;
                                                    }
                                                    return 'N/A';
                                                })()}
                                            </div>
                                        </div>
                                    </td>
                                    {/* Autosum per item (Total for Qty in grams) */}
                                    <td className="p-2 text-center">{(food.ptn * (food.qty / 100)).toFixed(1)}</td>
                                    <td className="p-2 text-center">{(food.cho * (food.qty / 100)).toFixed(1)}</td>
                                    <td className="p-2 text-center">{(food.fat * (food.qty / 100)).toFixed(1)}</td>
                                    <td className="p-2 text-center">{(food.fib * (food.qty / 100)).toFixed(1)}</td>
                                    <td className="p-2 text-center">{((food.ptn * 4 + food.cho * 4 + food.fat * 9) * (food.qty / 100)).toFixed(1)}</td>
                                    <td className="p-2 text-center">
                                        <div className="flex justify-center opacity-0 group-hover:opacity-100 transition-opacity gap-1">
                                            <button
                                                className="text-muted-foreground hover:text-primary"
                                                title="Substituir"
                                                onClick={() => {
                                                    setSelectedFoodForSub(food.name)
                                                    setIsSubstitutionModalOpen(true)
                                                }}
                                            >
                                                <RefreshCw className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                                className="text-muted-foreground hover:text-destructive"
                                                title="Remover"
                                                onClick={() => onRemoveFood(meal.id, food.id)}
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {meal.foods.length === 0 && (
                                <tr>
                                    <td colSpan={8} className="p-8 text-center text-muted-foreground text-xs italic">
                                        Nenhum alimento adicionado. Use a busca acima.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                        <tfoot className="bg-muted/20 border-t border-border font-medium">
                            <tr>
                                <td colSpan={2} className="p-2 text-right text-muted-foreground">Subtotal:</td>
                                <td colSpan={2} className="p-2 text-center">{Math.round(totals.kcal)} kcal</td>
                                <td></td> {/* Coluna para medida equivalente */}
                                <td className="p-2 text-center">{Math.round(totals.ptn)}g</td>
                                <td className="p-2 text-center">{Math.round(totals.cho)}g</td>
                                <td className="p-2 text-center">{Math.round(totals.fat)}g</td>
                                <td className="p-2 text-center">{Math.round(totals.fib)}g</td>
                                <td className="p-2 text-center">{Math.round(totals.kcal)}</td>
                                <td></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                <div className="p-2 border-t border-border flex justify-end">
                    <Button variant="ghost" size="sm" className="h-6 text-[10px] text-muted-foreground hover:text-foreground" onClick={() => setExpanded(false)}>
                        <ChevronUp className="w-3 h-3 mr-1" /> Recolher
                    </Button>
                </div>
            </div>

            <ExpressSelectorModal
                isOpen={isTemplateModalOpen}
                onClose={() => setIsTemplateModalOpen(false)}
                mealTitle={meal.type}
                onApplyTemplate={(templateName, items) => {
                    // TODO: Implement template selection logic
                    console.log('Template selected', templateName, items)
                    setIsTemplateModalOpen(false)
                }}
            />

            <SubstitutionModal
                isOpen={isSubstitutionModalOpen}
                onClose={() => setIsSubstitutionModalOpen(false)}
                originalFoodName={selectedFoodForSub}
                onSubstitute={(food) => {
                    // TODO: Implement substitution logic
                    console.log('Substitute with', food)
                    setIsSubstitutionModalOpen(false)
                }}
            />
        </div>
    )
}
