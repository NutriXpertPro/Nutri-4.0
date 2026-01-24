import React from 'react';
import { cn } from '@/lib/utils';
import { MealPresetFood } from '@/stores/diet-editor-store';

interface PresetFoodItemProps {
  food: MealPresetFood;
  className?: string;
}

import { FoodIcon } from '@/components/ui/FoodIcon';

export function PresetFoodItem({ food, className }: PresetFoodItemProps) {
  return (
    <div className={cn("flex items-center justify-between py-1.5 px-2.5 rounded-lg bg-muted/10 border border-border/20", className)}>
      <div className="flex items-center gap-2.5">
        <FoodIcon name={food.food_name} size="sm" />
        <div className="min-w-0">
          <div className="text-sm font-normal text-foreground truncate max-w-[140px]">{food.food_name}</div>
        </div>
      </div>
    </div>
  );
}
