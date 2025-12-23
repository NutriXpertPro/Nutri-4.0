"use client"

import * as React from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar, MapPin, Video, ChevronRight, ExternalLink } from "lucide-react"

export interface Appointment {
    id: string
    time: string
    patientName: string
    patientAvatar?: string
    type: "presencial" | "online"
    duration: number // em minutos
    description?: string
    isNow?: boolean
}

interface AgendaDoDiaProps {
    appointments?: Appointment[]
    className?: string
}

export function AgendaDoDia({ appointments = [], className }: AgendaDoDiaProps) {
    return (
        <Card className={cn("h-full flex flex-col", className)}>
            <CardHeader className="flex flex-row items-center justify-between pb-3 space-y-0">
                <div className="flex items-center gap-2">
                    <CardTitle className="flex items-center gap-2 text-lg !font-normal">
                        <Calendar className="h-5 w-5 text-amber-500" />
                        Agenda de Hoje
                    </CardTitle>
                    <Badge variant="secondary" className="!font-normal">
                        {appointments.length}
                    </Badge>
                </div>
                <Button variant="ghost" size="sm" className="h-8 gap-1 text-muted-foreground hover:text-primary text-xs" asChild>
                    <Link href="/calendar">
                        Ver Agenda
                        <ExternalLink className="h-3 w-3" />
                    </Link>
                </Button>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto pr-1">
                {appointments.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-4 text-muted-foreground">
                        <p className="text-sm">Nenhum agendamento para hoje.</p>
                    </div>
                ) : (
                    <div className="relative space-y-0">
                        {/* Linha vertical da timeline */}
                        <div className="absolute left-[19px] top-2 bottom-2 w-0.5 bg-border" />

                        {appointments.map((appointment) => (
                            <div
                                key={appointment.id}
                                className={cn(
                                    "relative flex items-start gap-4 py-3 pl-10 group transition-colors rounded-lg hover:bg-muted/40",
                                    appointment.isNow && "bg-primary/5 -mx-2 px-8 pl-10"
                                )}
                            >
                                {/* Timeline dot */}
                                <div
                                    className={cn(
                                        "absolute left-3 top-5 w-3 h-3 rounded-full border-2 bg-background z-10",
                                        appointment.isNow
                                            ? "border-primary bg-primary animate-pulse"
                                            : "border-muted-foreground group-hover:border-primary/50 transition-colors"
                                    )}
                                />

                                {/* Time */}
                                <div className="flex-shrink-0 w-12 pt-0.5 text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                                    {appointment.time}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-9 w-9 border border-border/50">
                                            <AvatarImage src={appointment.patientAvatar} />
                                            <AvatarFallback className="text-xs bg-muted !font-normal text-muted-foreground">
                                                {appointment.patientName.substring(0, 2).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <p className="!font-normal text-sm truncate text-foreground group-hover:text-primary transition-colors">
                                                {appointment.patientName}
                                            </p>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <Badge
                                                    variant="outline"
                                                    className={cn(
                                                        "h-5 px-1.5 gap-1 text-[10px] font-normal border-border/50",
                                                        appointment.type === "online"
                                                            ? "text-blue-600 bg-blue-50/50"
                                                            : "text-green-600 bg-green-50/50"
                                                    )}
                                                >
                                                    {appointment.type === "online" ? (
                                                        <Video className="h-2.5 w-2.5" />
                                                    ) : (
                                                        <MapPin className="h-2.5 w-2.5" />
                                                    )}
                                                    {appointment.type === "online" ? "Online" : "Presencial"}
                                                </Badge>
                                                {appointment.isNow && (
                                                    <span className="text-[10px] font-medium text-primary animate-pulse">
                                                        Em andamento
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

// Skeleton for loading
export function AgendaDoDiaSkeleton() {
    return (
        <Card className="h-full">
            <CardHeader className="pb-3 flex flex-row justify-between items-center">
                <div className="h-6 w-36 bg-muted animate-pulse rounded" />
                <div className="h-6 w-20 bg-muted animate-pulse rounded" />
            </CardHeader>
            <CardContent className="space-y-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-4">
                        <div className="h-4 w-12 bg-muted animate-pulse rounded" />
                        <div className="h-9 w-9 bg-muted animate-pulse rounded-full" />
                        <div className="flex-1 space-y-2">
                            <div className="h-4 w-32 bg-muted animate-pulse rounded" />
                            <div className="h-3 w-20 bg-muted animate-pulse rounded" />
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    )
}