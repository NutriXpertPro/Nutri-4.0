"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, MapPin, Video, CheckCircle, User } from "lucide-react"
import { format, setHours, setMinutes, isBefore, parseISO } from "date-fns"
import { ptBR } from "date-fns/locale"
import { toast } from "sonner"
import api from "@/services/api" // Supondo que você tenha um arquivo de configuração para a API

interface AppointmentSlot {
  id: number
  date: string
  time: string
  type: "presencial" | "online" | "primeira_vez" | "retorno" | "em_grupo" | "pacote" | "permuta" | "pessoal" | "antropometria" | "amigo" | "encaixe" | "teste"
  available: boolean
}

interface Patient {
  id: number
  name: string
}

interface ApiResponse {
  patient: Patient
  availableSlots: AppointmentSlot[]
}

export default function PatientSchedulePage({ params }: { params: { id: string } }) {
  const [selectedSlot, setSelectedSlot] = useState<AppointmentSlot | null>(null)
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<ApiResponse | null>(null)

  // Carregar dados do paciente e horários disponíveis do backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get(`/appointments/available-slots/${params.id}/`)
        setData(response.data)
      } catch (error) {
        console.error("Erro ao buscar horários disponíveis:", error)
        toast.error("Erro ao carregar horários disponíveis")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [params.id])

  const handleSchedule = async () => {
    if (!selectedSlot) {
      toast.error("Selecione um horário para agendar")
      return
    }

    try {
      // Enviar requisição para criar o agendamento
      const scheduleData = {
        patient: parseInt(params.id),  // ID do paciente
        date: selectedSlot.date,
        type: selectedSlot.type,
        status: 'agendada'  // Pode ser definido como 'agendada' inicialmente
      };

      const response = await api.post('/appointments/', scheduleData);

      toast.success(`Consulta agendada para ${format(parseISO(selectedSlot.date), 'dd/MM/yyyy', { locale: ptBR })} às ${selectedSlot.time}`)
      console.log("Agendamento realizado com sucesso:", response.data);

      // Atualizar o estado para refletir o agendamento feito
      if (data) {
        const updatedSlots = data.availableSlots.filter(slot => slot.id !== selectedSlot.id);
        setData({
          ...data,
          availableSlots: updatedSlots
        });
        setSelectedSlot(null);
      }
    } catch (error) {
      console.error("Erro ao agendar consulta:", error)
      toast.error("Erro ao agendar consulta. Por favor, tente novamente.")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Carregando horários disponíveis...</p>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">Não foi possível carregar os dados</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const groupedSlots = data.availableSlots
    .filter(slot => slot.available)
    .reduce((acc, slot) => {
      const date = format(parseISO(slot.date), 'yyyy-MM-dd')
      if (!acc[date]) {
        acc[date] = []
      }
      acc[date].push(slot)
      return acc
    }, {} as Record<string, AppointmentSlot[]>)

  const sortedDates = Object.keys(groupedSlots).sort()

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 p-4">
      <div className="max-w-4xl mx-auto py-8">
        <Card className="shadow-xl">
          <CardHeader className="bg-primary/5 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <User className="h-8 w-8 text-primary" />
              <Calendar className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold">
              Agende sua Consulta com {data.patient.name}
            </CardTitle>
            <p className="text-muted-foreground">
              Selecione um horário disponível para sua consulta
            </p>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Horários Disponíveis</h3>
                  <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                    {sortedDates.length > 0 ? (
                      sortedDates.map((date) => (
                        <div key={date} className="space-y-3">
                          <h4 className="font-medium text-muted-foreground">
                            {format(parseISO(date), 'EEEE, dd/MM/yyyy', { locale: ptBR })}
                          </h4>
                          <div className="grid grid-cols-3 gap-2">
                            {groupedSlots[date].map((slot) => (
                              <Button
                                key={slot.id}
                                variant={selectedSlot?.id === slot.id ? "default" : "outline"}
                                size="sm"
                                className="py-1.5"
                                onClick={() => setSelectedSlot(slot)}
                              >
                                <div className="flex flex-col items-center">
                                  <span>{slot.time}</span>
                                  <div className="flex gap-1 mt-1">
                                    {slot.type === "online" ? (
                                      <Video className="h-2.5 w-2.5" />
                                    ) : (
                                      <MapPin className="h-2.5 w-2.5" />
                                    )}
                                  </div>
                                </div>
                              </Button>
                            ))}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-muted-foreground text-center py-4">
                        Não há horários disponíveis nos próximos dias
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Resumo da Consulta</h3>
                  {selectedSlot ? (
                    <Card className="bg-muted/30">
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span>Data:</span>
                            <span className="font-medium">
                              {format(parseISO(selectedSlot.date), 'dd/MM/yyyy', { locale: ptBR })}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Horário:</span>
                            <span className="font-medium">{selectedSlot.time}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Tipo:</span>
                            <div className="flex items-center gap-1">
                              {selectedSlot.type === "online" ? (
                                <>
                                  <Video className="h-4 w-4" />
                                  <span>Online</span>
                                </>
                              ) : (
                                <>
                                  <MapPin className="h-4 w-4" />
                                  <span>Presencial</span>
                                </>
                              )}
                            </div>
                          </div>
                          <div className="pt-2">
                            <Button
                              className="w-full"
                              onClick={handleSchedule}
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Confirmar Agendamento
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <p className="text-muted-foreground text-center py-6">
                      Selecione um horário para ver os detalhes
                    </p>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground text-center">
                  Após confirmar o agendamento, o nutricionista será notificado para aprovação.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}