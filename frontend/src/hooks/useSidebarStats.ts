import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '@/services/dashboard-service';
import { messagesAPI } from '@/services/api';
import { anamnesisService } from '@/services/anamnesis-service';

export function useSidebarStats() {
    // 1. Dashboard Stats (Pacientes & Agenda)
    const { data: dashboardStats } = useQuery({
        queryKey: ['dashboard-stats'],
        queryFn: dashboardService.getStats,
        refetchInterval: 60000, // Atualizar a cada 1 min
        staleTime: 30000
    });

    // 2. Mensagens Não Lidas
    const { data: conversations } = useQuery({
        queryKey: ['messages-inbox-stats'],
        queryFn: async () => {
            const res = await messagesAPI.getConversations();
            return res.data;
        },
        refetchInterval: 30000,
        staleTime: 15000
    });

    const unreadMessages = conversations?.reduce((acc: number, conv: any) => acc + (conv.unread_count || 0), 0) || 0;

    // 3. Anamneses Pendentes (Incompletas)
    const { data: anamneses } = useQuery({
        queryKey: ['anamnesis-list-stats'],
        queryFn: anamnesisService.listStandardAnamneses,
        refetchInterval: 60000,
        staleTime: 30000
    });

    // Contar todas as anamneses registradas (Concluídas e Em andamento)
    // Isso reflete a quantidade total de fichas disponíveis para visualização.
    const totalAnamneses = anamneses?.length || 0;

    return {
        patients: dashboardStats?.active_patients || 0,
        appointments: dashboardStats?.appointments_today || 0,
        messages: unreadMessages,
        anamnesis: totalAnamneses,
    };
}
