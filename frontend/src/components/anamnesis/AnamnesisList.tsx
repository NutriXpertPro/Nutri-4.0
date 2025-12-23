"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
    FileText,
    Calendar,
    User,
    Target,
    Clock,
    CheckCircle2,
    Plus,
    Eye,
    Edit,
    Download,
    Filter
} from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

interface AnamnesisItem {
    id: number
    patientName: string
    patientEmail: string
    objective: string
    status: "completed" | "incomplete" | "pending"
    lastUpdated: Date
    completionPercentage: number
}

interface AnamnesisListProps {
    onNewAnamnesis: () => void
    onEdit: (id: number) => void
    onView: (id: number) => void
}

export function AnamnesisList({ onNewAnamnesis, onEdit, onView }: AnamnesisListProps) {
    const [anamnesisList, setAnamnesisList] = useState<AnamnesisItem[]>([])
    const [searchQuery, setSearchQuery] = useState("")
    const [filterStatus, setFilterStatus] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    // Simulando dados - em um cenário real, viria de uma API
    useEffect(() => {
        // Simulação de chamada à API
        const mockData: AnamnesisItem[] = [
            {
                id: 1,
                patientName: "Maria Silva",
                patientEmail: "maria@example.com",
                objective: "Emagrecimento",
                status: "completed",
                lastUpdated: new Date(2025, 11, 1),
                completionPercentage: 100
            },
            {
                id: 2,
                patientName: "João Santos",
                patientEmail: "joao@example.com",
                objective: "Ganho de massa muscular",
                status: "incomplete",
                lastUpdated: new Date(2025, 11, 5),
                completionPercentage: 65
            },
            {
                id: 3,
                patientName: "Ana Costa",
                patientEmail: "ana@example.com",
                objective: "Trincar o shape",
                status: "pending",
                lastUpdated: new Date(2025, 11, 8),
                completionPercentage: 15
            },
            {
                id: 4,
                patientName: "Carlos Oliveira",
                patientEmail: "carlos@example.com",
                objective: "Ganho de peso",
                status: "completed",
                lastUpdated: new Date(2025, 11, 10),
                completionPercentage: 100
            },
        ]
        
        setTimeout(() => {
            setAnamnesisList(mockData)
            setIsLoading(false)
        }, 500)
    }, [])

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
                    <Button onClick={onNewAnamnesis} className="gap-2">
                        <Plus className="h-4 w-4" />
                        Nova Anamnese
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
                                className={`px-4 py-2 text-sm capitalize rounded-full transition-colors ${
                                    (f === 'all' && filterStatus === null) || filterStatus === f
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
                                                    <Target className="h-4 w-4 text-muted-foreground" />
                                                    {item.objective}
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
                                                    {format(item.lastUpdated, "dd/MM/yyyy", { locale: ptBR })}
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