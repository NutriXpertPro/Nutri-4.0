"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { DashboardLayout } from "@/components/layout"
import { StatCard, AgendaDoDia, PacienteEmFoco, AcoesRapidas } from "@/components/dashboard"
import { Users, Calendar, UtensilsCrossed, Activity } from "lucide-react"

export default function DashboardPage() {
    const router = useRouter()
    const { user, isAuthenticated, isLoading } = useAuth()

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push("/login")
        }
    }, [isLoading, isAuthenticated, router])

    if (isLoading || !isAuthenticated) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                    <p className="text-muted-foreground animate-pulse">Carregando...</p>
                </div>
            </div>
        )
    }

    // Saudação dinâmica
    const getGreeting = () => {
        const hour = new Date().getHours()
        let timeGreeting = ""
        if (hour < 12) timeGreeting = "Bom dia"
        else if (hour < 18) timeGreeting = "Boa tarde"
        else timeGreeting = "Boa noite"

        let title = ""
        if (user?.professional_title) {
            const titles: Record<string, string> = {
                "NUT": "Nutricionista",
                "DR": "Dr.",
                "DRA": "Dra.",
                "ESP": "Especialista",
                "MTR": "Mestre",
                "PHD": "PhD"
            }
            title = titles[user.professional_title] || user.professional_title
        }

        return `${timeGreeting}, ${title ? title + " " : ""}${user?.name || "Nutricionista"}! 👋`
    }

    // Formatar data
    const formatDate = () => {
        const options: Intl.DateTimeFormatOptions = {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        }
        const date = new Date().toLocaleDateString('pt-BR', options)
        // Capitalizar primeira letra
        return date.charAt(0).toUpperCase() + date.slice(1)
    }

    return (
        <DashboardLayout>
            {/* Saudação */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold">{getGreeting()}</h1>
                <p className="text-muted-foreground mt-1 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {formatDate()}
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard
                    title="Pacientes Ativos"
                    value={32}
                    icon={Users}
                    variant="theme"
                    trend={{ value: 5, label: "este mês", isPositive: true }}
                />
                <StatCard
                    title="Consultas Hoje"
                    value={8}
                    icon={Calendar}
                    variant="amber"
                    subtitle="Próxima às 14:30"
                />
                <StatCard
                    title="Dietas Ativas"
                    value={42}
                    icon={UtensilsCrossed}
                    variant="green"
                    subtitle="3 vencem em breve"
                />
                <StatCard
                    title="Taxa de Adesão"
                    value="87%"
                    icon={Activity}
                    variant="violet"
                    trend={{ value: 2, label: "vs mês anterior", isPositive: true }}
                />
            </div>

            {/* Agenda + Paciente em Foco */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <AgendaDoDia />
                <PacienteEmFoco />
            </div>

            {/* Ações Rápidas */}
            <AcoesRapidas />
        </DashboardLayout>
    )
}
