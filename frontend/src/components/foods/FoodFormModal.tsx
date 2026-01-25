
"use client"

import React, { useState, useEffect } from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { customFoodService, CustomFood } from '@/services/custom-food-service'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Utensils, Info, Zap, Scale, Layers, Check, ChevronsUpDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

interface FoodFormModalProps {
    isOpen: boolean
    onClose: () => void
    food: CustomFood | null
}

export function FoodFormModal({ isOpen, onClose, food }: FoodFormModalProps) {
    const queryClient = useQueryClient()
    const [formData, setFormData] = useState<Partial<CustomFood>>({
        nome: '',
        grupo: '',
        energia_kcal: 0,
        proteina_g: 0,
        lipidios_g: 0,
        carboidrato_g: 0,
        fibra_g: 0,
        unidade_caseira: '',
        peso_unidade_caseira_g: 0
    })

    // Group Selector State
    const [openGroup, setOpenGroup] = useState(false)
    const [groupSearch, setGroupSearch] = useState("")
    const [inputMode, setInputMode] = useState<'100g' | 'serving'>('100g')
    const [servingWeight, setServingWeight] = useState<number | ''>('')

    // Fetch existing groups
    const { data: existingGroups = [] } = useQuery({
        queryKey: ['custom-food-groups'],
        queryFn: customFoodService.getGroups,
        enabled: isOpen
    })

    useEffect(() => {
        if (food) {
            setFormData(food)
        } else {
            setFormData({
                nome: '',
                grupo: '',
                energia_kcal: 0,
                proteina_g: 0,
                lipidios_g: 0,
                carboidrato_g: 0,
                fibra_g: 0,
                unidade_caseira: '',
                peso_unidade_caseira_g: undefined
            })
        }
    }, [food, isOpen])

    const mutation = useMutation({
        mutationFn: (data: Partial<CustomFood>) => {
            if (food?.id) {
                return customFoodService.update(food.id, data)
            }
            return customFoodService.create(data)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['foods-manage'] })
            toast.success(food ? "Alimento atualizado" : "Alimento criado", {
                description: "As alterações foram salvas na sua tabela pessoal."
            })
            onClose()
        }
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        let finalData = { ...formData }

        if (inputMode === 'serving' && servingWeight && Number(servingWeight) > 0) {
            // Convert serving macros to 100g base for storage
            const weight = Number(servingWeight)
            const factor = 100 / weight

            finalData = {
                ...finalData,
                energia_kcal: Math.round((Number(formData.energia_kcal) || 0) * factor),
                proteina_g: (Number(formData.proteina_g) || 0) * factor,
                carboidrato_g: (Number(formData.carboidrato_g) || 0) * factor,
                lipidios_g: (Number(formData.lipidios_g) || 0) * factor,
                fibra_g: (Number(formData.fibra_g) || 0) * factor,
                // Ensure serving info is saved as household measure if not already set
                peso_unidade_caseira_g: Number(formData.peso_unidade_caseira_g) || weight,
                unidade_caseira: formData.unidade_caseira || 'Porção'
            }
        }

        mutation.mutate(finalData)
    }

    const autoCalcKcal = () => {
        const kcal = (Number(formData.proteina_g || 0) * 4) +
            (Number(formData.carboidrato_g || 0) * 4) +
            (Number(formData.lipidios_g || 0) * 9)
        setFormData(prev => ({ ...prev, energia_kcal: Math.round(kcal) }))
    }

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[600px] bg-card/95 backdrop-blur-2xl border-border/40 rounded-[2rem] shadow-2xl p-0 overflow-hidden">
                <form onSubmit={handleSubmit}>
                    <DialogHeader className="p-8 pb-4 bg-primary/5">
                        <div className="flex items-center gap-3 mb-2 text-primary">
                            <Utensils className="w-6 h-6" />
                            <DialogTitle className="text-xl font-medium uppercase tracking-tight">
                                {food ? 'Editar' : 'Cadastrar'} <span className="text-foreground">Alimento</span>
                            </DialogTitle>
                        </div>
                        <p className="text-muted-foreground text-sm">
                            {food ? 'Atualize as informações nutricionais do item.' : 'Adicione um novo alimento à sua tabela personalizada.'}
                        </p>
                    </DialogHeader>

                    <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Básicos */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground/60 mb-2">
                                <Info className="w-3 h-3" /> Identificação
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">Nome do Alimento</Label>
                                <Input
                                    className="bg-muted/30 border-border/10 rounded-xl"
                                    value={formData.nome}
                                    onChange={e => setFormData(p => ({ ...p, nome: e.target.value }))}
                                    required
                                />
                            </div>
                            <div className="space-y-2 flex flex-col">
                                <Label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">Grupo Alimentar</Label>
                                <Popover open={openGroup} onOpenChange={setOpenGroup}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            role="combobox"
                                            aria-expanded={openGroup}
                                            className="justify-between bg-muted/30 border-border/10 rounded-xl h-10 font-normal hover:bg-muted/50"
                                        >
                                            {formData.grupo || "Selecione ou digite..."}
                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="p-0 w-[--radix-popover-trigger-width] rounded-xl shadow-xl">
                                        <Command>
                                            <CommandInput
                                                placeholder="Buscar grupo..."
                                                onValueChange={(val) => setGroupSearch(val)}
                                            />
                                            <CommandList>
                                                <CommandEmpty className="py-2 px-4 text-xs text-muted-foreground">
                                                    <div className="flex flex-col gap-2">
                                                        <span>Grupo não encontrado.</span>
                                                        <Button
                                                            variant="secondary"
                                                            size="sm"
                                                            className="h-7 text-xs bg-primary/10 text-primary hover:bg-primary/20"
                                                            onClick={() => {
                                                                setFormData(p => ({ ...p, grupo: groupSearch }))
                                                                setOpenGroup(false)
                                                            }}
                                                        >
                                                            Usar "{groupSearch}"
                                                        </Button>
                                                    </div>
                                                </CommandEmpty>
                                                <CommandGroup heading="Grupos Existentes">
                                                    {existingGroups.map((group) => (
                                                        <CommandItem
                                                            key={group}
                                                            onSelect={() => {
                                                                setFormData(p => ({ ...p, grupo: group }))
                                                                setOpenGroup(false)
                                                            }}
                                                            className="text-sm cursor-pointer"
                                                        >
                                                            <Check
                                                                className={cn(
                                                                    "mr-2 h-4 w-4",
                                                                    formData.grupo === group ? "opacity-100" : "opacity-0"
                                                                )}
                                                            />
                                                            {group}
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                            </div>

                            <div className="pt-4 space-y-4">
                                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground/60 mb-2">
                                    <Scale className="w-3 h-3" /> Medida Caseira
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">Unidade (Ex: 1 Colher de sopa)</Label>
                                    <Input
                                        className="bg-muted/30 border-border/10 rounded-xl"
                                        value={formData.unidade_caseira || ''}
                                        onChange={e => setFormData(p => ({ ...p, unidade_caseira: e.target.value }))}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">Peso da Unidade (g)</Label>
                                    <Input
                                        type="number"
                                        className="bg-muted/30 border-border/10 rounded-xl"
                                        value={formData.peso_unidade_caseira_g || ''}
                                        onChange={e => setFormData(p => ({ ...p, peso_unidade_caseira_g: e.target.value ? Number(e.target.value) : undefined }))}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Macros */}
                        <div className="space-y-4 bg-muted/20 p-6 rounded-3xl border border-border/10">
                            <div className="flex flex-col gap-3">
                                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest text-muted-foreground/60">
                                    <span className="flex items-center gap-2"><Layers className="w-3 h-3" /> Informação Nutricional</span>
                                    <Button type="button" variant="ghost" size="sm" className="h-6 text-[8px] hover:text-primary gap-1" onClick={autoCalcKcal}>
                                        <Zap className="w-2 h-2" /> Calcular Kcal
                                    </Button>
                                </div>

                                {/* Input Mode Switcher */}
                                <div className="flex bg-background/50 p-1 rounded-xl border border-border/10">
                                    <button
                                        type="button"
                                        onClick={() => setInputMode('100g')}
                                        className={cn(
                                            "flex-1 py-1.5 text-[10px] uppercase font-bold tracking-wider rounded-lg transition-all",
                                            inputMode === '100g'
                                                ? "bg-primary text-primary-foreground shadow-sm"
                                                : "text-muted-foreground hover:bg-muted/50"
                                        )}
                                    >
                                        Por 100g
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setInputMode('serving')}
                                        className={cn(
                                            "flex-1 py-1.5 text-[10px] uppercase font-bold tracking-wider rounded-lg transition-all",
                                            inputMode === 'serving'
                                                ? "bg-primary text-primary-foreground shadow-sm"
                                                : "text-muted-foreground hover:bg-muted/50"
                                        )}
                                    >
                                        Por Porção
                                    </button>
                                </div>

                                {inputMode === 'serving' && (
                                    <div className="space-y-2 animate-in fade-in slide-in-from-top-1">
                                        <Label className="text-[10px] uppercase font-bold text-primary ml-1">Peso da Porção (g/ml)</Label>
                                        <Input
                                            type="number"
                                            className="bg-primary/5 border-primary/20 rounded-xl"
                                            value={servingWeight}
                                            onChange={e => setServingWeight(e.target.value === '' ? '' : Number(e.target.value))}
                                            placeholder="Ex: 30g (1 unidade)"
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">Proteína (g)</Label>
                                    <Input
                                        type="number" step="0.1"
                                        className="bg-background border-border/20 rounded-xl"
                                        value={formData.proteina_g === 0 ? '' : formData.proteina_g}
                                        onChange={e => setFormData(p => ({ ...p, proteina_g: e.target.value === '' ? 0 : Number(e.target.value) }))}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">Carbos (g)</Label>
                                    <Input
                                        type="number" step="0.1"
                                        className="bg-background border-border/20 rounded-xl"
                                        value={formData.carboidrato_g === 0 ? '' : formData.carboidrato_g}
                                        onChange={e => setFormData(p => ({ ...p, carboidrato_g: e.target.value === '' ? 0 : Number(e.target.value) }))}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">Gordura (g)</Label>
                                    <Input
                                        type="number" step="0.1"
                                        className="bg-background border-border/20 rounded-xl"
                                        value={formData.lipidios_g === 0 ? '' : formData.lipidios_g}
                                        onChange={e => setFormData(p => ({ ...p, lipidios_g: e.target.value === '' ? 0 : Number(e.target.value) }))}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">Fibra (g)</Label>
                                    <Input
                                        type="number" step="0.1"
                                        className="bg-background border-border/20 rounded-xl"
                                        value={formData.fibra_g === 0 ? '' : formData.fibra_g}
                                        onChange={e => setFormData(p => ({ ...p, fibra_g: e.target.value === '' ? 0 : Number(e.target.value) }))}
                                    />
                                </div>
                            </div>

                            <div className="pt-4 border-t border-border/10 space-y-2">
                                <Label className="text-[10px] uppercase font-bold text-primary ml-1 flex items-center gap-1">
                                    <Zap className="w-3 h-3" /> Energia Total (kcal)
                                </Label>
                                <Input
                                    type="number"
                                    className="bg-primary/5 border-primary/10 h-12 text-xl font-medium text-primary rounded-xl"
                                    value={formData.energia_kcal || 0}
                                    onChange={e => setFormData(p => ({ ...p, energia_kcal: Number(e.target.value) }))}
                                />
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="bg-muted/30 p-6 flex flex-col md:flex-row gap-2 border-t border-border/10">
                        <Button type="button" variant="ghost" onClick={onClose} className="rounded-xl uppercase font-bold text-xs">Cancelar</Button>
                        <Button
                            type="submit"
                            className="rounded-xl px-10 uppercase font-medium tracking-widest shadow-md"
                            disabled={mutation.isPending}
                        >
                            {mutation.isPending ? 'Salvando...' : 'Confirmar e Salvar'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
