"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Upload, Download, FileText, AlertCircle, CheckCircle2 } from "lucide-react"
import { Question } from "@/services/anamnesis-service"

interface CsvTemplateImporterProps {
    onImport: (templateData: { title: string, description: string, questions: Question[] }) => void
}

export function CsvTemplateImporter({ onImport }: CsvTemplateImporterProps) {
    const [csvContent, setCsvContent] = useState<string>("")
    const [fileName, setFileName] = useState<string>("")
    const [isParsing, setIsParsing] = useState<boolean>(false)
    const [parseErrors, setParseErrors] = useState<string[]>([])
    const [preview, setPreview] = useState<{ title: string, description: string, questions: Question[] } | null>(null)

    const validateCsvHeaders = (headers: string[]): boolean => {
        const requiredHeaders = ['tipo', 'pergunta', 'obrigatoria']
        return requiredHeaders.every(header => headers.some(h => h.toLowerCase().trim() === header))
    }

    const parseCsv = (csv: string): { title: string, description: string, questions: Question[] } | null => {
        const lines = csv.split('\n').filter(line => line.trim() !== '')
        
        if (lines.length < 2) {
            setParseErrors(['CSV deve conter pelo menos um cabeçalho e uma linha de dados'])
            return null
        }

        const headers = lines[0].split(',').map(header => header.trim().toLowerCase())
        
        if (!validateCsvHeaders(headers)) {
            setParseErrors([
                'Cabeçalhos inválidos. Use: "tipo", "pergunta", "obrigatoria" (e opcionalmente "descricao")',
                'Exemplo: tipo,pergunta,obrigatoria,descricao'
            ])
            return null
        }

        const errors: string[] = []
        const questions: Question[] = []

        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim()
            if (!line) continue
            
            // Handle potential quoted values with commas inside
            const row = parseRow(line)
            
            if (row.length < 3) {
                errors.push(`Linha ${i + 1}: formato inválido - precisa ter pelo menos tipo, pergunta e obrigatoria`)
                continue
            }

            const [type, label, requiredStr, description = ""] = row
            
            const validTypes = ['text', 'long_text', 'number', 'select', 'multiselect']
            if (!validTypes.includes(type.toLowerCase())) {
                errors.push(`Linha ${i + 1}: tipo inválido "${type}". Use: ${validTypes.join(', ')}`)
                continue
            }

            const required = requiredStr.toLowerCase().trim() === 'true' || requiredStr.toLowerCase().trim() === '1' || requiredStr.toLowerCase().trim() === 'sim'

            const question: Question = {
                id: crypto.randomUUID(),
                type: type.toLowerCase() as any,
                label: label.trim(),
                required: required,
                options: type.toLowerCase() === 'select' || type.toLowerCase() === 'multiselect' ? [] : undefined
            }

            questions.push(question)
        }

        if (errors.length > 0) {
            setParseErrors(errors)
            return null
        }

        setParseErrors([])
        return {
            title: fileName.replace('.csv', '').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            description: `Template importado de ${fileName}`,
            questions
        }
    }

    // Helper function to properly parse CSV rows that may contain quoted values with commas
    const parseRow = (row: string): string[] => {
        const result: string[] = []
        let current = ''
        let inQuotes = false
        
        for (let i = 0; i < row.length; i++) {
            const char = row[i]
            
            if (char === '"') {
                inQuotes = !inQuotes
            } else if (char === ',' && !inQuotes) {
                result.push(current.trim())
                current = ''
            } else {
                current += char
            }
        }
        
        result.push(current.trim())
        return result
    }

    const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        setFileName(file.name)
        setParseErrors([])
        setPreview(null)

        const reader = new FileReader()
        reader.onload = (e) => {
            const content = e.target?.result as string
            setCsvContent(content)
        }
        reader.readAsText(file)
    }, [])

    const handleParse = () => {
        setIsParsing(true)
        setParseErrors([])
        setPreview(null)
        
        try {
            const result = parseCsv(csvContent)
            if (result) {
                setPreview(result)
            }
        } catch (error) {
            setParseErrors([`Erro ao processar CSV: ${(error as Error).message}`])
        } finally {
            setIsParsing(false)
        }
    }

    const handleImport = () => {
        if (preview) {
            onImport(preview)
        }
    }

    const handleClear = () => {
        setCsvContent("")
        setFileName("")
        setParseErrors([])
        setPreview(null)
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" className="gap-2 hover:border-primary/50">
                    <Download className="h-4 w-4" />
                    Importar CSV
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-primary" />
                        Importar Template via CSV
                    </DialogTitle>
                    <DialogDescription>
                        Carregue um arquivo CSV com as perguntas do seu template personalizado
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <Input
                                type="file"
                                accept=".csv"
                                onChange={handleFileUpload}
                                className="flex-1"
                                id="csv-upload"
                            />
                            {fileName && (
                                <Badge variant="secondary" className="px-3 py-1">
                                    {fileName}
                                </Badge>
                            )}
                        </div>

                        <div className="text-sm text-muted-foreground space-y-1">
                            <p><strong>Formato aceito:</strong> Arquivo .csv com colunas:</p>
                            <ul className="list-disc list-inside space-y-1 ml-2">
                                <li><code>tipo</code>: text, long_text, number, select, multiselect</li>
                                <li><code>pergunta</code>: texto da pergunta</li>
                                <li><code>obrigatoria</code>: true/false ou sim/não</li>
                                <li><code>descricao</code> (opcional): descrição adicional</li>
                            </ul>
                            <p className="mt-2"><strong>Exemplo:</strong></p>
                            <pre className="bg-muted p-3 rounded-md text-xs overflow-x-auto">
                                {`tipo,pergunta,obrigatoria\n`}
                                {`text,"Como está seu sono?",true\n`}
                                {`number,"Quantos anos você tem?",true\n`}
                                {`long_text,"Descreva sua alimentação habitual",false\n`}
                                {`select,"Qual seu objetivo?",true`}
                            </pre>
                        </div>
                    </div>

                    {parseErrors.length > 0 && (
                        <Card variant="glass" className="border-destructive/30">
                            <CardHeader>
                                <CardTitle className="text-destructive flex items-center gap-2">
                                    <AlertCircle className="h-5 w-5" />
                                    Erros encontrados
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2">
                                    {parseErrors.map((error, index) => (
                                        <li key={index} className="flex items-start gap-2">
                                            <AlertCircle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                                            <span>{error}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    )}

                    {preview && (
                        <Card variant="glass">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                                    Pré-visualização
                                </CardTitle>
                                <CardDescription>
                                    {preview.questions.length} perguntas encontradas
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div>
                                        <Label>Título do Template</Label>
                                        <p className="text-foreground font-medium">{preview.title}</p>
                                    </div>
                                    <div>
                                        <Label>Descrição</Label>
                                        <p className="text-foreground">{preview.description}</p>
                                    </div>
                                    <div>
                                        <Label>Perguntas ({preview.questions.length})</Label>
                                        <div className="mt-2 space-y-2 max-h-60 overflow-y-auto">
                                            {preview.questions.map((question, index) => (
                                                <div key={index} className="p-3 bg-muted/30 rounded-lg">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <span className="text-sm font-medium">{question.label}</span>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <Badge variant="secondary" className="text-xs">
                                                                    {question.type}
                                                                </Badge>
                                                                {question.required && (
                                                                    <Badge variant="outline" className="text-xs">
                                                                        Obrigatória
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    <div className="flex justify-between pt-2">
                        <Button 
                            variant="outline" 
                            onClick={handleClear}
                            disabled={!fileName && !csvContent}
                        >
                            Limpar
                        </Button>
                        
                        <div className="flex gap-2">
                            <Button 
                                variant="secondary" 
                                onClick={handleParse} 
                                disabled={!csvContent || isParsing}
                            >
                                {isParsing ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 mr-2" />
                                        Processando...
                                    </>
                                ) : (
                                    <>
                                        <FileText className="h-4 w-4 mr-2" />
                                        Pré-visualizar
                                    </>
                                )}
                            </Button>
                            
                            <Button 
                                onClick={handleImport} 
                                disabled={!preview}
                            >
                                <Upload className="h-4 w-4 mr-2" />
                                Importar
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}