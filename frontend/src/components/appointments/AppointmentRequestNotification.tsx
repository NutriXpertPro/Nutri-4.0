"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, Check, X, User, Calendar } from "lucide-react"
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
      <Card className="bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-xl border-border/40 hover:shadow-lg transition-all overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-500" />
        <CardHeader className="pb-3 relative">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500/30 to-blue-500/10 flex items-center justify-center text-blue-500">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="flex items-center gap-2">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-cyan-500">
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
                      <User className="h-4 w-4 text-muted-foreground" />
                      <h4 className="font-medium truncate">{request.patientName}</h4>
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5" />
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
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive border-destructive/30"
                      onClick={() => onReject(request.id)}
                      title="Rejeitar"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      className="h-8 px-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 shadow-lg shadow-blue-500/20"
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