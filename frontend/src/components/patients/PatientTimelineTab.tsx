"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarDays, Activity, Calendar, FileText, HeartPulse, Stethoscope, Syringe, Utensils } from "lucide-react"
import { TimelineEvent } from "./TimelineEvent"
import { IconWrapper } from "@/components/ui/IconWrapper"

export interface TimelineEvent {
  id: number
  type: 'evaluation' | 'appointment' | 'diet' | 'anamnesis' | 'lab_exam' | 'note'
  title: string
  description: string
  date: string // ISO string
  icon?: React.ReactNode
  color?: string
}

interface PatientTimelineTabProps {
  patientId?: number
}

export function PatientTimelineTab({ patientId }: PatientTimelineTabProps) {
  // Mock data - substituir por dados reais da API
  const timelineEvents: TimelineEvent[] = ([
    {
      id: 1,
      type: 'evaluation',
      title: "Avaliação Física",
      description: "Primeira avaliação completa com medidas antropométricas",
      date: "2025-11-15T10:30:00Z",
      icon: <HeartPulse className="h-4 w-4" />,
      color: "blue"
    },
    {
      id: 2,
      type: 'appointment',
      title: "Consulta Inicial",
      description: "Primeira consulta nutricional - anamnese e planejamento terapêutico",
      date: "2025-11-18T14:00:00Z",
      icon: <Stethoscope className="h-4 w-4" />,
      color: "emerald"
    },
    {
      id: 3,
      type: 'diet',
      title: "Plano Alimentar Inicial",
      description: "Dieta low-carb 1800kcal criada e entregue ao paciente",
      date: "2025-11-20T09:15:00Z",
      icon: <Utensils className="h-4 w-4" />,
      color: "violet"
    },
    {
      id: 4,
      type: 'lab_exam',
      title: "Exames Laboratoriais",
      description: "Hemograma completo e lipidograma solicitados",
      date: "2025-11-22T08:00:00Z",
      icon: <Syringe className="h-4 w-4" />,
      color: "amber"
    },
    {
      id: 5,
      type: 'appointment',
      title: "Retorno",
      description: "Acompanhamento da adesão à dieta e ajustes necessários",
      date: "2025-12-02T11:30:00Z",
      icon: <Calendar className="h-4 w-4" />,
      color: "emerald"
    },
    {
      id: 6,
      type: 'evaluation',
      title: "Reavaliação Física",
      description: "Comparação de medidas após 3 semanas de tratamento",
      date: "2025-12-05T10:00:00Z",
      icon: <HeartPulse className="h-4 w-4" />,
      color: "blue"
    }
  ] as const).map(e => ({ ...e }))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 px-1">
        <div>
          <h1 className="text-h1">Linha do Tempo</h1>
          <p className="text-subtitle mt-1 flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-primary" />
            Histórico completo de interações e evolução
          </p>
        </div>
      </div>

      <div className="relative">
        <div className="absolute left-6 top-4 bottom-4 w-px bg-gradient-to-b from-primary/50 via-border/20 to-transparent" />

        <div className="space-y-6">
          {timelineEvents.map((event, index) => (
            <div key={event.id} className="relative pl-16 group">
              <div className="absolute left-1.5 top-0 transition-transform group-hover:scale-110 duration-500">
                <IconWrapper
                  icon={event.type === 'evaluation' ? HeartPulse :
                    event.type === 'appointment' ? Stethoscope :
                      event.type === 'diet' ? Utensils :
                        event.type === 'lab_exam' ? Syringe : Activity}
                  variant={event.color as any}
                  size="md"
                  className="shadow-xl ring-4 ring-background"
                />
              </div>

              <TimelineEvent
                event={event as any}
                isLast={index === timelineEvents.length - 1}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}