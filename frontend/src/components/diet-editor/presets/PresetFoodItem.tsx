import React from 'react';
import { cn } from '@/lib/utils';
import { MealPresetFood } from '@/stores/diet-editor-store';

interface PresetFoodItemProps {
  food: MealPresetFood;
  className?: string;
}

export function PresetFoodItem({ food, className }: PresetFoodItemProps) {
  // Função para obter ícone baseado no tipo de alimento
  const getFoodIcon = (foodName: string) => {
    const lowerName = foodName.toLowerCase();

    if (lowerName.includes('ovo') || lowerName.includes('proteína') || lowerName.includes('carne') || lowerName.includes('frango') || lowerName.includes('peixe')) {
      return '🍗';
    } else if (lowerName.includes('arroz') || lowerName.includes('pão') || lowerName.includes('massa') || lowerName.includes('batata')) {
      return '🍚';
    } else if (lowerName.includes('salada') || lowerName.includes('alface') || lowerName.includes('tomate') || lowerName.includes('cenoura')) {
      return '🥗';
    } else if (lowerName.includes('fruta') || lowerName.includes('banana') || lowerName.includes('maçã') || lowerName.includes('laranja')) {
      return '🍎';
    } else if (lowerName.includes('leite') || lowerName.includes('iogurte') || lowerName.includes('queijo')) {
      return '🥛';
    } else if (lowerName.includes('aveia') || lowerName.includes('granola')) {
      return '🌾';
    } else {
      return '🍽️';
    }
  };

  return (
    <div className={cn("flex items-center justify-between py-1.5 px-2.5 rounded-lg bg-muted/10 border border-border/20", className)}>
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-sm">
          {getFoodIcon(food.food_name)}
        </div>
        <div className="min-w-0">
          <div className="text-sm font-medium text-foreground truncate max-w-[140px]">{food.food_name}</div>
          <div className="text-xs text-muted-foreground flex items-center gap-2">
            <span>{food.quantity}{food.unit}</span>
          </div>
        </div>
      </div>
    </div>
  );
}