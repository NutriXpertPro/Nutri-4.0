"use client"

import { FileText, Download, Eye, Calendar, Microscope, Upload, X, Check, Loader2, AlertCircle } from "lucide-react"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useExams } from "@/hooks/useExams"

import { ChevronRight } from "lucide-react"

export function ExamsTab({ onBack }: { onBack?: () => void }) {
    // API Hook
    const { exams: apiExams, loading, error: apiError, refetch } = useExams()

    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [newExam, setNewExam] = useState({ title: "", type: "", date: "" })
    const [isUploading, setIsUploading] = useState(false)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [error, setError] = useState<string | null>(null)

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            // Security: Validate file type
            const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
            if (!validTypes.includes(file.type) && !file.type.startsWith('image/')) {
                setError("Apenas arquivos PDF ou Imagens são permitidos por segurança.")
                setSelectedFile(null)
                return
            }
            if (file.size > 5 * 1024 * 1024) { // 5MB limit example
                setError("O arquivo deve ter no máximo 5MB.")
                setSelectedFile(null)
                return
            }
            setError(null)
            setSelectedFile(file)
            // Auto-fill title if empty
            if (!newExam.title) {
                setNewExam(prev => ({ ...prev, title: file.name.split('.')[0] }))
            }
        }
    }

    const handleUpload = async () => {
        if (!selectedFile) {
            setError("Por favor, selecione um arquivo válido.")
            return
        }

        setIsUploading(true)
        // TODO: Implement actual file upload to API
        // For now, simulate upload delay
        setTimeout(() => {
            setIsUploading(false)
            setIsDialogOpen(false)
            setNewExam({ title: "", type: "", date: "" })
            setSelectedFile(null)
            refetch() // Refresh exams list
        }, 1500)
    }

    return (
        <div className="space-y-6 pb-20">
            <div className="bg-gradient-to-br from-card to-muted border-primary/50 shadow-lg shadow-primary/10 rounded-3xl p-6 text-center">
                <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-4 opacity-80">
                    <Microscope className="w-8 h-8" />
                </div>
                <h2 className="text-xl font-bold mb-2 text-foreground">Seus Exames</h2>
                <p className="text-muted-foreground text-sm mb-6">Mantenha seus resultados organizados e compartilhe com seu nutricionista.</p>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="w-full h-12 rounded-xl text-base font-medium shadow-md shadow-primary/20 bg-primary text-primary-foreground hover:bg-primary/90">
                            <Upload className="w-4 h-4 mr-2" />
                            Adicionar Novo Exame
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md bg-card border-border/20">
                        <DialogHeader>
                            <DialogTitle>Novo Exame</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Nome do Exame</Label>
                                <Input
                                    id="name"
                                    placeholder="Ex: Hemograma"
                                    className="bg-muted/30 border-border/20"
                                    value={newExam.title}
                                    onChange={(e) => setNewExam({ ...newExam, title: e.target.value })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="type">Tipo</Label>
                                <Select onValueChange={(val) => setNewExam({ ...newExam, type: val })}>
                                    <SelectTrigger className="bg-muted/30 border-border/20">
                                        <SelectValue placeholder="Selecione o tipo" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Laboratorial">Laboratorial</SelectItem>
                                        <SelectItem value="Imagem">Imagem</SelectItem>
                                        <SelectItem value="Corporal">Corporal</SelectItem>
                                        <SelectItem value="Outro">Outro</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="file" className="sr-only">Arquivo do Exame</Label>
                                <div className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors cursor-pointer relative ${error ? 'border-red-400 bg-red-400/5' : 'border-border/30 bg-muted/10 hover:bg-muted/20'}`}>
                                    <input
                                        type="file"
                                        id="file"
                                        accept=".pdf,image/*"
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        onChange={handleFileSelect}
                                    />
                                    <div className="pointer-events-none">
                                        <Upload className={`w-8 h-8 mx-auto mb-2 ${selectedFile ? 'text-primary' : 'text-muted-foreground'}`} />
                                        {selectedFile ? (
                                            <p className="text-sm font-medium text-foreground truncate px-4">{selectedFile.name}</p>
                                        ) : (
                                            <p className="text-sm text-muted-foreground">Clique para selecionar PDF ou Imagem</p>
                                        )}
                                        {error && <p className="text-xs text-red-400 mt-2 font-medium">{error}</p>}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="border-border/20">
                                Cancelar
                            </Button>
                            <Button onClick={handleUpload} disabled={isUploading || !selectedFile} className="bg-primary text-primary-foreground hover:bg-primary/90">
                                {isUploading ? "Enviando..." : "Salvar Exame"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div>
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4 px-1">Recentes</h3>
                <div className="space-y-3">
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="w-6 h-6 animate-spin text-primary" />
                        </div>
                    ) : apiExams.length === 0 ? (
                        <div className="text-center py-8">
                            <FileText className="w-10 h-10 mx-auto text-muted-foreground/30 mb-2" />
                            <p className="text-sm text-muted-foreground">Nenhum exame encontrado</p>
                        </div>
                    ) : (
                        apiExams.map((exam: any) => (
                            <div key={exam.id} className="flex gap-4 p-4 bg-card border border-border/5 rounded-2xl hover:bg-card/80 transition-all shadow-sm group">
                                <div className="flex flex-col items-center justify-center bg-muted/30 rounded-xl w-12 h-12 min-w-[3rem] text-primary">
                                    <FileText className="w-6 h-6" />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <h4 className="font-semibold text-foreground truncate">{exam.file_name || exam.title}</h4>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                        <Calendar className="w-3 h-3" /> {exam.uploaded_at || exam.date}
                                        <span className="w-1 h-1 bg-border rounded-full" />
                                        {exam.file_type || 'Exame'}
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => exam.file_url && window.open(exam.file_url, '_blank')}
                                        className="p-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors"
                                    >
                                        <Eye className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {onBack && (
                <button
                    onClick={onBack}
                    className="w-full mt-4 p-4 text-muted-foreground hover:text-foreground hover:bg-muted/10 rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                    <ChevronRight className="w-4 h-4 rotate-180" /> Voltar
                </button>
            )}
        </div>
    )
}
