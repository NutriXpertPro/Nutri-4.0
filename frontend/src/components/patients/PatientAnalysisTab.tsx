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
import { IconWrapper } from "@/components/ui/IconWrapper"
import { cn } from "@/lib/utils"

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
        const sorted = [...evaluations].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

        return sorted.map(ev => ({
            date: format(new Date(ev.date), 'dd/MM'),
            fullDate: format(new Date(ev.date), "dd 'de' MMMM"),
            peso: ev.weight
        }))
    }, [evaluations])

    const latestEvaluation = React.useMemo(() => {
        if (!evaluations.length) return null
        return [...evaluations].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]
    }, [evaluations])

    const compositionData = [
        { name: 'Massa Magra', atual: latestEvaluation?.muscle_mass || 0, meta: 0, icon: '💪', color: '#10b981' },
        { name: 'Gordura corporal', atual: latestEvaluation?.body_fat || 0, meta: 0, icon: '🔥', color: '#f59e0b' },
    ]

    const weightChange = React.useMemo(() => {
        if (evaluations.length < 2) return null
        const sorted = [...evaluations].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        const latest = sorted[0].weight || 0
        const previous = sorted[sorted.length - 1].weight || 0
        return (latest - previous).toFixed(1)
    }, [evaluations])


    return (
        <div className="space-y-8 pb-12">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-1">
                <div>
                    <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-1">Performance & Métricas</p>
                    <h3 className="text-2xl font-black tracking-tight text-foreground">Análise Corporal</h3>
                </div>
                <div className="flex items-center gap-2">
                    {patientId && (
                        <Button onClick={() => setIsNewEvaluationOpen(true)} className="gap-2 h-11 px-6 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 transition-all">
                            <IconWrapper icon={Plus} variant="ghost" size="sm" className="bg-white/20" />
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
                <div className="flex justify-center py-20">
                    <Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" />
                </div>
            ) : evaluations.length === 0 ? (
                <Card variant="glass" className="border-dashed border-2 py-20 bg-primary/5 flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 rounded-full bg-background flex items-center justify-center mb-4 shadow-inner border border-border/10">
                        <Scale className="h-8 w-8 text-muted-foreground/40" />
                    </div>
                    <h3 className="text-lg font-black tracking-tight">Nenhuma avaliação registrada</h3>
                    <p className="text-sm font-bold text-muted-foreground/60 max-w-sm mt-1 mb-8">
                        Registe a primeira avaliação física para começar a acompanhar a evolução do paciente.
                    </p>
                    <Button variant="outline" onClick={() => setIsNewEvaluationOpen(true)} className="rounded-xl font-black text-[10px] uppercase tracking-widest px-8">
                        Criar primeira avaliação
                    </Button>
                </Card>
            ) : (
                <>
                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Gráfico de Evolução de Peso */}
                        <Card variant="glass" className="col-span-2 lg:col-span-1 overflow-hidden border-none shadow-2xl bg-background/40">
                            <CardHeader className="pb-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <IconWrapper icon={Scale} variant="blue" size="md" />
                                        <div>
                                            <CardTitle className="text-lg font-black tracking-tight">Evolução de Peso</CardTitle>
                                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Progresso histórico</p>
                                        </div>
                                    </div>
                                    {weightChange && (
                                        <div className={cn(
                                            "flex flex-col items-end px-4 py-2 rounded-2xl",
                                            Number(weightChange) <= 0 ? "bg-emerald-500/10" : "bg-amber-500/10"
                                        )}>
                                            <span className={cn("text-lg font-black tabular-nums leading-none", Number(weightChange) <= 0 ? "text-emerald-600" : "text-amber-600")}>
                                                {Number(weightChange) > 0 ? '+' : ''}{weightChange} kg
                                            </span>
                                            <span className="text-[9px] font-black uppercase tracking-tighter opacity-60">Variação Total</span>
                                        </div>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <div className="h-[280px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={weightData} margin={{ top: 20, right: 20, left: -20, bottom: 0 }}>
                                            <defs>
                                                <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0%" stopColor="oklch(var(--primary))" stopOpacity={0.3} />
                                                    <stop offset="100%" stopColor="oklch(var(--primary))" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="oklch(var(--border))" strokeOpacity={0.15} />
                                            <XAxis dataKey="date" stroke="oklch(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} dy={10} />
                                            <YAxis stroke="oklch(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} domain={['dataMin - 3', 'dataMax + 3']} />
                                            <Tooltip
                                                contentStyle={{ backgroundColor: 'oklch(var(--background))', borderRadius: '16px', border: '1px solid oklch(var(--border) / 0.1)', boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.3)', padding: '12px 16px' }}
                                                itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                                                labelStyle={{ fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.5, marginBottom: '4px' }}
                                            />
                                            <Area type="monotone" dataKey="peso" stroke="oklch(var(--primary))" strokeWidth={4} fill="url(#weightGradient)" animationDuration={1500} />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Composição Corporal */}
                        <Card variant="glass" className="col-span-2 lg:col-span-1 border-none shadow-2xl bg-background/40">
                            <CardHeader className="pb-2">
                                <div className="flex items-center gap-4">
                                    <IconWrapper icon={Target} variant="emerald" size="md" />
                                    <div>
                                        <CardTitle className="text-lg font-black tracking-tight">Composição Corporal</CardTitle>
                                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Última avaliação</p>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-6 space-y-8">
                                {compositionData.map((item, index) => (
                                    <div key={index} className="space-y-3 group">
                                        <div className="flex justify-between items-end">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-xl bg-background shadow-sm flex items-center justify-center text-sm group-hover:scale-110 transition-transform">{item.icon}</div>
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-60">Indicador</span>
                                                    <span className="text-sm font-black text-foreground">{item.name}</span>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end">
                                                <span className="text-2xl font-black tabular-nums tracking-tighter" style={{ color: item.color }}>{item.atual}%</span>
                                                <span className="text-[9px] font-black text-muted-foreground uppercase">Média ideal: 22%</span>
                                            </div>
                                        </div>
                                        <div className="h-3 bg-muted/40 rounded-full overflow-hidden p-0.5 border border-border/5">
                                            <div className="h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_12px_rgba(0,0,0,0.1)]" style={{ width: `${item.atual}%`, backgroundColor: item.color }} />
                                        </div>
                                    </div>
                                ))}
                                {!latestEvaluation?.body_fat && !latestEvaluation?.muscle_mass && (
                                    <div className="flex flex-col items-center justify-center py-10 opacity-40">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-center">Dados não disponíveis</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Galeria de Fotos */}
                    <div className="pt-4">
                        <EvaluationGallery evaluations={evaluations} />
                    </div>

                    {/* Tabela de Histórico */}
                    <Card variant="outline" className="border-border/10 bg-muted/5 rounded-[2.5rem] overflow-hidden">
                        <CardHeader className="p-8 pb-4">
                            <CardTitle className="text-xl font-black tracking-tight">Histórico Completo</CardTitle>
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Log de todas as avaliações</p>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader className="bg-muted/10 border-b border-border/10">
                                        <TableRow className="hover:bg-transparent border-none">
                                            <TableHead className="h-14 px-8 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Data</TableHead>
                                            <TableHead className="h-14 px-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Método</TableHead>
                                            <TableHead className="h-14 px-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest text-center">Peso</TableHead>
                                            <TableHead className="h-14 px-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest text-center">Altura</TableHead>
                                            <TableHead className="h-14 px-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest text-center">% Gordura</TableHead>
                                            <TableHead className="h-14 px-8 text-[10px] font-black text-muted-foreground uppercase tracking-widest text-right">Massa Muscular</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {[...evaluations].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((ev) => (
                                            <TableRow key={ev.id} className="group hover:bg-primary/5 border-b border-border/5 transition-colors">
                                                <TableCell className="px-8 font-black text-sm group-hover:text-primary transition-colors">
                                                    {format(new Date(ev.date), "dd/MM/yyyy")}
                                                </TableCell>
                                                <TableCell className="px-4">
                                                    <Badge variant="outline" className="px-2 py-0 h-6 text-[9px] font-black uppercase tracking-widest border-border/20 bg-background/50">
                                                        {ev.method?.toLowerCase()?.replace('_', ' ') || '-'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="px-4 text-center font-bold text-foreground tabular-nums">{ev.weight} kg</TableCell>
                                                <TableCell className="px-4 text-center font-bold text-muted-foreground/60 tabular-nums">{ev.height} m</TableCell>
                                                <TableCell className="px-4 text-center">
                                                    <span className="font-black text-amber-600 tabular-nums">{ev.body_fat ? `${ev.body_fat}%` : '-'}</span>
                                                </TableCell>
                                                <TableCell className="px-8 text-right font-black text-emerald-600 tabular-nums">{ev.muscle_mass ? `${ev.muscle_mass} kg` : '-'}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </>
            )}
        </div>
    )
}


