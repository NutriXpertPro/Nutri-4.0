"use client"

import { User, Ruler, Weight, Target, Edit2, ArrowLeft } from "lucide-react"
import { usePatient } from "@/contexts/patient-context"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"

export function ProfileTab({ onBack }: { onBack?: () => void }) {
    const { patient } = usePatient()

    return (
        <div className="space-y-6 pb-24">
            {/* Header / Avatar */}
            <div className="flex flex-col items-center justify-center pt-6 mb-6">
                <div className="relative mb-4">
                    <Avatar className="w-24 h-24 border-4 border-background shadow-xl">
                        <AvatarImage src={patient?.avatar} />
                        <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                            {patient?.name?.[0] || 'P'}
                        </AvatarFallback>
                    </Avatar>
                    <button className="absolute bottom-0 right-0 p-2 bg-primary text-primary-foreground rounded-full shadow-lg hover:scale-110 transition-transform">
                        <Edit2 className="w-4 h-4" />
                    </button>
                </div>
                <h2 className="text-2xl font-bold text-foreground">{patient?.name || "Paciente"}</h2>
                <p className="text-muted-foreground">{patient?.email || "email@exemplo.com"}</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4 px-1">
                <div className="bg-card border border-border/10 p-4 rounded-2xl flex flex-col items-center text-center shadow-sm">
                    <div className="p-2 bg-blue-500/10 text-blue-500 rounded-xl mb-2">
                        <Ruler className="w-5 h-5" />
                    </div>
                    <span className="text-2xl font-bold text-foreground">1.75</span>
                    <span className="text-xs text-muted-foreground uppercase tracking-wider">Altura (m)</span>
                </div>
                <div className="bg-card border border-border/10 p-4 rounded-2xl flex flex-col items-center text-center shadow-sm">
                    <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-xl mb-2">
                        <Weight className="w-5 h-5" />
                    </div>
                    <span className="text-2xl font-bold text-foreground">69.7</span>
                    <span className="text-xs text-muted-foreground uppercase tracking-wider">Peso (kg)</span>
                </div>
            </div>

            {/* Goal Section */}
            <div className="bg-gradient-to-br from-card to-muted border-primary/50 shadow-lg shadow-primary/5 rounded-3xl p-6 relative overflow-hidden">
                <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-primary/20 text-primary rounded-2xl">
                        <Target className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-foreground">Objetivo Atual</h3>
                        <p className="text-xs text-muted-foreground">Definido pelo paciente</p>
                    </div>
                </div>
                <p className="text-lg font-medium text-foreground leading-relaxed">
                    "{patient?.goal || 'Manter hábitos saudáveis e constância nos exercícios.'}"
                </p>
            </div>

            {/* General Info */}
            <div className="bg-card border border-border/10 rounded-3xl overflow-hidden divide-y divide-border/5">
                <div className="p-4 flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Gênero</span>
                    <span className="font-medium text-foreground capitalize">{patient?.gender === 'female' ? 'Feminino' : 'Masculino'}</span>
                </div>
                <div className="p-4 flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Idade</span>
                    <span className="font-medium text-foreground">28 anos</span>
                </div>
                <div className="p-4 flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Tipo de Acompanhamento</span>
                    <span className="font-medium text-primary bg-primary/10 px-2 py-1 rounded text-xs">
                        {patient?.service_type || 'ONLINE'}
                    </span>
                </div>
            </div>

            {onBack && (
                <Button variant="ghost" onClick={onBack} className="w-full text-muted-foreground">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
                </Button>
            )}
        </div>
    )
}
