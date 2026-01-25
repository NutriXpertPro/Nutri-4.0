
"use client"

import React, { useState, useEffect } from 'react'
import { Search, Plus, Filter, Download, Trash2, Edit, Utensils, Info, ChevronDown, Check } from 'lucide-react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { foodService, Food } from '@/services/food-service'
import { customFoodService, CustomFood } from '@/services/custom-food-service'
import { cn } from '@/lib/utils'
import { useDebounce } from '@/hooks/use-debounce'
import { FoodManagementTable } from './FoodManagementTable'
import { FoodFormModal } from './FoodFormModal'
import { toast } from 'sonner'

export default function FoodManagementContent() {
    const [searchQuery, setSearchQuery] = useState('')
    const [sourceFilter, setSourceFilter] = useState<string>('ALL')
    const [page, setPage] = useState(1)
    const [isFormModalOpen, setIsFormModalOpen] = useState(false)
    const [editingFood, setEditingFood] = useState<any>(null)
    const debouncedSearch = useDebounce(searchQuery, 300)
    const queryClient = useQueryClient()

    // Reset page when filters change
    useEffect(() => {
        setPage(1)
    }, [debouncedSearch, sourceFilter])

    // Query for unified search (TACO, TBCA, etc + Custom)
    const { data: searchResults, isLoading: isSearching } = useQuery({
        queryKey: ['foods-manage', debouncedSearch, sourceFilter, page],
        queryFn: () => foodService.search(debouncedSearch, {
            source: sourceFilter === 'ALL' ? '' : (sourceFilter === 'SUA TABELA' ? 'PERSONAL' : sourceFilter),
            limit: 50,
            page: page
        }),
    })

    const sources = [
        {
            id: 'ALL',
            label: 'Todas',
            activeClass: 'bg-muted text-muted-foreground border-border shadow-sm',
            inactiveClass: 'bg-transparent text-muted-foreground border-border/40 hover:bg-muted/30 hover:border-border/60'
        },
        {
            id: 'SUA TABELA',
            label: 'Minha Tabela',
            activeClass: 'bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20',
            inactiveClass: 'bg-transparent text-primary border-primary/30 hover:bg-primary/5 hover:border-primary/50'
        },
        {
            id: 'TACO',
            label: 'TACO',
            activeClass: 'bg-green-500 text-white border-green-600 shadow-md shadow-green-500/20',
            inactiveClass: 'bg-transparent text-green-600 dark:text-green-400 border-green-500/30 hover:bg-green-500/5 hover:border-green-500/50'
        },
        {
            id: 'TBCA',
            label: 'TBCA',
            activeClass: 'bg-blue-500 text-white border-blue-600 shadow-md shadow-blue-500/20',
            inactiveClass: 'bg-transparent text-blue-600 dark:text-blue-400 border-blue-500/30 hover:bg-blue-500/5 hover:border-blue-500/50'
        },
        {
            id: 'USDA',
            label: 'USDA',
            activeClass: 'bg-purple-500 text-white border-purple-600 shadow-md shadow-purple-500/20',
            inactiveClass: 'bg-transparent text-purple-600 dark:text-purple-400 border-purple-500/30 hover:bg-purple-500/5 hover:border-purple-500/50'
        }
    ]

    const handleCreate = () => {
        setEditingFood(null)
        setIsFormModalOpen(true)
    }

    const handleEdit = (food: any) => {
        if (food.source !== 'Sua Tabela') {
            toast.error("Acesso Negado", {
                description: "Somente alimentos da 'Minha Tabela' podem ser editados."
            })
            return
        }
        setEditingFood(food)
        setIsFormModalOpen(true)
    }

    const handleCopy = (food: any) => {
        // Clone food data but remove specific identifiers to treat as new
        const foodCopy = {
            ...food,
            id: undefined, // Clear ID to force create mode
            source: 'Sua Tabela', // Force source to personal table
            nome: `${food.nome}${food.source !== 'Sua Tabela' ? '' : ' (Cópia)'}`, // Add suffix only if copying from own table
            // Ensure zeros if null/undefined
            proteina_g: food.proteina_g || 0,
            lipidios_g: food.lipidios_g || 0,
            carboidrato_g: food.carboidrato_g || 0,
            energia_kcal: food.energia_kcal || 0,
            fibra_g: food.fibra_g || 0,
        }

        setEditingFood(foodCopy)
        setIsFormModalOpen(true)
        toast.info("Modo de Cópia", {
            description: "Você está criando um novo alimento baseado em um existente. Ajuste os dados se necessário."
        })
    }

    return (
        <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {/* Header / Search Controls */}
            <div className="flex flex-col md:flex-row gap-4 items-center bg-card p-4 rounded-xl border shadow-sm sticky top-0 z-20">
                <div className="relative flex-1 w-full group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input
                        placeholder="Buscar em todas as tabelas..."
                        className="pl-10 h-10 bg-background/50 border-border/20 rounded-xl focus:ring-primary/20 shadow-inner w-full"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 md:pb-0">
                    {sources.map((src) => {
                        const isActive = sourceFilter === src.id;
                        return (
                            <button
                                key={src.id}
                                onClick={() => setSourceFilter(src.id)}
                                className={cn(
                                    "px-4 py-2 rounded-xl text-[10px] font-medium uppercase tracking-wider transition-all border whitespace-nowrap",
                                    isActive ? src.activeClass : src.inactiveClass
                                )}
                            >
                                {src.label}
                            </button>
                        )
                    })}
                </div>

                <Button
                    onClick={handleCreate}
                    className="h-9 px-4 rounded-xl font-normal uppercase tracking-widest gap-2 bg-primary text-primary-foreground hover:bg-primary/90 shadow-md shadow-primary/20 border-0"
                >
                    <Plus className="w-4 h-4" />
                    Novo Alimento
                </Button>
            </div>

            {/* Content Area */}
            <div className="flex flex-col gap-4">
                {isSearching ? (
                    <div className="flex flex-col items-center justify-center p-32 gap-6 bg-card/10 rounded-[3rem] border border-border/5">
                        <div className="relative">
                            <Utensils className="w-16 h-16 text-primary animate-pulse opacity-20" />
                            <div className="absolute inset-0 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                        </div>
                        <div className="flex flex-col items-center gap-1">
                            <span className="text-xs uppercase tracking-[0.4em] text-primary/60 font-medium animate-pulse">
                                Sincronizando Base
                            </span>
                            <span className="text-[10px] text-muted-foreground/40 italic">Acessando Tabelas Oficiais...</span>
                        </div>
                    </div>
                ) : (
                    <>
                        <FoodManagementTable
                            foods={searchResults?.results || []}
                            onEdit={handleEdit}
                            onCopy={handleCopy}
                            sourceFilter={sourceFilter}
                        />

                        {/* Pagination Controls */}
                        <div className="flex items-center justify-between p-4 bg-card border border-border/10 rounded-2xl shadow-sm mt-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1 || isSearching}
                                className="text-xs uppercase font-medium tracking-wider rounded-xl border-primary/20 text-primary hover:bg-primary/10 hover:text-primary disabled:opacity-50 h-8 w-24"
                            >
                                Anterior
                            </Button>
                            <div className="flex items-center justify-center h-8 w-24 bg-primary/10 rounded-xl border border-primary/20">
                                <span className="text-[10px] uppercase font-bold text-primary tracking-[0.1em]">
                                    Página {page}
                                </span>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage(p => p + 1)}
                                disabled={!searchResults?.next || isSearching}
                                className="text-xs uppercase font-medium tracking-wider rounded-xl border-primary/20 text-primary hover:bg-primary/10 hover:text-primary disabled:opacity-50 h-8 w-24"
                            >
                                Próxima
                            </Button>
                        </div>
                    </>
                )}
            </div>

            <FoodFormModal
                isOpen={isFormModalOpen}
                onClose={() => setIsFormModalOpen(false)}
                food={editingFood}
            />
        </div >
    )
}
