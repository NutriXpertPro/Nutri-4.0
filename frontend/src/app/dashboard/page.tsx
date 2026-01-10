"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { DashboardLayout } from "@/components/layout"
import { AgendaDoDia, type Appointment } from "@/components/dashboard/AgendaDoDia"
import { AniversariantesCard, type BirthdayPatient } from "@/components/dashboard/AniversariantesCard"
import { StatCard, AcoesRapidas } from "@/components/dashboard"
import { Users, Calendar, UtensilsCrossed, Activity } from "lucide-react"
import { dashboardService, DashboardStats, DashboardAppointment, DashboardFeaturedPatient } from "@/services/dashboard-service"


export default function DashboardPage() {
    const router = useRouter()
    const { user, isAuthenticated, isLoading: authLoading } = useAuth()

    // States for real data
    const [stats, setStats] = useState<DashboardStats | null>(null)
    const [appointments, setAppointments] = useState<Appointment[]>([])
    const [birthdays, setBirthdays] = useState<BirthdayPatient[]>([])
    const [loadingData, setLoadingData] = useState(true)

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push("/login")
        }
    }, [authLoading, isAuthenticated, router])

    useEffect(() => {
        if (isAuthenticated) {
            fetchDashboardData()
        }
    }, [isAuthenticated])

    const fetchDashboardData = async () => {
        try {
            setLoadingData(true)
            const [statsData, appointmentsData, birthdaysData] = await Promise.all([
                dashboardService.getStats(),
                dashboardService.getAppointmentsToday(),
                dashboardService.getBirthdaysToday()
            ])

            setStats(statsData)

            // Map Appointments
            const mappedAppointments: Appointment[] = appointmentsData.map(apt => ({
                id: String(apt.id),
                time: apt.time,
                patientName: apt.patient_name,
                patientAvatar: apt.avatar || undefined, // Convert null/empty to undefined
                type: apt.type.toLowerCase() as "presencial" | "online",
                duration: apt.duration,
                description: apt.status === 'scheduled' ? 'Consulta Agendada' : apt.status,
                isNow: false
            }))
            setAppointments(mappedAppointments)

            // Set Birthdays
            setBirthdays(birthdaysData)

        } catch (error) {
            console.error("Failed to fetch dashboard data:", error)
            // toast({
            //     title: "Erro ao carregar dados",
            //     description: "Não foi possível atualizar o dashboard. Tente novamente.",
            //     variant: "destructive"
            // })
        } finally {
            setLoadingData(false)
        }
    }

    if (authLoading || !isAuthenticated) {
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

        let displayName = user?.name || "Nutricionista"
        if (user?.name) {
            const parts = user.name.trim().split(" ")
            if (parts.length > 1) {
                displayName = `${parts[0]} ${parts[parts.length - 1]}`
            }
        }

        return `${timeGreeting}, ${title ? title + " " : ""}${displayName}! 👋`
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
        return date.charAt(0).toUpperCase() + date.slice(1)
    }

    return (
        <DashboardLayout>
            {/* Saudação */}
            <div className="mb-8">
                <h1 className="text-h1 capitalize font-normal">{getGreeting()}</h1>
                <p className="text-subtitle mt-1 flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-amber-500" />
                    {formatDate()}
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard
                    title="Pacientes Ativos"
                    value={loadingData ? "..." : (stats?.active_patients || 0)}
                    icon={Users}
                    variant="theme"
                    trend={{ value: 0, label: "este mês", isPositive: true }}
                />
                <StatCard
                    title="Consultas Hoje"
                    value={loadingData ? "..." : (stats?.appointments_today || 0)}
                    icon={Calendar}
                    variant="amber"
                    subtitle={stats?.appointments_today === 0 ? "Nenhuma hoje" : "Ver agenda"}
                />
                <StatCard
                    title="Dietas Ativas"
                    value={loadingData ? "..." : (stats?.active_diets || 0)}
                    icon={UtensilsCrossed}
                    variant="green"
                    subtitle="Em andamento"
                />
                <StatCard
                    title="Taxa de Adesão"
                    value={loadingData ? "..." : `${stats?.adhesion_rate || 0}%`}
                    icon={Activity}
                    variant="violet"
                    trend={{ value: 0, label: "vs média", isPositive: true }}
                />
            </div>

            {/* Agenda + Paciente em Foco */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <AgendaDoDia appointments={loadingData ? [] : appointments} />
                <AniversariantesCard patients={loadingData ? [] : birthdays} />
            </div>

            {/* Ações Rápidas */}
            <AcoesRapidas />
        </DashboardLayout>
    )
}
