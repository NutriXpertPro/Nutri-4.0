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

import { IconWrapper } from "@/components/ui/IconWrapper"

export function TemplateList({ templates, onSelectTemplate, onCreateTemplate }: TemplateListProps) {
    return (
        <div className="space-y-8 pb-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-1">
                <div>
                    <p className="text-[10px] font-normal text-primary uppercase tracking-[0.2em] mb-1">Aplicação de Questionário</p>
                    <h3 className="text-2xl font-normal tracking-tight text-foreground">Modelos de Anamnese</h3>
                </div>
                <Button onClick={onCreateTemplate} className="h-12 px-8 rounded-2xl text-[11px] font-normal uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 transition-all gap-3">
                    <Plus className="h-4 w-4" />
                    Novo Modelo
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* Standard Template Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <Card
                        variant="glass"
                        className="group cursor-pointer border-none bg-primary/[0.03] ring-1 ring-primary/20 hover:ring-primary/40 transition-all hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-2 relative overflow-hidden h-full flex flex-col pt-4 shadow-xl"
                        onClick={() => onSelectTemplate('STANDARD')}
                    >
                        <div className="absolute top-0 right-0 p-16 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-50" />
                        <CardHeader className="pb-4">
                            <div className="flex items-center gap-4">
                                <IconWrapper icon={Star} variant="blue" size="md" className="shadow-lg" />
                                <div className="space-y-0.5">
                                    <p className="text-[9px] font-normal text-primary uppercase tracking-widest">Recomendado</p>
                                    <CardTitle className="text-lg font-normal tracking-tight">Anamnese Padrão</CardTitle>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-1 flex flex-col">
                            <CardDescription className="text-sm font-normal text-muted-foreground/80 mb-6 leading-relaxed">
                                Questionário completo cobrindo todos os pilares da saúde nutricional.
                            </CardDescription>

                            <div className="space-y-2 mb-8 flex-1">
                                {['Dados Clínicos', 'Rotina Alimentar', 'Histórico de Saúde', 'Metas e Objetivos'].map((item) => (
                                    <div key={item} className="flex items-center gap-2 text-xs font-normal text-foreground">
                                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                        {item}
                                    </div>
                                ))}
                            </div>

                            <div className="pt-4 border-t border-primary/10 flex justify-between items-center">
                                <span className="text-[10px] font-normal uppercase tracking-widest text-primary/40">Default Template</span>
                                <Button
                                    variant="default"
                                    size="sm"
                                    className="h-9 rounded-[1rem] font-bold text-[9px] uppercase tracking-[0.15em]
                                             bg-primary text-primary-foreground shadow-lg shadow-primary/20
                                             hover:bg-primary/90 hover:scale-105 transition-all gap-2"
                                >
                                    Selecionar <ArrowRight className="h-3.5 w-3.5" />
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
                            variant="glass"
                            className="group cursor-pointer border-none bg-background/40 hover:bg-background/60 transition-all hover:shadow-2xl hover:-translate-y-2 relative overflow-hidden h-full flex flex-col pt-4 shadow-xl"
                            onClick={() => onSelectTemplate(template)}
                        >
                            <CardHeader className="pb-4">
                                <div className="flex items-center gap-4">
                                    <IconWrapper icon={FileText} variant="ghost" size="md" className="bg-muted/30 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary shadow-sm" />
                                    <div className="space-y-0.5 min-w-0">
                                        <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest opacity-40">Personalizado</p>
                                        <CardTitle className="text-lg font-black tracking-tight truncate">{template.title}</CardTitle>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="flex-1 flex flex-col">
                                <CardDescription className="text-sm font-bold text-muted-foreground/80 mb-6 line-clamp-2 leading-relaxed">
                                    {template.description || "Sem descrição disponível para este modelo."}
                                </CardDescription>

                                <div className="mt-auto pt-4 border-t border-border/10 flex justify-between items-center">
                                    <span className="text-[10px] font-normal uppercase tracking-widest text-muted-foreground/30">
                                        {template.questions.length} questões
                                    </span>
                                    <Button
                                        variant="default"
                                        size="sm"
                                        className="h-9 rounded-[1rem] font-bold text-[9px] uppercase tracking-[0.15em]
                                                 bg-primary text-primary-foreground shadow-lg shadow-primary/20
                                                 hover:bg-primary/90 hover:scale-105 transition-all gap-2"
                                    >
                                        Selecionar <ArrowRight className="h-3.5 w-3.5" />
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
