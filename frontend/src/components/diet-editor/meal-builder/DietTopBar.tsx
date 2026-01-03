"use client"

import React, { useEffect } from 'react'
import { useDietEditorStore } from '@/stores/diet-editor-store'
import { Button } from "@/components/ui/button"
import { Settings, Star, X } from 'lucide-react'
import { cn } from "@/lib/utils"

const DAYS = [
    { id: 'Seg', label: 'Seg' },
    { id: 'Ter', label: 'Ter' },
    { id: 'Qua', label: 'Qua' },
    { id: 'Qui', label: 'Qui' },
    { id: 'Sex', label: 'Sex' },
    { id: 'Sab', label: 'Sáb' },
    { id: 'Dom', label: 'Dom' },
]

export function DietTopBar() {
    const {
        activeWorkspaceDay,
        setActiveWorkspaceDay,
        favorites,
        workspaceMeals,
        addFoodToWorkspaceMeal,
        loadFavorites,
        removeFavorite
    } = useDietEditorStore()

    useEffect(() => {
        loadFavorites()
    }, [loadFavorites])

    // Find the currently active meal in the workspace (first one not collapsed or just use a default)
    // For simplicity, we'll try to find an active one or use the first one if only one exists
    const activeMealId = workspaceMeals.length > 0 ? workspaceMeals[0].id : null

    return (
        <div className="glass-header sticky top-0 z-30 border-b border-border/50 shadow-sm backdrop-blur-md">
            <div className="px-6 py-2 flex flex-col gap-3">

                {/* Unified Toolbar */}
                <div className="flex items-center justify-between gap-4">
                    {/* Placeholder for future day selectors or other tools */}
                </div>

                {/* 3. Favorites Quick Bar - Premium Carousel */}
                <div className="flex items-center gap-4 pt-2 border-t border-border/5 translate-y-[35px]">
                    <div className="flex items-center gap-2 min-w-max text-[10px] font-black text-amber-500/80 mx-1 uppercase tracking-widest">
                        <Star className="w-4 h-4 fill-amber-500/20" />
                        Favoritos
                    </div>

                    <div className="flex items-center gap-3 flex-1 overflow-x-auto no-scrollbar py-2 px-1">
                        {favorites.length === 0 ? (
                            <span className="text-[10px] font-bold text-muted-foreground/40 italic px-2">
                                Escolha seus alimentos favoritos na busca para acesso rápido.
                            </span>
                        ) : (
                            favorites.map((fav) => {
                                const sourceColors = {
                                    'TACO': 'text-emerald-500 border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 hover:border-emerald-500/40',
                                    'TBCA': 'text-orange-500 border-orange-500/20 bg-orange-500/5 hover:bg-orange-500/10 hover:border-orange-500/40',
                                    'USDA': 'text-blue-500 border-blue-500/20 bg-blue-500/5 hover:bg-blue-500/10 hover:border-blue-500/40',
                                    'IBGE': 'text-violet-500 border-violet-500/20 bg-violet-500/5 hover:bg-violet-500/10 hover:border-violet-500/40'
                                }
                                const colorClass = sourceColors[fav.source as keyof typeof sourceColors] || 'text-primary border-primary/20 bg-primary/5'

                                return (
                                    <div key={fav.id} className="relative group/fav group">
                                        <button
                                            onClick={() => activeMealId && addFoodToWorkspaceMeal(activeMealId, fav)}
                                            className={cn(
                                                "w-10 h-10 flex items-center justify-center rounded-2xl border transition-all transform hover:scale-110 active:scale-95 shadow-sm",
                                                colorClass
                                            )}
                                            title={`Adicionar ${fav.nome}`}
                                        >
                                            <span className="text-xl leading-none">{getFoodIcon(fav.nome, fav.grupo)}</span>
                                        </button>

                                        {/* Remove Favorite Button */}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (window.confirm(`Deseja mesmo excluir ${fav.nome} dos favoritos?`)) {
                                                    removeFavorite(fav.id, fav.source, fav.nome);
                                                }
                                            }}
                                            className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-background border border-border shadow-md rounded-full flex items-center justify-center opacity-0 group-hover/fav:opacity-100 hover:bg-destructive hover:text-white transition-all z-10 scale-0 group-hover/fav:scale-100"
                                            title="Remover favorito"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>

                                        {/* Name Tooltip on Hover */}
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-background border border-border shadow-xl rounded-xl opacity-0 group-hover:opacity-100 transition-all pointer-events-none whitespace-nowrap z-50 transform translate-y-1 group-hover:translate-y-0">
                                            <div className="flex flex-col items-center">
                                                <span className={cn("text-[11px] font-black uppercase tracking-tight", colorClass.split(' ')[0])}>
                                                    {fav.nome}
                                                </span>
                                                <span className="text-[8px] font-bold text-muted-foreground/60 uppercase tracking-widest mt-0.5">
                                                    {fav.source} • {fav.grupo}
                                                </span>
                                            </div>
                                            {/* Tooltip Arrow */}
                                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-border" />
                                        </div>
                                    </div>
                                )
                            })
                        )}
                    </div>
                </div>

            </div>
        </div>
    )
}

export function getFoodIcon(name: string, group: string): string {
    const n = name.toLowerCase()
    const g = group ? group.toLowerCase() : ''

    // -------------------------------------------------------------------------
    // 0. SPECIFIC DISHES (High Priority)
    // -------------------------------------------------------------------------
    if (n.includes('cabidela') || n.includes('molho pardo')) return '🥘'
    if (n.includes('risoto')) return '🍛'

    // -------------------------------------------------------------------------
    // 1. DRINKS / BEVERAGES
    // -------------------------------------------------------------------------
    if (n.includes('café') || n.includes('cafe') || n.includes('expresso')) return '☕'
    if (n.includes('chá') || n.includes('cha') || n.includes('infusão')) return '🍵'
    if (n.includes('água de coco') || n.includes('agua de coco') || (n.includes('agua') && n.includes('coco')) || n.includes('coco')) return '🥥'
    if (n.includes('água') || n.includes('agua')) return '🚰'
    if (n.includes('suco') || n.includes('refresco') || n.includes('refrigerante') || n.includes('bebida') || n.includes('nektar')) return '🥤'
    if (n.includes('leite') || n.includes('iogurte') || n.includes('coalhada') || n.includes('whey')) return '🥛'
    if (n.includes('cerveja') || n.includes('chopp')) return '🍺'
    if (n.includes('vinho')) return '🍷'
    if (n.includes('drink') || n.includes('cocktail') || n.includes('batida')) return '🍹'
    if (n.includes('champagne') || n.includes('espumante')) return '🥂'
    if (n.includes('whisky') || n.includes('vodka') || n.includes('licor') || n.includes('destilado')) return '🥃'

    // -------------------------------------------------------------------------
    // 2. FRUITS (Individual Matches)
    // -------------------------------------------------------------------------
    if (n.includes('uva')) return '🍇'
    if (n.includes('melão') || n.includes('melao')) return '🍈'
    if (n.includes('melancia')) return '🍉'
    if (n.includes('laranja') || n.includes('mexerica') || n.includes('tangerina') || n.includes('citrus')) return '🍊'
    if (n.includes('limão') || n.includes('limao')) return '🍋'
    if (n.includes('banana')) return '🍌'
    if (n.includes('abacaxi')) return '🍍'
    if (n.includes('manga')) return '🥭'
    if (n.includes('maçã') && n.includes('verde')) return '🍏'
    if (n.includes('maçã') && !n.includes('verde')) return '🍎'
    if (n === 'maca' || n === 'maçã') return '🍎'
    if (n.includes('pera') || n.includes('pêra')) return '🍐'
    if (n.includes('pêssego') || n.includes('pessego')) return '🍑'
    if (n.includes('cereja')) return '🍒'
    if (n.includes('morango')) return '🍓'
    if (n.includes('mirtilo') || n.includes('blueberry')) return '🫐'
    if (n.includes('kiwi')) return '🥝'
    if (n.includes('tomate')) return '🍅'
    if (n.includes('azeitona') || n.includes('olive')) return '🫒'
    if (n.includes('abacate')) return '🥑'

    // -------------------------------------------------------------------------
    // 3. VEGETABLES & TUBERS
    // -------------------------------------------------------------------------
    // Tubers and Roots (Priority before "sweets")
    if ((n.includes('batata') && n.includes('doce')) || n.includes('inhame')) return '🍠'
    if (n.includes('batata')) return '🥔'
    if (n.includes('mandioca') || n.includes('aipim') || n.includes('macaxeira') || n.includes('mandioquinha')) return '🥔'
    if (n.includes('cará') || n.includes('cara')) return '🥔'

    if (n.includes('cenoura')) return '🥕'
    if (n.includes('milho')) return '🌽'
    if (n.includes('pimenta') || n.includes('chill')) return '🌶️'
    if (n.includes('pimentão') || n.includes('pimentao')) return '🫑'
    if (n.includes('pepino')) return '🥒'
    if (n.includes('alface') || n.includes('folha') || n.includes('couve') || n.includes('espinafre')) return '🥬'
    if (n.includes('brócolis') || n.includes('brocolis')) return '🥦'
    if (n.includes('cogumelo') || n.includes('champignon')) return '🍄'
    if (n.includes('castanha') || n.includes('amendoim') || n.includes('amêndoa') || n.includes('nozes')) return '🥜'
    if (n.includes('cebola')) return '🧅'
    if (n.includes('alho')) return '🧄'
    if (n.includes('gengibre')) return '🫚'
    if (n.includes('ervilha') || n.includes('feijão verde')) return '🫛'
    if (n.includes('berinjela')) return '🍆'

    // -------------------------------------------------------------------------
    // 4. MEATS & PROTEINS
    // -------------------------------------------------------------------------
    if (n.includes('ovo') || n.includes('omelete')) return '🥚'
    if (n.includes('bacon') || n.includes('toucinho')) return '🥓'
    if (n.includes('presunto') || n.includes('apresuntado')) return '🥩'
    if (n.includes('frango') || n.includes('sobrecoxa') || n.includes('peito de frango') || n.includes('peru')) return '🍗'
    if (n.includes('carne') || n.includes('bife') || n.includes('picanha') || n.includes('alcatra') || n.includes('bovino')) return '🥩'
    if (n.includes('peixe') || n.includes('salmão') || n.includes('salmao') || n.includes('atum') || n.includes('tilápia')) return '🐟'
    if (n.includes('camarão') || n.includes('camarao')) return '🍤'
    if (n.includes('lagosta')) return '🦞'
    if (n.includes('caranguejo') || n.includes('siri')) return '🦀'
    if (n.includes('lula') || n.includes('polvo')) return '🦑'

    // -------------------------------------------------------------------------
    // 5. CARBS & BAKERY
    // -------------------------------------------------------------------------
    if (n.includes('pão') || n.includes('pao') || n.includes('tapioca') || n.includes('cuzcuz')) return '🍞'
    if (n.includes('croissant')) return '🥐'
    if (n.includes('baguete')) return '🥖'
    if (n.includes('pretzel')) return '🥨'
    if (n.includes('bagel')) return '🥯'
    if (n.includes('panqueca')) return '🥞'
    if (n.includes('waffle')) return '🧇'
    if (n.includes('queijo') || n.includes('mussarela') || n.includes('parmesão') || n.includes('ricota')) return '🧀'
    if (n.includes('pizza')) return '🍕'
    if (n.includes('hamburger') || n.includes('hambúrguer') || n.includes('burguer')) return '🍔'
    if (n.includes('frita') || n.includes('batata frita')) return '🍟'
    if (n.includes('hot dog') || n.includes('cachorro quente')) return '🌭'
    if (n.includes('sanduiche') || n.includes('misto quente')) return '🥪'
    if (n.includes('taco')) return '🌮'
    if (n.includes('burrito')) return '🌯'
    if (n.includes('salada')) return '🥗'
    if (n.includes('arroz') || n.includes('risoto')) return '🍚'
    if (n.includes('macarrão') || n.includes('massas') || n.includes('espaguete') || n.includes('lasanha')) return '🍝'
    if (n.includes('feijão') || n.includes('feijao') || n.includes('lentilha') || n.includes('grão') || n.includes('grao')) return '🍲'
    if (n.includes('sushi') || n.includes('temaki')) return '🍣'
    if (n.includes('pipoca')) return '🍿'
    if (n.includes('biscoito') || n.includes('bolacha')) return '🍪'

    // -------------------------------------------------------------------------
    // 6. SWEETS & DESSERTS
    // -------------------------------------------------------------------------
    // Sweets (Checks for "batata doce" handled above by potato icon)
    if (n.includes('doce') || n.includes('bolo') || n.includes('torta') || n.includes('açúcar') || n.includes('acucar') || n.includes('chocolate') || n.includes('sobremesa') || n.includes('pudim')) return '🍰'
    if (n.includes('sorvete') || n.includes('gelato')) return '🍦'
    if (n.includes('donut') || n.includes('rosquinha')) return '🍩'
    if (n.includes('cupcake')) return '🧁'
    if (n.includes('pirulito')) return '🍭'
    if (n.includes('mel')) return '🍯'

    // -------------------------------------------------------------------------
    // Fallback Group Based Matches
    // -------------------------------------------------------------------------
    if (g.includes('carne') || g.includes('bovino') || g.includes('suíno')) return '🥩'
    if (g.includes('ave') || g.includes('frango')) return '🍗'
    if (g.includes('peixe') || g.includes('frutos do mar')) return '🐟'
    if (g.includes('leite') || g.includes('laticínio') || g.includes('queijo')) return '🥛'
    if (g.includes('ovo')) return '🥚'
    if (g.includes('legume') || g.includes('verdura') || g.includes('hortaliça') || g.includes('vegetal')) return '🥦'
    if (g.includes('fruta')) return '🍎'
    if (g.includes('cereal') || g.includes('pão') || g.includes('pao') || g.includes('arroz') || g.includes('farinha')) return '🍞'
    if (g.includes('tubérculo') || g.includes('raiz')) return '🥔'
    if (g.includes('óleo') || g.includes('gordura') || g.includes('semente') || g.includes('oleaginosa')) return '🥑'
    if (g.includes('açúcar') || g.includes('doce') || g.includes('confeitaria')) return '🍬'
    if (g.includes('bebida') || g.includes('suco') || g.includes('infusão')) return '🥤'

    return '🍽️'
}