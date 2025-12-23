import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Upload, FileText, X, Check, AlertCircle } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import externalExamService from "@/services/external-exam-service"

interface ExternalExamUploadProps {
  patientId: number
  onUpload?: (file: File, notes: string) => void
  onSuccess?: () => void
}

export function ExternalExamUpload({ patientId, onUpload, onSuccess }: ExternalExamUploadProps) {
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null)
  const [notes, setNotes] = React.useState("")
  const [isUploading, setIsUploading] = React.useState(false)
  const [uploadProgress, setUploadProgress] = React.useState(0)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      // Verificar se o tipo de arquivo é suportado
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']
      if (allowedTypes.includes(file.type)) {
        setSelectedFile(file)
      } else {
        toast({
          title: "Tipo de arquivo não suportado",
          description: "Por favor, envie um arquivo PDF, JPG ou PNG.",
          variant: "destructive"
        })
      }
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) {
      toast({
        title: "Nenhum arquivo selecionado",
        description: "Por favor, selecione um arquivo para upload.",
        variant: "destructive"
      })
      return
    }

    if (!patientId || patientId === 0) {
      toast({
        title: "Paciente não selecionado",
        description: "Por favor, selecione um paciente primeiro.",
        variant: "destructive"
      })
      return
    }

    setIsUploading(true)
    setUploadProgress(0)

    try {
      // Simular progresso visual
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      // Upload REAL para o backend
      await externalExamService.upload(patientId, selectedFile, notes)

      clearInterval(progressInterval)
      setUploadProgress(100)

      // Chamar callbacks
      if (onUpload) {
        onUpload(selectedFile, notes)
      }

      if (onSuccess) {
        onSuccess()
      }

      toast({
        title: "Upload realizado",
        description: `Arquivo ${selectedFile.name} enviado com sucesso.`,
      })

      // Resetar o formulário
      setSelectedFile(null)
      setNotes("")
      setUploadProgress(0)

    } catch (error: any) {
      console.error("Erro no upload:", error)
      const errorMessage = error.response?.data?.error || error.message || "Erro desconhecido"
      toast({
        title: "Erro no upload",
        description: `Falha ao enviar o arquivo: ${errorMessage}`,
        variant: "destructive"
      })
    } finally {
      setIsUploading(false)
    }
  }

  const removeFile = () => {
    setSelectedFile(null)
    setUploadProgress(0)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Upload de Exame Externo
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="exam-file">Arquivo do Exame</Label>
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 flex flex-col items-center justify-center gap-4 hover:bg-muted/10 transition-colors">
            {!selectedFile ? (
              <label className="flex flex-col items-center justify-center w-full cursor-pointer">
                <Upload className="h-10 w-10 text-muted-foreground" />
                <div className="text-center">
                  <p className="font-medium">Clique para selecionar arquivo</p>
                  <p className="text-sm text-muted-foreground">PDF, JPG, PNG até 10MB</p>
                </div>
                <Input
                  id="exam-file"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
            ) : (
              <div className="w-full flex flex-col items-center">
                <div className="flex items-center gap-2 w-full mb-4">
                  <FileText className="h-8 w-8 text-primary" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{selectedFile.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={removeFile}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {isUploading && (
                  <div className="w-full space-y-2">
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground text-center">{uploadProgress}%</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="exam-notes">Anotações (Opcional)</Label>
          <Input
            id="exam-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Adicione observações sobre este exame..."
          />
        </div>

        <Button
          className="w-full"
          onClick={handleUpload}
          disabled={!selectedFile || isUploading}
        >
          {isUploading ? (
            <>
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Enviando...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Fazer Upload
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}