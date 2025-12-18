'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import {
  Calendar,
  Plus,
  Trash2,
  RefreshCw,
  ExternalLink,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import api from '@/services/api';

interface GoogleCalendarIntegration {
  id: string;
  google_email: string;
  google_display_name: string;
  is_active: boolean;
  default_calendar_id: string;
  created_at: string;
}

interface Appointment {
  id: number;
  patient: {
    id: number;
    user: {
      name: string;
      email: string;
    };
  };
  date: string; // ISO string
  duration: number; // in minutes
  type: 'presencial' | 'online';
  status: 'agendada' | 'confirmada' | 'realizada' | 'cancelada' | 'faltou';
  notes?: string;
  synced_with_google?: boolean;
}

const GoogleCalendarIntegration = () => {
  const [integration, setIntegration] = useState<GoogleCalendarIntegration | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [availableCalendars, setAvailableCalendars] = useState<any[]>([]);
  const [selectedCalendar, setSelectedCalendar] = useState('primary');

  // Load integration status
  useEffect(() => {
    const loadIntegration = async () => {
      try {
        setLoading(true);
        // Try to get existing integration
        try {
          const response = await api.get('/integrations/google-calendar/sync/me/');
          setIntegration(response.data);
        } catch (error) {
          // Integration doesn't exist, that's okay
          setIntegration(null);
        }
      } catch (error) {
        console.error('Error loading Google Calendar integration:', error);
        toast({
          title: 'Erro',
          description: 'Falha ao carregar configurações do Google Calendar',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    loadIntegration();
  }, []);

  // Load available calendars when connected
  useEffect(() => {
    if (integration?.is_active) {
      loadCalendars();
    }
  }, [integration]);

  const connectToGoogle = async () => {
    try {
      const response = await api.get('/integrations/google-calendar/auth/');
      
      // Redirect to Google auth URL
      window.location.href = response.data.authorization_url;
    } catch (error) {
      console.error('Error connecting to Google:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao iniciar conexão com Google Calendar',
        variant: 'destructive'
      });
    }
  };

  const disconnectGoogle = async () => {
    try {
      await api.delete('/integrations/google-calendar/sync/disconnect/');
      setIntegration(null);
      toast({
        title: 'Sucesso',
        description: 'Integração com Google Calendar desconectada'
      });
    } catch (error) {
      console.error('Error disconnecting from Google:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao desconectar do Google Calendar',
        variant: 'destructive'
      });
    }
  };

  const loadCalendars = async () => {
    try {
      const response = await api.get('/integrations/google-calendar/sync/get_calendars/');
      setAvailableCalendars(response.data.calendars);
      
      // Set the primary calendar as default if available
      const primaryCalendar = response.data.calendars.find((cal: any) => cal.primary);
      if (primaryCalendar) {
        setSelectedCalendar(primaryCalendar.id);
      }
    } catch (error) {
      console.error('Error loading calendars:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao carregar calendários do Google',
        variant: 'destructive'
      });
    }
  };

  const syncAppointment = async (appointmentId: number) => {
    try {
      setSyncing(true);
      await api.post('/integrations/google-calendar/sync/sync_appointment/', {
        appointment_id: appointmentId,
        calendar_id: selectedCalendar
      });
      
      toast({
        title: 'Sucesso',
        description: 'Consulta sincronizada com Google Calendar'
      });
    } catch (error) {
      console.error('Error syncing appointment:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao sincronizar consulta com Google Calendar',
        variant: 'destructive'
      });
    } finally {
      setSyncing(false);
    }
  };

  const syncAllAppointments = async () => {
    try {
      setSyncing(true);
      const response = await api.post('/integrations/google-calendar/sync/sync_all_appointments/', {
        calendar_id: selectedCalendar
      });
      
      toast({
        title: 'Sucesso',
        description: `Sincronização concluída: ${response.data.results.length} consultas processadas`
      });
    } catch (error) {
      console.error('Error syncing all appointments:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao sincronizar consultas com Google Calendar',
        variant: 'destructive'
      });
    } finally {
      setSyncing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando integração...</p>
        </div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="bg-blue-500 p-2 rounded-lg">
            <Calendar className="h-6 w-6 text-white" />
          </div>
          <div>
            <CardTitle>Google Calendar</CardTitle>
            <CardDescription>
              Integre sua agenda com o Google Calendar
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {integration ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div>
                <h3 className="font-medium">{integration.google_display_name}</h3>
                <p className="text-sm text-muted-foreground">{integration.google_email}</p>
              </div>
              <Badge variant={integration.is_active ? "default" : "secondary"}>
                {integration.is_active ? "Conectado" : "Desconectado"}
              </Badge>
            </div>

            <div className="space-y-3">
              <Label>Calendário Padrão</Label>
              <select
                value={selectedCalendar}
                onChange={(e) => setSelectedCalendar(e.target.value)}
                className="w-full p-2 border rounded-md bg-background"
                disabled={availableCalendars.length === 0}
              >
                {availableCalendars.map((calendar) => (
                  <option key={calendar.id} value={calendar.id}>
                    {calendar.summary} {calendar.primary && '(Principal)'}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Google Calendar não conectado</h3>
            <p className="text-muted-foreground mb-4">
              Conecte sua conta do Google para sincronizar suas consultas automaticamente
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row gap-3">
        {integration ? (
          <>
            <Button
              variant="outline"
              onClick={disconnectGoogle}
              className="flex-1"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Desconectar
            </Button>
            <Button
              onClick={syncAllAppointments}
              disabled={syncing}
              className="flex-1"
            >
              {syncing ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Sincronizar Tudo
            </Button>
          </>
        ) : (
          <Button
            onClick={connectToGoogle}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Conectar Google Calendar
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default GoogleCalendarIntegration;