"use client"

import { useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { SubstitutionDrawer } from './SubstitutionDrawer'
import api from '@/services/api'
import type { Food } from '@/services/food-service'
import type { DietType } from '@/stores/diet-editor-store'

interface SubstitutionButtonProps {
    food: Food
    quantity: number
    dietType: DietType
    onSubstitute: (substituteFood: Food, newQuantity: number) => void
}

export function SubstitutionButton({ 
    food, 
    quantity, 
    dietType,
    onSubstitute 
}: SubstitutionButtonProps) {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false)

    return (
        <>
            {/* Botão de Substituição */}
            <Button
                size="sm"
                variant="outline"
                onClick={() => setIsDrawerOpen(true)}
                title="Ver substituições"
                className="hover:text-amber-600 transition-colors"
            >
                <RefreshCw className="w-4 h-4 mr-2" />
                Substituir
            </Button>

            {/* Drawer Lateral */}
            <SubstitutionDrawer
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                originalFood={food}
                originalQuantity={quantity}
                dietType={dietType}
                onSubstitute={(substituteFood, newQuantity) => {
                    onSubstitute(substituteFood, newQuantity)
                    setIsDrawerOpen(false)
                }}
            />
        </>
    )
}
