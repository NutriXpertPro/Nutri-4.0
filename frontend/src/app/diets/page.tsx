"use client"

import * as React from "react"
import Link from "next/link"
import { DashboardLayout } from "@/components/layout"
import { Button } from "@/components/ui/button"
import { Plus, Utensils } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

export default function DietsPage() {
    const { isAuthenticated, isLoading } = useAuth()

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
        )
    }

    return (
        <DashboardLayout>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-h1 capitalize flex items-center gap-2">
                        Meus Planos Alimentares
                    </h1>
                    <p className="text-muted-foreground mt-1 flex items-center gap-2">
                        <Utensils className="h-4 w-4 text-primary" />
                        Gerencie os planos alimentares dos seus pacientes
                    </p>
                </div>
                <Button className="gap-2" asChild>
                    <Link href="/diets/create">
                        <Plus className="h-4 w-4" />
                        Novo Plano
                    </Link>
                </Button>
            </div>

            {/* Empty State / Content Placeholder */}
            <div className="flex flex-col items-center justify-center min-h-[32rem] text-center border-2 border-dashed rounded-lg bg-muted/10">
                <p className="text-muted-foreground text-lg">Nenhum plano alimentar criado ainda</p>
                <p className="text-muted-foreground text-sm mt-2 mb-4">Crie seu primeiro plano alimentar usando o botão acima</p>
                <Button asChild>
                    <Link href="/diets/create">
                        Criar Dieta
                    </Link>
                </Button>
            </div>
        </DashboardLayout>
    )
}
