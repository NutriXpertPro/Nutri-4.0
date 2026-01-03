"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    User,
    Mail,
    Phone,
    Calendar,
    MoreVertical,
    MessageSquare,
    UtensilsCrossed,
    Eye,
    Trash2,
    TrendingUp,
    TrendingDown,
    Target,
    Heart,
    Activity,
    Zap,
} from "lucide-react"
import api from "@/services/api"

interface Patient {
    id: string
    name: string
    email: string
    phone: string
    avatar?: string
    createdAt: string
    lastVisit?: string
    status: "active" | "inactive"
    goal?: string
    progress?: {
        value: number
        isPositive: boolean
    }
}

interface PatientCardProps {
    patient: Patient
    className?: string
}

// Função para retornar ícone específico baseado no tipo de goal
function getGoalIcon(goal: string) {
    const normalizedGoal = goal.toLowerCase();

    if (normalizedGoal.includes('qualidade') || normalizedGoal.includes('bem-estar') || normalizedGoal.includes('saúde')) {
        return <Heart className="h-4 w-4 text-rose-500" />;
    }

    if (normalizedGoal.includes('massa') || normalizedGoal.includes('músculo') || normalizedGoal.includes('ganho')) {
        return <Activity className="h-4 w-4 text-blue-500" />;
    }

    if (normalizedGoal.includes('gordura') || normalizedGoal.includes('perda') || normalizedGoal.includes('emagrecer')) {
        return <Zap className="h-4 w-4 text-amber-500" />;
    }

    // Default para outros tipos de objetivo
    return <Target className="h-4 w-4 text-primary" />;
}

export function PatientCard({ patient, className }: PatientCardProps) {
    const router = useRouter();

    const handleOpenMessage = async () => {
        try {
            // Usar o novo endpoint que encontra ou cria a conversa automaticamente
            // O backend converte o patient_profile_id para user_id corretamente
            const response = await api.post('/messages/conversations/find-or-create-by-patient/', {
                patient_id: patient.id
            });

            const conversation = response.data;

            // Navegar para a página de mensagens com o ID da conversa
            router.push(`/messages?conversation=${conversation.id}`);
        } catch (error) {
            console.error('Erro ao abrir conversa com o paciente:', error);
            // Se houver erro, redirecionar para a página de mensagens genérica
            router.push('/messages');
        }
    };

    return (
        <Card
            variant="glass"
            className={cn(
                "group relative overflow-hidden transition-all duration-500",
                "hover:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] hover:-translate-y-2",
                "bg-background/40 border border-border shadow-xl",
                className
            )}
        >
            <CardContent className="p-6">
                {/* Header: Avatar + Name */}
                <div className="flex items-start gap-4 mb-6">
                    <div className="relative">
                        <Avatar className="h-16 w-16 border-2 border-background shadow-md overflow-hidden">
                            <AvatarImage src={patient.avatar} className="h-full w-full object-cover" />
                            <AvatarFallback className="text-lg bg-primary/10 text-primary">
                                {patient.name.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div className={cn(
                            "absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-4 border-background shadow-sm",
                            patient.status === "active" ? "bg-emerald-500" : "bg-slate-300"
                        )} />
                    </div>

                    <div className="flex-1 min-w-0 pt-1">
                        <div className="flex items-center gap-2 mb-1">
                            <User className="h-5 w-5 text-muted-foreground" />
                            <h3 className="text-lg tracking-tight truncate group-hover:text-primary transition-colors font-normal">
                                {patient.name.startsWith('Paciente ') ? patient.name.substring(9) : patient.name}
                            </h3>
                        </div>
                        {patient.goal ? (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                {getGoalIcon(patient.goal.toLowerCase())}
                                <span>{patient.goal.toLowerCase()}</span>
                            </div>
                        ) : (
                            <p className="text-[10px] text-muted-foreground/40 capitalize tracking-wide">Paciente cadastrado</p>
                        )}
                    </div>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-1 gap-3 mb-6">
                    <a
                        href={`mailto:${patient.email}`}
                        className="flex items-center gap-3 p-2.5 rounded-2xl bg-muted/20 border border-border/5 group/info hover:bg-muted/40 transition-colors cursor-pointer"
                    >
                        <div className="p-2 rounded-xl bg-background shadow-sm text-blue-500 group-hover/info:scale-110 transition-transform">
                            <Mail className="h-3.5 w-3.5" />
                        </div>
                        <span className="text-xs text-muted-foreground truncate hover:text-blue-500 transition-colors">{patient.email}</span>
                    </a>
                    <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-muted/20 border border-border/5 group/info hover:bg-muted/40 transition-colors">
                        <div className="p-2 rounded-xl bg-background shadow-sm text-green-600 group-hover/info:scale-110 transition-transform">
                            <Phone className="h-3.5 w-3.5" />
                        </div>
                        <span className="text-xs text-muted-foreground">{patient.phone || '(11) 99999-9999'}</span>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-9 px-3 rounded-xl border-border/20 text-[10px] uppercase tracking-widest hover:bg-destructive hover:text-white hover:border-destructive transition-all shadow-sm"
                        onClick={handleOpenMessage}
                    >
                        <MessageSquare className="h-3.5 w-3.5 mr-1 text-destructive" />
                        Mensagem
                    </Button>
                </div>

                {/* Footer: Progress + CTA */}
                <div className="flex items-center justify-between pt-5 border-t border-border/10">
                    <div className="flex flex-col">
                        <span className="text-[9px] text-muted-foreground uppercase tracking-widest opacity-40 mb-1">Evolução Peso</span>
                        {patient.progress ? (
                            <div className="flex items-center gap-2">
                                <div className={cn(
                                    "flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] tabular-nums",
                                    patient.progress.isPositive ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600"
                                )}>
                                    {patient.progress.isPositive ? (
                                        <TrendingDown className="h-3.5 w-3.5" />
                                    ) : (
                                        <TrendingUp className="h-3.5 w-3.5" />
                                    )}
                                    {patient.progress.value > 0 ? "-" : "+"}{Math.abs(patient.progress.value)}kg
                                </div>
                            </div>
                        ) : (
                            <span className="text-[10px] text-muted-foreground/40 italic">Sem dados</span>
                        )}
                    </div>

                    <Button size="sm" variant="outline" className="h-9 px-4 rounded-xl border-border/20 text-[10px] uppercase tracking-widest hover:bg-primary hover:text-white hover:border-primary transition-all shadow-sm" asChild>
                        <Link href={`/patients/${patient.id}`}>
                            Perfil Completo
                        </Link>
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}

// Skeleton
export function PatientCardSkeleton() {
    return (
        <Card>
            <CardContent className="p-4">
                <div className="flex items-start gap-3 mb-4">
                    <div className="h-12 w-12 rounded-full bg-muted animate-pulse" />
                    <div className="flex-1 space-y-2">
                        <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                        <div className="h-3 w-16 bg-muted animate-pulse rounded" />
                    </div>
                </div>
                <div className="space-y-2 mb-4">
                    <div className="h-3 w-full bg-muted animate-pulse rounded" />
                    <div className="h-3 w-2/3 bg-muted animate-pulse rounded" />
                    <div className="h-3 w-1/2 bg-muted animate-pulse rounded" />
                </div>
                <div className="flex items-center justify-between pt-3 border-t">
                    <div className="h-5 w-12 bg-muted animate-pulse rounded" />
                    <div className="h-8 w-20 bg-muted animate-pulse rounded" />
                </div>
            </CardContent>
        </Card>
    )
}
