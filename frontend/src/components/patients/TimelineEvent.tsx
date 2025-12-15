import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Activity, Calendar, FileText, HeartPulse, Stethoscope, Syringe, Utensils } from "lucide-react"
import { TimelineEvent } from "./PatientTimelineTab"

interface TimelineEventProps {
  event: TimelineEvent
  isLast: boolean
}

export function TimelineEvent({ event, isLast }: TimelineEventProps) {
  const formattedDate = format(new Date(event.date), "dd 'de' MMM 'às' HH:mm", { locale: ptBR })
  
  // Mapear tipo de evento para ícones e cores
  const eventTypeConfig = {
    evaluation: { icon: <HeartPulse className="h-4 w-4" />, color: "bg-blue-500", title: "Avaliação" },
    appointment: { icon: <Calendar className="h-4 w-4" />, color: "bg-green-500", title: "Consulta" },
    diet: { icon: <Utensils className="h-4 w-4" />, color: "bg-purple-500", title: "Dieta" },
    anamnesis: { icon: <Stethoscope className="h-4 w-4" />, color: "bg-orange-500", title: "Anamnese" },
    lab_exam: { icon: <Syringe className="h-4 w-4" />, color: "bg-amber-500", title: "Exame" },
    note: { icon: <FileText className="h-4 w-4" />, color: "bg-gray-500", title: "Anotação" }
  }
  
  const config = eventTypeConfig[event.type] || eventTypeConfig.note
  
  return (
    <Card className="border-l-4 border-l-primary shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <span className={`inline-block w-3 h-3 rounded-full ${config.color}`}></span>
            {event.title}
          </CardTitle>
          <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
            {formattedDate}
          </span>
        </div>
        <CardDescription className="text-sm">
          {event.description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-xs text-muted-foreground space-y-1">
          <div className="flex items-center gap-2">
            <span className="capitalize">{event.type}</span>
            <span>•</span>
            <span>ID: {event.id}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}