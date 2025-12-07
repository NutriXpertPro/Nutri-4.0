"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, FileText, ArrowRight, Star } from "lucide-react"
import { AnamnesisTemplate } from "@/services/anamnesis-service"

interface TemplateListProps {
    templates: AnamnesisTemplate[]
    onSelectTemplate: (template: AnamnesisTemplate | 'STANDARD') => void
    onCreateTemplate: () => void
}

export function TemplateList({ templates, onSelectTemplate, onCreateTemplate }: TemplateListProps) {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-medium">Modelos de Anamnese</h3>
                    <p className="text-sm text-muted-foreground">Selecione um questionário para aplicar ou crie um novo.</p>
                </div>
                <Button onClick={onCreateTemplate} className="gap-2 shadow-lg hover:shadow-primary/20 transition-all">
                    <Plus className="h-4 w-4" />
                    Novo Modelo
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {/* Standard Template Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <Card
                        className="group cursor-pointer hover:border-primary/50 transition-all hover:shadow-xl hover:-translate-y-1 relative overflow-hidden h-full"
                        onClick={() => onSelectTemplate('STANDARD')}
                    >
                        <div className="absolute top-0 right-0 p-16 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                    <Star className="h-5 w-5" />
                                </div>
                                <span>Anamnese Padrão</span>
                            </CardTitle>
                            <CardDescription>
                                Questionário completo e detalhado (Recomendado)
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ul className="text-sm text-muted-foreground list-disc pl-4 space-y-1">
                                <li>Dados Clínicos</li>
                                <li>Rotina Alimentar</li>
                                <li>Histórico de Saúde</li>
                                <li>Metas e Objetivos</li>
                            </ul>
                            <div className="mt-4 flex justify-end">
                                <Button variant="ghost" size="sm" className="group-hover:text-primary gap-1">
                                    Selecionar <ArrowRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Custom Templates */}
                {templates.map((template, index) => (
                    <motion.div
                        key={template.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 + 0.1 }}
                    >
                        <Card
                            className="group cursor-pointer hover:border-primary/50 transition-all hover:shadow-xl hover:-translate-y-1 relative overflow-hidden h-full"
                            onClick={() => onSelectTemplate(template)}
                        >
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                        <FileText className="h-5 w-5" />
                                    </div>
                                    <span className="truncate">{template.title}</span>
                                </CardTitle>
                                <CardDescription className="line-clamp-2 min-h-[40px]">
                                    {template.description || "Sem descrição"}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="text-sm text-muted-foreground mb-4">
                                    {template.questions.length} questões personalizadas
                                </div>
                                <div className="mt-auto flex justify-end">
                                    <Button variant="ghost" size="sm" className="group-hover:text-primary gap-1">
                                        Selecionar <ArrowRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>
        </div>
    )
}
