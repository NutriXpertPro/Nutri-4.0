import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Scale, Target, Plus, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { NewEvaluationDialog } from "@/components/evaluations/NewEvaluationDialog"
import { useQuery } from "@tanstack/react-query"
import { evaluationService, Evaluation } from "@/services/evaluation-service"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { EvaluationGallery } from "@/components/evaluations/EvaluationGallery"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

// Cores modernas e vibrantes
const COLORS = {
    primary: '#6366f1',      // Indigo vibrante
    primaryLight: '#818cf8',
    secondary: '#22c55e',    // Verde sucesso
    accent: '#f59e0b',       // Laranja/Âmbar
    water: '#0ea5e9',        // Azul água
    muscle: '#10b981',       // Verde esmeralda
    fat: '#ef4444',          // Vermelho suave
    meta: '#94a3b8',         // Cinza elegante
    grid: '#e2e8f0',         // Grid suave
}

interface PatientAnalysisTabProps {
    patientId?: number
}

export function PatientAnalysisTab({ patientId }: PatientAnalysisTabProps) {
    const [isNewEvaluationOpen, setIsNewEvaluationOpen] = React.useState(false)

    // Fetch Evaluations
    const { data: evaluations = [], isLoading } = useQuery({
        queryKey: ['evaluations', patientId],
        queryFn: () => patientId ? evaluationService.listByPatient(patientId) : Promise.resolve([]),
        enabled: !!patientId
    })

    // Process Data for Charts
    const weightData = React.useMemo(() => {
        if (!evaluations.length) return []
        // Sort by date ascending for chart
        const sorted = [...evaluations].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

        return sorted.map(ev => ({
            date: format(new Date(ev.date), 'dd/MM'),
            fullDate: format(new Date(ev.date), "dd 'de' MMMM"),
            peso: ev.weight
        }))
    }, [evaluations])

    // Get latest composition data
    const latestEvaluation = React.useMemo(() => {
        if (!evaluations.length) return null
        // Sort by date descending to get latest
        return [...evaluations].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]
    }, [evaluations])

    // Dynamic composition data based on latest evaluation
    const compositionData = [
        { name: 'Massa Magra', atual: latestEvaluation?.muscle_mass || 0, meta: 0, icon: '💪', color: '#10b981' },
        { name: 'Gordura', atual: latestEvaluation?.body_fat || 0, meta: 0, icon: '🔥', color: '#f59e0b' },
    ]

    const weightChange = React.useMemo(() => {
        if (evaluations.length < 2) return null
        const sorted = [...evaluations].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        const latest = sorted[0].weight || 0
        const previous = sorted[sorted.length - 1].weight || 0 // Compare with first one for total progress
        return (latest - previous).toFixed(1)
    }, [evaluations])


    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h3 className="text-lg font-semibold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                        Análise Corporal
                    </h3>
                    <p className="text-sm text-muted-foreground">Evolução dos indicadores físicos</p>
                </div>
                <div className="flex items-center gap-2">
                    {patientId && (
                        <Button onClick={() => setIsNewEvaluationOpen(true)} className="gap-2">
                            <Plus className="h-4 w-4" />
                            Nova Avaliação
                        </Button>
                    )}
                </div>
            </div>

            {patientId && (
                <NewEvaluationDialog
                    open={isNewEvaluationOpen}
                    onOpenChange={setIsNewEvaluationOpen}
                    patientId={patientId}
                />
            )}

            {isLoading ? (
                <div className="flex justify-center py-10">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : evaluations.length === 0 ? (
                <Card className="border-dashed py-10">
                    <div className="flex flex-col items-center justify-center text-center">
                        <Scale className="h-10 w-10 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold">Nenhuma avaliação registrada</h3>
                        <p className="text-sm text-muted-foreground max-w-sm mt-1 mb-4">
                            Registe a primeira avaliação física para começar a acompanhar a evolução do paciente.
                        </p>
                        <Button variant="outline" onClick={() => setIsNewEvaluationOpen(true)}>
                            Criar primeira avaliação
                        </Button>
                    </div>
                </Card>
            ) : (
                <>
                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Gráfico de Evolução de Peso */}
                        <Card className="col-span-2 lg:col-span-1 overflow-hidden border-0 shadow-xl bg-gradient-to-br from-indigo-500/5 via-transparent to-emerald-500/5">
                            <CardHeader className="pb-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/25">
                                            <Scale className="h-5 w-5 text-white" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-base">Evolução de Peso</CardTitle>
                                            <CardDescription className="text-xs">Progresso total</CardDescription>
                                        </div>
                                    </div>
                                    {weightChange && (
                                        <Badge variant="secondary" className={`font-semibold ${Number(weightChange) <= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                            {Number(weightChange) > 0 ? '+' : ''}{weightChange} kg
                                        </Badge>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent className="pt-2">
                                <div className="h-[280px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={weightData} margin={{ top: 20, right: 20, left: -10, bottom: 0 }}>
                                            <defs>
                                                <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0%" stopColor={COLORS.primary} stopOpacity={0.4} />
                                                    <stop offset="50%" stopColor={COLORS.primaryLight} stopOpacity={0.2} />
                                                    <stop offset="100%" stopColor={COLORS.primary} stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={COLORS.grid} strokeOpacity={0.5} />
                                            <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} dy={10} />
                                            <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} domain={['dataMin - 3', 'dataMax + 3']} dx={-10} />
                                            <Tooltip
                                                contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: '12px', border: 'none', boxShadow: '0 10px 40px -10px rgba(0, 0, 0, 0.2)', padding: '12px 16px' }}
                                                labelStyle={{ color: '#64748b', marginBottom: '4px' }}
                                            />
                                            <Area type="monotone" dataKey="peso" stroke={COLORS.primary} strokeWidth={3} fill="url(#weightGradient)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Composição Corporal */}
                        <Card className="col-span-2 lg:col-span-1 border-0 shadow-xl bg-white dark:bg-card">
                            <CardHeader className="pb-2">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/25">
                                        <Target className="h-5 w-5 text-white" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-base">Composição Corporal</CardTitle>
                                        <CardDescription className="text-xs">Última avaliação</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-4 space-y-6">
                                {compositionData.map((item, index) => (
                                    <div key={index} className="space-y-2">
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center gap-2">
                                                <span>{item.icon}</span>
                                                <span className="text-sm font-medium">{item.name}</span>
                                            </div>
                                            <span className="font-bold text-lg" style={{ color: item.color }}>{item.atual}%</span>
                                        </div>
                                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                                            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${item.atual}%`, backgroundColor: item.color }} />
                                        </div>
                                    </div>
                                ))}
                                {!latestEvaluation?.body_fat && !latestEvaluation?.muscle_mass && (
                                    <p className="text-sm text-center text-muted-foreground py-4">
                                        Dados de composição corporal não disponíveis na última avaliação.
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Galeria de Fotos */}
                    <EvaluationGallery evaluations={evaluations} />

                    {/* Tabela de Histórico */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Histórico de Avaliações</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Data</TableHead>
                                        <TableHead>Método</TableHead>
                                        <TableHead>Peso (kg)</TableHead>
                                        <TableHead>Altura (m)</TableHead>
                                        <TableHead>% Gordura</TableHead>
                                        <TableHead>Massa Muscular (kg)</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {[...evaluations].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((ev) => (
                                        <TableRow key={ev.id}>
                                            <TableCell>{format(new Date(ev.date), "dd/MM/yyyy")}</TableCell>
                                            <TableCell className="capitalize">{ev.method?.toLowerCase()?.replace('_', ' ') || '-'}</TableCell>
                                            <TableCell>{ev.weight}</TableCell>
                                            <TableCell>{ev.height}</TableCell>
                                            <TableCell>{ev.body_fat || '-'}</TableCell>
                                            <TableCell>{ev.muscle_mass || '-'}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </>
            )}
        </div>
    )
}


