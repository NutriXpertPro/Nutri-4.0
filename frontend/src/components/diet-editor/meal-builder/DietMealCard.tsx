"use client"

import React, { useState, useRef, useEffect } from 'react'
import { Food, foodService } from '@/services/food-service'
import { WorkspaceMeal, useDietEditorStore } from '@/stores/diet-editor-store'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Trash2, Plus, GripVertical, Check, ChevronsUpDown, Search, Loader2, Utensils, RefreshCw, X, ChevronDown, ChevronUp, Copy, Maximize2, Minimize2, Flame, Folder, ArrowRight, Star, Clock, Coffee, Salad, Apple, Soup, Moon, PieChart, FileText, Eye } from 'lucide-react'
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
import { Card, CardContent } from "@/components/ui/card"
import { IconWrapper } from "@/components/ui/IconWrapper"

// Diet Types Options
const DIET_TYPES = [
    'Normocalórica', 'Low Carb', 'High Carb', 'Cetogênica',
    'Vegetariana', 'Vegana', 'Hipercalórica'
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

// Helper Component for Subtotal Metrics
function SubtotalMetric({ label, value, color, bgColor, dotColor }: { label: string, value: number, color: string, bgColor: string, dotColor: string }) {
    return (
        <div className="flex items-center gap-2.5 px-2 py-1 transition-all">
            <div className={cn("w-1.5 h-1.5 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.5)]", dotColor)} />
            <div className="flex flex-col">
                <span className={cn("text-[8px] font-black uppercase tracking-[0.15em] leading-none mb-1", color)}>{label}</span>
                <span className="text-xs font-black tabular-nums leading-none text-foreground">{Math.round(value)}<span className="text-[8px] ml-0.5 opacity-40">g</span></span>
            </div>
        </div>
    )
}

export function DietMealCard({
    meal, index, onUpdate, onDelete, onCopy, onAddFood, onRemoveFood, compact = false
}: DietMealCardProps) {
    const [searchQuery, setSearchQuery] = useState('')
    const [sourceFilter, setSourceFilter] = useState<string | null>(null)
    const [isSearchFocused, setIsSearchFocused] = useState(false)
    const [expanded, setExpanded] = useState(!compact)
    const [lastAddedFoodId, setLastAddedFoodId] = useState<number | null>(null)

    const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false)
    const [isSubstitutionModalOpen, setIsSubstitutionModalOpen] = useState(false)
    const [selectedFoodForSub, setSelectedFoodForSub] = useState<string>('')
    const [favorites, setFavorites] = useState<Food[]>([])

    // Função para o botão "Preview"
    const handlePreview = () => {
        // A função setShowPDFPreview não está disponível no diet-editor-store
        // então vamos apenas exibir um alerta por enquanto
        alert("Preview PDF acionado");
    }

    const searchInputRef = useRef<HTMLInputElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)

    const addFavorite = (food: Food) => {
        setFavorites(prev => [...prev, food])
    }

    const removeFavorite = (foodId: number) => {
        setFavorites(prev => prev.filter(f => f.id !== foodId))
    }

    // Map para armazenar refs
    const quantityInputRefs = useRef<Map<number, React.RefObject<HTMLInputElement | null>>>(new Map())

    // Garante que todo alimento tenha seu ref criado
    useEffect(() => {
        const map = quantityInputRefs.current
        meal.foods.forEach(food => {
            if (!map.has(food.id)) {
                map.set(food.id, React.createRef<HTMLInputElement | null>())
            }
        })
    }, [meal.foods])

    // CORRIGIDO: Função helper para obter ou criar ref
    const getOrCreateRef = (foodId: number) => {
        if (!quantityInputRefs.current.has(foodId)) {
            quantityInputRefs.current.set(foodId, React.createRef<HTMLInputElement | null>())
        }
        return quantityInputRefs.current.get(foodId)!
    }

    const debouncedQuery = useDebounce(searchQuery, 300)

    // Cálculo dos totais
    const totals = meal.foods.reduce((acc, f) => {
        const ratio = f.qty / 100
        return {
            kcal: acc.kcal + (f.ptn * 4 + f.cho * 4 + f.fat * 9) * ratio,
            ptn: acc.ptn + f.ptn * ratio,
            cho: acc.cho + f.cho * ratio,
            fat: acc.fat + f.fat * ratio,
            fib: acc.fib + (f.fib || 0) * ratio,
        }
    }, { kcal: 0, ptn: 0, cho: 0, fat: 0, fib: 0 })

    const { data: searchResults, isLoading: isSearching } = useQuery({
        queryKey: ['food-search', debouncedQuery, sourceFilter],
        queryFn: () => foodService.search(debouncedQuery, { source: sourceFilter || undefined, limit: 10 }),
        enabled: debouncedQuery.length >= 2,
    })

    const handleSelectFood = (food: Food) => {
        onAddFood(meal.id, food)
        setSearchQuery('')
        setIsSearchFocused(false)
    }

    // Foco automático no input de quantidade do último alimento adicionado
    useEffect(() => {
        if (lastAddedFoodId !== null) {
            const timer = setTimeout(() => {
                const ref = quantityInputRefs.current.get(lastAddedFoodId)
                ref?.current?.focus()
                ref?.current?.select()
                setLastAddedFoodId(null)
            }, 0)
            return () => clearTimeout(timer)
        }
    }, [lastAddedFoodId])

    useEffect(() => {
        if (meal.foods.length > 0) {
            setLastAddedFoodId(meal.foods[meal.foods.length - 1].id)
        }
    }, [meal.foods.length])

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsSearchFocused(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    if (!expanded) {
        return (
            <Card variant="glass" className="p-3 flex flex-col gap-2 hover:border-primary/50 transition-all cursor-pointer group" onClick={() => setExpanded(true)}>
                <div className="flex items-center justify-between">
                    <span className="text-sm font-bold truncate text-foreground">{meal.type || `Refeição ${index + 1} `}</span>
                    <Button variant="ghost" size="icon" className="h-8 w-8 bg-destructive/5 text-destructive hover:bg-destructive hover:text-white transition-all shadow-sm border border-destructive/20" onClick={(e) => { e.stopPropagation(); if (confirm('Excluir esta refeição?')) onDelete(); }}>
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground/80 font-medium">
                    <Clock className="w-3.5 h-3.5 text-primary/60" />
                    <span>{meal.time}</span>
                </div>
                <div className="mt-1 pt-2 border-t border-border/10 flex justify-between items-end">
                    <div className="space-y-0.5">
                        <div className="text-sm font-black text-foreground tabular-nums">{Math.round(totals.kcal)} <span className="text-[10px] text-muted-foreground font-bold">kcal</span></div>
                        <div className="text-[9px] text-muted-foreground font-black flex gap-2 uppercase tracking-tight">
                            <span>P:{Math.round(totals.ptn)}g</span>
                            <span>C:{Math.round(totals.cho)}g</span>
                            <span>F:{Math.round(totals.fat)}g</span>
                        </div>
                    </div>
                    <ChevronDown className="w-4 h-4 text-muted-foreground/40 group-hover:text-primary/60 transition-colors" />
                </div>
            </Card>
        )
    }

    return (
        <Card variant="default" className="overflow-hidden shadow-xl flex flex-col transition-all min-h-[300px] border-border/40 w-full">
            {/* TABELA DE ALIMENTOS - ÚNICA COLUNA */}
            <div className="flex-1 flex flex-col bg-background">
                {/* Barra de busca e filtros */}
                <div className="p-4 border-b border-border/10 bg-background relative z-10" ref={containerRef}>
                    <div className="flex flex-col gap-4 mb-4">
                        <div className="flex items-center gap-4">
                            <Input
                                type="time"
                                value={meal.time}
                                onChange={(e) => onUpdate({ time: e.target.value })}
                                className="h-8 w-24 text-xs font-bold bg-background/50 border-border/20 rounded-lg text-center"
                            />
                            <Input
                                value={meal.type}
                                onChange={(e) => {
                                    // Limita o input a 30 caracteres
                                    if (e.target.value.length <= 30) {
                                        onUpdate({ type: e.target.value });
                                    }
                                }}
                                className="h-8 w-40 text-sm font-black bg-background/50 border-border/20 px-3 rounded-lg transition-all focus:border-primary focus:bg-background truncate"
                                placeholder="Nome da Refeição"
                            />
                        </div>
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                            <div className="flex items-center gap-2">
                                {['TACO', 'TBCA', 'USDA'].map(src => {
                                    const isActive = sourceFilter === src
                                    let activeClass = "bg-primary text-primary-foreground border-primary"
                                    let inactiveClass = "text-muted-foreground hover:text-foreground border-border/30 hover:border-primary/40 bg-muted/20"

                                    switch (src) {
                                        case 'TACO': activeClass = "bg-emerald-500 text-white border-emerald-600 shadow-sm shadow-emerald-500/20"; inactiveClass = "text-emerald-600/70 border-emerald-500/20 hover:bg-emerald-500/5 hover:text-emerald-600"; break;
                                        case 'TBCA': activeClass = "bg-orange-500 text-white border-orange-600 shadow-sm shadow-orange-500/20"; inactiveClass = "text-orange-600/70 border-orange-500/20 hover:bg-orange-500/5 hover:text-orange-600"; break;
                                        case 'USDA': activeClass = "bg-blue-500 text-white border-blue-600 shadow-sm shadow-blue-500/20"; inactiveClass = "text-blue-600/70 border-blue-500/20 hover:bg-blue-500/5 hover:text-blue-600"; break;
                                    }

                                    return (
                                        <button
                                            key={src}
                                            onClick={() => setSourceFilter(isActive ? null : src)}
                                            className={cn("text-[10px] font-black px-3 py-1 rounded-lg border transition-all uppercase tracking-widest", isActive ? activeClass : inactiveClass)}
                                        >
                                            {src}
                                        </button>
                                    )
                                })}
                            </div>

                            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 lg:pb-0">
                                {['Café da Manhã', 'Almoço', 'Lanche', 'Jantar', 'Ceia'].map(label => {
                                    let Icon = Utensils
                                    let colorClass = "text-muted-foreground"
                                    switch (label) {
                                        case 'Café da Manhã': Icon = Coffee; colorClass = "text-orange-500"; break;
                                        case 'Almoço': Icon = Salad; colorClass = "text-emerald-500"; break;
                                        case 'Lanche': Icon = Apple; colorClass = "text-orange-400"; break;
                                        case 'Jantar': Icon = Soup; colorClass = "text-blue-500"; break;
                                        case 'Ceia': Icon = Moon; colorClass = "text-sky-500"; break;
                                    }

                                    return (
                                        <DropdownMenu key={label}>
                                            <DropdownMenuTrigger asChild>
                                                <button className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-muted/30 hover:bg-muted/50 border border-border/20 hover:border-primary/30 transition-all group whitespace-nowrap min-w-fit shadow-sm">
                                                    <Icon className={cn("h-3.5 w-3.5 transition-transform group-hover:scale-110", colorClass)} />
                                                    <span className="text-[10px] font-black text-muted-foreground group-hover:text-foreground transition-colors uppercase tracking-tight">{label}</span>
                                                    <ChevronDown className="h-3 w-3 opacity-30" />
                                                </button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-52 p-1">
                                                <div className="px-3 py-2 text-[10px] font-black text-muted-foreground uppercase tracking-widest bg-muted/30 rounded-t-lg mb-1">Padrão Dietético</div>
                                                {DIET_TYPES.map(type => (
                                                    <DropdownMenuItem key={type} className="text-xs font-bold py-2 px-3 cursor-pointer focus:bg-primary/10 focus:text-primary rounded-lg">
                                                        {type}
                                                    </DropdownMenuItem>
                                                ))}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    )
                                })}
                                <Button variant="outline" size="sm" className="h-8 rounded-xl px-3 gap-2 text-[10px] font-black uppercase tracking-widest border-border/40 hover:bg-muted/40 whitespace-nowrap" onClick={onCopy}>
                                    <Copy className="w-3.5 h-3.5 text-primary" />
                                    <span className="hidden sm:inline">Copiar Refeição</span>
                                </Button>
                                <Button variant="secondary" size="sm" className="h-8 rounded-xl px-3 gap-2 text-[10px] font-black uppercase tracking-widest bg-primary/10 text-primary border-transparent hover:bg-primary/20 whitespace-nowrap" onClick={handlePreview}>
                                    <Eye className="w-3.5 h-3.5" />
                                    <span className="hidden sm:inline">Preview</span>
                                </Button>
                                <Button variant="ghost" size="sm" className="h-8 w-8 bg-muted/30 text-foreground hover:bg-primary/20 transition-all border border-border/30" title="Gerenciar Templates">
                                    <Settings className="w-3.5 h-3.5" />
                                </Button>
                                <Button variant="ghost" size="sm" className="h-8 w-8 bg-destructive/10 text-destructive hover:bg-destructive hover:text-white transition-all border border-destructive/30 shadow-lg shadow-destructive/10" onClick={() => { if (confirm('Excluir esta refeição inteira?')) onDelete(); }} title="Excluir Refeição">
                                    <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="relative group">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground flex items-center justify-center pointer-events-none group-focus-within:text-primary transition-colors">
                            <Search className="w-4 h-4" />
                        </div>
                        <Input
                            ref={searchInputRef}
                            className="pl-10 h-10 text-sm font-bold bg-muted/30 border-border/20 focus:bg-background focus:border-primary/40 rounded-xl transition-all shadow-inner"
                            placeholder="Buscar alimento por nome... (ex: frango, arroz, ovo)"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onFocus={() => setIsSearchFocused(true)}
                        />
                        {isSearchFocused && searchQuery.length > 1 && (
                            <Card className="absolute top-full left-0 right-0 mt-3 p-2 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.6)] max-h-[450px] overflow-y-auto z-[100] border-border/40 bg-card/98 backdrop-blur-3xl rounded-[2rem] ring-1 ring-white/10 animate-in fade-in slide-in-from-top-2 duration-300">
                                {isSearching ? (
                                    <div className="flex flex-col items-center justify-center p-12 gap-3">
                                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Buscando no banco de dados...</span>
                                    </div>
                                ) : searchResults?.results?.length ? (
                                    <div className="space-y-1">
                                        <div className="px-4 py-2 text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-50 border-b border-border/5 mb-2">Resultados Encontrados</div>
                                        {searchResults?.results?.sort((a: Food, b: Food) => {
                                            const isAFav = favorites.some(f => f.id === a.id);
                                            const isBFav = favorites.some(f => f.id === b.id);
                                            if (isAFav && !isBFav) return -1;
                                            if (!isAFav && isBFav) return 1;
                                            return 0;
                                        }).map((food: Food) => {
                                            const isFavorite = favorites.some(f => f.id === food.id);
                                            const sourceColor = food.source === 'TACO' ? 'text-emerald-500 border-emerald-500/20' :
                                                food.source === 'TBCA' ? 'text-orange-500 border-orange-500/20' :
                                                    'text-blue-500 border-blue-500/20';

                                            return (
                                                <button
                                                    key={`${food.source} -${food.id} `}
                                                    className="w-full px-4 py-3.5 text-left hover:bg-white/[0.03] flex items-center justify-between text-sm group transition-all rounded-2xl border border-transparent hover:border-white/5 hover:shadow-lg active:scale-[0.98]"
                                                    onClick={() => handleSelectFood(food)}
                                                >
                                                    <div className="flex items-center gap-4 min-w-0 flex-1">
                                                        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center font-black text-[10px] border shrink-0 transition-transform group-hover:scale-110 shadow-sm bg-transparent", sourceColor)}>
                                                            {food.source}
                                                        </div>
                                                        <div className="min-w-0 pr-4 flex-1">
                                                            <div className="flex items-center gap-2">
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        isFavorite ? removeFavorite(food.id) : addFavorite(food);
                                                                    }}
                                                                    className="shrink-0 hover:scale-110 transition-transform focus:outline-none"
                                                                    title={isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
                                                                >
                                                                    <Star className={cn("w-3.5 h-3.5 transition-colors", isFavorite ? "fill-amber-400 text-amber-400" : "text-amber-400 hover:text-amber-300")} />
                                                                </button>
                                                                <div className="font-black text-foreground transition-colors truncate text-sm tracking-tight">{food.nome}</div>
                                                            </div>
                                                            <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-tight flex items-center gap-3 mt-1 opacity-70">
                                                                <div className="flex items-center gap-1">
                                                                    <Folder className="w-3 h-3 text-muted-foreground/60" />
                                                                    <span className="truncate max-w-[120px]">{food.grupo}</span>
                                                                </div>
                                                                <span className="w-1 h-1 rounded-full bg-border" />
                                                                <div className="flex items-center gap-1 text-foreground/80">
                                                                    <Flame className="w-3 h-3 text-orange-500/70" />
                                                                    <span className="font-black tabular-nums">{Math.round(food.energia_kcal)} kcal</span>
                                                                    <span className="text-[8px] font-bold">/100g</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0">
                                                        <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/30">
                                                            <ArrowRight className="w-4 h-4" />
                                                        </div>
                                                    </div>
                                                </button>
                                            )
                                        })}
                                    </div>
                                ) : (
                                    <div className="p-16 text-center flex flex-col items-center gap-4">
                                        <div className="w-16 h-16 bg-muted/30 rounded-full flex items-center justify-center">
                                            <Search className="w-8 h-8 text-muted-foreground/20" />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-sm font-black text-foreground uppercase tracking-widest">Nenhum alimento encontrado</p>
                                            <p className="text-[10px] font-bold text-muted-foreground max-w-[200px] text-center">Tente buscar por termos mais genéricos ou verifique a ortografia.</p>
                                        </div>
                                    </div>
                                )}
                            </Card>
                        )}
                    </div>
                </div>

                {/* TABELA 100% CORRIGIDA */}
                <div className="flex-1 overflow-auto min-h-[250px] relative">
                    <table className="w-full border-collapse">
                        <thead className="bg-muted/20 sticky top-0 z-20 shadow-sm">
                            <tr className="text-[10px] font-black text-muted-foreground uppercase tracking-widest border-b border-border/10">
                                <th className="p-3 w-10 text-center"><GripVertical className="w-4 h-4 mx-auto opacity-20" /></th>
                                <th className="p-3 text-left">Alimento</th>
                                <th className="p-3 text-center w-20">Qtd</th>
                                <th className="p-3 text-center w-14">Unid</th>
                                <th className="p-3 text-center w-28">Medida Caseira</th>
                                <th className="p-3 text-center w-14 text-emerald-600/70">PTN</th>
                                <th className="p-3 text-center w-14 text-blue-600/70">CHO</th>
                                <th className="p-3 text-center w-14 text-amber-600/70">FAT</th>
                                <th className="p-3 text-center w-14 text-primary/70">FIB</th>
                                <th className="p-3 text-center w-16 text-foreground font-black">kcal</th>
                                <th className="p-3 text-center w-12 text-muted-foreground/30">...</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/5">
                            {meal.foods.map((food) => {
                                const inputRef = getOrCreateRef(food.id)
                                return (
                                    <tr key={food.id} className="group hover:bg-white/[0.03] transition-colors">
                                        <td className="p-3 text-center">
                                            <GripVertical className="w-4 h-4 text-muted-foreground/20 group-hover:text-primary transition-colors cursor-grab mx-auto" />
                                        </td>
                                        <td className="p-3">
                                            <div className="font-bold text-sm text-foreground truncate max-w-[280px] transition-colors">{food.name}</div>
                                            <div className="text-[10px] font-black text-muted-foreground uppercase tracking-tight flex items-center gap-1.5 mt-0.5">
                                                <Utensils className="w-3 h-3 opacity-30" />
                                                {food.prep || 'Natural'}
                                            </div>
                                        </td>
                                        <td className="p-3">
                                            <div className="relative">
                                                <Input
                                                    type="number"
                                                    value={food.qty}
                                                    onChange={(e) => onUpdate({ foods: meal.foods.map(f => f.id === food.id ? { ...f, qty: Number(e.target.value) || 0 } : f) })}
                                                    onKeyDown={(e) => e.key === 'Enter' && searchInputRef.current?.focus()}
                                                    ref={inputRef}
                                                    className="h-8 w-full text-center font-black text-sm bg-muted/20 border-border/10 focus:bg-background focus:border-primary/40 rounded-lg transition-all"
                                                />
                                            </div>
                                        </td>
                                        <td className="p-3 text-center">
                                            <span className="text-[10px] font-black text-muted-foreground uppercase">{food.unit}</span>
                                        </td>
                                        <td className="p-3">
                                            <div className="flex flex-col gap-1.5">
                                                <select
                                                    value={food.measure || 'default'}
                                                    onChange={(e) => onUpdate({ foods: meal.foods.map(f => f.id === food.id ? { ...f, measure: e.target.value } : f) })}
                                                    className="h-6 w-full text-[10px] font-bold bg-muted/20 border border-border/10 rounded-lg text-center focus:border-primary/40 focus:bg-background transition-all outline-none"
                                                >
                                                    <option value="default">Auto ({food.unidade_caseira || 'N/A'})</option>
                                                    <option value="col_sopa">Col. Sopa</option>
                                                    <option value="col_cha">Col. Chá</option>
                                                    <option value="col_sobremesa">Col. Sobremesa</option>
                                                    <option value="xicara">Xícara</option>
                                                    <option value="copo">Copo</option>
                                                    <option value="unidade">Unidade</option>
                                                </select>
                                                <div className="text-[9px] font-black text-primary/60 w-full text-center uppercase tracking-tighter">
                                                    {(() => {
                                                        if (!food.measure || food.measure === 'default' || food.measure === 'g') {
                                                            if (food.unidade_caseira && food.peso_unidade_caseira_g && food.peso_unidade_caseira_g > 0) {
                                                                return `${(food.qty / food.peso_unidade_caseira_g).toFixed(1)} ${food.unidade_caseira} `
                                                            }
                                                            return '--'
                                                        }
                                                        const conv = { col_sopa: 10, col_cha: 5, col_sobremesa: 15, xicara: 240, copo: 200 }
                                                        if (conv[food.measure as keyof typeof conv]) {
                                                            return `${(food.qty / conv[food.measure as keyof typeof conv]).toFixed(1)} ${food.measure.replace('_', ' ')} `
                                                        }
                                                        if (food.measure === 'unidade' && food.peso_unidade_caseira_g) {
                                                            return `${(food.qty / food.peso_unidade_caseira_g).toFixed(1)} und.`
                                                        }
                                                        return '--'
                                                    })()}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-3 text-center font-bold font-mono text-foreground">{(food.ptn * (food.qty / 100)).toFixed(1)}</td>
                                        <td className="p-3 text-center font-bold font-mono text-foreground">{(food.cho * (food.qty / 100)).toFixed(1)}</td>
                                        <td className="p-3 text-center font-bold font-mono text-foreground">{(food.fat * (food.qty / 100)).toFixed(1)}</td>
                                        <td className="p-3 text-center font-bold font-mono text-foreground">{(food.fib * (food.qty / 100)).toFixed(1)}</td>
                                        <td className="p-3 text-center font-black font-mono text-foreground">
                                            {((food.ptn * 4 + food.cho * 4 + food.fat * 9) * (food.qty / 100)).toFixed(0)}
                                        </td>
                                        <td className="p-3 text-center">
                                            <div className="flex justify-center opacity-0 group-hover:opacity-100 transition-all gap-1 transform translate-x-2 group-hover:translate-x-0">
                                                <button className="p-1.5 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors" title="Substituir" onClick={() => { setSelectedFoodForSub(food.name); setIsSubstitutionModalOpen(true) }}>
                                                    <RefreshCw className="w-3.5 h-3.5" />
                                                </button>
                                                <button className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors" title="Remover" onClick={() => onRemoveFood(meal.id, food.id)}>
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                            {meal.foods.length === 0 && (
                                <tr>
                                    <td colSpan={11} className="p-12 text-center">
                                        <div className="flex flex-col items-center gap-2 opacity-30 group">
                                            <Utensils className="w-10 h-10 mb-2 group-hover:scale-110 transition-transform" />
                                            <span className="text-xs font-black uppercase tracking-widest italic">Nenhum alimento na lista</span>
                                            <span className="text-[10px] font-bold">Inicie uma busca acima para compor sua refeição</span>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                        <tfoot className="bg-muted/20 border-t border-border/10 sticky bottom-0 z-20 shadow-[0_-5px_15px_-5px_rgba(0,0,0,0.1)]">
                            <tr>
                                <td colSpan={11} className="p-0">
                                    <div className="flex items-center justify-between px-6 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                                                <PieChart className="w-4 h-4 text-primary" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-black text-foreground uppercase tracking-[0.2em] leading-none">Subtotal</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-6">
                                            <SubtotalMetric label="PTN" value={totals.ptn} color="text-emerald-500" bgColor="bg-emerald-500/10" dotColor="bg-emerald-500" />
                                            <SubtotalMetric label="CHO" value={totals.cho} color="text-blue-500" bgColor="bg-blue-500/10" dotColor="bg-blue-500" />
                                            <SubtotalMetric label="FAT" value={totals.fat} color="text-orange-500" bgColor="bg-orange-500/10" dotColor="bg-orange-500" />
                                            <SubtotalMetric label="FIB" value={totals.fib} color="text-sky-500" bgColor="bg-sky-500/10" dotColor="bg-sky-500" />

                                            <div className="h-8 w-px bg-border/20 mx-1" />

                                            <div className="flex flex-col items-end">
                                                <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest mb-0.5">Total</span>
                                                <div className="flex items-baseline gap-1">
                                                    <span className="text-xl font-black text-foreground tabular-nums tracking-tighter">{Math.round(totals.kcal)}</span>
                                                    <span className="text-[9px] font-bold text-muted-foreground uppercase">kcal</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                {/* Removendo a div fixa duplicada se houver, o tfoot acima substitui ela */}

                <div className="p-3 border-t border-border/10 flex justify-end items-center bg-muted/10">
                    <Button variant="ghost" size="sm" className="h-7 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors gap-2" onClick={() => setExpanded(false)}>
                        <ChevronUp className="w-3.5 h-3.5" /> Recolher Refeição
                    </Button>
                </div>
            </div >

            <ExpressSelectorModal isOpen={isTemplateModalOpen} onClose={() => setIsTemplateModalOpen(false)} mealTitle={meal.type} onApplyTemplate={() => setIsTemplateModalOpen(false)} />
            <SubstitutionModal isOpen={isSubstitutionModalOpen} onClose={() => setIsSubstitutionModalOpen(false)} originalFoodName={selectedFoodForSub} onSubstitute={() => setIsSubstitutionModalOpen(false)} />
        </Card >
    )
}
