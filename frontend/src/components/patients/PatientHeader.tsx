"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MessageSquare, Calendar, Edit, Phone, Mail } from "lucide-react"

interface PatientHeaderProps {
    patient?: {
        name: string
        avatar?: string
        email: string
        phone: string
        age: number
        occupation: string
        status: "active" | "inactive"
        adesao?: number
    }
    className?: string
}

// Mock data default
const defaultPatient = {
    name: "Maria Silva",
    email: "maria.silva@email.com",
    phone: "(11) 99999-8888",
    age: 32,
    occupation: "Advogada",
    status: "active" as const,
    adesao: 87,
}

export function PatientHeader({ patient = defaultPatient, className }: PatientHeaderProps) {
    return (
        <div className={cn("relative mb-8", className)}>
            {/* Background Banner */}
            <div className="h-32 w-full bg-gradient-to-r from-primary/20 to-secondary/20 rounded-t-3xl border-b border-border/10" />

            <div className="px-6 md:px-10 pb-6 -mt-12 flex flex-col md:flex-row items-end md:items-center gap-6">
                {/* Avatar Grande */}
                <div className="relative">
                    <Avatar className="h-32 w-32 border-4 border-background shadow-xl">
                        <AvatarImage src={patient.avatar} />
                        <AvatarFallback className="text-4xl bg-primary/10 text-primary">
                            {patient.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <Badge
                        variant="secondary"
                        className={cn(
                            "absolute bottom-2 right-2 border-2 border-background",
                            patient.status === "active" ? "bg-green-500 text-white" : "bg-gray-500 text-white"
                        )}
                    >
                        {patient.status === "active" ? "Ativo" : "Inativo"}
                    </Badge>
                </div>

                {/* Informações Principais */}
                <div className="flex-1 space-y-2 mb-2">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">
                            {patient.name}
                        </h1>
                        <Badge variant="outline" className="w-fit text-muted-foreground font-normal">
                            {patient.age} anos
                        </Badge>
                        <Badge variant="outline" className="w-fit text-muted-foreground font-normal">
                            {patient.occupation}
                        </Badge>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                            <Mail className="h-4 w-4 text-primary" />
                            {patient.email}
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Phone className="h-4 w-4 text-primary" />
                            {patient.phone}
                        </div>
                    </div>
                </div>

                {/* Ações */}
                <div className="flex items-center gap-2 mb-2 w-full md:w-auto">
                    <Button variant="outline" size="sm" className="flex-1 md:flex-none">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Mensagem
                    </Button>
                    <Button variant="default" size="sm" className="flex-1 md:flex-none">
                        <Calendar className="h-4 w-4 mr-2" />
                        Agendar
                    </Button>
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
                        <Edit className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    )
}
