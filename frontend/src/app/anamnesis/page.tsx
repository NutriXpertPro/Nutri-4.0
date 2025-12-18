"use client"

import * as React from "react"
import { DashboardLayout } from "@/components/layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { anamnesisService, AnamnesisTemplate } from "@/services/anamnesis-service"
import {
    ClipboardList,
    Plus,
    Search,
    FileText,
    Clock,
    CheckCircle2,
    Loader2,
    LayoutTemplate,
    Users,
    Star,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    User,
    Calendar,
    Moon,
    Activity,
    Heart,
    Target,
    Ruler,
    Camera,
    Upload,
    Download,
    Edit3,
    Trash2,
    Copy,
    Sparkles,
    FileUp,
    AlertCircle,
    List,
    Edit,
    Eye,
} from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { TemplateBuilder } from "@/components/anamnesis/TemplateBuilder"
import { AnamnesisList } from "@/components/anamnesis/AnamnesisList"
import { WizardAnamnesisForm } from "@/components/anamnesis/WizardAnamnesisForm"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

// Tipo para as seções da anamnese padrão
interface StandardSection {
    id: string
    title: string
    icon: React.ReactNode
    description: string
    fields: string[]
    color: string
}

// Seções da anamnese padrão baseadas no modelo do backend
const STANDARD_SECTIONS: StandardSection[] = [
    {
        id: "identificacao",
        title: "1. Identificação",
        icon: <User className="h-5 w-5" />,
        description: "Dados pessoais e contato do paciente",
        fields: ["Nome", "Idade", "Sexo", "Data de Nascimento", "Profissão", "Email", "Telefone"],
        color: "from-blue-500/20 to-blue-500/5"
    },
    {
        id: "rotina",
        title: "2. Rotina",
        icon: <Moon className="h-5 w-5" />,
        description: "Horários de sono, treino e disponibilidade",
        fields: ["Hora que acorda", "Hora que dorme", "Dificuldade para dormir", "Horário de treino", "Tempo disponível para treino", "Dias de treino por semana"],
        color: "from-indigo-500/20 to-indigo-500/5"
    },
    {
        id: "nutricao",
        title: "3. Nutrição e Hábitos",
        icon: <Activity className="h-5 w-5" />,
        description: "Peso, altura, restrições alimentares e preferências",
        fields: ["Peso", "Altura", "Status do peso", "Alimentos restritos", "Já fez dieta antes?", "Resultado da dieta", "Funcionamento intestinal", "Litros de água/dia", "Vontade de doce (0-10)", "Horários de maior apetite", "Preferência de lanches", "Frutas preferidas"],
        color: "from-emerald-500/20 to-emerald-500/5"
    },
    {
        id: "saude",
        title: "4. Histórico de Saúde",
        icon: <Heart className="h-5 w-5" />,
        description: "Doenças, medicamentos, intolerâncias e hábitos",
        fields: ["Doença familiar", "Problema de saúde atual", "Detalhes dos problemas", "Problema articular", "Uso de medicamentos", "Detalhes medicamentos", "Uso de cigarros", "Intolerância alimentar", "Detalhes intolerância", "Uso de anticoncepcional", "Termogênico utilizado", "Uso de álcool", "Frequência álcool", "Já usou anabolizante", "Problemas com anabolizante", "Pretende usar anabolizante"],
        color: "from-rose-500/20 to-rose-500/5"
    },
    {
        id: "objetivos",
        title: "5. Objetivos",
        icon: <Target className="h-5 w-5" />,
        description: "Metas do tratamento e compromisso com acompanhamento",
        fields: ["Objetivo principal", "Compromisso com relatórios semanais"],
        color: "from-amber-500/20 to-amber-500/5"
    },
    {
        id: "medidas",
        title: "6. Medidas",
        icon: <Ruler className="h-5 w-5" />,
        description: "Circunferências corporais em centímetros",
        fields: ["Pescoço (cm)", "Cintura (cm)", "Quadril (cm) - Feminino"],
        color: "from-purple-500/20 to-purple-500/5"
    },
    {
        id: "fotos",
        title: "7. Fotos",
        icon: <Camera className="h-5 w-5" />,
        description: "Registro fotográfico para acompanhamento visual",
        fields: ["Foto de frente", "Foto de lado", "Foto de costas"],
        color: "from-pink-500/20 to-pink-500/5"
    },
]

export default function AnamnesisPage() {
    const [searchQuery, setSearchQuery] = React.useState("")
    const [expandedSections, setExpandedSections] = React.useState<string[]>(["identificacao"])
    const [showTemplateBuilder, setShowTemplateBuilder] = React.useState(false)
    const [editingTemplate, setEditingTemplate] = React.useState<AnamnesisTemplate | null>(null)
    const [importJson, setImportJson] = React.useState("")
    const [importDialogOpen, setImportDialogOpen] = React.useState(false)
    const [viewMode, setViewMode] = React.useState<"list" | "form">("list") // Para alternar entre lista e formulário

    const queryClient = useQueryClient()

    // Fetch Templates
    const { data: templates, isLoading: templatesLoading } = useQuery({
        queryKey: ['anamnesis-templates'],
        queryFn: anamnesisService.listTemplates
    })

    // Create Template Mutation
    const createTemplateMutation = useMutation({
        mutationFn: anamnesisService.createTemplate,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['anamnesis-templates'] })
            setShowTemplateBuilder(false)
            setEditingTemplate(null)
        }
    })

    // Delete Template Mutation
    const deleteTemplateMutation = useMutation({
        mutationFn: anamnesisService.deleteTemplate,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['anamnesis-templates'] })
        }
    })

    const filteredTemplates = templates?.filter(t =>
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description?.toLowerCase().includes(searchQuery.toLowerCase())
    ) || []

    const toggleSection = (id: string) => {
        setExpandedSections(prev =>
            prev.includes(id)
                ? prev.filter(s => s !== id)
                : [...prev, id]
        )
    }

    const handleSaveTemplate = (templateData: any) => {
        createTemplateMutation.mutate(templateData)
    }

    const handleImportTemplate = () => {
        try {
            const parsed = JSON.parse(importJson)
            if (!parsed.title || !parsed.questions) {
                throw new Error("Formato inválido")
            }
            createTemplateMutation.mutate({
                title: parsed.title,
                description: parsed.description || "",
                questions: parsed.questions
            })
            setImportJson("")
            setImportDialogOpen(false)
        } catch (e) {
            alert("Erro ao importar: JSON inválido ou formato incorreto")
        }
    }

    const handleDuplicateTemplate = (template: AnamnesisTemplate) => {
        createTemplateMutation.mutate({
            title: `${template.title} (Cópia)`,
            description: template.description,
            questions: template.questions
        })
    }

    const handleNewAnamnesis = () => {
        setViewMode("form")
    }

    const handleEditAnamnesis = (id: number) => {
        setViewMode("form")
        // Aqui você pode carregar os dados da anamnese com o ID especificado
    }

    const handleViewAnamnesis = (id: number) => {
        // Aqui você pode implementar a visualização da anamnese
        alert(`Visualizando anamnese ${id}`)
    }

    const handleCancelForm = () => {
        setViewMode("list")
    }

    if (showTemplateBuilder) {
        return (
            <DashboardLayout>
                <div className="fixed inset-0 bg-linear-to-br from-primary/5 via-background to-secondary/5 -z-10" />
                <TemplateBuilder
                    onSave={handleSaveTemplate}
                    onCancel={() => {
                        setShowTemplateBuilder(false)
                        setEditingTemplate(null)
                    }}
                    isLoading={createTemplateMutation.isPending}
                />
            </DashboardLayout>
        )
    }

    if (viewMode === "form") {
        return (
            <DashboardLayout>
                <div className="fixed inset-0 bg-linear-to-br from-primary/5 via-background to-secondary/5 -z-10" />
                <div className="max-w-4xl mx-auto py-6 px-4">
                    <div className="flex items-center gap-4 mb-6">
                        <Button variant="ghost" onClick={handleCancelForm} className="gap-2">
                            <ChevronLeft className="h-4 w-4" />
                            Voltar para Lista
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold">Preencher Anamnese</h1>
                            <p className="text-muted-foreground">
                                Preencha as informações do paciente passo a passo
                            </p>
                        </div>
                    </div>
                    <WizardAnamnesisForm onCancel={handleCancelForm} />
                </div>
            </DashboardLayout>
        )
    }

    return (
        <DashboardLayout>
            {/* Background Decorativo */}
            <div className="fixed inset-0 bg-linear-to-br from-primary/5 via-background to-secondary/5 -z-10" />

            <div className="space-y-6 relative animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Header Premium */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="h-16 w-16 rounded-2xl bg-linear-to-br from-primary/30 to-primary/10 flex items-center justify-center text-primary shadow-xl shadow-primary/20 ring-4 ring-primary/5">
                            <ClipboardList className="h-8 w-8" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-foreground bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                                Central de Anamneses
                            </h1>
                            <p className="text-muted-foreground mt-1">
                                Gerencie questionários, templates personalizados e respostas dos pacientes
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
                            <DialogTrigger asChild>
                                <Button variant="outline" className="gap-2 hover:border-primary/50">
                                    <FileUp className="h-4 w-4" />
                                    Importar
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-lg">
                                <DialogHeader>
                                    <DialogTitle className="flex items-center gap-2">
                                        <Upload className="h-5 w-5 text-primary" />
                                        Importar Template
                                    </DialogTitle>
                                    <DialogDescription>
                                        Cole o JSON do template que deseja importar
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                    <Textarea
                                        placeholder='{"title": "Meu Template", "description": "...", "questions": [...]}'
                                        value={importJson}
                                        onChange={(e) => setImportJson(e.target.value)}
                                        className="min-h-[200px] font-mono text-sm"
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        O JSON deve conter: title (texto), description (opcional), questions (array de perguntas)
                                    </p>
                                </div>
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setImportDialogOpen(false)}>
                                        Cancelar
                                    </Button>
                                    <Button onClick={handleImportTemplate} disabled={!importJson.trim()}>
                                        <Download className="mr-2 h-4 w-4" />
                                        Importar
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>

                        <Button onClick={handleNewAnamnesis} className="gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all">
                            <Plus className="h-4 w-4" />
                            Nova Anamnese
                        </Button>

                        <Button onClick={() => setShowTemplateBuilder(true)} className="gap-2">
                            <LayoutTemplate className="h-4 w-4" />
                            Templates
                        </Button>
                    </div>
                </div>

                {/* Stats Cards Premium */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="bg-linear-to-br from-card/80 to-card/40 backdrop-blur-xl border-border/40 hover:shadow-lg transition-all group">
                        <CardContent className="p-5 flex items-center gap-4">
                            <div className="h-14 w-14 rounded-2xl bg-linear-to-br from-primary/20 to-primary/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <List className="h-7 w-7 text-primary" />
                            </div>
                            <div>
                                <p className="text-3xl font-bold">24</p>
                                <p className="text-sm text-muted-foreground">Anamneses</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-linear-to-br from-card/80 to-card/40 backdrop-blur-xl border-border/40 hover:shadow-lg transition-all group">
                        <CardContent className="p-5 flex items-center gap-4">
                            <div className="h-14 w-14 rounded-2xl bg-linear-to-br from-violet-500/20 to-violet-500/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <LayoutTemplate className="h-7 w-7 text-violet-500" />
                            </div>
                            <div>
                                <p className="text-3xl font-bold">{templates?.length || 0}</p>
                                <p className="text-sm text-muted-foreground">Templates Criados</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-linear-to-br from-card/80 to-card/40 backdrop-blur-xl border-border/40 hover:shadow-lg transition-all group">
                        <CardContent className="p-5 flex items-center gap-4">
                            <div className="h-14 w-14 rounded-2xl bg-linear-to-br from-amber-500/20 to-amber-500/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Clock className="h-7 w-7 text-amber-500" />
                            </div>
                            <div>
                                <p className="text-3xl font-bold">8</p>
                                <p className="text-sm text-muted-foreground">Pendentes</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-linear-to-br from-card/80 to-card/40 backdrop-blur-xl border-border/40 hover:shadow-lg transition-all group">
                        <CardContent className="p-5 flex items-center gap-4">
                            <div className="h-14 w-14 rounded-2xl bg-linear-to-br from-emerald-500/20 to-emerald-500/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <CheckCircle2 className="h-7 w-7 text-emerald-500" />
                            </div>
                            <div>
                                <p className="text-3xl font-bold">16</p>
                                <p className="text-sm text-muted-foreground">Completas</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Tabs Principal */}
                <Tabs defaultValue="list" className="space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <TabsList className="bg-muted/30 backdrop-blur-sm p-1 rounded-xl">
                            <TabsTrigger value="list" className="gap-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-lg">
                                <List className="h-4 w-4" />
                                Lista de Anamneses
                            </TabsTrigger>
                            <TabsTrigger value="standard" className="gap-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-lg">
                                <Star className="h-4 w-4" />
                                Anamnese Padrão
                            </TabsTrigger>
                            <TabsTrigger value="templates" className="gap-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-lg">
                                <LayoutTemplate className="h-4 w-4" />
                                Templates
                                {(templates?.length || 0) > 0 && (
                                    <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                                        {templates?.length}
                                    </Badge>
                                )}
                            </TabsTrigger>
                        </TabsList>

                        <div className="relative max-w-xs">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 bg-background/50 backdrop-blur-sm"
                            />
                        </div>
                    </div>

                    {/* Aba Lista de Anamneses */}
                    <TabsContent value="list" className="space-y-6 mt-6">
                        <AnamnesisList
                            onNewAnamnesis={handleNewAnamnesis}
                            onEdit={handleEditAnamnesis}
                            onView={handleViewAnamnesis}
                        />
                    </TabsContent>

                    {/* Aba Anamnese Padrão */}
                    <TabsContent value="standard" className="space-y-6 mt-6">
                        {/* Hero Card */}
                        <Card className="bg-linear-to-br from-primary/10 via-card to-card border-primary/20 overflow-hidden relative">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                            <CardContent className="p-8 relative">
                                <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                                    <div className="h-20 w-20 rounded-3xl bg-linear-to-br from-primary to-primary/60 flex items-center justify-center text-primary-foreground shadow-2xl shadow-primary/30">
                                        <Sparkles className="h-10 w-10" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <h2 className="text-2xl font-bold">Anamnese Padrão Completa</h2>
                                            <Badge className="bg-primary/20 text-primary hover:bg-primary/30">Recomendado</Badge>
                                        </div>
                                        <p className="text-muted-foreground max-w-2xl">
                                            Questionário completo com <strong>7 seções</strong> e <strong>campos condicionais inteligentes</strong> que se adaptam às respostas do paciente. Inclui identificação, rotina, nutrição, histórico de saúde, objetivos, medidas e registro fotográfico.
                                        </p>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <Badge variant="outline" className="gap-1">
                                            <FileText className="h-3 w-3" />
                                            40+ campos
                                        </Badge>
                                        <Badge variant="outline" className="gap-1">
                                            <Activity className="h-3 w-3" />
                                            8 condicionais
                                        </Badge>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Seções Expansíveis */}
                        <div className="grid gap-4">
                            {STANDARD_SECTIONS.map((section, index) => (
                                <Collapsible
                                    key={section.id}
                                    open={expandedSections.includes(section.id)}
                                    onOpenChange={() => toggleSection(section.id)}
                                >
                                    <Card className={cn(
                                        "transition-all duration-300 hover:shadow-lg group overflow-hidden",
                                        expandedSections.includes(section.id) && "ring-2 ring-primary/20"
                                    )}>
                                        <div className={cn(
                                            "absolute inset-0 bg-linear-to-r opacity-0 group-hover:opacity-100 transition-opacity -z-10",
                                            section.color
                                        )} />
                                        <CollapsibleTrigger asChild>
                                            <CardHeader className="cursor-pointer hover:bg-muted/20 transition-colors">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-4">
                                                        <div className={cn(
                                                            "h-12 w-12 rounded-xl flex items-center justify-center transition-all",
                                                            `bg-linear-to-br ${section.color}`,
                                                            expandedSections.includes(section.id) ? "scale-110 shadow-lg" : ""
                                                        )}>
                                                            {section.icon}
                                                        </div>
                                                        <div>
                                                            <CardTitle className="text-lg flex items-center gap-2">
                                                                {section.title}
                                                                <Badge variant="secondary" className="text-xs font-normal">
                                                                    {section.fields.length} campos
                                                                </Badge>
                                                            </CardTitle>
                                                            <CardDescription>{section.description}</CardDescription>
                                                        </div>
                                                    </div>
                                                    {expandedSections.includes(section.id) ? (
                                                        <ChevronDown className="h-5 w-5 text-muted-foreground transition-transform" />
                                                    ) : (
                                                        <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform" />
                                                    )}
                                                </div>
                                            </CardHeader>
                                        </CollapsibleTrigger>
                                        <CollapsibleContent>
                                            <CardContent className="pt-0 pb-6">
                                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-4 border-t">
                                                    {section.fields.map((field, i) => (
                                                        <div
                                                            key={i}
                                                            className={cn(
                                                                "flex items-center gap-2 p-3 rounded-lg bg-muted/30 text-sm",
                                                                field.includes("Condicional") || field.includes("Feminino") || field.includes("Detalhes") || field.includes("Resultado") || field.includes("Frequência")
                                                                    ? "border-l-2 border-amber-500 bg-amber-500/5"
                                                                    : ""
                                                            )}
                                                        >
                                                            <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                                                            <span className="text-foreground/80">{field}</span>
                                                            {(field.includes("Feminino") || field.includes("Detalhes") || field.includes("Resultado") || field.includes("Frequência")) && (
                                                                <Badge variant="outline" className="text-[10px] px-1 py-0 text-amber-600 border-amber-300">
                                                                    Condicional
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </CardContent>
                                        </CollapsibleContent>
                                    </Card>
                                </Collapsible>
                            ))}
                        </div>

                        {/* Info Box */}
                        <Card className="bg-muted/30 border-dashed">
                            <CardContent className="p-6 flex items-start gap-4">
                                <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                                    <AlertCircle className="h-5 w-5 text-blue-500" />
                                </div>
                                <div>
                                    <h4 className="font-medium mb-1">Como funciona?</h4>
                                    <p className="text-sm text-muted-foreground">
                                        A anamnese padrão é aplicada automaticamente a cada novo paciente. Ela contém <strong>campos condicionais</strong> que só aparecem quando necessário (ex: detalhes de medicamentos só aparecem se o paciente usa medicamentos). Os dados são salvos no prontuário do paciente e podem ser editados a qualquer momento.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Aba Meus Templates */}
                    <TabsContent value="templates" className="space-y-6 mt-6">
                        {templatesLoading ? (
                            <div className="flex items-center justify-center py-16">
                                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                            </div>
                        ) : filteredTemplates.length === 0 ? (
                            <Card className="bg-card/60 backdrop-blur-xl border-dashed border-2">
                                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                                    <div className="h-20 w-20 rounded-full bg-linear-to-br from-muted to-muted/50 flex items-center justify-center mb-6">
                                        <FileText className="h-10 w-10 text-muted-foreground" />
                                    </div>
                                    <h3 className="text-xl font-semibold mb-2">Nenhum template personalizado</h3>
                                    <p className="text-muted-foreground mb-6 max-w-md">
                                        Crie templates personalizados para diferentes tipos de consulta, acompanhamento ou especialidades.
                                    </p>
                                    <div className="flex gap-3">
                                        <Button variant="outline" onClick={() => setImportDialogOpen(true)}>
                                            <Upload className="mr-2 h-4 w-4" />
                                            Importar Template
                                        </Button>
                                        <Button onClick={() => setShowTemplateBuilder(true)}>
                                            <Plus className="mr-2 h-4 w-4" />
                                            Criar do Zero
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredTemplates.map((template, index) => (
                                    <Card
                                        key={template.id}
                                        className="bg-card/60 backdrop-blur-xl border-border/40 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1 transition-all duration-300 group overflow-hidden"
                                        style={{ animationDelay: `${index * 100}ms` }}
                                    >
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/10 transition-colors" />
                                        <CardHeader className="pb-3 relative">
                                            <div className="flex items-start justify-between">
                                                <div className="h-12 w-12 rounded-xl bg-linear-to-br from-primary/20 to-primary/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                    <FileText className="h-6 w-6 text-primary" />
                                                </div>
                                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 hover:bg-primary/10"
                                                        onClick={() => handleDuplicateTemplate(template)}
                                                    >
                                                        <Copy className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 hover:bg-destructive/10 text-destructive"
                                                        onClick={() => {
                                                            if (confirm("Excluir este template?")) {
                                                                deleteTemplateMutation.mutate(template.id)
                                                            }
                                                        }}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                            <CardTitle className="text-lg mt-4 group-hover:text-primary transition-colors">
                                                {template.title}
                                            </CardTitle>
                                            <CardDescription className="line-clamp-2">
                                                {template.description || "Sem descrição"}
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="flex items-center justify-between">
                                                <Badge variant="secondary" className="gap-1">
                                                    <FileText className="h-3 w-3" />
                                                    {template.questions.length} questões
                                                </Badge>
                                                <span className="text-xs text-muted-foreground">
                                                    {new Date(template.created_at).toLocaleDateString('pt-BR')}
                                                </span>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}

                                {/* Card para adicionar novo */}
                                <Card
                                    className="bg-card/30 border-dashed border-2 hover:border-primary/50 hover:bg-card/50 transition-all cursor-pointer group"
                                    onClick={() => setShowTemplateBuilder(true)}
                                >
                                    <CardContent className="flex flex-col items-center justify-center h-full min-h-[200px] text-center">
                                        <div className="h-14 w-14 rounded-full bg-muted/50 flex items-center justify-center mb-4 group-hover:bg-primary/10 group-hover:scale-110 transition-all">
                                            <Plus className="h-7 w-7 text-muted-foreground group-hover:text-primary" />
                                        </div>
                                        <p className="font-medium group-hover:text-primary transition-colors">Criar Novo Template</p>
                                        <p className="text-sm text-muted-foreground mt-1">Personalize seu questionário</p>
                                    </CardContent>
                                </Card>
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </div>
        </DashboardLayout>
    )
}
