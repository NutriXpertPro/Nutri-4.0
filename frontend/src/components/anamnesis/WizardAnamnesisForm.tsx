"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Slider,
} from "@/components/ui/slider"
import {
    User,
    Moon,
    Activity,
    Heart,
    Target,
    Ruler,
    Camera,
    ChevronLeft,
    ChevronRight,
    Save,
    CheckCircle,
    ArrowLeft,
    AlertCircle,
    Save as SaveIcon
} from "lucide-react"
import { cn } from "@/lib/utils"

interface WizardStep {
    id: string
    title: string
    icon: React.ReactNode
    color: string
    description: string
    completed: boolean
}

interface WizardAnamnesisData {
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

interface WizardAnamnesisFormProps {
    patientId?: number
    initialData?: Partial<WizardAnamnesisData>
    onSave?: (data: WizardAnamnesisData) => Promise<void>
    onCancel?: () => void
}

const defaultData: WizardAnamnesisData = {
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

export function WizardAnamnesisForm({ patientId, initialData, onSave, onCancel }: WizardAnamnesisFormProps) {
    const [currentStep, setCurrentStep] = useState(0)
    const [formData, setFormData] = useState<WizardAnamnesisData>({
        ...defaultData,
        ...initialData
    })
    const [isSaving, setIsSaving] = useState(false)
    const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
    const [lastSaved, setLastSaved] = useState<Date | null>(null)

    // Função para validar se um campo obrigatório está preenchido
    const isFieldValid = (value: any): boolean => {
        if (value === null || value === undefined) return false
        if (typeof value === 'string') return value.trim().length > 0
        if (typeof value === 'number') return !isNaN(value)
        return !!value
    }

    // Validação específica para cada etapa
    const validateStep = (stepId: string): boolean => {
        switch (stepId) {
            case "identificacao":
                return isFieldValid(formData.nome) &&
                       isFieldValid(formData.idade) &&
                       isFieldValid(formData.sexo) &&
                       isFieldValid(formData.nascimento) &&
                       isFieldValid(formData.email) &&
                       isFieldValid(formData.telefone)
            case "rotina":
                return isFieldValid(formData.hora_acorda) &&
                       isFieldValid(formData.hora_dorme)
            case "nutricao":
                return isFieldValid(formData.peso) &&
                       isFieldValid(formData.altura)
            case "saude":
                return true // Validação complexa, consideramos como válido por enquanto
            case "objetivos":
                return isFieldValid(formData.objetivo)
            case "medidas":
                // Pelo menos um campo de medida deve estar preenchido
                return isFieldValid(formData.pescoco) ||
                       isFieldValid(formData.cintura) ||
                       isFieldValid(formData.quadril)
            case "fotos":
                // Consideramos completa se pelo menos uma foto estiver preenchida
                return isFieldValid(formData.foto_frente) ||
                       isFieldValid(formData.foto_lado) ||
                       isFieldValid(formData.foto_costas)
            default:
                return false
        }
    }

    const steps: WizardStep[] = [
        {
            id: "identificacao",
            title: "Identificação",
            icon: <User className="h-5 w-5" />,
            color: "blue",
            description: "Dados pessoais e contato",
            completed: validateStep("identificacao")
        },
        {
            id: "rotina",
            title: "Rotina",
            icon: <Moon className="h-5 w-5" />,
            color: "indigo",
            description: "Sono e atividade física",
            completed: validateStep("rotina")
        },
        {
            id: "nutricao",
            title: "Nutrição",
            icon: <Activity className="h-5 w-5" />,
            color: "emerald",
            description: "Hábitos alimentares",
            completed: validateStep("nutricao")
        },
        {
            id: "saude",
            title: "Saúde",
            icon: <Heart className="h-5 w-5" />,
            color: "rose",
            description: "Histórico médico",
            completed: validateStep("saude")
        },
        {
            id: "objetivos",
            title: "Objetivos",
            icon: <Target className="h-5 w-5" />,
            color: "amber",
            description: "Metas do tratamento",
            completed: validateStep("objetivos")
        },
        {
            id: "medidas",
            title: "Medidas",
            icon: <Ruler className="h-5 w-5" />,
            color: "purple",
            description: "Circunferências",
            completed: validateStep("medidas")
        },
        {
            id: "fotos",
            title: "Fotos",
            icon: <Camera className="h-5 w-5" />,
            color: "pink",
            description: "Registro visual",
            completed: validateStep("fotos")
        },
    ]

    const updateField = <K extends keyof WizardAnamnesisData>(
        field: K,
        value: WizardAnamnesisData[K]
    ) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    const nextStep = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1)
        }
    }

    const prevStep = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1)
        }
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

    // Calcular progresso
    const calculateProgress = (): number => {
        const completedSteps = steps.filter(step => step.completed).length
        return Math.round((completedSteps / steps.length) * 100)
    }

    const progress = calculateProgress()

    // Função de auto-salvamento
    const autoSave = useCallback(async () => {
        if (!onSave) return;

        setAutoSaveStatus('saving');

        try {
            await onSave(formData);
            setAutoSaveStatus('saved');
            setLastSaved(new Date());

            // Voltar ao estado idle após 3 segundos
            setTimeout(() => {
                if (autoSaveStatus === 'saved') {
                    setAutoSaveStatus('idle');
                }
            }, 3000);
        } catch (error) {
            setAutoSaveStatus('error');
            console.error('Erro no auto-save:', error);

            // Voltar ao estado idle após 5 segundos
            setTimeout(() => {
                if (autoSaveStatus === 'error') {
                    setAutoSaveStatus('idle');
                }
            }, 5000);
        }
    }, [formData, onSave]);

    // Configurar o auto-save a cada 30 segundos
    useEffect(() => {
        const interval = setInterval(() => {
            // Apenas auto-salvar se houver alterações significativas ou se for a primeira vez
            if (onSave) {
                autoSave();
            }
        }, 30000); // 30 segundos

        // Limpar o intervalo quando o componente for desmontado
        return () => clearInterval(interval);
    }, [autoSave]);

    // Disparar auto-save quando houver alterações importantes nos dados do formulário
    useEffect(() => {
        // Esta lógica evita salvar a cada pequena alteração, mas salva quando há alterações significativas
        const hasSignificantChanges = Object.values(formData).some(value => {
            if (typeof value === 'string') return value.length > 0;
            if (typeof value === 'number') return value !== null && !isNaN(value);
            if (typeof value === 'boolean') return true;
            if (value instanceof Date) return true;
            return !!value;
        });

        if (hasSignificantChanges && autoSaveStatus === 'idle') {
            // Agendar um auto-save em 5 segundos para evitar salvar a cada digitação
            const timeout = setTimeout(() => {
                autoSave();
            }, 5000);

            return () => clearTimeout(timeout);
        }
    }, [formData, autoSave, autoSaveStatus]);

    // Renderizar o conteúdo da etapa atual
    const renderStepContent = () => {
        switch (currentStep) {
            case 0: // Identificação
                return (
                    <Card className="border-0 shadow-none">
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
                                    <User className="h-5 w-5" />
                                </div>
                                <div>
                                    <CardTitle className="text-2xl">Informações Pessoais</CardTitle>
                                    <CardDescription>Dados básicos do paciente</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid gap-6 md:grid-cols-2">
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
                            </div>
                        </CardContent>
                    </Card>
                )

            case 1: // Rotina
                return (
                    <Card className="border-0 shadow-none">
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                                    <Moon className="h-5 w-5" />
                                </div>
                                <div>
                                    <CardTitle className="text-2xl">Rotina Diária</CardTitle>
                                    <CardDescription>Seus horários e atividades</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid gap-6 md:grid-cols-2">
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
                            </div>
                        </CardContent>
                    </Card>
                )

            case 2: // Nutrição
                return (
                    <Card className="border-0 shadow-none">
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                    <Activity className="h-5 w-5" />
                                </div>
                                <div>
                                    <CardTitle className="text-2xl">Nutrição e Hábitos</CardTitle>
                                    <CardDescription>Sua alimentação e preferências</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
                                    <Label>Número de dias sem ir ao banheiro</Label>
                                    <Input
                                        type="number"
                                        value={formData.dias_sem_banheiro || ""}
                                        onChange={(e) => updateField("dias_sem_banheiro", e.target.value ? parseInt(e.target.value) : null)}
                                        placeholder="Ex: 2"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Vezes que vai ao banheiro por dia</Label>
                                    <Input
                                        type="number"
                                        value={formData.vezes_banheiro_dia || ""}
                                        onChange={(e) => updateField("vezes_banheiro_dia", e.target.value ? parseInt(e.target.value) : null)}
                                        placeholder="Ex: 2"
                                    />
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
                            </div>
                        </CardContent>
                    </Card>
                )

            case 3: // Saúde
                return (
                    <Card className="border-0 shadow-none">
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-500">
                                    <Heart className="h-5 w-5" />
                                </div>
                                <div>
                                    <CardTitle className="text-2xl">Histórico de Saúde</CardTitle>
                                    <CardDescription>Informações médicas e hábitos</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid gap-6 md:grid-cols-2">
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
                            </div>
                        </CardContent>
                    </Card>
                )

            case 4: // Objetivos
                return (
                    <Card className="border-0 shadow-none">
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500">
                                    <Target className="h-5 w-5" />
                                </div>
                                <div>
                                    <CardTitle className="text-2xl">Objetivos</CardTitle>
                                    <CardDescription>Suas metas e compromisso</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-6">
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
                            </div>
                        </CardContent>
                    </Card>
                )

            case 5: // Medidas
                return (
                    <Card className="border-0 shadow-none">
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-500">
                                    <Ruler className="h-5 w-5" />
                                </div>
                                <div>
                                    <CardTitle className="text-2xl">Medidas Corporais</CardTitle>
                                    <CardDescription>Circunferências em centímetros</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid gap-6 md:grid-cols-3">
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
                            </div>
                        </CardContent>
                    </Card>
                )

            case 6: // Fotos
                return (
                    <Card className="border-0 shadow-none">
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-lg bg-pink-500/10 flex items-center justify-center text-pink-500">
                                    <Camera className="h-5 w-5" />
                                </div>
                                <div>
                                    <CardTitle className="text-2xl">Fotos Corporais</CardTitle>
                                    <CardDescription>Registro fotográfico para acompanhamento</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-6 md:grid-cols-3">
                                {[
                                    { key: "foto_frente" as keyof WizardAnamnesisData, label: "Frente" },
                                    { key: "foto_lado" as keyof WizardAnamnesisData, label: "Lado" },
                                    { key: "foto_costas" as keyof WizardAnamnesisData, label: "Costas" },
                                ].map(({ key, label }) => (
                                    <div key={key} className="flex flex-col items-center gap-4">
                                        <div className="w-full aspect-[3/4] bg-muted/30 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 hover:border-primary/50 transition-colors cursor-pointer">
                                            {formData[key] ? (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <div className="text-center p-2">
                                                        <CheckCircle className="h-8 w-8 text-emerald-500 mx-auto" />
                                                        <p className="text-sm mt-1">Foto {label}</p>
                                                        <p className="text-xs text-muted-foreground">Carregada</p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <>
                                                    <Camera className="h-8 w-8 text-muted-foreground" />
                                                    <span className="text-sm text-muted-foreground">{label}</span>
                                                    <p className="text-xs text-muted-foreground text-center px-2">Clique para adicionar</p>
                                                </>
                                            )}
                                        </div>
                                        <Button variant="outline" size="sm" className="w-full">
                                    <Camera className="h-4 w-4 mr-2" />
                                    {formData[key] ? "Substituir" : "Adicionar"} Foto
                                </Button>
                                    </div>
                                ))}
                            </div>
                            <p className="text-sm text-muted-foreground mt-4 text-center">
                                As fotos devem ser tiradas de roupa de banho ou underwear para melhor avaliação.
                            </p>
                        </CardContent>
                    </Card>
                )

            default:
                return null
        }
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Barra de progresso */}
            <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Progresso</span>
                    <span className="text-sm font-medium text-muted-foreground">{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
            </div>

            {/* Navegação por etapas */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 overflow-x-auto pb-2">
                    {steps.map((step, index) => (
                        <div 
                            key={step.id}
                            className="flex items-center gap-2 min-w-max"
                        >
                            <div 
                                className={cn(
                                    "h-10 w-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors cursor-pointer",
                                    index === currentStep 
                                        ? `bg-${step.color}-500 text-white` 
                                        : index < currentStep 
                                            ? "bg-emerald-500 text-white" 
                                            : "bg-muted text-muted-foreground",
                                    index > currentStep && "hover:bg-muted/50"
                                )}
                                onClick={() => setCurrentStep(index)}
                            >
                                {index < currentStep ? <CheckCircle className="h-5 w-5" /> : index + 1}
                            </div>
                            <div className="text-left hidden sm:block">
                                <div className={cn(
                                    "text-sm font-medium",
                                    index === currentStep 
                                        ? "text-foreground" 
                                        : index < currentStep 
                                            ? "text-emerald-600" 
                                            : "text-muted-foreground"
                                )}>
                                    {step.title}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    {step.description}
                                </div>
                            </div>
                            {index < steps.length - 1 && (
                                <div className="h-0.5 w-8 bg-border" />
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <Separator />

            {/* Conteúdo da etapa */}
            <div className="py-4">
                {renderStepContent()}
            </div>

            <Separator />

            {/* Indicador de Auto-Save */}
            <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-2 text-sm">
                    {autoSaveStatus === 'saving' && (
                        <>
                            <SaveIcon className="h-4 w-4 text-amber-500 animate-pulse" />
                            <span className="text-amber-600">Salvando automaticamente...</span>
                        </>
                    )}
                    {autoSaveStatus === 'saved' && (
                        <>
                            <CheckCircle className="h-4 w-4 text-emerald-500" />
                            <span className="text-emerald-600">
                                Salvo automaticamente {lastSaved ? `às ${lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ''}
                            </span>
                        </>
                    )}
                    {autoSaveStatus === 'error' && (
                        <>
                            <AlertCircle className="h-4 w-4 text-destructive" />
                            <span className="text-destructive">Erro ao salvar automaticamente</span>
                        </>
                    )}
                    {autoSaveStatus === 'idle' && lastSaved && (
                        <>
                            <CheckCircle className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">
                                Último salvamento automático às {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </>
                    )}
                </div>

                <div className="text-sm text-muted-foreground">
                    {currentStep + 1} de {steps.length} etapas
                </div>
            </div>

            {/* Botões de navegação */}
            <div className="flex items-center justify-between pt-2">
                <Button
                    variant="outline"
                    onClick={onCancel || prevStep}
                    disabled={currentStep === 0}
                    className="gap-2"
                >
                    <ArrowLeft className="h-4 w-4" />
                    {onCancel ? "Cancelar" : "Anterior"}
                </Button>

                <div className="flex items-center gap-2">
                    {currentStep < steps.length - 1 ? (
                        <Button onClick={nextStep} className="gap-2">
                            Próximo
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    ) : (
                        <Button onClick={handleSave} disabled={isSaving} className="gap-2">
                            {isSaving ? (
                                <CheckCircle className="h-4 w-4 animate-spin" />
                            ) : (
                                <Save className="h-4 w-4" />
                            )}
                            Salvar Anamnese
                        </Button>
                    )}
                </div>
            </div>
        </div>
    )
}