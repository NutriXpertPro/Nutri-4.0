"use client"

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { UserProfileForm } from "@/components/user-profile/UserProfileForm";
import AutomationSettings from "@/components/automation/AutomationSettings";
import BrandingSettings from "@/components/branding/BrandingSettings";
import GoogleCalendarIntegration from "@/components/integrations/GoogleCalendarIntegration";

export default function SettingsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          <p className="text-muted-foreground animate-pulse">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-1">Configurações</h1>
        <p className="text-muted-foreground">Gerencie suas informações de perfil e preferências.</p>
      </div>
      <div className="border-b pb-4">
        <h2 className="text-2xl font-semibold mb-4">Informações do Perfil</h2>
        <UserProfileForm />
      </div>
      {/* Configurações de automação de mensagens */}
      <AutomationSettings />
      {/* Configurações de branding */}
      <BrandingSettings />
      {/* Configurações de integração com Google Calendar */}
      <GoogleCalendarIntegration />
    </div>
  );
}
