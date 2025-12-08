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
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Utensils className="h-6 w-6 text-primary" />
                        Meus Planos Alimentares
                    </h1>
                    <p className="text-muted-foreground mt-1">
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
            <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed rounded-lg bg-muted/10">
                <div className="bg-background p-4 rounded-full mb-4 ring-1 ring-border">
                    <Utensils className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-1">Meus Planos Alimentares</h3>
                <p className="text-muted-foreground mb-6 max-w-sm">
                    Aqui você poderá visualizar e gerenciar todos os planos alimentares criados.
                    Por enquanto, utilize o botão acima para criar um novo plano.
                </p>
                <Button variant="outline" asChild>
                    <Link href="/diets/create">
                        Criar meu primeiro plano
                    </Link>
                </Button>
            </div>
        </DashboardLayout>
    )
}
