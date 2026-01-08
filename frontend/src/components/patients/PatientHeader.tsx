"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MessageSquare, Calendar, Edit, Phone, Mail, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import api from "@/services/api"
import { useAuth } from "@/contexts/auth-context"

import { EditPatientDialog } from "./EditPatientDialog"

interface PatientHeaderProps {
    patient?: {
        name: string
        avatar?: string
        email: string
        phone: string
        age: number
        occupation: string
        status: "active" | "inactive"
        adesao?: number
    }
    fullData?: any // Pass the full API object here
    className?: string
}

const defaultPatient = {
    name: "Maria Silva",
    email: "maria.silva@email.com",
    phone: "(11) 99999-8888",
    age: 32,
    occupation: "Advogada",
    status: "active" as const,
    adesao: 87,
}

export function PatientHeader({ patient = defaultPatient, fullData, className }: PatientHeaderProps) {
    const [isEditOpen, setIsEditOpen] = React.useState(false)
    const [isSendingLink, setIsSendingLink] = React.useState(false);
    const router = useRouter();
    const { user } = useAuth();

    const handleOpenMessage = async () => {
        if (!fullData) return;

        try {
            // Primeiro, tentamos encontrar uma conversa existente com o paciente
            const response = await api.get('/messages/conversations/');
            const conversations = response.data;

            // Procurar uma conversa que contenha o paciente como participante
            let conversation = conversations.find((conv: any) =>
                conv.participants.some((p: any) => p.id === (isNaN(Number(fullData.id)) ? fullData.id : parseInt(fullData.id)))
            );

            // Se não encontrar uma conversa existente, criamos uma nova
            if (!conversation) {
                // Criamos uma conversa com o paciente como participante
                // O backend automaticamente adiciona o usuário autenticado como participante
                const patientId = isNaN(Number(fullData.id)) ? fullData.id : parseInt(fullData.id);

                try {
                    // Enviar o ID do paciente como participante
                    const newConversationResponse = await api.post('/messages/conversations/', {
                        participants: [patientId]
                    });
                    conversation = newConversationResponse.data;
                } catch (createError: any) {
                    console.error('Erro ao criar conversa:', createError);
                    // Verificar se é um erro 400 e tentar uma abordagem alternativa
                    if (createError.response?.status === 400) {
                        // Se o erro for 400, pode ser um problema com a validação do ManyToManyField
                        // Tentar criar uma conversa vazia e deixar o backend adicionar os participantes
                        try {
                            // Primeiro, vamos tentar encontrar o ID do usuário autenticado
                            const currentUserId = user?.id || JSON.parse(localStorage.getItem('user') || '{}')?.id;

                            if (currentUserId) {
                                // Tentar criar uma conversa vazia e adicionar participantes separadamente
                                // Mas como não temos um endpoint para isso, vamos tentar uma abordagem diferente
                                // Vamos tentar criar a conversa com ambos os participantes explicitamente
                                const newConversationResponse = await api.post('/messages/conversations/', {
                                    participants: [currentUserId, patientId]
                                });
                                conversation = newConversationResponse.data;
                            } else {
                                throw createError; // Se não tivermos o ID do usuário, lançar o erro original
                            }
                        } catch (fallbackError: any) {
                            console.error('Erro ao criar conversa com abordagem alternativa:', fallbackError);
                            throw fallbackError;
                        }
                    } else {
                        throw createError; // Para outros tipos de erro, lançar o erro original
                    }
                }
            }

            // Navegar para a página de mensagens com o ID da conversa
            router.push(`/messages?conversation=${conversation.id}`);
        } catch (error) {
            console.error('Erro ao abrir conversa com o paciente:', error);
            // Se houver erro, redirecionar para a página de mensagens genérica
            router.push('/messages');
        }
    };

    const handleScheduleAppointment = () => {
        // Redirecionar para a página de calendário em vez de uma rota inexistente
        router.push('/calendar');
    };

    const handleResendPasswordLink = async () => {
        if (!fullData?.id) return;

        setIsSendingLink(true);
        try {
            const response = await api.post(`/patients/${fullData.id}/resend-password-link/`);
            alert(response.data.message || 'Link de redefinição de senha enviado com sucesso!');
        } catch (error: any) {
            console.error('Erro ao reenviar link de redefinição de senha:', error);
            alert(error.response?.data?.error || 'Erro ao reenviar link de redefinição de senha.');
        } finally {
            setIsSendingLink(false);
        }
    };

    return (
        <div className={cn("relative mb-8 overflow-hidden rounded-3xl border border-border/50 bg-card/30 backdrop-blur-sm shadow-sm", className)}>
            {/* Background Banner */}
            <div className="h-32 w-full bg-gradient-to-r from-primary/20 via-primary/10 to-transparent relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
            </div>

            <div className="px-6 md:px-10 pb-8 -mt-12 flex flex-col md:flex-row items-end md:items-center gap-6 relative z-10">
                {/* Avatar Grande */}
                <div className="relative group">
                    <Avatar className="h-32 w-32 border-4 border-background shadow-2xl transition-transform group-hover:scale-105 overflow-hidden">
                        <AvatarImage src={patient.avatar || (patient as any).photo} className="h-full w-full object-cover" />
                        <AvatarFallback className="text-4xl bg-primary/10 text-primary">
                            {patient.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <Badge
                        className={cn(
                            "absolute bottom-2 right-2 border-2 border-background px-2 py-0.5 shadow-lg",
                            patient.status === "active" ? "bg-green-500 text-white" : "bg-gray-500 text-white"
                        )}
                    >
                        {patient.status === "active" ? "Ativo" : "Inativo"}
                    </Badge>
                </div>

                {/* Informações Principais */}
                <div className="flex-1 space-y-2 mb-2">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                        <h1 className="text-h1 font-normal">
                            {patient.name}
                        </h1>
                        <div className="flex gap-2">
                            <Badge variant="outline" className="text-muted-foreground bg-background/50">
                                {patient.age} anos
                            </Badge>
                            <Badge variant="outline" className="text-muted-foreground bg-background/50">
                                {patient.occupation}
                            </Badge>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-1.5 text-subtitle">
                            <Mail className="h-3.5 w-3.5 text-blue-500" />
                            {patient.email}
                        </div>
                        <div className="flex items-center gap-1.5 text-subtitle">
                            {patient.phone}
                        </div>
                    </div>
                </div>

                {/* Ações */}
                <div className="flex items-center gap-2 mb-2 w-full md:w-auto">
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-9 gap-2 flex-1 md:flex-none glass-card-hover border-destructive/20 text-destructive hover:bg-destructive/5 hover:border-destructive/40"
                        onClick={handleOpenMessage}
                    >
                        <MessageSquare className="h-4 w-4" />
                        Mensagem
                    </Button>
                    <Button
                        variant="default"
                        size="sm"
                        className="h-9 gap-2 flex-1 md:flex-none shadow-lg shadow-primary/20"
                        onClick={handleScheduleAppointment}
                    >
                        <Calendar className="h-4 w-4 text-amber-300" />
                        Agendar
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-9 gap-2 flex-1 md:flex-none glass-card-hover border-blue-500/20 text-blue-600 hover:bg-blue-500/5 hover:border-blue-500/40"
                        onClick={handleResendPasswordLink}
                        disabled={!fullData || isSendingLink}
                    >
                        {isSendingLink ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Enviando...
                            </>
                        ) : (
                            <>
                                <Mail className="h-4 w-4" />
                                Reenviar Link
                            </>
                        )}
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                        onClick={() => setIsEditOpen(true)}
                        disabled={!fullData}
                    >
                        <Edit className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {fullData && (
                <EditPatientDialog
                    open={isEditOpen}
                    onOpenChange={setIsEditOpen}
                    patient={fullData}
                />
            )}
        </div>
    )
}
