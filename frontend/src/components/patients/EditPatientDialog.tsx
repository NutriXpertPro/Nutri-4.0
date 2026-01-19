"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Loader2, Camera, X } from "lucide-react"
import { usePatients } from "@/hooks/usePatients"
import { toast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

const formSchema = z.object({
    name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
    email: z.string().email("Email inválido"),
    phone: z.string().min(10, "Telefone inválido"),
    birth_date: z.string().min(1, "Data de nascimento obrigatória"),
    gender: z.string().optional(),
    service_type: z.enum(["ONLINE", "PRESENCIAL"]),
})

type FormValues = z.infer<typeof formSchema>

interface EditPatientDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    patient: {
        id: number
        name: string
        email: string
        phone: string
        birth_date?: string
        gender?: string
        service_type?: "ONLINE" | "PRESENCIAL"
        avatar?: string
    }
}

export function EditPatientDialog({ open, onOpenChange, patient }: EditPatientDialogProps) {
    const { updatePatient, deletePatient } = usePatients()
    const router = useRouter()
    const [isLoading, setIsLoading] = React.useState(false)

    const validateName = (name: string) => {
        const nameRegex = /^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/
        if (name && !nameRegex.test(name)) {
            return "Nome não pode conter símbolos especiais. Use apenas letras e espaços."
        }
        return null
    }

    const [nameError, setNameError] = React.useState<string | null>(null)


    // Manual form state handling to keep it simple without full hook-form complexity for now
    // or use hook-form which is cleaner. Let's use controlled inputs for simplicity with existing code style
    const [formData, setFormData] = React.useState({
        name: patient.name,
        email: patient.email,
        phone: patient.phone,
        birth_date: patient.birth_date || "",
        gender: patient.gender || "F",
        service_type: patient.service_type || "ONLINE",
        profile_picture: undefined as File | null | undefined,
    })
    const fileInputRef = React.useRef<HTMLInputElement>(null)
    const [previewUrl, setPreviewUrl] = React.useState<string | null>(patient.avatar || null)

    // Update form data when patient changes
    React.useEffect(() => {
        if (open) {
            setFormData({
                name: patient.name,
                email: patient.email,
                phone: patient.phone,
                birth_date: patient.birth_date || "",
                gender: patient.gender || "F",
                service_type: patient.service_type || "ONLINE",
                profile_picture: undefined,
            })
            setPreviewUrl(patient.avatar || null)
        }
    }, [open, patient])

    const handleChange = (field: string, value: any) => {
        if (field === "name") {
            const error = validateName(value)
            setNameError(error)
            if (error) {
                window.alert(error)
            }
        }
        setFormData(prev => ({ ...prev, [field]: value }))
    }


    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            handleChange("profile_picture", file)
            const reader = new FileReader()
            reader.onloadend = () => {
                setPreviewUrl(reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            await updatePatient.mutateAsync({
                id: patient.id,
                data: formData
            })
            onOpenChange(false)
            toast({
                title: "Paciente atualizado",
                description: "Os dados foram salvos com sucesso.",
            })
            router.refresh()
        } catch (error) {
            console.error("Failed to update patient", error)
            toast({
                title: "Erro ao atualizar",
                description: "Não foi possível salvar as alterações.",
                variant: "destructive"
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col p-0 overflow-hidden">
                <DialogHeader className="p-6 pb-2">
                    <DialogTitle>Editar Paciente</DialogTitle>
                    <DialogDescription>
                        Faça alterações no perfil do paciente aqui. Clique em salvar quando terminar.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="flex flex-col overflow-hidden" autoComplete="off">
                    <div className="flex-1 overflow-y-auto px-6 py-4">
                        <div className="grid gap-6">
                            {/* Foto do Paciente */}
                            <div className="flex flex-col items-center gap-4 py-2">
                                <div className="relative group">
                                    <Avatar className="h-28 w-28 border-2 border-primary/20 bg-muted/30 shadow-md overflow-hidden">
                                        <AvatarImage src={previewUrl || ""} className="h-full w-full object-cover" />
                                        <AvatarFallback className="text-2xl font-bold bg-primary/5 text-primary">
                                            {formData.name.substring(0, 2).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <Button
                                        type="button"
                                        size="icon"
                                        variant="secondary"
                                        className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full shadow-lg border-2 border-background"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <Camera className="h-4 w-4" />
                                    </Button>
                                    {previewUrl && (
                                        <Button
                                            type="button"
                                            size="icon"
                                            variant="destructive"
                                            className="absolute -top-1 -right-1 h-6 w-6 rounded-full shadow-lg border-2 border-background"
                                            onClick={() => {
                                                setPreviewUrl(null)
                                                handleChange("profile_picture", null)
                                            }}
                                        >
                                            <X className="h-3 w-3" />
                                        </Button>
                                    )}
                                </div>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                />
                                <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Clique para alterar a foto</p>
                            </div>

                            <div className="grid gap-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2 col-span-2">
                                        <div className="flex justify-between items-center">
                                            <Label htmlFor="name">Nome Completo</Label>
                                            {nameError && (
                                                <span className="text-[10px] text-destructive font-medium">
                                                    {nameError}
                                                </span>
                                            )}
                                        </div>
                                        <Input
                                            id="name"
                                            value={formData.name}
                                            onChange={(e) => handleChange("name", e.target.value)}
                                            required
                                            className={cn(
                                                nameError && "border-destructive focus-visible:ring-destructive"
                                            )}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => handleChange("email", e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Telefone</Label>
                                        <Input
                                            id="phone"
                                            value={formData.phone}
                                            onChange={(e) => handleChange("phone", e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="birth_date">Data de Nascimento</Label>
                                        <Input
                                            id="birth_date"
                                            type="date"
                                            value={formData.birth_date}
                                            onChange={(e) => handleChange("birth_date", e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="gender">Gênero</Label>
                                        <Select
                                            value={formData.gender}
                                            onValueChange={(value) => handleChange("gender", value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecione" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="F">Feminino</SelectItem>
                                                <SelectItem value="M">Masculino</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <DialogFooter className="p-6 pt-2 border-t bg-muted/5">
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={isLoading || !!nameError}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Salvar Alterações
                            </Button>

                        </DialogFooter>

                        <div className="border-t pt-4 mt-4">
                            <DialogDescription className="text-destructive mb-2 font-semibold">
                                Zona de Perigo
                            </DialogDescription>
                            <div className="flex flex-col gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full border-red-200 text-red-700 hover:bg-red-50 hover:text-red-900 justify-start"
                                    onClick={() => {
                                        if (confirm("Tem certeza que deseja arquivar este paciente? Ele ficará inativo mas os dados serão preservados.")) {
                                            deletePatient.mutate({ id: patient.id, hardDelete: false }, {
                                                onSuccess: () => {
                                                    onOpenChange(false);
                                                    toast({ title: "Paciente arquivado", description: "O paciente foi movido para inativos." });
                                                }
                                            });
                                        }
                                    }}
                                >
                                    <span className="mr-2">📁</span> Arquivar Paciente (Reversível)
                                </Button>

                                <Button
                                    type="button"
                                    variant="destructive"
                                    className="w-full justify-start"
                                    onClick={() => {
                                        if (confirm("ATENÇÃO: Tem certeza que deseja EXCLUIR PERMANENTEMENTE este paciente? Todos os dados, incluindo histórico, avaliações e dietas serão apagados. Esta ação NÃO pode ser desfeita.")) {
                                            deletePatient.mutate({ id: patient.id, hardDelete: true }, {
                                                onSuccess: () => {
                                                    onOpenChange(false);
                                                    toast({ title: "Paciente excluído", description: "Todos os dados foram removidos permanentemente." });
                                                }
                                            });
                                        }
                                    }}
                                >
                                    <span className="mr-2">🗑️</span> Excluir Permanentemente
                                </Button>
                            </div>
                        </div>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
