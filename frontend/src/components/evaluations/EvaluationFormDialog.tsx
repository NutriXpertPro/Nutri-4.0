import * as React from "react"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
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
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Plus, Trash2, GripVertical, X, Eye, Edit3, Check, XCircle, Ruler } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { evaluationFormService, EvaluationForm, EvaluationFormField, CreateEvaluationFormDTO } from "@/services/evaluation-form-service"
import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query"

interface EvaluationFormDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    patientId?: number
    evaluationId?: number
    onUseForm?: (form: EvaluationForm) => void
}

const formSchema = z.object({
    name: z.string().min(1, "Nome é obrigatório"),
    description: z.string().optional(),
    fields: z.array(
        z.object({
            name: z.string().min(1, "Nome do campo é obrigatório"),
            label: z.string().min(1, "Rótulo é obrigatório"),
            type: z.enum(['number', 'text', 'select', 'checkbox', 'date']),
            required: z.boolean(),
            unit: z.string().optional(),
            options: z.array(z.string()).optional(),
        })
    ),
})

export function EvaluationFormDialog({ open, onOpenChange, patientId, evaluationId, onUseForm }: EvaluationFormDialogProps) {
    const [formData, setFormData] = React.useState({
        name: "",
        description: "",
        fields: [
            { id: Date.now().toString(), name: "", label: "", type: "number", required: false, unit: "", options: [], order: 0 }
        ] as EvaluationFormField[]
    })

    const [selectedForm, setSelectedForm] = React.useState<EvaluationForm | null>(null)
    const [availableForms, setAvailableForms] = React.useState<EvaluationForm[]>([])
    const [isLoading, setIsLoading] = React.useState(false)
    const [isCreating, setIsCreating] = React.useState(true)

    // Carregar formulários existentes
    React.useEffect(() => {
        if (open) {
            loadAvailableForms()
        }
    }, [open])

    const loadAvailableForms = async () => {
        try {
            const forms = await evaluationFormService.listAll()
            setAvailableForms(forms)
        } catch (error) {
            console.error("Erro ao carregar formulários:", error)
            toast({
                title: "Erro",
                description: "Falha ao carregar formulários personalizados.",
                variant: "destructive"
            })
        }
    }

    const handleAddField = () => {
        setFormData(prev => ({
            ...prev,
            fields: [
                ...prev.fields,
                {
                    id: Date.now().toString(),
                    name: "",
                    label: "",
                    type: "number",
                    required: false,
                    unit: "",
                    options: [],
                    order: prev.fields.length
                }
            ]
        }))
    }

    const handleRemoveField = (id: string) => {
        if (formData.fields.length > 1) {
            setFormData(prev => ({
                ...prev,
                fields: prev.fields.filter(field => field.id !== id)
            }))
        }
    }

    const handleFieldChange = (id: string, field: keyof EvaluationFormField, value: any) => {
        setFormData(prev => ({
            ...prev,
            fields: prev.fields.map(f =>
                f.id === id ? { ...f, [field]: value } : f
            )
        }))
    }

    const handleOptionChange = (fieldId: string, optionIndex: number, value: string) => {
        setFormData(prev => ({
            ...prev,
            fields: prev.fields.map(f => {
                if (f.id === fieldId) {
                    const newOptions = [...f.options || []]
                    newOptions[optionIndex] = value
                    return { ...f, options: newOptions }
                }
                return f
            })
        }))
    }

    const handleAddOption = (fieldId: string) => {
        setFormData(prev => ({
            ...prev,
            fields: prev.fields.map(f => {
                if (f.id === fieldId) {
                    return { ...f, options: [...(f.options || []), ""] }
                }
                return f
            })
        }))
    }

    const handleRemoveOption = (fieldId: string, optionIndex: number) => {
        setFormData(prev => ({
            ...prev,
            fields: prev.fields.map(f => {
                if (f.id === fieldId && f.options) {
                    const newOptions = [...f.options]
                    newOptions.splice(optionIndex, 1)
                    return { ...f, options: newOptions }
                }
                return f
            })
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const formToCreate: CreateEvaluationFormDTO = {
                name: formData.name,
                description: formData.description,
                fields: formData.fields.map(({ id, ...field }) => field),
                isActive: true,
                isDefault: false
            }

            await evaluationFormService.create(formToCreate)

            toast({
                title: "Formulário criado",
                description: "Ficha personalizada criada com sucesso.",
            })

            // Atualizar a lista
            loadAvailableForms()

            // Resetar o formulário
            setFormData({
                name: "",
                description: "",
                fields: [{ id: Date.now().toString(), name: "", label: "", type: "number", required: false, unit: "", options: [], order: 0 }]
            })

        } catch (error) {
            console.error("Erro ao criar formulário:", error)
            toast({
                title: "Erro",
                description: "Falha ao criar ficha personalizada.",
                variant: "destructive"
            })
        } finally {
            setIsLoading(false)
        }
    }

    const handleUseForm = (form: EvaluationForm) => {
        setSelectedForm(form)
        setIsCreating(false)
    }

    const handleCreateNew = () => {
        setSelectedForm(null)
        setIsCreating(true)
        setFormData({
            name: "",
            description: "",
            fields: [{ id: Date.now().toString(), name: "", label: "", type: "number", required: false, unit: "", options: [], order: 0 }]
        })
    }

    if (!patientId) {
        return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Selecione um Paciente</DialogTitle>
                        <DialogDescription>
                            Para criar uma ficha antropométrica, selecione um paciente primeiro.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 text-center">
                        <p className="text-muted-foreground">Nenhum paciente selecionado.</p>
                        <p className="text-sm text-muted-foreground mt-2">Selecione um paciente na lista ou vá para a página de pacientes.</p>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancelar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        )
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Criar Ficha Antropométrica</DialogTitle>
                    <DialogDescription>
                        Crie uma ficha personalizada com os campos que deseja registrar.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {isCreating ? (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Informações básicas */}
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Nome da Ficha *</Label>
                                        <Input
                                            id="name"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="description">Descrição</Label>
                                        <Input
                                            id="description"
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Campos do formulário */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-medium">Campos da Ficha</h3>
                                    <Button type="button" variant="outline" size="sm" onClick={handleAddField}>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Adicionar Campo
                                    </Button>
                                </div>

                                {formData.fields.map((field, index) => (
                                    <Card key={field.id}>
                                        <CardHeader className="pb-3">
                                            <div className="flex items-center justify-between">
                                                <CardTitle className="text-sm">Campo {index + 1}</CardTitle>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleRemoveField(field.id)}
                                                    disabled={formData.fields.length <= 1}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor={`field-name-${field.id}`}>Nome do Campo *</Label>
                                                    <Input
                                                        id={`field-name-${field.id}`}
                                                        value={field.name}
                                                        onChange={(e) => handleFieldChange(field.id, 'name', e.target.value)}
                                                        placeholder="Ex: dobra_tricipital"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor={`field-label-${field.id}`}>Rótulo *</Label>
                                                    <Input
                                                        id={`field-label-${field.id}`}
                                                        value={field.label}
                                                        onChange={(e) => handleFieldChange(field.id, 'label', e.target.value)}
                                                        placeholder="Ex: Dobra Tricipital"
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor={`field-type-${field.id}`}>Tipo</Label>
                                                    <Select
                                                        value={field.type}
                                                        onValueChange={(value) => handleFieldChange(field.id, 'type', value as any)}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Selecione" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="number">Número</SelectItem>
                                                            <SelectItem value="text">Texto</SelectItem>
                                                            <SelectItem value="date">Data</SelectItem>
                                                            <SelectItem value="select">Seleção</SelectItem>
                                                            <SelectItem value="checkbox">Checkbox</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor={`field-unit-${field.id}`}>Unidade</Label>
                                                    <Input
                                                        id={`field-unit-${field.id}`}
                                                        value={field.unit || ""}
                                                        onChange={(e) => handleFieldChange(field.id, 'unit', e.target.value)}
                                                        placeholder="Ex: mm, kg, cm"
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label>Requerido</Label>
                                                    <div className="flex items-center space-x-2">
                                                        <input
                                                            type="checkbox"
                                                            id={`field-required-${field.id}`}
                                                            checked={field.required}
                                                            onChange={(e) => handleFieldChange(field.id, 'required', e.target.checked)}
                                                            className="h-4 w-4"
                                                        />
                                                        <Label htmlFor={`field-required-${field.id}`} className="text-sm">
                                                            Campo obrigatório
                                                        </Label>
                                                    </div>
                                                </div>
                                            </div>

                                            {field.type === 'select' && (
                                                <div className="space-y-2">
                                                    <Label>Opções</Label>
                                                    <div className="space-y-2">
                                                        {field.options?.map((option, optionIndex) => (
                                                            <div key={optionIndex} className="flex items-center gap-2">
                                                                <Input
                                                                    value={option}
                                                                    onChange={(e) => handleOptionChange(field.id, optionIndex, e.target.value)}
                                                                    placeholder={`Opção ${optionIndex + 1}`}
                                                                />
                                                                <Button
                                                                    type="button"
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => handleRemoveOption(field.id, optionIndex)}
                                                                >
                                                                    <X className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        ))}
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleAddOption(field.id)}
                                                        >
                                                            <Plus className="h-4 w-4 mr-2" />
                                                            Adicionar Opção
                                                        </Button>
                                                    </div>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>

                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                    Cancelar
                                </Button>
                                <Button type="submit" disabled={isLoading}>
                                    {isLoading && <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />}
                                    Criar Ficha
                                </Button>
                            </DialogFooter>
                        </form>
                    ) : (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-medium">Fichas Disponíveis</h3>
                                <Button type="button" variant="outline" size="sm" onClick={handleCreateNew}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Nova Ficha
                                </Button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Ficha padrão de dobras cutâneas */}
                                <Card
                                    className="cursor-pointer hover:bg-accent transition-colors border-2 border-dashed border-primary/30"
                                    onClick={() => {
                                        setSelectedForm({
                                            id: -1,
                                            name: "Ficha de Dobra Cutânea",
                                            description: "Medidas de dobras cutâneas com adipômetro",
                                            fields: [],
                                            isActive: true,
                                            isDefault: true,
                                            createdAt: new Date().toISOString(),
                                            updatedAt: new Date().toISOString()
                                        })
                                        setIsCreating(false)
                                    }}
                                >
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="text-base flex items-center gap-2">
                                                <Ruler className="h-4 w-4" />
                                                Ficha de Dobra Cutânea
                                            </CardTitle>
                                            <Badge variant="default">Padrão</Badge>
                                        </div>
                                        <p className="text-sm text-muted-foreground">Medidas de dobras cutâneas com adipômetro</p>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-center justify-between text-sm">
                                            <span>10 campos</span>
                                            <div className="flex gap-1">
                                                <Badge variant="outline">Ativo</Badge>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {availableForms.map(form => (
                                    <Card
                                        key={form.id}
                                        className="cursor-pointer hover:bg-accent transition-colors"
                                        onClick={() => handleUseForm(form)}
                                    >
                                        <CardHeader>
                                            <div className="flex items-center justify-between">
                                                <CardTitle className="text-base">{form.name}</CardTitle>
                                                {form.isDefault && (
                                                    <Badge variant="secondary">Padrão</Badge>
                                                )}
                                            </div>
                                            <p className="text-sm text-muted-foreground">{form.description}</p>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="flex items-center justify-between text-sm">
                                                <span>{form.fields.length} campos</span>
                                                <div className="flex gap-1">
                                                    <Badge variant="outline">{form.isActive ? 'Ativo' : 'Inativo'}</Badge>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>

                            {availableForms.length === 0 && (
                                <div className="text-center py-8 text-muted-foreground">
                                    <p>Nenhuma ficha personalizada encontrada.</p>
                                    <p className="text-sm mt-2">Crie sua primeira ficha usando o botão acima.</p>
                                </div>
                            )}

                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                    Cancelar
                                </Button>
                                {selectedForm && (
                                    <Button
                                        type="button"
                                        onClick={() => {
                                            if (selectedForm.id === -1) {
                                                // É a ficha padrão de dobras cutâneas
                                                if (patientId) {
                                                    window.location.href = `/patients/${patientId}/evaluations/skinfold`
                                                }
                                            } else {
                                                // É uma ficha personalizada
                                                if (onUseForm) {
                                                    onUseForm(selectedForm);
                                                }
                                                onOpenChange(false);
                                            }
                                        }}
                                    >
                                        Usar Ficha: {selectedForm.name}
                                    </Button>
                                )}
                            </DialogFooter>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}