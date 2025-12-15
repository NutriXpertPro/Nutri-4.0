"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Calendar as CalendarIcon,
  RefreshCw,
  X,
  Check,
  Loader2
} from "lucide-react"
import { toast } from "sonner"

interface Appointment {
  id: number
  patientName: string
  date: string
  duration: number
  type: "presencial" | "online"
  status: "agendada" | "confirmada" | "realizada" | "cancelada" | "faltou"
  meetingLink?: string
  notes?: string
}

interface GoogleCalendarSyncProps {
  appointment: Appointment
}

export function GoogleCalendarSync({ appointment }: GoogleCalendarSyncProps) {
  const [isSyncing, setIsSyncing] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [syncStatus, setSyncStatus] = useState<"synced" | "pending" | "error" | null>(null)

  // Verificar se o usuário está conectado ao Google Calendar
  useEffect(() => {
    // Em uma implementação real, isso verificaria o token de autorização
    const isConnectedToGoogle = localStorage.getItem('google-calendar-connected') === 'true'
    setIsConnected(isConnectedToGoogle)
  }, [])

  const handleGoogleAuth = () => {
    // Em uma implementação real, isso iniciaria o fluxo OAuth com Google
    toast.info("Conectando-se ao Google Calendar...")
    
    // Simulando autenticação
    setTimeout(() => {
      localStorage.setItem('google-calendar-connected', 'true')
      setIsConnected(true)
      toast.success("Conectado ao Google Calendar!")
    }, 1500)
  }

  const handleSyncToCalendar = async () => {
    if (!isConnected) {
      toast.error("Por favor, conecte-se ao Google Calendar primeiro.")
      return
    }

    setIsSyncing(true)
    setSyncStatus(null)
    
    try {
      // Em uma implementação real, isso chamaria a API do Google Calendar
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      setSyncStatus("synced")
      toast.success("Evento sincronizado com Google Calendar!")
    } catch (error) {
      setSyncStatus("error")
      toast.error("Erro ao sincronizar com Google Calendar")
    } finally {
      setIsSyncing(false)
    }
  }

  return (
    <div className="border rounded-lg p-4 bg-muted/20">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5 text-primary" />
          <h3 className="font-medium">Google Calendar</h3>
        </div>
        
        {syncStatus === "synced" && (
          <Badge variant="default" className="bg-green-500/10 text-green-700 dark:text-green-300">
            <Check className="h-3 w-3 mr-1" />
            Sincronizado
          </Badge>
        )}
      </div>
      
      {!isConnected ? (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Conecte sua conta do Google para sincronizar seus compromissos automaticamente.
          </p>
          <Button 
            size="sm" 
            className="w-full"
            onClick={handleGoogleAuth}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Conectar Google
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Sincronize este compromisso com seu Google Calendar.
          </p>
          <Button 
            size="sm" 
            className="w-full"
            onClick={handleSyncToCalendar}
            disabled={isSyncing}
          >
            {isSyncing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Sincronizando...
              </>
            ) : (
              <>
                <CalendarIcon className="h-4 w-4 mr-2" />
                Sincronizar Compromisso
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  )
}