import React from 'react';
import FoodManagementContent from '@/components/foods/FoodManagementContent';
import { DashboardLayout } from "@/components/layout"

export default function FoodsPage() {
    return (
        <DashboardLayout>
            <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-1">
                    <h1 className="text-h1 capitalize font-normal">
                        Gestão de <span className="text-primary">Alimentos</span>
                    </h1>
                    <p className="text-subtitle max-w-2xl">
                        Consulte as tabelas oficiais ou gerencie sua base personalizada de forma profissional.
                    </p>
                </div>

                <FoodManagementContent />
            </div>
        </DashboardLayout>
    );
}
