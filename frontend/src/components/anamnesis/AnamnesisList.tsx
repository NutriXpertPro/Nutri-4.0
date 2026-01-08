"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Search,
    User,
    Target,
    Calendar,
    Eye,
    Edit,
    Download,
    TrendingDown,
    TrendingUp,
    Dumbbell,
    Flame
} from "lucide-react"
import { IconWrapper } from "@/components/ui/IconWrapper"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { useQuery } from "@tanstack/react-query"
import { usePatients } from "@/hooks/usePatients"
import { anamnesisService } from "@/services/anamnesis-service"

interface AnamnesisItem {
    id: number // Patient ID for linking
    anamnesisId?: number
    patientName: string
    patientEmail: string
    objective: string
    status: "completed" | "incomplete" | "pending"
    lastUpdated: Date | null
    completionPercentage: number
}

// Helper para obter ícone e cor baseado no objetivo
const getObjectiveConfig = (objective: string) => {
    // Normalizar string para comparação segura
    const obj = objective?.toLowerCase() || ""

    if (obj.includes("emagrecimento") || obj.includes("perda")) {
        return { icon: TrendingDown, variant: "blue" as const }
    } else if (obj.includes("massa") || obj.includes("hipertrofia")) {
        return { icon: Dumbbell, variant: "amber" as const }
    } else if (obj.includes("peso")) {
        return { icon: TrendingUp, variant: "indigo" as const }
    } else if (obj.includes("definir") || obj.includes("trincar")) {
        return { icon: Flame, variant: "rose" as const }
    } else {
        return { icon: Target, variant: "emerald" as const }
    }
}

interface AnamnesisListProps {
    onNewAnamnesis: () => void
    onEdit: (id: number) => void
    onView: (id: number) => void
}

export function AnamnesisList({ onNewAnamnesis, onEdit, onView }: AnamnesisListProps) {
    const [searchQuery, setSearchQuery] = useState("")
    const [filterStatus, setFilterStatus] = useState<string | null>(null)

    // Buscar Pacientes
    const { patients, isLoading: isLoadingPatients } = usePatients()

    // Buscar Anamneses Padrão (todas)
    const { data: anamneses, isLoading: isLoadingAnamneses } = useQuery({
        queryKey: ['anamnesis-standard-list'],
        queryFn: anamnesisService.listStandardAnamneses
    })

    const isLoading = isLoadingPatients || isLoadingAnamneses

    // Combinar dados
    const anamnesisList: AnamnesisItem[] = patients?.map(patient => {
        // Encontrar anamnese deste paciente
        const anamnesis = anamneses?.find((a: any) => a.patient === patient.id)

        let status: AnamnesisItem['status'] = 'pending'
        let completionPercentage = 0
        let lastUpdated: Date | null = null

        if (anamnesis) {
            completionPercentage = anamnesis.progresso || 0

            if (completionPercentage === 100) status = 'completed'
            else if (completionPercentage > 0) status = 'incomplete'
            else status = 'pending'

            lastUpdated = new Date(anamnesis.updated_at)
        }

        // Mapping objetivos do patient service para display friendlier se não tiver no anamnesis
        // Patient service: PERDA_GORDURA, GANHO_MASSA, QUALIDADE_VIDA, OUTRO
        // Anamnesis: Emagrecimento, Ganho de massa muscular, etc.
        const mapGoal = (goal?: string) => {
            if (!goal) return "Não definido"
            if (goal === 'PERDA_GORDURA') return 'Emagrecimento'
            if (goal === 'GANHO_MASSA') return 'Ganho de Massa'
            if (goal === 'QUALIDADE_VIDA') return 'Qualidade de Vida'
            if (goal === 'PERDA_PESO') return 'Perda de peso - Redução de peso com foco em saúde e sustentabilidade'
            if (goal === 'GANHO_MUSCULAR') return 'Ganho de massa muscular - Hipertrofia e desenvolvimento muscular'
            if (goal === 'MANUTENCAO_PESO') return 'Manutenção do peso - Equilíbrio e manutenção do peso atual'
            if (goal === 'PERFORMANCE_ESPORTIVA') return 'Performance esportiva - Otimização do desempenho atlético e competitivo'
            if (goal === 'GESTACAO_LACTACAO') return 'Gestação e lactação - Acompanhamento nutricional materno-infantil'
            if (goal === 'DOENCAS_CRONICAS') return 'Manejo de doenças crônicas - Diabetes, hipertensão, dislipidemias, doenças cardiovasculares'
            if (goal === 'REABILITACAO_NUTRICIONAL') return 'Reabilitação nutricional - Recuperação pós-cirúrgica ou pós-doença'
            if (goal === 'TRANSTORNOS_ALIMENTARES') return 'Transtornos alimentares - Apoio no tratamento de anorexia, bulimia, compulsão alimentar'
            if (goal === 'ALERGIAS_INTOLERANCIAS') return 'Alergias e intolerâncias alimentares - Manejo de restrições alimentares específicas'
            if (goal === 'DISTURBIOS_GASTROINTESTINAIS') return 'Distúrbios gastrointestinais - Síndrome do intestino irritável, doença celíaca, refluxo'
            if (goal === 'CONDICOES_HORMONAIS') return 'Condições hormonais - SOP (Síndrome dos Ovários Policísticos), hipotireoidismo, menopausa'
            if (goal === 'NUTRICAO_FUNCIONAL') return 'Nutrição funcional e integrativa - Abordagem holística e preventiva'
            if (goal === 'SUPLEMENTACAO_ORIENTADA') return 'Suplementação orientada - Otimização do uso de suplementos nutricionais'
            if (goal === 'SAUDE_IDOSO') return 'Saúde do idoso - Nutrição voltada para longevidade e qualidade de vida'
            if (goal === 'PREVENCAO_DOENCAS') return 'Prevenção de doenças - Promoção de saúde e hábitos preventivos'
            return goal
        }

        return {
            id: patient.id,
            anamnesisId: anamnesis?.patient, // ID da anamnese é o mesmo do paciente (OneToOne Primary Key)
            patientName: patient.name,
            patientEmail: patient.email,
            objective: anamnesis?.objetivo || mapGoal(patient.goal),
            status,
            lastUpdated,
            completionPercentage
        }
    }) || []

    const filteredAnamnesis = anamnesisList.filter(item => {
        const matchesSearch =
            item.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.patientEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.objective.toLowerCase().includes(searchQuery.toLowerCase())

        const matchesFilter = filterStatus ? item.status === filterStatus : true

        return matchesSearch && matchesFilter
    })

    const getStatusBadge = (status: AnamnesisItem["status"]) => {
        switch (status) {
            case "completed":
                return <Badge className="bg-emerald-500 hover:bg-emerald-500">Completa</Badge>
            case "incomplete":
                return <Badge className="bg-amber-500 hover:bg-amber-500">Incompleta</Badge>
            case "pending":
                return <Badge className="bg-destructive text-white hover:bg-destructive">Pendente</Badge>
            default:
                return <Badge variant="outline">Desconhecido</Badge>
        }
    }

    return (
        <div className="space-y-6">
            {/* Header com ações */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-normal tracking-tight">Anamneses</h2>
                    <p className="text-muted-foreground">
                        Gerencie as anamneses dos seus pacientes
                    </p>
                </div>

                <div className="flex flex-wrap gap-3">
                    <Button onClick={onNewAnamnesis}>
                        Anamnese
                    </Button>
                </div>
            </div>

            {/* Filtros e Busca */}
            <Card>
                <CardHeader className="pb-3">
                    <div className="flex gap-2">
                        {(['all', 'completed', 'incomplete', 'pending'] as const).map((f) => (
                            <button
                                key={f}
                                className={`px-4 py-2 text-sm capitalize rounded-full transition-colors ${(f === 'all' && filterStatus === null) || filterStatus === f
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                    }`}
                                onClick={() => setFilterStatus(f === 'all' ? null : f)}
                            >
                                {f === 'all' ? 'Todos' :
                                    f === 'completed' ? 'Completas' :
                                        f === 'incomplete' ? 'Incompletas' :
                                            'Pendentes'}
                            </button>
                        ))}
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 mt-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar paciente, objetivos..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Paciente</TableHead>
                                    <TableHead>Objetivo</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Progresso</TableHead>
                                    <TableHead>Última Atualização</TableHead>
                                    <TableHead>Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8">
                                            Carregando anamneses...
                                        </TableCell>
                                    </TableRow>
                                ) : filteredAnamnesis.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                            Nenhuma anamnese encontrada
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredAnamnesis.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                                        <User className="h-5 w-5 text-primary" />
                                                    </div>
                                                    <div>
                                                        <div className="font-medium">{item.patientName}</div>
                                                        <div className="text-sm text-muted-foreground">{item.patientEmail}</div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <IconWrapper
                                                        {...getObjectiveConfig(item.objective)}
                                                        size="sm"
                                                        className="ring-2 ring-background border border-white/5 shadow-sm"
                                                    />
                                                    <span className="text-sm font-medium">{item.objective}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {getStatusBadge(item.status)}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <div className="h-2 w-32 bg-muted rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-primary rounded-full"
                                                            style={{ width: `${item.completionPercentage}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-sm text-muted-foreground">{item.completionPercentage}%</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <Calendar className="h-4 w-4" />
                                                    {item.lastUpdated ? format(item.lastUpdated, "dd/MM/yyyy", { locale: ptBR }) : "-"}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => onView(item.id)}
                                                        title="Visualizar"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => onEdit(item.id)}
                                                        title="Editar"
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        title="Exportar"
                                                    >
                                                        <Download className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}