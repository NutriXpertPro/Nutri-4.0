import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Activity, Calendar, FileText, HeartPulse, Stethoscope, Syringe, Utensils } from "lucide-react"
import { TimelineEvent as TimelineEventData } from "./PatientTimelineTab"

interface TimelineEventProps {
  event: TimelineEventData
  isLast: boolean
}

export function TimelineEvent({ event }: TimelineEventProps) {
  const formattedDate = format(new Date(event.date), "dd 'de' MMM, HH:mm", { locale: ptBR })

  const eventTypeConfig: Record<string, { variant: "blue" | "emerald" | "violet" | "amber" | "ghost", label: string }> = {
    evaluation: { variant: "blue", label: "Avaliação" },
    appointment: { variant: "emerald", label: "Consulta" },
    diet: { variant: "violet", label: "Plano Alimentar" },
    anamnesis: { variant: "amber", label: "Anamnese" },
    lab_exam: { variant: "amber", label: "Exame Laboratorial" },
    note: { variant: "ghost", label: "Anotação" }
  }

  const config = eventTypeConfig[event.type] || eventTypeConfig.note

  return (
    <Card variant="glass" className="border-none bg-background/40 hover:bg-background/60 transition-all shadow-lg group">
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="text-[10px] font-normal text-muted-foreground uppercase tracking-widest opacity-60">{config.label}</p>
            <CardTitle className="text-lg font-normal tracking-tight text-primary transition-colors">
              {event.title}
            </CardTitle>
          </div>
          <Badge variant="outline" className="h-7 px-3 rounded-xl text-[10px] font-normal uppercase tracking-widest border-border/10 bg-muted/20 text-muted-foreground whitespace-nowrap">
            {formattedDate}
          </Badge>
        </div>
        <p className="text-sm font-normal text-muted-foreground/80 mt-2 leading-relaxed">
          {event.description}
        </p>
      </CardHeader>
      <CardContent className="pt-0 pb-6">
        <div className="flex items-center gap-4 text-[10px] font-normal uppercase tracking-widest text-muted-foreground/60 transition-colors group-hover:text-muted-foreground/80">
          <span className="flex items-center gap-1.5 border-r border-border/10 pr-4">
            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
            Ref: #{event.id}
          </span>
          <span className="flex items-center gap-1.5">
            <Activity className="h-3 w-3 text-primary" />
            Sincronizado
          </span>
        </div>
      </CardContent>
    </Card>
  )
}