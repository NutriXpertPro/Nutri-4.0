import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Scale, Target, Plus, Loader2, FileText, Calendar, MessageSquare, Trash2, Search, Filter, Activity, Zap } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { NewEvaluationDialog } from "@/components/evaluations/NewEvaluationDialog"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { evaluationService } from "@/services/evaluation-service"
import { usePatient } from "@/hooks/usePatients"
import patientService from "@/services/patient-service"
import { format } from "date-fns"
import { EvaluationGallery } from "@/components/evaluations/EvaluationGallery"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { IconWrapper } from "@/components/ui/IconWrapper"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface PatientAnalysisTabProps {
    patientId: number
}

export function PatientAnalysisTab({ patientId }: PatientAnalysisTabProps) {
    const [isNewEvaluationOpen, setIsNewEvaluationOpen] = React.useState(false)
    const [selectedMethod, setSelectedMethod] = React.useState<string>("all")
    const [noteForm, setNoteForm] = React.useState({
        content: '',
        title: '',
        category: 'evolution',
        date: new Date().toISOString().split('T')[0]
    })
    
    const { patient } = usePatient(patientId)
    const queryClient = useQueryClient()

    // Handle Note Submission
    const handleAddNote = async () => {
        if (!patientId || !noteForm.content.trim()) return
        try {
            await patientService.createClinicalNote(patientId, noteForm.content, noteForm.title)
            await queryClient.invalidateQueries({ queryKey: ['patient', patientId] })
            toast.success("Evolução registrada")
            setNoteForm(prev => ({ ...prev, content: '', title: '' }))
        } catch (error) {
            toast.error("Erro ao salvar")
        }
    }

    const handleDeleteNote = async (noteId: number) => {
        if(!confirm("Excluir esta nota?")) return
        try {
            await patientService.deleteClinicalNote(noteId)
            await queryClient.invalidateQueries({ queryKey: ['patient', patientId] })
            toast.success("Nota excluída")
        } catch(error) {
            toast.error("Erro ao excluir")
        }
    }

    const { data: evaluations = [], isLoading } = useQuery({
        queryKey: ['evaluations', patientId],
        queryFn: () => patientId ? evaluationService.listByPatient(patientId) : Promise.resolve([]),
        enabled: !!patientId
    })

    // Extrair métodos únicos para o filtro
    const uniqueMethods = React.useMemo(() => {
        const methods = new Set(evaluations.map(ev => ev.method).filter(Boolean))
        return Array.from(methods)
    }, [evaluations])

    // Process Data for Charts
    const chartData = React.useMemo(() => {
        if (!evaluations.length) return []
        const sorted = [...evaluations].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

        return sorted.map(ev => ({
            date: format(new Date(ev.date), 'dd/MM'),
            fullDate: format(new Date(ev.date), "dd 'de' MMMM"),
            peso: ev.weight || 0,
            massaMagra: ev.muscle_mass || 0,
            gordura: ev.body_fat || 0
        }))
    }, [evaluations])

    // Filtered Evaluations for Table
    const filteredEvaluations = React.useMemo(() => {
        let filtered = [...evaluations].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        
        if (selectedMethod && selectedMethod !== "all") {
            filtered = filtered.filter(ev => ev.method === selectedMethod)
        }
        
        return filtered
    }, [evaluations, selectedMethod])

    const getLatestValue = (key: 'weight' | 'muscle_mass' | 'body_fat') => {
        if (chartData.length === 0) return 0;
        const last = chartData[chartData.length - 1];
        if (key === 'weight') return last.peso;
        if (key === 'muscle_mass') return last.massaMagra;
        if (key === 'body_fat') return last.gordura;
        return 0;
    }

    return (
        <div className="space-y-8 pb-12">
            {/* Header com Avatar */}
            <div className="p-4 bg-background/40 rounded-xl border border-border/10 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-muted border border-background shadow-sm overflow-hidden flex items-center justify-center">
                        {patient?.avatar ? (
                            <img src={patient.avatar} alt={patient.name} className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-lg font-medium text-muted-foreground">{patient?.name?.substring(0, 2).toUpperCase()}</span>
                        )}
                    </div>
                    <div>
                        <h3 className="text-base font-medium">{patient?.name || 'Carregando...'}</h3>
                        <p className="text-xs text-muted-foreground font-normal">Painel de Performance</p>
                    </div>
                </div>
                {patientId && (
                    <Button onClick={() => setIsNewEvaluationOpen(true)} className="gap-2 h-9 px-4 text-xs font-normal">
                        <Plus className="w-3.5 h-3.5" /> Nova Avaliação
                    </Button>
                )}
            </div>

            {patientId && (
                <NewEvaluationDialog open={isNewEvaluationOpen} onOpenChange={setIsNewEvaluationOpen} patientId={patientId} />
            )}

            {isLoading ? (
                <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary opacity-20" /></div>
            ) : evaluations.length === 0 ? (
                <Card className="border-dashed border py-16 flex flex-col items-center justify-center text-center shadow-none bg-transparent">
                    <Scale className="h-8 w-8 text-muted-foreground/50 mb-3" />
                    <h3 className="text-base font-medium">Sem dados</h3>
                    <p className="text-xs text-muted-foreground mt-1 mb-4">Registre a primeira avaliação.</p>
                    <Button onClick={() => setIsNewEvaluationOpen(true)} variant="outline" size="sm">Criar Avaliação</Button>
                </Card>
            ) : (
                <>
                    {/* Grid de Gráficos Individuais */}
                    <div className="grid gap-6 md:grid-cols-3">
                        
                        {/* 1. Peso */}
                        <Card className="shadow-sm">
                            <CardHeader className="pb-2 p-5">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="p-1.5 rounded-md bg-blue-50 text-blue-600"><Scale className="w-4 h-4" /></div>
                                        <span className="text-sm font-medium">Peso Corporal</span>
                                    </div>
                                    <span className="text-lg font-medium tabular-nums text-blue-600">{getLatestValue('weight')} kg</span>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0 pb-4">
                                <div className="h-[180px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
                                            <defs>
                                                <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.2} />
                                                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" strokeOpacity={0.5} />
                                            <XAxis dataKey="date" stroke="#9ca3af" fontSize={10} tickLine={false} axisLine={false} dy={5} />
                                            <YAxis stroke="#9ca3af" fontSize={10} tickLine={false} axisLine={false} domain={['dataMin - 2', 'dataMax + 2']} />
                                            <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                            <Area type="monotone" dataKey="peso" stroke="#3b82f6" strokeWidth={2} fill="url(#blueGradient)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>

                        {/* 2. Massa Magra */}
                        <Card className="shadow-sm">
                            <CardHeader className="pb-2 p-5">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="p-1.5 rounded-md bg-emerald-50 text-emerald-600"><Zap className="w-4 h-4" /></div>
                                        <span className="text-sm font-medium">Massa Magra</span>
                                    </div>
                                    <span className="text-lg font-medium tabular-nums text-emerald-600">{getLatestValue('muscle_mass')} kg</span>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0 pb-4">
                                <div className="h-[180px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
                                            <defs>
                                                <linearGradient id="greenGradient" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.2} />
                                                    <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" strokeOpacity={0.5} />
                                            <XAxis dataKey="date" stroke="#9ca3af" fontSize={10} tickLine={false} axisLine={false} dy={5} />
                                            <YAxis stroke="#9ca3af" fontSize={10} tickLine={false} axisLine={false} />
                                            <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                            <Area type="monotone" dataKey="massaMagra" stroke="#10b981" strokeWidth={2} fill="url(#greenGradient)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>

                        {/* 3. Gordura */}
                        <Card className="shadow-sm">
                            <CardHeader className="pb-2 p-5">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="p-1.5 rounded-md bg-orange-50 text-orange-600"><Activity className="w-4 h-4" /></div>
                                        <span className="text-sm font-medium">Gordura Corporal</span>
                                    </div>
                                    <span className="text-lg font-medium tabular-nums text-orange-600">{getLatestValue('body_fat')}%</span>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0 pb-4">
                                <div className="h-[180px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
                                            <defs>
                                                <linearGradient id="orangeGradient" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0%" stopColor="#f97316" stopOpacity={0.2} />
                                                    <stop offset="100%" stopColor="#f97316" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" strokeOpacity={0.5} />
                                            <XAxis dataKey="date" stroke="#9ca3af" fontSize={10} tickLine={false} axisLine={false} dy={5} />
                                            <YAxis stroke="#9ca3af" fontSize={10} tickLine={false} axisLine={false} />
                                            <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                            <Area type="monotone" dataKey="gordura" stroke="#f97316" strokeWidth={2} fill="url(#orangeGradient)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Galeria */}
                    <div className="pt-2">
                        <EvaluationGallery evaluations={evaluations} />
                    </div>

                    {/* Tabela de Histórico - Melhorada com Filtro */}
                    <Card className="shadow-sm overflow-hidden border border-border/10">
                        <div className="p-5 border-b border-border/10 bg-muted/5 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div>
                                <h3 className="text-base font-medium">Histórico de Avaliações</h3>
                                <p className="text-xs text-muted-foreground font-normal">Todos os registros detalhados</p>
                            </div>
                            
                            <div className="flex items-center gap-3 w-full sm:w-auto">
                                <Filter className="w-4 h-4 text-muted-foreground" />
                                <Select value={selectedMethod} onValueChange={setSelectedMethod}>
                                    <SelectTrigger className="w-full sm:w-[200px] h-9 text-xs">
                                        <SelectValue placeholder="Filtrar por método" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Todos os métodos</SelectItem>
                                        {uniqueMethods.map(method => (
                                            <SelectItem key={method || 'unknown'} value={method || ''}>
                                                {(method || '').replace(/_/g, ' ')}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader className="bg-muted/10">
                                    <TableRow className="border-b border-border/10 hover:bg-transparent">
                                        <TableHead className="pl-6 h-10 text-xs font-medium text-muted-foreground">DATA</TableHead>
                                        <TableHead className="h-10 text-xs font-medium text-muted-foreground">MÉTODO</TableHead>
                                        <TableHead className="text-center h-10 text-xs font-medium text-muted-foreground">PESO</TableHead>
                                        <TableHead className="text-center h-10 text-xs font-medium text-muted-foreground">GORDURA</TableHead>
                                        <TableHead className="text-center h-10 text-xs font-medium text-muted-foreground">MASSA MAGRA</TableHead>
                                        <TableHead className="text-right pr-6 h-10 text-xs font-medium text-muted-foreground">ALTURA</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredEvaluations.length > 0 ? (
                                        filteredEvaluations.map((ev) => (
                                            <TableRow key={ev.id} className="border-b border-border/5 hover:bg-muted/5">
                                                <TableCell className="pl-6 font-medium text-xs py-3">
                                                    {format(new Date(ev.date), "dd/MM/yyyy")}
                                                </TableCell>
                                                <TableCell className="py-3">
                                                    <span className="text-xs text-muted-foreground capitalize">
                                                        {ev.method?.toLowerCase()?.replace(/_/g, ' ') || '-'}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-center font-medium text-xs tabular-nums py-3">
                                                    {ev.weight} kg
                                                </TableCell>
                                                <TableCell className="text-center text-xs tabular-nums py-3">
                                                    {ev.body_fat ? <span className="text-orange-600">{ev.body_fat}%</span> : '-'}
                                                </TableCell>
                                                <TableCell className="text-center text-xs tabular-nums py-3">
                                                    {ev.muscle_mass ? <span className="text-emerald-600">{ev.muscle_mass} kg</span> : '-'}
                                                </TableCell>
                                                <TableCell className="text-right pr-6 text-xs tabular-nums text-muted-foreground py-3">
                                                    {ev.height || '-'} m
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={6} className="h-24 text-center text-xs text-muted-foreground">
                                                Nenhum resultado para este filtro.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </Card>
                </>
            )}

            {/* Anotações */}
            <Card className="shadow-sm overflow-hidden border border-border/10">
                <div className="p-5 border-b border-border/10 bg-muted/5 flex items-center justify-between">
                    <div>
                        <h3 className="text-base font-medium">Diário de Evolução</h3>
                        <p className="text-xs text-muted-foreground font-normal">Notas clínicas e observações</p>
                    </div>
                </div>
                <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row">
                        {/* Timeline */}
                        <div className="flex-1 p-6 space-y-6 border-b md:border-b-0 md:border-r border-border/10 min-h-[350px] max-h-[500px] overflow-y-auto">
                            {patient?.notes && patient.notes.length > 0 ? (
                                <div className="space-y-6 relative before:absolute before:inset-y-0 before:left-[15px] before:w-[1px] before:bg-border/40">
                                    {patient.notes.map((note: any, idx: number) => {
                                        const noteDate = new Date(note.created_at || Date.now())
                                        return (
                                            <div key={note.id || idx} className="relative pl-8">
                                                <div className="absolute left-[11px] top-1.5 w-2 h-2 rounded-full bg-primary ring-4 ring-background" />
                                                <div className="bg-background rounded-lg border border-border/10 p-4 shadow-sm">
                                                    <div className="flex justify-between items-center mb-2">
                                                        <span className="text-[10px] text-muted-foreground uppercase font-medium">
                                                            {format(noteDate, "dd 'de' MMM, yyyy")}
                                                        </span>
                                                        <Button variant="ghost" size="icon" className="h-5 w-5 text-muted-foreground hover:text-red-500" onClick={() => handleDeleteNote(note.id)}>
                                                            <Trash2 className="w-3 h-3" />
                                                        </Button>
                                                    </div>
                                                    <h4 className="text-sm font-medium text-foreground mb-1">{note.title}</h4>
                                                    <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap font-normal">
                                                        {note.content}
                                                    </p>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                                    <MessageSquare className="w-8 h-8 mb-2" />
                                    <p className="text-xs">Nenhuma nota registrada.</p>
                                </div>
                            )}
                        </div>

                        {/* Form */}
                        <div className="w-full md:w-[320px] p-6 bg-muted/5">
                            <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-4">Nova Nota</h4>
                            <div className="space-y-3">
                                <div className="space-y-1">
                                    <Input
                                        placeholder="Título..."
                                        value={noteForm.title}
                                        onChange={e => setNoteForm(prev => ({ ...prev, title: e.target.value }))}
                                        className="h-8 text-xs bg-background"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <textarea
                                        rows={6}
                                        placeholder="Escreva a evolução aqui..."
                                        value={noteForm.content}
                                        onChange={e => setNoteForm(prev => ({ ...prev, content: e.target.value }))}
                                        className="w-full px-3 py-2 bg-background border rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-primary/20 resize-none font-normal"
                                    />
                                </div>
                                <Button className="w-full h-8 text-xs font-normal" onClick={handleAddNote} disabled={!noteForm.content}>
                                    Salvar
                                </Button>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
