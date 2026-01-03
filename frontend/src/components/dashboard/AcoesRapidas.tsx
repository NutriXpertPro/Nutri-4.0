"use client"

import * as React from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { UserPlus, UtensilsCrossed, CalendarPlus, ClipboardPlus, Zap } from "lucide-react"

interface QuickAction {
    icon: React.ReactNode
    label: string
    href: string
    variant?: "default" | "secondary" | "outline"
}

interface AcoesRapidasProps {
    className?: string
}

const quickActions: QuickAction[] = [
    {
        icon: <UserPlus className="h-4 w-4" />,
        label: "Novo Paciente",
        href: "/patients/new",
        variant: "default",
    },
    {
        icon: <UtensilsCrossed className="h-4 w-4" />,
        label: "Criar Dieta",
        href: "/diets/create",
        variant: "secondary",
    },
    {
        icon: <CalendarPlus className="h-4 w-4" />,
        label: "Agendar Consulta",
        href: "/calendar",
        variant: "outline",
    },
    {
        icon: <ClipboardPlus className="h-4 w-4" />,
        label: "Nova Anamnese",
        href: "/anamnesis",
        variant: "outline",
    },
]

export function AcoesRapidas({ className }: AcoesRapidasProps) {
    return (
        <Card className={cn("", className)}>
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg font-normal">
                    <Zap className="h-5 w-5 text-primary" />
                    Ações Rápidas
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex flex-wrap gap-3">
                    {quickActions.map((action) => (
                        <Button
                            key={action.label}
                            variant={action.variant}
                            className="gap-2"
                            asChild
                        >
                            <Link href={action.href}>
                                {action.icon}
                                {action.label}
                            </Link>
                        </Button>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
