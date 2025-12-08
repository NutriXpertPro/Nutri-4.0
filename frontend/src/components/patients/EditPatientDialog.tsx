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
import { Loader2 } from "lucide-react"
import { usePatients } from "@/hooks/usePatients"
import { toast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"

const formSchema = z.object({
    name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
    email: z.string().email("Email inválido"),
    phone: z.string().min(10, "Telefone inválido"),
    birth_date: z.string().min(1, "Data de nascimento obrigatória"),
    gender: z.string().optional(),
    goal: z.string().min(1, "Objetivo obrigatório"),
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
        goal?: string
        service_type?: "ONLINE" | "PRESENCIAL"
    }
}

export function EditPatientDialog({ open, onOpenChange, patient }: EditPatientDialogProps) {
    const { updatePatient } = usePatients()
    const router = useRouter()
    const [isLoading, setIsLoading] = React.useState(false)

    // Manual form state handling to keep it simple without full hook-form complexity for now
    // or use hook-form which is cleaner. Let's use controlled inputs for simplicity with existing code style
    const [formData, setFormData] = React.useState({
        name: patient.name,
        email: patient.email,
        phone: patient.phone,
        birth_date: patient.birth_date || "",
        gender: patient.gender || "F",
        goal: patient.goal || "",
        service_type: patient.service_type || "ONLINE"
    })

    // Update form data when patient changes
    React.useEffect(() => {
        if (open) {
            setFormData({
                name: patient.name,
                email: patient.email,
                phone: patient.phone,
                birth_date: patient.birth_date || "",
                gender: patient.gender || "F",
                goal: patient.goal || "",
                service_type: patient.service_type || "ONLINE"
            })
        }
    }, [open, patient])

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }))
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
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Editar Paciente</DialogTitle>
                    <DialogDescription>
                        Faça alterações no perfil do paciente aqui. Clique em salvar quando terminar.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2 col-span-2">
                                <Label htmlFor="name">Nome Completo</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => handleChange("name", e.target.value)}
                                    required
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
                            <div className="space-y-2 col-span-2">
                                <Label htmlFor="goal">Objetivo Principal</Label>
                                <Select
                                    value={formData.goal}
                                    onValueChange={(value) => handleChange("goal", value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione o objetivo" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="PERDA_GORDURA">Emagrecimento</SelectItem>
                                        <SelectItem value="GANHO_MASSA">Hipertrofia</SelectItem>
                                        <SelectItem value="QUALIDADE_VIDA">Qualidade de Vida</SelectItem>
                                        <SelectItem value="OUTRO">Outro</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Salvar Alterações
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
