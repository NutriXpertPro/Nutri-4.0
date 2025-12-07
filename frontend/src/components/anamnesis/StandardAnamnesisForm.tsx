"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    User,
    Moon,
    Activity,
    Heart,
    Target,
    Ruler,
    Camera,
    ChevronDown,
    ChevronRight,
    Save,
    ArrowLeft,
    Loader2,
    Upload,
    Check,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface StandardAnamnesisFormProps {
    patientId: number
    onBack: () => void
    initialData?: Partial<StandardAnamnesisData>
    onSave?: (data: StandardAnamnesisData) => Promise<void>
}

// Interface baseada no modelo Django Anamnesis
export interface StandardAnamnesisData {
    // 1. Identificação
    nome: string
    idade: number | null
    sexo: string
    nascimento: string
    profissao: string
    email: string
    telefone: string

    // 2. Rotina
    hora_acorda: string
    hora_dorme: string
    dificuldade_dormir: string
    horario_treino: string
    tempo_disponivel_treino: string
    dias_treino_semana: number | null

    // 3. Nutrição e Hábitos
    peso: number | null
    altura: number | null
    peso_status: string
    alimentos_restritos: string
    ja_fez_dieta: boolean
    resultado_dieta: string
    intestino: string
    dias_sem_banheiro: number | null
    vezes_banheiro_dia: number | null
    litros_agua_dia: number | null
    vontade_doce: number
    horarios_maior_apetite: string
    preferencia_lanches: string
    frutas_preferencia: string

    // 4. Histórico de Saúde
    doenca_familiar: string
    problema_saude: boolean
    problemas_saude_detalhes: string
    problema_articular: string
    uso_medicamentos: boolean
    medicamentos_detalhes: string
    uso_cigarros: boolean
    intolerancia: boolean
    intolerancia_detalhes: string
    uso_anticoncepcional: boolean
    termogenico_usado: string
    uso_alcool: boolean
    alcool_frequencia: string
    ja_usou_anabolizante: boolean
    anabolizante_problemas: string
    pretende_usar_anabolizante: boolean

    // 5. Objetivos
    objetivo: string
    compromisso_relatorios: boolean

    // 6. Medidas
    pescoco: number | null
    cintura: number | null
    quadril: number | null

    // 7. Fotos (URLs)
    foto_frente: string | null
    foto_lado: string | null
    foto_costas: string | null
}

const defaultData: StandardAnamnesisData = {
    nome: "",
    idade: null,
    sexo: "",
    nascimento: "",
    profissao: "",
    email: "",
    telefone: "",
    hora_acorda: "",
    hora_dorme: "",
    dificuldade_dormir: "",
    horario_treino: "",
    tempo_disponivel_treino: "",
    dias_treino_semana: null,
    peso: null,
    altura: null,
    peso_status: "",
    alimentos_restritos: "",
    ja_fez_dieta: false,
    resultado_dieta: "",
    intestino: "",
    dias_sem_banheiro: null,
    vezes_banheiro_dia: null,
    litros_agua_dia: null,
    vontade_doce: 0,
    horarios_maior_apetite: "",
    preferencia_lanches: "",
    frutas_preferencia: "",
    doenca_familiar: "",
    problema_saude: false,
    problemas_saude_detalhes: "",
    problema_articular: "",
    uso_medicamentos: false,
    medicamentos_detalhes: "",
    uso_cigarros: false,
    intolerancia: false,
    intolerancia_detalhes: "",
    uso_anticoncepcional: false,
    termogenico_usado: "",
    uso_alcool: false,
    alcool_frequencia: "",
    ja_usou_anabolizante: false,
    anabolizante_problemas: "",
    pretende_usar_anabolizante: false,
    objetivo: "",
    compromisso_relatorios: false,
    pescoco: null,
    cintura: null,
    quadril: null,
    foto_frente: null,
    foto_lado: null,
    foto_costas: null,
}

interface Section {
    id: string
    title: string
    icon: React.ReactNode
    color: string
}

const SECTIONS: Section[] = [
    { id: "identificacao", title: "1. Identificação", icon: <User className="h-5 w-5" />, color: "blue" },
    { id: "rotina", title: "2. Rotina", icon: <Moon className="h-5 w-5" />, color: "indigo" },
    { id: "nutricao", title: "3. Nutrição e Hábitos", icon: <Activity className="h-5 w-5" />, color: "emerald" },
    { id: "saude", title: "4. Histórico de Saúde", icon: <Heart className="h-5 w-5" />, color: "rose" },
    { id: "objetivos", title: "5. Objetivos", icon: <Target className="h-5 w-5" />, color: "amber" },
    { id: "medidas", title: "6. Medidas", icon: <Ruler className="h-5 w-5" />, color: "purple" },
    { id: "fotos", title: "7. Fotos", icon: <Camera className="h-5 w-5" />, color: "pink" },
]

export function StandardAnamnesisForm({ patientId, onBack, initialData, onSave }: StandardAnamnesisFormProps) {
    const [formData, setFormData] = React.useState<StandardAnamnesisData>({
        ...defaultData,
        ...initialData
    })
    const [expandedSections, setExpandedSections] = React.useState<string[]>(["identificacao"])
    const [isSaving, setIsSaving] = React.useState(false)
    const [savedSections, setSavedSections] = React.useState<string[]>([])

    const toggleSection = (id: string) => {
        setExpandedSections(prev =>
            prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
        )
    }

    const updateField = <K extends keyof StandardAnamnesisData>(
        field: K,
        value: StandardAnamnesisData[K]
    ) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    // Calcula progresso
    const calculateProgress = (): number => {
        const requiredFields = [
            formData.nome,
            formData.idade,
            formData.sexo,
            formData.nascimento,
            formData.email,
            formData.telefone,
            formData.peso,
            formData.altura,
            formData.objetivo
        ]
        const filled = requiredFields.filter(f => f !== null && f !== "" && f !== undefined).length
        return Math.round((filled / requiredFields.length) * 100)
    }

    const handleSave = async () => {
        if (!onSave) return
        setIsSaving(true)
        try {
            await onSave(formData)
        } finally {
            setIsSaving(false)
        }
    }

    const progress = calculateProgress()

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={onBack}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h2 className="text-2xl font-bold">Anamnese Padrão</h2>
                        <p className="text-sm text-muted-foreground">Preencha os dados do paciente</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm text-muted-foreground">Progresso</p>
                        <p className="text-lg font-bold text-primary">{progress}%</p>
                    </div>
                    <Progress value={progress} className="w-24 h-2 hidden sm:block" />
                    <Button onClick={handleSave} disabled={isSaving} className="gap-2">
                        {isSaving ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Save className="h-4 w-4" />
                        )}
                        Salvar
                    </Button>
                </div>
            </div>

            {/* Seções */}
            <div className="space-y-4">
                {/* SEÇÃO 1: IDENTIFICAÇÃO */}
                <Collapsible open={expandedSections.includes("identificacao")} onOpenChange={() => toggleSection("identificacao")}>
                    <Card className={cn(expandedSections.includes("identificacao") && "ring-2 ring-blue-500/20")}>
                        <CollapsibleTrigger asChild>
                            <CardHeader className="cursor-pointer hover:bg-muted/20 transition-colors">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
                                            <User className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-lg">1. Identificação</CardTitle>
                                            <CardDescription>Dados pessoais e contato</CardDescription>
                                        </div>
                                    </div>
                                    {expandedSections.includes("identificacao") ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                                </div>
                            </CardHeader>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                            <CardContent className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-2 md:col-span-2">
                                    <Label>Nome Completo *</Label>
                                    <Input
                                        value={formData.nome}
                                        onChange={(e) => updateField("nome", e.target.value)}
                                        placeholder="Nome do paciente"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Idade *</Label>
                                    <Input
                                        type="number"
                                        value={formData.idade || ""}
                                        onChange={(e) => updateField("idade", e.target.value ? parseInt(e.target.value) : null)}
                                        placeholder="Ex: 32"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Sexo *</Label>
                                    <Select value={formData.sexo} onValueChange={(v) => updateField("sexo", v)}>
                                        <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Feminino">Feminino</SelectItem>
                                            <SelectItem value="Masculino">Masculino</SelectItem>
                                            <SelectItem value="Outro">Outro</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Data de Nascimento *</Label>
                                    <Input
                                        type="date"
                                        value={formData.nascimento}
                                        onChange={(e) => updateField("nascimento", e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Profissão</Label>
                                    <Input
                                        value={formData.profissao}
                                        onChange={(e) => updateField("profissao", e.target.value)}
                                        placeholder="Ex: Advogada"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Email *</Label>
                                    <Input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => updateField("email", e.target.value)}
                                        placeholder="email@exemplo.com"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Telefone *</Label>
                                    <Input
                                        value={formData.telefone}
                                        onChange={(e) => updateField("telefone", e.target.value)}
                                        placeholder="(11) 99999-9999"
                                    />
                                </div>
                            </CardContent>
                        </CollapsibleContent>
                    </Card>
                </Collapsible>

                {/* SEÇÃO 2: ROTINA */}
                <Collapsible open={expandedSections.includes("rotina")} onOpenChange={() => toggleSection("rotina")}>
                    <Card className={cn(expandedSections.includes("rotina") && "ring-2 ring-indigo-500/20")}>
                        <CollapsibleTrigger asChild>
                            <CardHeader className="cursor-pointer hover:bg-muted/20 transition-colors">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                                            <Moon className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-lg">2. Rotina</CardTitle>
                                            <CardDescription>Horários de sono e treino</CardDescription>
                                        </div>
                                    </div>
                                    {expandedSections.includes("rotina") ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                                </div>
                            </CardHeader>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                            <CardContent className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label>Hora que acorda</Label>
                                    <Input
                                        type="time"
                                        value={formData.hora_acorda}
                                        onChange={(e) => updateField("hora_acorda", e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Hora que dorme</Label>
                                    <Input
                                        type="time"
                                        value={formData.hora_dorme}
                                        onChange={(e) => updateField("hora_dorme", e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <Label>Possui dificuldade para dormir?</Label>
                                    <Textarea
                                        value={formData.dificuldade_dormir}
                                        onChange={(e) => updateField("dificuldade_dormir", e.target.value)}
                                        placeholder="Descreva se tem insônia, acorda durante a noite, etc."
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Horário preferido para treino</Label>
                                    <Input
                                        value={formData.horario_treino}
                                        onChange={(e) => updateField("horario_treino", e.target.value)}
                                        placeholder="Ex: Manhã, 6h-7h"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Tempo disponível para treino</Label>
                                    <Input
                                        value={formData.tempo_disponivel_treino}
                                        onChange={(e) => updateField("tempo_disponivel_treino", e.target.value)}
                                        placeholder="Ex: 1 hora"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Dias de treino por semana</Label>
                                    <Select
                                        value={formData.dias_treino_semana?.toString() || ""}
                                        onValueChange={(v) => updateField("dias_treino_semana", v ? parseInt(v) : null)}
                                    >
                                        <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                                        <SelectContent>
                                            {[2, 3, 4, 5, 6, 7].map(n => (
                                                <SelectItem key={n} value={n.toString()}>{n} dias</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardContent>
                        </CollapsibleContent>
                    </Card>
                </Collapsible>

                {/* SEÇÃO 3: NUTRIÇÃO E HÁBITOS */}
                <Collapsible open={expandedSections.includes("nutricao")} onOpenChange={() => toggleSection("nutricao")}>
                    <Card className={cn(expandedSections.includes("nutricao") && "ring-2 ring-emerald-500/20")}>
                        <CollapsibleTrigger asChild>
                            <CardHeader className="cursor-pointer hover:bg-muted/20 transition-colors">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                            <Activity className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-lg">3. Nutrição e Hábitos</CardTitle>
                                            <CardDescription>Peso, alimentação e preferências</CardDescription>
                                        </div>
                                    </div>
                                    {expandedSections.includes("nutricao") ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                                </div>
                            </CardHeader>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                            <CardContent className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                <div className="space-y-2">
                                    <Label>Peso (kg) *</Label>
                                    <Input
                                        type="number"
                                        step="0.1"
                                        value={formData.peso || ""}
                                        onChange={(e) => updateField("peso", e.target.value ? parseFloat(e.target.value) : null)}
                                        placeholder="Ex: 70.5"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Altura (m) *</Label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        value={formData.altura || ""}
                                        onChange={(e) => updateField("altura", e.target.value ? parseFloat(e.target.value) : null)}
                                        placeholder="Ex: 1.65"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Como o peso está?</Label>
                                    <Select value={formData.peso_status} onValueChange={(v) => updateField("peso_status", v)}>
                                        <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Aumentando">Aumentando</SelectItem>
                                            <SelectItem value="Diminuindo">Diminuindo</SelectItem>
                                            <SelectItem value="Estável">Estável</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2 md:col-span-2 lg:col-span-3">
                                    <Label>Alimentos que não gosta ou não pode comer</Label>
                                    <Textarea
                                        value={formData.alimentos_restritos}
                                        onChange={(e) => updateField("alimentos_restritos", e.target.value)}
                                        placeholder="Liste alimentos que deve evitar..."
                                    />
                                </div>
                                <div className="space-y-4 md:col-span-2 lg:col-span-3">
                                    <div className="flex items-center justify-between">
                                        <Label>Já fez dieta antes?</Label>
                                        <Switch
                                            checked={formData.ja_fez_dieta}
                                            onCheckedChange={(v) => updateField("ja_fez_dieta", v)}
                                        />
                                    </div>
                                    {formData.ja_fez_dieta && (
                                        <div className="space-y-2 animate-in slide-in-from-top-2">
                                            <Label className="text-amber-600">Como foi o resultado?</Label>
                                            <Textarea
                                                value={formData.resultado_dieta}
                                                onChange={(e) => updateField("resultado_dieta", e.target.value)}
                                                placeholder="Descreva o que funcionou e o que não funcionou..."
                                                className="border-amber-500/30 focus:ring-amber-500/20"
                                            />
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label>Funcionamento intestinal</Label>
                                    <Select value={formData.intestino} onValueChange={(v) => updateField("intestino", v)}>
                                        <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Preso">Preso</SelectItem>
                                            <SelectItem value="Regular">Regular</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Litros de água por dia</Label>
                                    <Input
                                        type="number"
                                        step="0.5"
                                        value={formData.litros_agua_dia || ""}
                                        onChange={(e) => updateField("litros_agua_dia", e.target.value ? parseFloat(e.target.value) : null)}
                                        placeholder="Ex: 2"
                                    />
                                </div>
                                <div className="space-y-4">
                                    <Label>Vontade de doce: {formData.vontade_doce}/10</Label>
                                    <Slider
                                        value={[formData.vontade_doce]}
                                        onValueChange={(v) => updateField("vontade_doce", v[0])}
                                        max={10}
                                        step={1}
                                        className="mt-2"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Preferência de lanches</Label>
                                    <Select value={formData.preferencia_lanches} onValueChange={(v) => updateField("preferencia_lanches", v)}>
                                        <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Doce">Doce</SelectItem>
                                            <SelectItem value="Salgado">Salgado</SelectItem>
                                            <SelectItem value="Doce e Salgado">Doce e Salgado</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Horários de maior apetite</Label>
                                    <Input
                                        value={formData.horarios_maior_apetite}
                                        onChange={(e) => updateField("horarios_maior_apetite", e.target.value)}
                                        placeholder="Ex: À noite, após o jantar"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Frutas preferidas</Label>
                                    <Input
                                        value={formData.frutas_preferencia}
                                        onChange={(e) => updateField("frutas_preferencia", e.target.value)}
                                        placeholder="Ex: Maçã, banana, morango"
                                    />
                                </div>
                            </CardContent>
                        </CollapsibleContent>
                    </Card>
                </Collapsible>

                {/* SEÇÃO 4: HISTÓRICO DE SAÚDE */}
                <Collapsible open={expandedSections.includes("saude")} onOpenChange={() => toggleSection("saude")}>
                    <Card className={cn(expandedSections.includes("saude") && "ring-2 ring-rose-500/20")}>
                        <CollapsibleTrigger asChild>
                            <CardHeader className="cursor-pointer hover:bg-muted/20 transition-colors">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-500">
                                            <Heart className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-lg">4. Histórico de Saúde</CardTitle>
                                            <CardDescription>Doenças, medicamentos e hábitos</CardDescription>
                                        </div>
                                    </div>
                                    {expandedSections.includes("saude") ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                                </div>
                            </CardHeader>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                            <CardContent className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-2 md:col-span-2">
                                    <Label>Doenças na família (histórico)</Label>
                                    <Textarea
                                        value={formData.doenca_familiar}
                                        onChange={(e) => updateField("doenca_familiar", e.target.value)}
                                        placeholder="Ex: Diabetes na mãe, hipertensão no pai..."
                                    />
                                </div>

                                {/* Problema de Saúde - Condicional */}
                                <div className="space-y-4 md:col-span-2">
                                    <div className="flex items-center justify-between">
                                        <Label>Possui algum problema de saúde?</Label>
                                        <Switch
                                            checked={formData.problema_saude}
                                            onCheckedChange={(v) => updateField("problema_saude", v)}
                                        />
                                    </div>
                                    {formData.problema_saude && (
                                        <div className="animate-in slide-in-from-top-2 space-y-2">
                                            <Label className="text-amber-600">Quais problemas?</Label>
                                            <Textarea
                                                value={formData.problemas_saude_detalhes}
                                                onChange={(e) => updateField("problemas_saude_detalhes", e.target.value)}
                                                placeholder="Descreva os problemas de saúde..."
                                                className="border-amber-500/30"
                                            />
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-2 md:col-span-2">
                                    <Label>Problemas articulares ou de locomoção</Label>
                                    <Textarea
                                        value={formData.problema_articular}
                                        onChange={(e) => updateField("problema_articular", e.target.value)}
                                        placeholder="Lesões, dores, limitações..."
                                    />
                                </div>

                                {/* Medicamentos - Condicional */}
                                <div className="space-y-4 md:col-span-2">
                                    <div className="flex items-center justify-between">
                                        <Label>Usa algum medicamento?</Label>
                                        <Switch
                                            checked={formData.uso_medicamentos}
                                            onCheckedChange={(v) => updateField("uso_medicamentos", v)}
                                        />
                                    </div>
                                    {formData.uso_medicamentos && (
                                        <div className="animate-in slide-in-from-top-2 space-y-2">
                                            <Label className="text-amber-600">Quais medicamentos?</Label>
                                            <Textarea
                                                value={formData.medicamentos_detalhes}
                                                onChange={(e) => updateField("medicamentos_detalhes", e.target.value)}
                                                placeholder="Nome, dosagem, frequência..."
                                                className="border-amber-500/30"
                                            />
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center justify-between">
                                    <Label>Fuma?</Label>
                                    <Switch
                                        checked={formData.uso_cigarros}
                                        onCheckedChange={(v) => updateField("uso_cigarros", v)}
                                    />
                                </div>

                                {/* Intolerância - Condicional */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <Label>Possui intolerância alimentar?</Label>
                                        <Switch
                                            checked={formData.intolerancia}
                                            onCheckedChange={(v) => updateField("intolerancia", v)}
                                        />
                                    </div>
                                    {formData.intolerancia && (
                                        <Input
                                            value={formData.intolerancia_detalhes}
                                            onChange={(e) => updateField("intolerancia_detalhes", e.target.value)}
                                            placeholder="Lactose, glúten, etc."
                                            className="animate-in slide-in-from-top-2 border-amber-500/30"
                                        />
                                    )}
                                </div>

                                {/* Anticoncepcional - Condicional (só feminino) */}
                                {formData.sexo === "Feminino" && (
                                    <div className="flex items-center justify-between animate-in slide-in-from-top-2">
                                        <Label>Usa anticoncepcional?</Label>
                                        <Switch
                                            checked={formData.uso_anticoncepcional}
                                            onCheckedChange={(v) => updateField("uso_anticoncepcional", v)}
                                        />
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <Label>Já usou termogênico? Qual?</Label>
                                    <Input
                                        value={formData.termogenico_usado}
                                        onChange={(e) => updateField("termogenico_usado", e.target.value)}
                                        placeholder="Nome do produto, se houver"
                                    />
                                </div>

                                {/* Álcool - Condicional */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <Label>Consome álcool?</Label>
                                        <Switch
                                            checked={formData.uso_alcool}
                                            onCheckedChange={(v) => updateField("uso_alcool", v)}
                                        />
                                    </div>
                                    {formData.uso_alcool && (
                                        <Input
                                            value={formData.alcool_frequencia}
                                            onChange={(e) => updateField("alcool_frequencia", e.target.value)}
                                            placeholder="Com que frequência?"
                                            className="animate-in slide-in-from-top-2 border-amber-500/30"
                                        />
                                    )}
                                </div>

                                {/* Anabolizante - Condicional */}
                                <div className="space-y-4 md:col-span-2">
                                    <div className="flex items-center justify-between">
                                        <Label>Já usou anabolizante?</Label>
                                        <Switch
                                            checked={formData.ja_usou_anabolizante}
                                            onCheckedChange={(v) => updateField("ja_usou_anabolizante", v)}
                                        />
                                    </div>
                                    {formData.ja_usou_anabolizante && (
                                        <div className="animate-in slide-in-from-top-2 space-y-2">
                                            <Label className="text-amber-600">Teve algum problema?</Label>
                                            <Textarea
                                                value={formData.anabolizante_problemas}
                                                onChange={(e) => updateField("anabolizante_problemas", e.target.value)}
                                                placeholder="Descreva..."
                                                className="border-amber-500/30"
                                            />
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center justify-between">
                                    <Label>Pretende usar anabolizante?</Label>
                                    <Switch
                                        checked={formData.pretende_usar_anabolizante}
                                        onCheckedChange={(v) => updateField("pretende_usar_anabolizante", v)}
                                    />
                                </div>
                            </CardContent>
                        </CollapsibleContent>
                    </Card>
                </Collapsible>

                {/* SEÇÃO 5: OBJETIVOS */}
                <Collapsible open={expandedSections.includes("objetivos")} onOpenChange={() => toggleSection("objetivos")}>
                    <Card className={cn(expandedSections.includes("objetivos") && "ring-2 ring-amber-500/20")}>
                        <CollapsibleTrigger asChild>
                            <CardHeader className="cursor-pointer hover:bg-muted/20 transition-colors">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500">
                                            <Target className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-lg">5. Objetivos</CardTitle>
                                            <CardDescription>Metas e compromisso</CardDescription>
                                        </div>
                                    </div>
                                    {expandedSections.includes("objetivos") ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                                </div>
                            </CardHeader>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                            <CardContent className="grid gap-6">
                                <div className="space-y-2">
                                    <Label>Objetivo Principal *</Label>
                                    <Select value={formData.objetivo} onValueChange={(v) => updateField("objetivo", v)}>
                                        <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Emagrecimento">Emagrecimento</SelectItem>
                                            <SelectItem value="Ganho de massa muscular">Ganho de massa muscular</SelectItem>
                                            <SelectItem value="Ganho de peso">Ganho de peso</SelectItem>
                                            <SelectItem value="Trincar o shape">Trincar o shape</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex items-center justify-between p-4 rounded-xl bg-primary/5 border border-primary/20">
                                    <div>
                                        <Label className="text-base">Compromisso semanal</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Você se compromete a enviar fotos e relatórios semanalmente?
                                        </p>
                                    </div>
                                    <Switch
                                        checked={formData.compromisso_relatorios}
                                        onCheckedChange={(v) => updateField("compromisso_relatorios", v)}
                                    />
                                </div>
                            </CardContent>
                        </CollapsibleContent>
                    </Card>
                </Collapsible>

                {/* SEÇÃO 6: MEDIDAS */}
                <Collapsible open={expandedSections.includes("medidas")} onOpenChange={() => toggleSection("medidas")}>
                    <Card className={cn(expandedSections.includes("medidas") && "ring-2 ring-purple-500/20")}>
                        <CollapsibleTrigger asChild>
                            <CardHeader className="cursor-pointer hover:bg-muted/20 transition-colors">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-500">
                                            <Ruler className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-lg">6. Medidas</CardTitle>
                                            <CardDescription>Circunferências em centímetros</CardDescription>
                                        </div>
                                    </div>
                                    {expandedSections.includes("medidas") ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                                </div>
                            </CardHeader>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                            <CardContent className="grid gap-6 md:grid-cols-3">
                                <div className="space-y-2">
                                    <Label>Pescoço (cm)</Label>
                                    <Input
                                        type="number"
                                        step="0.1"
                                        value={formData.pescoco || ""}
                                        onChange={(e) => updateField("pescoco", e.target.value ? parseFloat(e.target.value) : null)}
                                        placeholder="Ex: 38.5"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Cintura (cm)</Label>
                                    <Input
                                        type="number"
                                        step="0.1"
                                        value={formData.cintura || ""}
                                        onChange={(e) => updateField("cintura", e.target.value ? parseFloat(e.target.value) : null)}
                                        placeholder="Ex: 78"
                                    />
                                </div>
                                {formData.sexo === "Feminino" && (
                                    <div className="space-y-2 animate-in slide-in-from-top-2">
                                        <Label className="flex items-center gap-2">
                                            Quadril (cm)
                                            <Badge variant="outline" className="text-xs">Feminino</Badge>
                                        </Label>
                                        <Input
                                            type="number"
                                            step="0.1"
                                            value={formData.quadril || ""}
                                            onChange={(e) => updateField("quadril", e.target.value ? parseFloat(e.target.value) : null)}
                                            placeholder="Ex: 98"
                                        />
                                    </div>
                                )}
                            </CardContent>
                        </CollapsibleContent>
                    </Card>
                </Collapsible>

                {/* SEÇÃO 7: FOTOS */}
                <Collapsible open={expandedSections.includes("fotos")} onOpenChange={() => toggleSection("fotos")}>
                    <Card className={cn(expandedSections.includes("fotos") && "ring-2 ring-pink-500/20")}>
                        <CollapsibleTrigger asChild>
                            <CardHeader className="cursor-pointer hover:bg-muted/20 transition-colors">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-lg bg-pink-500/10 flex items-center justify-center text-pink-500">
                                            <Camera className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-lg">7. Fotos</CardTitle>
                                            <CardDescription>Registro fotográfico (👙/🩲)</CardDescription>
                                        </div>
                                    </div>
                                    {expandedSections.includes("fotos") ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                                </div>
                            </CardHeader>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                            <CardContent>
                                <div className="grid gap-6 md:grid-cols-3">
                                    {[
                                        { key: "foto_frente" as const, label: "Frente" },
                                        { key: "foto_lado" as const, label: "Lado" },
                                        { key: "foto_costas" as const, label: "Costas" },
                                    ].map(({ key, label }) => (
                                        <div key={key} className="flex flex-col items-center gap-4">
                                            <div className="w-full aspect-[3/4] bg-muted/30 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 hover:border-primary/50 transition-colors cursor-pointer">
                                                {formData[key] ? (
                                                    <img
                                                        src={formData[key] as string}
                                                        alt={label}
                                                        className="w-full h-full object-cover rounded-xl"
                                                    />
                                                ) : (
                                                    <>
                                                        <Upload className="h-8 w-8 text-muted-foreground" />
                                                        <span className="text-sm text-muted-foreground">{label}</span>
                                                    </>
                                                )}
                                            </div>
                                            <Button variant="outline" size="sm" className="w-full">
                                                <Upload className="h-4 w-4 mr-2" />
                                                Upload
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                                <p className="text-sm text-muted-foreground mt-4 text-center">
                                    Fotos devem ser tiradas de roupa de banho ou underwear para melhor avaliação.
                                </p>
                            </CardContent>
                        </CollapsibleContent>
                    </Card>
                </Collapsible>
            </div>

            {/* Footer com ações */}
            <div className="flex items-center justify-between pt-6 border-t">
                <Button variant="ghost" onClick={onBack}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Voltar
                </Button>
                <div className="flex items-center gap-4">
                    <p className="text-sm text-muted-foreground hidden sm:block">
                        Progresso: <strong>{progress}%</strong>
                    </p>
                    <Button onClick={handleSave} disabled={isSaving} size="lg" className="gap-2">
                        {isSaving ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Save className="h-4 w-4" />
                        )}
                        Salvar Anamnese
                    </Button>
                </div>
            </div>
        </div>
    )
}
