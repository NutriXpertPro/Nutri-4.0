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
import { Plus, Trash2, GripVertical, X, Eye, Edit3, Check, XCircle, Loader2 } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { evaluationFormService, EvaluationForm, EvaluationFormField } from "@/services/evaluation-form-service"
import { evaluationService, CreateEvaluationDTO } from "@/services/evaluation-service"
import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query"

interface FillEvaluationFormDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    form: EvaluationForm
    patientId: number
    evaluationId?: number
}

export function FillEvaluationFormDialog({ open, onOpenChange, form, patientId, evaluationId }: FillEvaluationFormDialogProps) {
    const [formData, setFormData] = React.useState<Record<string, any>>({})
    const [isLoading, setIsLoading] = React.useState(false)
    const queryClient = useQueryClient()

    // Inicializar os dados do formulário
    React.useEffect(() => {
        if (open && form) {
            const initialData: Record<string, any> = {}
            form.fields.forEach(field => {
                initialData[field.name] = field.type === 'checkbox' ? false : field.type === 'select' ? field.options?.[0] || '' : ''
            })
            setFormData(initialData)
        }
    }, [open, form])

    const handleFieldChange = (fieldName: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            [fieldName]: value
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            // Preparar os dados para envio
            const evaluationData: CreateEvaluationDTO = {
                patient: patientId,
                date: new Date().toISOString().split('T')[0],
                method: 'ADIPOMETRO', // Usando o método de adipômetro para esta ficha
                body_measurements: formData // Armazenando os dados personalizados em body_measurements
            }

            // Adicionar campos específicos se existirem
            form.fields.forEach(field => {
                if (field.name === 'weight' && formData[field.name]) {
                    evaluationData.weight = parseFloat(formData[field.name])
                } else if (field.name === 'height' && formData[field.name]) {
                    evaluationData.height = parseFloat(formData[field.name])
                } else if (field.name === 'body_fat' && formData[field.name]) {
                    evaluationData.body_fat = parseFloat(formData[field.name])
                } else if (field.name === 'muscle_mass' && formData[field.name]) {
                    evaluationData.muscle_mass = parseFloat(formData[field.name])
                }
            })

            await evaluationService.create(evaluationData)
            
            toast({
                title: "Avaliação registrada",
                description: "Dados da ficha registrados com sucesso.",
            })

            // Atualizar as consultas
            queryClient.invalidateQueries({ queryKey: ['evaluations'] })
            queryClient.invalidateQueries({ queryKey: ['patient', patientId] })
            
            onOpenChange(false)
            
        } catch (error) {
            console.error("Erro ao registrar avaliação:", error)
            toast({
                title: "Erro",
                description: "Falha ao registrar a avaliação.",
                variant: "destructive"
            })
        } finally {
            setIsLoading(false)
        }
    }

    if (!form) return null

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{form.name}</DialogTitle>
                    <DialogDescription>
                        {form.description || "Preencha os campos da ficha."}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 py-4 max-h-[60vh] overflow-y-auto">
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium">Campos da Ficha</h3>
                        
                        {form.fields.map((field, index) => (
                            <div key={field.id} className="space-y-2">
                                <Label htmlFor={`field-${field.name}`}>
                                    {field.label} {field.required && <span className="text-destructive">*</span>}
                                </Label>
                                
                                {field.type === 'number' && (
                                    <Input
                                        id={`field-${field.name}`}
                                        type="number"
                                        step="0.1"
                                        value={formData[field.name] || ''}
                                        onChange={(e) => handleFieldChange(field.name, e.target.value)}
                                        required={field.required}
                                        placeholder={`Ex: 10.5${field.unit ? ` ${field.unit}` : ''}`}
                                    />
                                )}
                                
                                {field.type === 'text' && (
                                    <Input
                                        id={`field-${field.name}`}
                                        value={formData[field.name] || ''}
                                        onChange={(e) => handleFieldChange(field.name, e.target.value)}
                                        required={field.required}
                                        placeholder={`Ex: ${field.unit || 'valor'}`}
                                    />
                                )}
                                
                                {field.type === 'date' && (
                                    <Input
                                        id={`field-${field.name}`}
                                        type="date"
                                        value={formData[field.name] || ''}
                                        onChange={(e) => handleFieldChange(field.name, e.target.value)}
                                        required={field.required}
                                    />
                                )}
                                
                                {field.type === 'select' && (
                                    <Select
                                        value={formData[field.name] || (field.options?.[0] || '')}
                                        onValueChange={(value) => handleFieldChange(field.name, value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione uma opção" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {field.options?.map((option, idx) => (
                                                <SelectItem key={idx} value={option}>
                                                    {option}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                                
                                {field.type === 'checkbox' && (
                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            id={`field-${field.name}`}
                                            checked={formData[field.name] || false}
                                            onChange={(e) => handleFieldChange(field.name, e.target.checked)}
                                            className="h-4 w-4"
                                        />
                                        <Label htmlFor={`field-${field.name}`}>Marcar como verdadeiro</Label>
                                    </div>
                                )}
                                
                                {field.unit && (
                                    <p className="text-xs text-muted-foreground">{field.unit}</p>
                                )}
                            </div>
                        ))}
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Salvar Avaliação
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}