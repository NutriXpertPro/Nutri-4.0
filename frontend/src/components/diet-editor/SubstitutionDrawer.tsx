"use client"

import { motion, AnimatePresence } from 'framer-motion'
import {
    Star,
    X,
    ArrowRight,
    CheckCircle2,
    Sparkles,
    Loader2
} from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog"
import api from '@/services/api'
import type { Food } from '@/services/food-service'
import type { DietType } from '@/stores/diet-editor-store'
import { DIET_TYPE_MACROS } from '@/stores/diet-editor-store'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'

interface Substitution {
    id: string
    food: Food
    suggested_quantity: number
    similarity_score: number
    is_favorite: boolean
    is_selected: boolean
    priority: number
    notes?: string
}

interface SubstitutionDrawerProps {
    isOpen: boolean
    onClose: () => void
    originalFood: Food
    originalQuantity: number
    dietType: DietType
    onSubstitute: (food: Food, quantity: number) => void
}

export function SubstitutionDrawer({
    isOpen,
    onClose,
    originalFood,
    originalQuantity,
    dietType,
    onSubstitute
}: SubstitutionDrawerProps) {
    const [substitutions, setSubstitutions] = useState<Substitution[]>([])
    const [loading, setLoading] = useState(false)
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
    const [saving, setSaving] = useState(false)

    // Buscar substituições ao abrir
    useEffect(() => {
        if (isOpen && originalFood) {
            fetchSubstitutions()
        }
    }, [isOpen, originalFood, dietType])

    const fetchSubstitutions = async () => {
        setLoading(true)
        try {
            // Calcular o alvo real baseado no que está na tela (evita desvios do banco)
            const ratio = (originalQuantity || 100) / 100
            const targetPtn = originalFood.proteina_g * ratio
            const targetCho = originalFood.carboidrato_g * ratio
            const targetFat = originalFood.lipidios_g * ratio

            const response = await api.get('diets/substitutions/suggest/', {
                params: {
                    food_id: originalFood.id,
                    food_name: originalFood.nome,
                    food_source: originalFood.source || 'TACO',
                    quantity: originalQuantity,
                    diet_type: dietType,
                    // Passar targets explícitos para cálculo blindado
                    orig_ptn: targetPtn.toFixed(2),
                    orig_cho: targetCho.toFixed(2),
                    orig_fat: targetFat.toFixed(2)
                }
            })

            setSubstitutions(response.data.substitutions)

            // Marcar como selecionados os que já estiverem marcados
            const preSelected = new Set<string>()
            response.data.substitutions.forEach((sub: Substitution) => {
                if (sub.is_selected) {
                    preSelected.add(sub.id)
                }
            })
            setSelectedIds(preSelected)
        } catch (error) {
            console.error('Erro ao buscar substituições:', error)
            toast.error('Erro ao carregar substituições', {
                description: 'Não foi possível carregar as opções de substituição.'
            })
        } finally {
            setLoading(false)
        }
    }

    const toggleFavorite = async (substitutionId: string) => {
        try {
            await api.post('diets/substitutions/toggle-favorite/', {
                substitution_id: substitutionId,
                is_favorite: !substitutions.find(s => s.id === substitutionId)?.is_favorite
            })

            // Atualizar estado local
            setSubstitutions(prev => prev.map(sub =>
                sub.id === substitutionId
                    ? { ...sub, is_favorite: !sub.is_favorite }
                    : sub
            ))
        } catch (error) {
            console.error('Erro ao atualizar favorita:', error)
            toast.error('Erro ao atualizar favorito', {
                description: 'Não foi possível alterar o status do favorito.'
            })
        }
    }

    const handleSelect = (substitutionId: string) => {
        const newSelected = new Set(selectedIds)
        if (newSelected.has(substitutionId)) {
            newSelected.delete(substitutionId)
        } else {
            newSelected.add(substitutionId)
        }
        setSelectedIds(newSelected)
    }

    const handleSaveSelection = async () => {
        setSaving(true)
        try {
            // Salvar as substituições selecionadas
            await api.post('diets/substitutions/save-selection/', {
                original_food_id: originalFood.id,
                diet_type: dietType,
                selected_substitution_ids: Array.from(selectedIds)
            })

            // Aplicar a primeira substituição selecionada
            const firstSelected = substitutions.find(s => s.id === Array.from(selectedIds)[0])
            if (firstSelected) {
                onSubstitute(firstSelected.food, firstSelected.suggested_quantity)
                toast.success('Substituição aplicada!', {
                    description: `${firstSelected.food.nome} foi adicionado à dieta.`
                })
            }

            onClose()
        } catch (error) {
            console.error('Erro ao salvar seleção:', error)
            toast.error('Erro ao salvar seleção', {
                description: 'Não foi possível salvar as substituições selecionadas.'
            })
        } finally {
            setSaving(false)
        }
    }

    // Separar favoritas de não favoritas
    const favorites = substitutions.filter(s => s.is_favorite)
    const others = substitutions.filter(s => !s.is_favorite)

    if (!originalFood) {
        return (
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Nenhum alimento selecionado</DialogTitle>
                    </DialogHeader>
                    <p>Por favor, selecione um alimento para ver as substituições.</p>
                </DialogContent>
            </Dialog>
        )
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <ArrowRight className="w-5 h-5 text-amber-600" />
                        Substituições para "{originalFood.nome}"
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Informações do alimento original */}
                    <Card className="bg-muted/50 border-muted">
                        <div className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="font-semibold">{originalFood.nome}</div>
                                    <div className="text-sm text-muted-foreground">
                                        {(originalQuantity || 100)}g • {originalFood.proteina_g.toFixed(1)}g P • {originalFood.carboidrato_g.toFixed(1)}g C • {originalFood.lipidios_g.toFixed(1)}g G
                                    </div>
                                </div>
                                <Badge variant="outline">
                                    {DIET_TYPE_MACROS[dietType]?.label || ((dietType as any) === 'balanced' ? 'Normocalórica' : dietType)}
                                </Badge>
                            </div>
                        </div>
                    </Card>

                    {/* Loading */}
                    {loading && (
                        <div className="flex items-center justify-center p-8">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        </div>
                    )}

                    {/* Lista de substituições */}
                    {!loading && (
                        <>
                            {/* Se houver favoritas */}
                            {favorites.length > 0 && (
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-sm font-semibold text-amber-600">
                                        <Sparkles className="w-4 h-4" />
                                        SUAS SUGESTÕES FAVORITAS
                                    </div>

                                    {favorites.map((sub) => (
                                        <SubstitutionCard
                                            key={sub.id}
                                            substitution={sub}
                                            isSelected={selectedIds.has(sub.id)}
                                            onSelect={() => handleSelect(sub.id)}
                                            onToggleFavorite={() => toggleFavorite(sub.id)}
                                        />
                                    ))}
                                </div>
                            )}

                            {/* Outras opções */}
                            {others.length > 0 && (
                                <div className="space-y-3">
                                    <div className="text-sm font-semibold text-muted-foreground">
                                        OUTRAS OPÇÕES DISPONÍVEIS
                                    </div>

                                    {others.map((sub) => (
                                        <SubstitutionCard
                                            key={sub.id}
                                            substitution={sub}
                                            isSelected={selectedIds.has(sub.id)}
                                            onSelect={() => handleSelect(sub.id)}
                                            onToggleFavorite={() => toggleFavorite(sub.id)}
                                        />
                                    ))}
                                </div>
                            )}

                            {/* Sem substituições */}
                            {!loading && substitutions.length === 0 && (
                                <div className="text-center py-8 text-muted-foreground">
                                    Nenhuma substituição disponível para este alimento
                                    no tipo de dieta selecionado.
                                </div>
                            )}
                        </>
                    )}

                    {/* Ações */}
                    {!loading && substitutions.length > 0 && (
                        <div className="flex justify-between pt-4 border-t">
                            <Button variant="ghost" onClick={onClose}>
                                <X className="w-4 h-4 mr-2" />
                                Cancelar
                            </Button>
                            <Button
                                onClick={handleSaveSelection}
                                disabled={selectedIds.size === 0 || saving}
                            >
                                {saving ? (
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                ) : (
                                    <CheckCircle2 className="w-4 h-4 mr-2" />
                                )}
                                {saving ? 'Salvando...' : 'Salvar Selecionadas'}
                            </Button>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}

// Subcomponente: Card de cada substituição
function SubstitutionCard({
    substitution,
    isSelected,
    onSelect,
    onToggleFavorite
}: {
    substitution: Substitution
    isSelected: boolean
    onSelect: () => void
    onToggleFavorite: () => void
}) {
    return (
        <Card
            className={`cursor-pointer transition-all ${isSelected
                ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/20'
                : 'hover:border-primary/50'
                }`}
            onClick={() => onSelect()}
        >
            <div className="p-3">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <div className="flex items-center gap-3">
                            {/* Checkbox visual */}
                            <div className={`w-5 h-5 rounded border flex items-center justify-center ${isSelected
                                ? 'bg-amber-500 border-amber-500 text-white'
                                : 'border-muted'
                                }`}>
                                {isSelected && <CheckCircle2 className="w-3 h-3" />}
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2 mb-0.5">
                                    <div className="font-bold text-xs text-primary truncate">{substitution.food.nome}</div>
                                    <div className="text-xs font-bold text-amber-600 whitespace-nowrap">
                                        {substitution.suggested_quantity}g
                                    </div>
                                </div>
                                <div className="text-[10px] text-muted-foreground">
                                    {((substitution.suggested_quantity / 100) * substitution.food.proteina_g).toFixed(1)}g P • {((substitution.suggested_quantity / 100) * substitution.food.carboidrato_g).toFixed(1)}g C • {((substitution.suggested_quantity / 100) * substitution.food.lipidios_g).toFixed(1)}g G
                                </div>
                            </div>
                        </div>

                        {/* Similaridade e notas */}
                        {substitution.notes && (
                            <div className="mt-1 text-[9px] text-muted-foreground ml-8 leading-tight">
                                {substitution.notes}
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col items-end gap-2">
                        {/* Similaridade */}
                        <Badge
                            variant={substitution.similarity_score >= 0.8 ? "default" : "secondary"}
                            className="text-xs"
                        >
                            {Math.round(substitution.similarity_score * 100)}% similar
                        </Badge>

                        {/* Botão de favorito */}
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                                e.stopPropagation()
                                onToggleFavorite()
                            }}
                            className="p-1"
                        >
                            {substitution.is_favorite ? (
                                <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                            ) : (
                                <Star className="w-4 h-4" />
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </Card>
    )
}
