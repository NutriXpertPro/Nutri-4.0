"use client"

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
import { Loader2, Upload, X } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { evaluationService } from "@/services/evaluation-service"
import { useQueryClient, useMutation } from "@tanstack/react-query"

const formSchema = z.object({
    date: z.string(),
    weight: z.string().min(1, "Peso é obrigatório"),
    height: z.string().min(1, "Altura é obrigatória"),
    body_fat: z.string().optional(),
    muscle_mass: z.string().optional(),
    method: z.string().optional(),
})

interface NewEvaluationDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    patientId: number
}

export function NewEvaluationDialog({ open, onOpenChange, patientId }: NewEvaluationDialogProps) {
    const queryClient = useQueryClient()
    const [photos, setPhotos] = React.useState<{ front: File | null, side: File | null, back: File | null }>({
        front: null,
        side: null,
        back: null
    })

    // Default today's date
    const today = new Date().toISOString().split('T')[0]

    const [formData, setFormData] = React.useState({
        date: today,
        weight: "",
        height: "",
        body_fat: "",
        muscle_mass: "",
        method: "ADIPOMETRO"
    })
    const [isLoading, setIsLoading] = React.useState(false)

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'front' | 'side' | 'back') => {
        if (e.target.files && e.target.files[0]) {
            setPhotos(prev => ({ ...prev, [type]: e.target.files![0] }))
        }
    }

    const removePhoto = (type: 'front' | 'side' | 'back') => {
        setPhotos(prev => ({ ...prev, [type]: null }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            // 1. Create Evaluation
            const evaluation = await evaluationService.create({
                patient: patientId,
                date: formData.date,
                weight: parseFloat(formData.weight),
                height: parseFloat(formData.height),
                body_fat: formData.body_fat ? parseFloat(formData.body_fat) : undefined,
                muscle_mass: formData.muscle_mass ? parseFloat(formData.muscle_mass) : undefined,
                method: formData.method
            })

            // 2. Upload Photos
            const uploadPromises = []
            if (photos.front) uploadPromises.push(evaluationService.uploadPhoto(evaluation.id, photos.front, 'FRENTE'))
            if (photos.side) uploadPromises.push(evaluationService.uploadPhoto(evaluation.id, photos.side, 'LADO'))
            if (photos.back) uploadPromises.push(evaluationService.uploadPhoto(evaluation.id, photos.back, 'COSTAS'))

            if (uploadPromises.length > 0) {
                await Promise.all(uploadPromises)
            }

            toast({
                title: "Avaliação criada",
                description: "Dados e fotos salvos com sucesso.",
            })

            queryClient.invalidateQueries({ queryKey: ['patient', patientId] }) // Refresh patient data if needed
            // Also invalidate evaluation list if we had one

            onOpenChange(false)
            // Reset form
            setFormData({
                date: today,
                weight: "",
                height: "",
                body_fat: "",
                muscle_mass: "",
                method: "ADIPOMETRO"
            })
            setPhotos({ front: null, side: null, back: null })

        } catch (error) {
            console.error("Erro ao criar avaliação:", error)
            toast({
                title: "Erro",
                description: "Falha ao salvar a avaliação.",
                variant: "destructive"
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Nova Avaliação Física</DialogTitle>
                    <DialogDescription>
                        Registre as medidas e fotos do paciente.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 py-4">
                    {/* Metrics Section */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="date">Data da Avaliação</Label>
                            <Input
                                id="date"
                                type="date"
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="method">Método</Label>
                            <Select
                                value={formData.method}
                                onValueChange={(v) => setFormData({ ...formData, method: v })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ADIPOMETRO">Adipômetro</SelectItem>
                                    <SelectItem value="BIOIMPEDANCIA">Bioimpedância</SelectItem>
                                    <SelectItem value="FITA_METRICA">Fita Métrica</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="weight">Peso (kg) *</Label>
                            <Input
                                id="weight"
                                type="number"
                                step="0.1"
                                value={formData.weight}
                                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="height">Altura (m) *</Label>
                            <Input
                                id="height"
                                type="number"
                                step="0.01"
                                value={formData.height}
                                onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="body_fat">% Gordura</Label>
                            <Input
                                id="body_fat"
                                type="number"
                                step="0.1"
                                value={formData.body_fat}
                                onChange={(e) => setFormData({ ...formData, body_fat: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="muscle_mass">Massa Muscular (kg)</Label>
                            <Input
                                id="muscle_mass"
                                type="number"
                                step="0.1"
                                value={formData.muscle_mass}
                                onChange={(e) => setFormData({ ...formData, muscle_mass: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Photos Section */}
                    <div className="space-y-4">
                        <Label className="text-base">Fotos da Evolução</Label>
                        <div className="grid grid-cols-3 gap-4">
                            {/* Front Photo */}
                            <div className="space-y-2">
                                <Label className="text-xs text-muted-foreground">Frente</Label>
                                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 flex flex-col items-center justify-center gap-2 hover:bg-muted/10 transition-colors relative h-32">
                                    {photos.front ? (
                                        <>
                                            <span className="text-xs truncate max-w-full px-2">{photos.front.name}</span>
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="icon"
                                                className="h-6 w-6 absolute -top-2 -right-2 rounded-full"
                                                onClick={() => removePhoto('front')}
                                            >
                                                <X className="h-3 w-3" />
                                            </Button>
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="h-6 w-6 text-muted-foreground" />
                                            <Input
                                                type="file"
                                                accept="image/*"
                                                className="absolute inset-0 opacity-0 cursor-pointer"
                                                onChange={(e) => handlePhotoChange(e, 'front')}
                                            />
                                            <span className="text-xs text-muted-foreground">Upload</span>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Side Photo */}
                            <div className="space-y-2">
                                <Label className="text-xs text-muted-foreground">Lado</Label>
                                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 flex flex-col items-center justify-center gap-2 hover:bg-muted/10 transition-colors relative h-32">
                                    {photos.side ? (
                                        <>
                                            <span className="text-xs truncate max-w-full px-2">{photos.side.name}</span>
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="icon"
                                                className="h-6 w-6 absolute -top-2 -right-2 rounded-full"
                                                onClick={() => removePhoto('side')}
                                            >
                                                <X className="h-3 w-3" />
                                            </Button>
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="h-6 w-6 text-muted-foreground" />
                                            <Input
                                                type="file"
                                                accept="image/*"
                                                className="absolute inset-0 opacity-0 cursor-pointer"
                                                onChange={(e) => handlePhotoChange(e, 'side')}
                                            />
                                            <span className="text-xs text-muted-foreground">Upload</span>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Back Photo */}
                            <div className="space-y-2">
                                <Label className="text-xs text-muted-foreground">Costas</Label>
                                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 flex flex-col items-center justify-center gap-2 hover:bg-muted/10 transition-colors relative h-32">
                                    {photos.back ? (
                                        <>
                                            <span className="text-xs truncate max-w-full px-2">{photos.back.name}</span>
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="icon"
                                                className="h-6 w-6 absolute -top-2 -right-2 rounded-full"
                                                onClick={() => removePhoto('back')}
                                            >
                                                <X className="h-3 w-3" />
                                            </Button>
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="h-6 w-6 text-muted-foreground" />
                                            <Input
                                                type="file"
                                                accept="image/*"
                                                className="absolute inset-0 opacity-0 cursor-pointer"
                                                onChange={(e) => handlePhotoChange(e, 'back')}
                                            />
                                            <span className="text-xs text-muted-foreground">Upload</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
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
