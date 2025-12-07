"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Trash2, Save, ArrowLeft, GripVertical } from "lucide-react"
import { Question } from "@/services/anamnesis-service"

interface TemplateBuilderProps {
    onSave: (templateData: any) => void
    onCancel: () => void
    isLoading?: boolean
}

export function TemplateBuilder({ onSave, onCancel, isLoading }: TemplateBuilderProps) {
    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [questions, setQuestions] = useState<Question[]>([])

    const addQuestion = () => {
        const newQuestion: Question = {
            id: crypto.randomUUID(),
            type: 'text',
            label: "",
            required: false,
            options: []
        }
        setQuestions([...questions, newQuestion])
    }

    const removeQuestion = (index: number) => {
        const newQuestions = [...questions]
        newQuestions.splice(index, 1)
        setQuestions(newQuestions)
    }

    const updateQuestion = (index: number, field: keyof Question, value: any) => {
        const newQuestions = [...questions]
        newQuestions[index] = { ...newQuestions[index], [field]: value }
        setQuestions(newQuestions)
    }

    const handleSave = () => {
        if (!title.trim()) return
        onSave({ title, description, questions })
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={onCancel}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h3 className="text-lg font-medium">Novo Modelo de Anamnese</h3>
                        <p className="text-sm text-muted-foreground">Defina as perguntas do seu questionário personalizado.</p>
                    </div>
                </div>
                <Button onClick={handleSave} disabled={isLoading || !title} className="gap-2">
                    <Save className="h-4 w-4" />
                    Salvar Modelo
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Configurações Gerais */}
                <Card className="md:col-span-1 h-fit">
                    <CardHeader>
                        <CardTitle className="text-base">Informações Básicas</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">Título do Modelo</Label>
                            <Input
                                id="title"
                                placeholder="Ex: Acompanhamento Mensal"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="desc">Descrição</Label>
                            <Textarea
                                id="desc"
                                placeholder="Breve descrição do propósito..."
                                value={description}
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Lista de Perguntas */}
                <div className="md:col-span-2 space-y-4">
                    {questions.map((q, index) => (
                        <Card key={q.id} className="relative group border-muted hover:border-primary/50 transition-colors">
                            <CardContent className="p-4 space-y-4">
                                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => removeQuestion(index)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>

                                <div className="flex items-start gap-3">
                                    <div className="mt-3 text-muted-foreground cursor-move">
                                        <GripVertical className="h-5 w-5" />
                                    </div>
                                    <div className="flex-1 space-y-4">
                                        <div className="grid grid-cols-3 gap-4">
                                            <div className="col-span-2 space-y-2">
                                                <Label>Pergunta</Label>
                                                <Input
                                                    value={q.label}
                                                    onChange={(e) => updateQuestion(index, 'label', e.target.value)}
                                                    placeholder="Ex: Como está seu sono?"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Tipo</Label>
                                                <Select
                                                    value={q.type}
                                                    onValueChange={(val) => updateQuestion(index, 'type', val)}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="text">Texto Curto</SelectItem>
                                                        <SelectItem value="long_text">Texto Longo</SelectItem>
                                                        <SelectItem value="number">Número</SelectItem>
                                                        {/* Future: Select/Multiselect support */}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}

                    <Button variant="outline" className="w-full border-dashed py-8 text-muted-foreground hover:text-primary hover:border-primary/50" onClick={addQuestion}>
                        <Plus className="mr-2 h-4 w-4" />
                        Adicionar Pergunta
                    </Button>
                </div>
            </div>
        </div>
    )
}
