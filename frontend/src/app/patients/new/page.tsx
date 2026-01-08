"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { ArrowLeft, Camera, Loader2, Save, Upload, UserPlus, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { usePatients } from "@/hooks/usePatients"
import { CreatePatientDTO } from "@/services/patient-service"

export default function NewPatientPage() {
    console.log("!!! FRONTEND VALIDATION V3 LOADED !!!")
    const router = useRouter()
    const { createPatient } = usePatients()
    const [previewUrl, setPreviewUrl] = React.useState<string | null>(null)
    const [photoFile, setPhotoFile] = React.useState<File | null>(null)

    const [formData, setFormData] = React.useState<CreatePatientDTO>({
        name: "",
        email: "",
        phone: "",
        birth_date: "",
        gender: "F",
        goal: "",
        service_type: "ONLINE", // Default
        start_date: new Date().toISOString().split('T')[0]
    })

    const formatPhone = (value: string) => {
        // Remove non-numeric characters
        const numbers = value.replace(/\D/g, "")

        // Limit to 11 digits
        const truncated = numbers.slice(0, 11)

        // Apply mask
        if (truncated.length <= 10) {
            // (XX) XXXX-XXXX
            return truncated
                .replace(/^(\d{2})(\d)/, "($1) $2")
                .replace(/(\d{4})(\d)/, "$1-$2")
        } else {
            // (XX) XXXXX-XXXX
            return truncated
                .replace(/^(\d{2})(\d)/, "($1) $2")
                .replace(/(\d{5})(\d)/, "$1-$2")
        }
    }

    const validateName = (name: string) => {
        // Permite APENAS letras (incluindo acentos) e espaços
        const nameRegex = /^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/
        if (name && !nameRegex.test(name)) {
            return "Nome não pode conter símbolos especiais. Use apenas letras e espaços."
        }
        return null
    }

    const [nameError, setNameError] = React.useState<string | null>(null)

    const handleChange = (field: keyof CreatePatientDTO, value: string) => {
        let finalValue = value

        if (field === "name") {
            const error = validateName(value)
            setNameError(error)
            if (error) {
                console.log("Validation error detected:", error)
                window.alert(error)
            }
        }

        if (field === "phone") {
            finalValue = formatPhone(value)
        }

        setFormData(prev => ({ ...prev, [field]: finalValue }))
    }


    const [error, setError] = React.useState<string | null>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        try {
            await createPatient.mutateAsync({ ...formData, profile_picture: photoFile })
            router.push("/patients")
        } catch (err: any) {
            console.error("Failed to create patient:", err)
            // Try to extract a meaningful message
            let msg = "Erro ao salvar paciente. Verifique os dados e tente novamente."

            if (err.response?.data) {
                // If it's a DRF error dictionary: { email: ["Enter a valid email."], phone: [...] }
                const data = err.response.data
                if (typeof data === 'object') {
                    const messages = Object.entries(data).map(([key, val]) => {
                        const fieldName = {
                            email: "Email",
                            name: "Nome",
                            phone: "Telefone",
                            birth_date: "Data de Nascimento",
                            goal: "Objetivo",
                            gender: "Gênero"
                        }[key] || key
                        return `${fieldName}: ${Array.isArray(val) ? val.join(" ") : val}`
                    })
                    msg = messages.join(" | ")
                }
            }
            setError(msg)
        }
    }

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const url = URL.createObjectURL(file)
            setPreviewUrl(url)
            setPhotoFile(file)
        }
    }

    return (
        <DashboardLayout>
            {/* Background Decorativo - Gradiente do Tema */}
            <div className="fixed inset-0 bg-linear-to-br from-primary/5 via-background to-secondary/5 -z-10" />

            <div className="max-w-4xl mx-auto space-y-6 relative">
                {/* Header */}
                <div className="flex items-center gap-4 pt-4">
                    <Button variant="ghost" size="icon" asChild className="hover:bg-primary/10 hover:text-primary transition-colors">
                        <Link href="/patients">
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-normal tracking-tight text-foreground">
                            Novo Paciente
                        </h1>
                        <p className="text-muted-foreground mt-1 flex items-center gap-2">
                            <UserPlus className="h-4 w-4 text-primary" />
                            Preencha os dados abaixo para criar um novo prontuário.
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {error && (
                        <div className="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive flex items-center gap-3 shadow-sm">
                            <AlertCircle className="h-5 w-5 shrink-0" />
                            <p className="text-sm font-medium">{error}</p>
                        </div>
                    )}

                    <Card className="border-border/40 bg-card/60 backdrop-blur-xl shadow-2xl overflow-hidden">
                        <div className="absolute top-0 right-0 p-32 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                        <CardHeader className="border-b border-border/40 pb-6">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shadow-inner">
                                    <Camera className="h-5 w-5" />
                                </div>
                                <div className="space-y-1">
                                    <CardTitle className="text-xl">Informações Pessoais</CardTitle>
                                    <CardDescription>
                                        Dados básicos de identificação e contato.
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent className="space-y-8 p-8">

                            {/* Upload de Foto Premium */}
                            <div className="flex flex-col sm:flex-row items-center gap-8 p-6 rounded-2xl bg-linear-to-br from-muted/50 to-muted/10 border border-border/50 shadow-sm relative overflow-hidden group/banner">
                                <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover/banner:opacity-100 transition-opacity duration-500" />

                                <div className="relative group/avatar">
                                    <div className={cn(
                                        "h-32 w-32 rounded-full overflow-hidden border-4 border-background shadow-xl flex items-center justify-center transition-all duration-300 group-hover/avatar:scale-105 group-hover/avatar:border-primary/20",
                                        !previewUrl && "bg-muted"
                                    )}>
                                        {previewUrl ? (
                                            <img src={previewUrl} alt="Preview" className="h-full w-full object-cover" />
                                        ) : (
                                            <Camera className="h-10 w-10 text-muted-foreground/50 group-hover/avatar:text-primary transition-colors" />
                                        )}
                                    </div>

                                    {/* Overlay de Upload */}
                                    <div className="absolute inset-0 rounded-full flex items-center justify-center bg-black/40 opacity-0 group-hover/avatar:opacity-100 transition-all duration-300 backdrop-blur-[2px] cursor-pointer">
                                        <Upload className="h-6 w-6 text-white drop-shadow-md scale-90 group-hover/avatar:scale-100 transition-transform" />
                                    </div>

                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20 rounded-full"
                                        onChange={handlePhotoChange}
                                    />

                                    {/* Status Badge */}
                                    <div className="absolute bottom-1 right-1 h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg border-2 border-background transform translate-x-1 translate-y-1">
                                        <Camera className="h-4 w-4" />
                                    </div>
                                </div>

                                <div className="space-y-3 text-center sm:text-left z-10">
                                    <div>
                                        <h4 className="text-base font-semibold text-foreground">Foto de Perfil</h4>
                                        <p className="text-sm text-muted-foreground max-w-[280px]">
                                            Adicione uma foto para facilitar a identificação visual nos cards e listas.
                                        </p>
                                    </div>
                                    <Button variant="secondary" size="sm" type="button" onClick={() => (document.querySelector('input[type="file"]') as HTMLInputElement | null)?.click()} className="active:scale-95 transition-transform">
                                        <Upload className="mr-2 h-3.5 w-3.5" />
                                        Selecionar Arquivo
                                    </Button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                <div className="space-y-2 col-span-1 md:col-span-2 group">
                                    <div className="flex justify-between items-center">
                                        <Label htmlFor="name" className={cn(
                                            "text-xs uppercase tracking-wider font-semibold transition-colors",
                                            nameError ? "text-destructive" : "text-muted-foreground group-focus-within:text-primary"
                                        )}>
                                            Nome Completo
                                        </Label>
                                        {nameError && (
                                            <span className="text-[10px] text-destructive font-medium animate-in fade-in slide-in-from-right-1">
                                                {nameError}
                                            </span>
                                        )}
                                    </div>
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) => handleChange("name", e.target.value)}
                                        placeholder="Ex: Maria Silva"
                                        required
                                        className={cn(
                                            "h-12 bg-background/50 transition-all rounded-xl focus:ring-4",
                                            nameError
                                                ? "border-destructive focus:border-destructive focus:ring-destructive/10"
                                                : "border-input focus:border-primary focus:ring-primary/10"
                                        )}
                                    />
                                </div>


                                {/* Email */}
                                <div className="space-y-2 group">
                                    <Label htmlFor="email" className="text-xs uppercase tracking-wider text-muted-foreground font-semibold group-focus-within:text-primary transition-colors">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => handleChange("email", e.target.value)}
                                        placeholder="maria@exemplo.com"
                                        required
                                        className="h-12 bg-background/50 border-input transition-all focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-xl"
                                    />
                                </div>

                                {/* Telefone */}
                                <div className="space-y-2 group">
                                    <Label htmlFor="phone" className="text-xs uppercase tracking-wider text-muted-foreground font-semibold group-focus-within:text-primary transition-colors">WhatsApp</Label>
                                    <Input
                                        id="phone"
                                        value={formData.phone}
                                        onChange={(e) => handleChange("phone", e.target.value)}
                                        placeholder="(11) 99999-9999"
                                        required
                                        className="h-12 bg-background/50 border-input transition-all focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-xl"
                                    />
                                </div>

                                {/* Data de Nascimento */}
                                <div className="space-y-2 group">
                                    <Label htmlFor="birthdate" className="text-xs uppercase tracking-wider text-muted-foreground font-semibold group-focus-within:text-primary transition-colors">Data de Nascimento</Label>
                                    <Input
                                        id="birthdate"
                                        type="date"
                                        value={formData.birth_date}
                                        onChange={(e) => handleChange("birth_date", e.target.value)}
                                        required
                                        className="h-12 bg-background/50 border-input transition-all focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-xl"
                                    />
                                </div>

                                {/* Gênero */}
                                <div className="space-y-2 group">
                                    <Label htmlFor="gender" className="text-xs uppercase tracking-wider text-muted-foreground font-semibold group-focus-within:text-primary transition-colors">Gênero Biológico</Label>
                                    <Select
                                        value={formData.gender}
                                        onValueChange={(value) => handleChange("gender", value)}
                                        required
                                    >
                                        <SelectTrigger className="h-12 bg-background/50 border-input transition-all focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-xl">
                                            <SelectValue placeholder="Selecione..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="F">Feminino</SelectItem>
                                            <SelectItem value="M">Masculino</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Objetivo Principal */}
                                <div className="space-y-2 col-span-1 md:col-span-2 group">
                                    <Label htmlFor="goal" className="text-xs uppercase tracking-wider text-muted-foreground font-semibold group-focus-within:text-primary transition-colors">Objetivo Principal</Label>
                                    <Select
                                        value={formData.goal}
                                        onValueChange={(value) => handleChange("goal", value)}
                                    >
                                        <SelectTrigger className="h-12 bg-background/50 border-input transition-all focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-xl">
                                            <SelectValue placeholder="Qual o foco do tratamento?" />
                                        </SelectTrigger>
                                        <SelectContent className="max-h-60">
                                            <SelectItem value="PERDA_PESO">Perda de peso - Redução de peso com foco em saúde e sustentabilidade</SelectItem>
                                            <SelectItem value="GANHO_MUSCULAR">Ganho de massa muscular - Hipertrofia e desenvolvimento muscular</SelectItem>
                                            <SelectItem value="MANUTENCAO_PESO">Manutenção do peso - Equilíbrio e manutenção do peso atual</SelectItem>
                                            <SelectItem value="PERFORMANCE_ESPORTIVA">Performance esportiva - Otimização do desempenho atlético e competitivo</SelectItem>
                                            <SelectItem value="GESTACAO_LACTACAO">Gestação e lactação - Acompanhamento nutricional materno-infantil</SelectItem>
                                            <SelectItem value="DOENCAS_CRONICAS">Manejo de doenças crônicas - Diabetes, hipertensão, dislipidemias, doenças cardiovasculares</SelectItem>
                                            <SelectItem value="REABILITACAO_NUTRICIONAL">Reabilitação nutricional - Recuperação pós-cirúrgica ou pós-doença</SelectItem>
                                            <SelectItem value="TRANSTORNOS_ALIMENTARES">Transtornos alimentares - Apoio no tratamento de anorexia, bulimia, compulsão alimentar</SelectItem>
                                            <SelectItem value="ALERGIAS_INTOLERANCIAS">Alergias e intolerâncias alimentares - Manejo de restrições alimentares específicas</SelectItem>
                                            <SelectItem value="DISTURBIOS_GASTROINTESTINAIS">Distúrbios gastrointestinais - Síndrome do intestino irritável, doença celíaca, refluxo</SelectItem>
                                            <SelectItem value="CONDICOES_HORMONAIS">Condições hormonais - SOP (Síndrome dos Ovários Policísticos), hipotireoidismo, menopausa</SelectItem>
                                            <SelectItem value="NUTRICAO_FUNCIONAL">Nutrição funcional e integrativa - Abordagem holística e preventiva</SelectItem>
                                            <SelectItem value="SUPLEMENTACAO_ORIENTADA">Suplementação orientada - Otimização do uso de suplementos nutricionais</SelectItem>
                                            <SelectItem value="SAUDE_IDOSO">Saúde do idoso - Nutrição voltada para longevidade e qualidade de vida</SelectItem>
                                            <SelectItem value="PREVENCAO_DOENCAS">Prevenção de doenças - Promoção de saúde e hábitos preventivos</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-4 mt-8 pb-12">
                        <Button variant="ghost" type="button" asChild className="hover:bg-destructive/10 hover:text-destructive transition-colors">
                            <Link href="/patients">Cancelar</Link>
                        </Button>
                        <Button type="submit" disabled={createPatient.isPending || !!nameError} className="min-w-[160px] h-11 text-base shadow-xl shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-0.5 transition-all rounded-xl">

                            {createPatient.isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Processando...
                                </>
                            ) : (
                                <>
                                    <Save className="mr-2 h-4 w-4" />
                                    Salvar Cadastro
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    )
}
