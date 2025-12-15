"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarDays } from "lucide-react"
import { TimelineEvent } from "./TimelineEvent"
import { Activity, Calendar, FileText, HeartPulse, Stethoscope, Syringe, Utensils } from "lucide-react"

interface TimelineEvent {
  id: number
  type: 'evaluation' | 'appointment' | 'diet' | 'anamnesis' | 'lab_exam' | 'note'
  title: string
  description: string
  date: string // ISO string
  icon?: JSX.Element
  color?: string
}

interface PatientTimelineTabProps {
  patientId?: number
}

export function PatientTimelineTab({ patientId }: PatientTimelineTabProps) {
  // Mock data - substituir por dados reais da API
  const timelineEvents: TimelineEvent[] = [
    {
      id: 1,
      type: 'evaluation',
      title: "Avaliação Física",
      description: "Primeira avaliação completa com medidas antropométricas",
      date: "2025-11-15T10:30:00Z",
      icon: <HeartPulse className="h-4 w-4" />,
      color: "bg-blue-500"
    },
    {
      id: 2,
      type: 'appointment',
      title: "Consulta Inicial",
      description: "Primeira consulta nutricional - anamnese e planejamento terapêutico",
      date: "2025-11-18T14:00:00Z",
      icon: <Stethoscope className="h-4 w-4" />,
      color: "bg-green-500"
    },
    {
      id: 3,
      type: 'diet',
      title: "Plano Alimentar Inicial",
      description: "Dieta low-carb 1800kcal criada e entregue ao paciente",
      date: "2025-11-20T09:15:00Z",
      icon: <Utensils className="h-4 w-4" />,
      color: "bg-purple-500"
    },
    {
      id: 4,
      type: 'lab_exam',
      title: "Exames Laboratoriais",
      description: "Hemograma completo e lipidograma solicitados",
      date: "2025-11-22T08:00:00Z",
      icon: <Syringe className="h-4 w-4" />,
      color: "bg-amber-500"
    },
    {
      id: 5,
      type: 'appointment',
      title: "Retorno",
      description: "Acompanhamento da adesão à dieta e ajustes necessários",
      date: "2025-12-02T11:30:00Z",
      icon: <Calendar className="h-4 w-4" />,
      color: "bg-green-500"
    },
    {
      id: 6,
      type: 'evaluation',
      title: "Reavaliação Física",
      description: "Comparação de medidas após 3 semanas de tratamento",
      date: "2025-12-05T10:00:00Z",
      icon: <HeartPulse className="h-4 w-4" />,
      color: "bg-blue-500"
    }
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) // Ordenar pela data mais recente

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Linha do Tempo
          </h3>
          <p className="text-sm text-muted-foreground">Histórico de interações e eventos</p>
        </div>
      </div>

      <Card className="overflow-hidden">
        <CardHeader className="bg-muted/30">
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            Histórico de Eventos
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="relative">
            {/* Linha do tempo vertical */}
            <div className="absolute left-4 top-0 h-full w-0.5 bg-border -translate-x-1/2"></div>
            
            <div className="space-y-8 ml-10">
              {timelineEvents.map((event, index) => (
                <div key={event.id} className="relative">
                  {/* Ponto de evento na linha */}
                  <div className={`absolute -left-11 top-3.5 w-7 h-7 rounded-full flex items-center justify-center ${event.color} text-white shadow-md`}>
                    {event.icon}
                  </div>
                  
                  <TimelineEvent 
                    event={event} 
                    isLast={index === timelineEvents.length - 1}
                  />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}