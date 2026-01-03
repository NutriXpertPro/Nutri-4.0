"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, Check, X, User, Calendar } from "lucide-react"
import { IconWrapper } from "@/components/ui/IconWrapper"
import { format, parseISO } from "date-fns"
import { ptBR } from "date-fns/locale"

interface PendingAppointment {
  id: number
  patientName: string
  date: string
  time: string
  reason: string
}

interface AppointmentRequestNotificationProps {
  pendingAppointments: PendingAppointment[]
  onApprove: (id: number) => void
  onReject: (id: number) => void
}

export function AppointmentRequestNotification({
  pendingAppointments = [],
  onApprove,
  onReject
}: AppointmentRequestNotificationProps) {
  if (pendingAppointments.length === 0) {
    return null; // Não exibe nada se não houver solicitações
  }

  return (
    <div className="relative">
      <Card variant="glass" className="overflow-hidden">
        <CardHeader className="pb-3 relative">
          <div className="flex items-center gap-4">
            <IconWrapper
              icon={Clock}
              variant="green"
              size="xl"
              className="ring-4 ring-background border border-white/10 dark:border-white/20 shadow-md"
            />
            <div>
              <CardTitle className="flex items-center gap-2">
                <span className="text-foreground">
                  Solicitações de Agendamento
                </span>
                <Badge variant="secondary" className="text-xs">
                  {pendingAppointments.length}
                </Badge>
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Novas solicitações de pacientes para agendamento
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pb-4">
          <div className="divide-y divide-border/50">
            {pendingAppointments.map((request) => (
              <div key={request.id} className="py-3 first:pt-0 last:pb-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-primary" />
                      <h4 className="truncate">{request.patientName}</h4>
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5 text-amber-500" />
                      <span>
                        {format(parseISO(request.date), 'dd/MM/yyyy', { locale: ptBR })} às {request.time}
                      </span>
                    </div>
                    {request.reason && (
                      <p className="text-xs text-muted-foreground mt-1 truncate">{request.reason}</p>
                    )}
                  </div>

                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      onClick={() => onReject(request.id)}
                      title="Rejeitar"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      className="h-8 px-3"
                      onClick={() => onApprove(request.id)}
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Aceitar
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}