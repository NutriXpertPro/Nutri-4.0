"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatCard } from "@/components/dashboard/StatCard"
import { Activity, Calendar, TrendingUp, Utensils, MessageSquareText, FileText, Plus, Pencil, Trash2, Loader2 } from "lucide-react"
import { IconWrapper } from "@/components/ui/IconWrapper"
import { useDietEditorStore } from "@/stores/diet-editor-store"
import { Button } from "@/components/ui/button"
import { useQueryClient } from '@tanstack/react-query'
import { usePatient } from '@/hooks/usePatients'
import patientService from '@/services/patient-service'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Skeleton } from "@/components/ui/skeleton"

export function PatientOverviewTab({ patientId }: { patientId: number }) {
    // 2. Fonte da Verdade: React Query (Direto da API/Cache)
    const { patient, isLoading, error } = usePatient(patientId)
    const queryClient = useQueryClient()

    const setActiveTab = useDietEditorStore(state => state.setActiveTab)
    const setAnamnesisViewMode = useDietEditorStore(state => state.setAnamnesisViewMode)

    // State for note dialog
    const [isNoteDialogOpen, setIsNoteDialogOpen] = useState(false)
    const [editingNote, setEditingNote] = useState<any | null>(null)
    const [noteTitle, setNoteTitle] = useState('')
    const [noteContent, setNoteContent] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Reset form when dialog opens/closes
    useEffect(() => {
        if (!isNoteDialogOpen) {
            setEditingNote(null)
            setNoteTitle('')
            setNoteContent('')
        }
    }, [isNoteDialogOpen])

    // Função para calcular idade
    const calculateAge = (birthDate?: string): string => {
        if (!birthDate) return '--'
        const today = new Date()
        const birth = new Date(birthDate)
        let age = today.getFullYear() - birth.getFullYear()
        const monthDiff = today.getMonth() - birth.getMonth()
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--
        }
        return String(age)
    }

    const hasWeightHistory = patient?.initial_weight && patient?.weight
    const weightDiff = (patient?.weight || 0) - (patient?.initial_weight || 0)
    const isWeightLoss = weightDiff <= 0

    // Format Date Helper
    const formatDate = (dateStr: string) => {
        try {
            if (!dateStr) return 'Data não disponível'
            const date = new Date(dateStr)
            // Check for invalid date or epoch 0 (timezone adjusted often hits 1969)
            if (isNaN(date.getTime()) || date.getFullYear() < 2000) {
                return 'Data não disponível'
            }
            return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(date)
        } catch {
            return dateStr || 'Data não disponível'
        }
    }

    const handleEditClick = (note: any) => {
        setEditingNote(note)
        setNoteTitle(note.title || '')
        setNoteContent(note.content)
        setIsNoteDialogOpen(true)
    }

    const handleSaveNote = async () => {
        if (!noteContent.trim() || !patientId) return

        setIsSubmitting(true)
        try {
            if (editingNote) {
                await patientService.updateClinicalNote(editingNote.id, noteContent, noteTitle)
                toast.success('Anotação atualizada com sucesso!')
            } else {
                await patientService.createClinicalNote(patientId, noteContent, noteTitle)
                toast.success('Anotação adicionada com sucesso!')
            }
            await queryClient.invalidateQueries({ queryKey: ['patient', patientId] })
            setIsNoteDialogOpen(false)
        } catch (error: any) {
            console.error('Error saving note:', error)
            toast.error('Erro ao salvar anotação')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDeleteNote = async (noteId: number, e: React.MouseEvent) => {
        e.stopPropagation()
        if (!confirm('Tem certeza que deseja excluir esta anotação?')) return

        try {
            await patientService.deleteClinicalNote(noteId)
            await queryClient.invalidateQueries({ queryKey: ['patient', patientId] })
            toast.success('Anotação excluída.')
        } catch (error) {
            console.error('Error deleting note:', error)
            toast.error('Erro ao excluir anotação.')
        }
    }

    if (isLoading) {
        return (
            <div className="space-y-8 pb-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Skeleton className="h-40 col-span-1 md:col-span-2 rounded-3xl" />
                    <Skeleton className="h-40 rounded-3xl" />
                    <Skeleton className="h-40 rounded-3xl" />
                </div>
                <div className="flex justify-center">
                   <Skeleton className="w-32 h-32 rounded-full" />
                </div>
                <Skeleton className="h-64 rounded-3xl" />
            </div>
        )
    }

    if (!patient) return null

    return (
        <div className="space-y-8 pb-10 pt-[10px]">
            {/* Cards de Resumo */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                {/* Weight Evolution Card */}
                <Card variant="glass" className="col-span-1 md:col-span-2 border-none bg-background/40 shadow-xl overflow-hidden group">
                    <CardHeader className="flex flex-row items-center justify-between pb-6">
                        <div className="space-y-1">
                            <p className="text-[10px] text-primary uppercase tracking-[0.2em] font-normal">Monitoramento</p>
                            <CardTitle className="text-xl tracking-tight font-normal">Evolução de Peso</CardTitle>
                        </div>
                        <IconWrapper icon={Activity} variant="blue" size="md" className="group-hover:scale-110 transition-transform" />
                    </CardHeader>
                    <CardContent className="pt-2">
                        <div className="flex items-end justify-between mb-8">
                            <div className="space-y-1">
                                <p className="text-[10px] text-white uppercase tracking-widest font-normal">Peso Inicial</p>
                                <div className="text-xl text-white tabular-nums font-normal">{patient.initial_weight ? `${patient.initial_weight} kg` : '--'}</div>
                            </div>

                            <div className="flex flex-col items-center">
                                {hasWeightHistory ? (
                                    <>
                                        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-2xl shadow-sm border animate-pulse ${isWeightLoss ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/10' : 'bg-red-500/10 text-red-500 border-red-500/10'}`}>
                                            <TrendingUp className={`h-4 w-4 ${isWeightLoss ? 'rotate-180' : ''}`} />
                                            <span className="text-sm tabular-nums font-normal">{Math.abs(weightDiff).toFixed(1)} kg</span>
                                        </div>
                                        <p className={`text-[8px] uppercase tracking-widest mt-2 font-normal ${isWeightLoss ? 'text-emerald-500' : 'text-red-500'}`}>{isWeightLoss ? 'Perda Total' : 'Ganho Total'}</p>
                                    </>
                                ) : (
                                    <div className="text-xs text-muted-foreground opacity-50">Sem histórico suficiente</div>
                                )}
                            </div>

                            <div className="text-right space-y-1">
                                <p className="text-[10px] text-primary uppercase tracking-widest font-normal">Peso Atual</p>
                                <div className="text-5xl tracking-tighter text-foreground tabular-nums font-normal">{patient.weight || '--'}<span className="text-xl ml-1 text-white font-normal">kg</span></div>
                            </div>
                        </div>

                        {/* Visual Gauge */}
                        {hasWeightHistory ? (
                            <div className="relative pt-6 pb-2">
                                <div className="h-2 w-full rounded-full bg-muted/30 overflow-hidden relative">
                                    <div className="absolute inset-0 bg-gradient-to-r from-red-500/60 via-amber-400/60 to-emerald-500/60 blur-[1px]" />
                                    <div className="absolute inset-y-0 left-0 bg-primary/20 w-full" />
                                </div>
                                <div className="flex justify-between mt-6">
                                    <div className="flex flex-col">
                                        <span className="text-[9px] text-white uppercase tracking-widest font-normal">Início</span>
                                        <span className="text-xs text-white tabular-nums font-normal">{patient.initial_weight}kg</span>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className="text-[9px] text-primary uppercase tracking-widest font-normal">Atual</span>
                                        <span className="text-xs tabular-nums font-normal">{patient.weight}kg</span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="h-10 flex items-center justify-center border-t border-border/10">
                                <p className="text-xs text-muted-foreground">Adicione uma avaliação física para gerar gráfico.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <StatCard
                    title="Idade"
                    value={patient.age ? `${patient.age} anos` : calculateAge(patient.birth_date)}
                    subtitle={patient.gender === 'M' ? 'Masculino' : patient.gender === 'F' ? 'Feminino' : 'Não especificado'}
                    icon={Calendar}
                    variant="blue"
                />

                <StatCard
                    title="IMC"
                    value={patient.weight && patient.height ? (patient.weight / (patient.height * patient.height)).toFixed(1) : '--'}
                    subtitle="Índice de Massa Corporal"
                    icon={Activity}
                    variant="green"
                />
            </div>

            {/* Foto do Paciente */}
            <div className="flex justify-center">
                <div className="relative group cursor-pointer">
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border-4 border-background shadow-2xl overflow-hidden flex items-center justify-center group-hover:border-primary/50 transition-colors">
                        {patient?.avatar ? (
                            <img
                                src={patient.avatar}
                                alt={patient.name}
                                className="w-full h-full object-cover block"
                                style={{ minWidth: '100%', minHeight: '100%' }}
                            />
                        ) : (
                            <div className="w-full h-full bg-muted/30 flex items-center justify-center">
                                <span className="text-3xl text-muted-foreground">
                                    {patient?.name?.substring(0, 2).toUpperCase() || 'P'}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>


            {/* Anotações Rápidas */}
            <Card variant="glass" className="border-none bg-background/40 shadow-xl group overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between pb-6">
                    <div className="flex items-center gap-4">
                        <IconWrapper icon={MessageSquareText} variant="amber" size="md" className="group-hover:rotate-12 transition-transform" />
                        <div className="space-y-1">
                            <p className="text-[10px] text-amber-500 uppercase tracking-widest">Clinical Notes</p>
                            <CardTitle className="text-xl tracking-tight">Anotações</CardTitle>
                        </div>
                    </div>
                    <Dialog open={isNoteDialogOpen} onOpenChange={setIsNoteDialogOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" size="sm" className="h-8 gap-2 bg-background/50 hover:bg-amber-500/10 hover:text-amber-500 hover:border-amber-500/50 transition-all border-dashed rounded-xl">
                                <Plus className="h-3.5 w-3.5" />
                                Adicionar
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[600px]">
                            <DialogHeader>
                                <DialogTitle>{editingNote ? 'Editar Anotação' : 'Nova Anotação Clínica'}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="note-title">Título (Opcional)</Label>
                                    <Input
                                        id="note-title"
                                        value={noteTitle}
                                        onChange={(e) => setNoteTitle(e.target.value)}
                                        placeholder="Ex: Consulta de retorno, Observações iniciais..."
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="note-content">Conteúdo</Label>
                                    <Textarea
                                        id="note-content"
                                        value={noteContent}
                                        onChange={(e) => setNoteContent(e.target.value)}
                                        placeholder="Digite a anotação clínica detalhada aqui..."
                                        rows={10}
                                        className="resize-none"
                                    />
                                </div>
                                <Button
                                    onClick={handleSaveNote}
                                    disabled={isSubmitting || !noteContent.trim()}
                                    className="w-full"
                                >
                                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                    {isSubmitting ? 'Salvando...' : (editingNote ? 'Atualizar' : 'Salvar Anotação')}
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </CardHeader>
                <CardContent className="px-6 pb-8">
                    {patient?.notes && patient.notes.length > 0 ? (
                        <div className="flex flex-col gap-4">
                            {patient.notes.map((note: any, idx: number) => (
                                <div 
                                    key={idx} 
                                    className="group/note relative bg-muted/20 hover:bg-muted/40 p-5 rounded-3xl border border-border/5 transition-all hover:translate-x-1 cursor-pointer"
                                    onClick={() => handleEditClick(note)}
                                >
                                    <div className="absolute left-0 top-6 bottom-6 w-1 bg-primary rounded-full shadow-[0_0_10px_rgba(var(--primary),0.5)]" />
                                    
                                    <div className="flex justify-between items-start mb-2">
                                        {note.title ? (
                                            <h4 className="font-semibold text-base text-foreground/90">{note.title}</h4>
                                        ) : (
                                            <span className="text-xs text-muted-foreground italic">Sem título</span>
                                        )}
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            className="h-6 w-6 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 -mt-1 -mr-1 opacity-0 group-hover/note:opacity-100 transition-opacity"
                                            onClick={(e) => handleDeleteNote(note.id, e)}
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </Button>
                                    </div>
                                    
                                    <p className="text-sm text-foreground leading-relaxed font-normal whitespace-pre-wrap">{note.content}</p>
                                    
                                    <div className="flex items-center gap-2 mt-4 text-[10px] text-muted-foreground/40 uppercase tracking-widest">
                                        <Calendar className="h-3 w-3" />
                                        {formatDate(note.created_at)}
                                        {note.updated_at && note.updated_at !== note.created_at && (
                                            <span className="ml-2 italic">(Editado)</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-8 text-center bg-muted/5 rounded-3xl border border-border/5 border-dashed">
                            <MessageSquareText className="h-8 w-8 text-muted-foreground/20 mb-3" />
                            <p className="text-sm text-muted-foreground">Nenhuma anotação registrada.</p>
                            <p className="text-xs text-muted-foreground/50 mt-1">Use o botão acima para adicionar uma nota.</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Anamnese e Exames */}
            <Card variant="glass" className="border-none bg-background/40 shadow-xl group overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between pb-6">
                    <div className="flex items-center gap-4">
                        <IconWrapper icon={FileText} variant="emerald" size="md" className="group-hover:scale-110 transition-transform" />
                        <div className="space-y-1">
                            <p className="text-[10px] text-emerald-500 uppercase tracking-widest">Anamnese & Exames</p>
                            <CardTitle className="text-xl tracking-tight">Informações Clínicas</CardTitle>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="px-6 pb-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Anamnese Card */}
                        <div className={`p-5 rounded-3xl border transition-all hover:bg-muted/20 ${patient?.anamnesis ? 'bg-muted/10 border-border/5' : 'bg-transparent border-border/10 border-dashed'}`}>
                            <div className="flex items-center justify-between mb-2">
                                <h4 className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">Anamnese</h4>
                                {!patient?.anamnesis && (
                                    <Button variant="ghost" size="sm" onClick={() => setActiveTab('anamnesis')} className="h-6 text-[9px] uppercase tracking-wider hover:bg-emerald-500/10 hover:text-emerald-500">
                                        Preencher
                                    </Button>
                                )}
                            </div>

                            {patient?.anamnesis ? (
                                <div>
                                    <p className="text-sm font-medium text-foreground mb-1">{patient.anamnesis.template_title || 'Anamnese Padrão'}</p>
                                    <p className="text-xs text-muted-foreground">Preenchida em {formatDate(patient.anamnesis.filled_date)}</p>
                                    <Button
                                        variant="link"
                                        onClick={() => {
                                            useDietEditorStore.getState().setAnamnesisViewMode('view-responses')
                                            setActiveTab('anamnesis')
                                        }}
                                        className="text-emerald-500 p-0 h-auto text-xs mt-3"
                                    >
                                        Ver respostas
                                    </Button>
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground/60 py-2">
                                    Nenhuma anamnese registrada para este paciente.
                                </p>
                            )}
                        </div>

                        {/* Exames Card */}
                        <div className={`p-5 rounded-3xl border transition-all hover:bg-muted/20 ${patient?.exams && patient.exams.length > 0 ? 'bg-muted/10 border-border/5' : 'bg-transparent border-border/10 border-dashed'}`}>
                            <div className="flex items-center justify-between mb-2">
                                <h4 className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">Exames Recentes</h4>
                                <Button variant="ghost" size="sm" className="h-6 text-[9px] uppercase tracking-wider hover:bg-emerald-500/10 hover:text-emerald-500">
                                    Upload
                                </Button>
                            </div>

                            {patient?.exams && patient.exams.length > 0 ? (
                                <div className="space-y-3">
                                    {patient.exams.slice(0, 3).map((exam: any, idx: number) => (
                                        <div key={idx} className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                                                <span className="text-xs text-foreground truncate max-w-[150px]">{exam.file_name || 'Exame sem nome'}</span>
                                            </div>
                                            <span className="text-[10px] text-muted-foreground/50">{formatDate(exam.uploaded_at)}</span>
                                        </div>
                                    ))}
                                    {patient.exams.length > 3 && (
                                        <p className="text-[10px] text-center text-muted-foreground mt-2">e mais {patient.exams.length - 3} exames.</p>
                                    )}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground/60 py-2">
                                    Nenhum exame registrado recentemente.
                                </p>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}