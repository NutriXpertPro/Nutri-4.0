
"use client"

import React from 'react'
import { Edit2, Trash2, Info, Lock, Copy } from 'lucide-react'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { cn } from '@/lib/utils'
import { Food } from '@/services/food-service'
import { customFoodService } from '@/services/custom-food-service'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

interface FoodManagementTableProps {
    foods: Food[]
    onEdit: (food: Food) => void
    onCopy: (food: Food) => void
    sourceFilter: string
}

export function FoodManagementTable({ foods, onEdit, onCopy, sourceFilter }: FoodManagementTableProps) {
    const queryClient = useQueryClient()

    const deleteMutation = useMutation({
        mutationFn: (id: number) => customFoodService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['foods-manage'] })
            toast.success("Alimento removido", { description: "O item foi excluído da sua tabela." })
        }
    })

    const handleDelete = (id: number) => {
        if (confirm("Tem certeza que deseja excluir este alimento permanentemente?")) {
            deleteMutation.mutate(id)
        }
    }

    if (foods.length === 0) {
        return (
            <Card className="p-20 flex flex-col items-center justify-center bg-card/20 border-border/10 rounded-3xl">
                <span className="text-muted-foreground text-sm italic">Nenhum alimento encontrado para esta fonte ou termo de busca.</span>
            </Card>
        )
    }

    return (
        <Card className="overflow-hidden bg-card/30 backdrop-blur-xl border-border/30 shadow-xl rounded-3xl animate-in fade-in duration-700">
            <Table>
                <TableHeader className="bg-muted/10">
                    <TableRow className="hover:bg-transparent border-border/5">
                        <TableHead className="w-[10px]"></TableHead>
                        <TableHead className="text-[11px] uppercase font-medium text-muted-foreground">Nome do Alimento</TableHead>
                        <TableHead className="text-[11px] uppercase font-medium text-muted-foreground w-[120px]">Fonte</TableHead>
                        <TableHead className="text-[11px] uppercase font-medium text-muted-foreground">Medida</TableHead>
                        <TableHead className="text-[11px] uppercase font-medium text-muted-foreground text-center">Kcal (100g)</TableHead>
                        <TableHead className="text-[11px] uppercase font-medium text-muted-foreground text-center">Prot (100g)</TableHead>
                        <TableHead className="text-[11px] uppercase font-medium text-muted-foreground text-center">Carb (100g)</TableHead>
                        <TableHead className="text-[11px] uppercase font-medium text-muted-foreground text-center">Gord (100g)</TableHead>
                        <TableHead className="text-[11px] uppercase font-medium text-right">Ações</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {foods.map((food) => {
                        const isEditable = String(food.source) === 'Sua Tabela'
                        const sourceColor = food.source === 'TACO' ? 'text-emerald-500 border-emerald-500/20' :
                            food.source === 'TBCA' ? 'text-orange-500 border-orange-500/20' :
                                food.source === 'USDA' ? 'text-blue-500 border-blue-500/20' :
                                    'text-primary border-primary/20 bg-primary/5';

                        return (
                            <TableRow key={`${food.source}-${food.id}`} className="hover:bg-primary/[0.03] transition-colors border-border/5 group">
                                <TableCell className="w-[10px] p-0">
                                    <div className={cn("w-1 h-full opacity-0 group-hover:opacity-100 transition-opacity bg-primary", isEditable && "opacity-50")} />
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-normal text-foreground">{food.nome}</span>
                                        <span className="text-[10px] uppercase tracking-wide text-muted-foreground/60">{food.grupo}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline" className={cn("text-[10px] font-medium uppercase", sourceColor)}>
                                        {food.source}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="text-xs text-muted-foreground">
                                            {food.unidade_caseira ? (
                                                <>
                                                    {food.unidade_caseira}
                                                    {food.peso_unidade_caseira_g && <span className="opacity-50"> ({Math.round(food.peso_unidade_caseira_g)}g)</span>}
                                                </>
                                            ) : (
                                                <span className="opacity-20">-</span>
                                            )}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-center font-mono text-xs">{Math.round(food.energia_kcal)}</TableCell>
                                <TableCell className="text-center font-mono text-xs">{food.proteina_g.toFixed(1)}</TableCell>
                                <TableCell className="text-center font-mono text-xs">{food.carboidrato_g.toFixed(1)}</TableCell>
                                <TableCell className="text-center font-mono text-xs">{food.lipidios_g.toFixed(1)}</TableCell>
                                <TableCell className="text-right">
                                    <div className="flex items-center justify-end gap-1">
                                        {isEditable ? (
                                            <>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-muted-foreground hover:text-blue-500 hover:bg-blue-500/10 transition-all rounded-xl"
                                                    onClick={() => onCopy(food)}
                                                    title="Duplicar"
                                                >
                                                    <Copy className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all rounded-xl"
                                                    onClick={() => onEdit(food)}
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all rounded-xl"
                                                    onClick={() => handleDelete(Number(food.id))}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </>
                                        ) : (
                                            <>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-muted-foreground hover:text-blue-500 hover:bg-blue-500/10 transition-all rounded-xl mr-1"
                                                    onClick={() => onCopy(food)}
                                                    title="Copiar para Minha Tabela"
                                                >
                                                    <Copy className="w-4 h-4" />
                                                </Button>
                                                <div className="flex items-center gap-1.5 px-3 py-1 bg-muted/10 border border-border/5 rounded-lg opacity-30 grayscale cursor-not-allowed">
                                                    <Lock className="w-2.5 h-2.5" />
                                                    <span className="text-[8px] font-medium uppercase tracking-[0.2em]">Protegido</span>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </TableCell>
                            </TableRow>
                        )
                    })}
                </TableBody>
            </Table>
        </Card >
    )
}
