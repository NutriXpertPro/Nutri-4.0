"use client"

import React from 'react'
import { 
  Beef, 
  Fish, 
  Soup, 
  Apple, 
  Banana, 
  Citrus, 
  Grape, 
  Sandwich, 
  Pizza, 
  Coffee, 
  Milk, 
  Wheat, 
  Utensils, 
  Flame,
  Egg,
  Drumstick,
  Carrot,
  Salad,
  Popcorn,
  Cookie,
  IceCream,
  GlassWater,
  Beer,
  Wine,
  Folder,
  ChefHat,
  Shell
} from 'lucide-react'
import { cn } from "@/lib/utils"

interface FoodIconProps {
  name: string
  group?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

export function FoodIcon({ name, group, size = 'md', className }: FoodIconProps) {
  const n = name.toLowerCase()
  const g = group ? group.toLowerCase() : ''

  // Icon mapping logic
  const getIconConfig = () => {
    // 1. Proteins
    if (n.includes('ovo') || n.includes('omelete')) return { Icon: Egg, color: 'text-orange-500', bg: 'bg-orange-500/10' }
    if (n.includes('frango') || n.includes('sobrecoxa') || n.includes('peru') || n.includes('ave')) return { Icon: Drumstick, color: 'text-amber-600', bg: 'bg-amber-600/10' }
    if (n.includes('carne') || n.includes('bife') || n.includes('bovino') || n.includes('suíno') || n.includes('steak') || n.includes('picanha')) return { Icon: Beef, color: 'text-red-500', bg: 'bg-red-500/10' }
    if (n.includes('peixe') || n.includes('salmão') || n.includes('atum') || n.includes('tilápia') || n.includes('bacalhau')) return { Icon: Fish, color: 'text-blue-500', bg: 'bg-blue-500/10' }
    if (n.includes('camarão') || n.includes('lagosta') || n.includes('siri') || n.includes('caranguejo')) return { Icon: Shell, color: 'text-rose-400', bg: 'bg-rose-400/10' }

    // 2. Vegetables & Fruits
    if (n.includes('salada') || n.includes('alface') || n.includes('folha') || n.includes('couve') || n.includes('rúcula')) return { Icon: Salad, color: 'text-emerald-500', bg: 'bg-emerald-500/10' }
    if (n.includes('cenoura') || n.includes('abóbora') || n.includes('pimentão')) return { Icon: Carrot, color: 'text-orange-400', bg: 'bg-orange-400/10' }
    if (n.includes('fruta') || n.includes('maçã') || n.includes('pera')) return { Icon: Apple, color: 'text-red-400', bg: 'bg-red-400/10' }
    if (n.includes('banana')) return { Icon: Banana, color: 'text-yellow-500', bg: 'bg-yellow-500/10' }
    if (n.includes('laranja') || n.includes('limão') || n.includes('mexerica')) return { Icon: Citrus, color: 'text-orange-500', bg: 'bg-orange-500/10' }
    if (n.includes('uva')) return { Icon: Grape, color: 'text-purple-500', bg: 'bg-purple-500/10' }

    // 3. Carbs & Grains
    if (n.includes('pão') || n.includes('croissant') || n.includes('baguete') || n.includes('tapioca')) return { Icon: Wheat, color: 'text-amber-500', bg: 'bg-amber-500/10' }
    if (n.includes('arroz') || n.includes('risoto') || n.includes('feijão') || n.includes('lentilha') || n.includes('grão')) return { Icon: Soup, color: 'text-amber-700', bg: 'bg-amber-700/10' }
    if (n.includes('pizza') || n.includes('massa') || n.includes('macarrão') || n.includes('lasanha')) return { Icon: Pizza, color: 'text-orange-600', bg: 'bg-orange-600/10' }
    if (n.includes('sanduíche') || n.includes('hambúrguer') || n.includes('burguer')) return { Icon: Sandwich, color: 'text-yellow-700', bg: 'bg-yellow-700/10' }

    // 4. Dairy & Drinks
    if (n.includes('leite') || n.includes('iogurte') || n.includes('queijo') || n.includes('whey')) return { Icon: Milk, color: 'text-blue-400', bg: 'bg-blue-400/10' }
    if (n.includes('café') || n.includes('cappuccino') || n.includes('expresso')) return { Icon: Coffee, color: 'text-amber-900', bg: 'bg-amber-900/10' }
    if (n.includes('água') || n.includes('suco') || n.includes('chá')) return { Icon: GlassWater, color: 'text-sky-400', bg: 'bg-sky-400/10' }
    if (n.includes('cerveja') || n.includes('vinho') || n.includes('drink')) return { Icon: Beer, color: 'text-amber-500', bg: 'bg-amber-500/10' }

    // 5. Snacks & Others
    if (n.includes('pipoca') || n.includes('amendoim') || n.includes('castanha')) return { Icon: Popcorn, color: 'text-yellow-600', bg: 'bg-yellow-600/10' }
    if (n.includes('doce') || n.includes('bolo') || n.includes('chocolate') || n.includes('biscoito')) return { Icon: Cookie, color: 'text-amber-800', bg: 'bg-amber-800/10' }
    if (n.includes('sorvete') || n.includes('gelato')) return { Icon: IceCream, color: 'text-pink-400', bg: 'bg-pink-400/10' }

    // 6. Group Fallbacks
    if (g.includes('carne') || g.includes('proteína')) return { Icon: Beef, color: 'text-red-500', bg: 'bg-red-500/10' }
    if (g.includes('fruta')) return { Icon: Apple, color: 'text-red-400', bg: 'bg-red-400/10' }
    if (g.includes('vegetal') || g.includes('legume') || g.includes('verdura')) return { Icon: Salad, color: 'text-emerald-500', bg: 'bg-emerald-500/10' }
    if (g.includes('bebida')) return { Icon: GlassWater, color: 'text-sky-400', bg: 'bg-sky-400/10' }

    return { Icon: Utensils, color: 'text-primary', bg: 'bg-primary/10' }
  }

  const { Icon, color, bg } = getIconConfig()

  const sizeClasses = {
    sm: 'w-6 h-6 p-1',
    md: 'w-8 h-8 p-1.5',
    lg: 'w-10 h-10 p-2',
    xl: 'w-12 h-12 p-2.5'
  }

  const iconSizes = {
    sm: 14,
    md: 18,
    lg: 22,
    xl: 26
  }

  return (
    <div className={cn(
      "rounded-xl flex items-center justify-center transition-all shadow-sm border border-white/5",
      bg,
      sizeClasses[size],
      className
    )}>
      <Icon size={iconSizes[size]} className={cn("shrink-0", color)} />
    </div>
  )
}
