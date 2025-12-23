import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText, Download, Eye, Calendar, User } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import externalExamService, { ExternalExam } from "@/services/external-exam-service"

interface ExternalExamListProps {
    patientId: number
}

export function ExternalExamList({ patientId }: ExternalExamListProps) {
    const { data: exams = [], isLoading, refetch } = useQuery({
        queryKey: ['external-exams', patientId],
        queryFn: () => externalExamService.list(patientId),
        enabled: patientId > 0,
    })

    const getFileIcon = (fileType: string) => {
        if (fileType === 'PDF') {
            return <FileText className="h-5 w-5 text-red-500" />
        }
        return <FileText className="h-5 w-5 text-blue-500" />
    }

    const handleView = (exam: ExternalExam) => {
        window.open(exam.file_url, '_blank')
    }

    const handleDownload = (exam: ExternalExam) => {
        const link = document.createElement('a')
        link.href = exam.file_url
        link.download = exam.file_name
        link.click()
    }

    if (isLoading) {
        return (
            <Card>
                <CardContent className="flex items-center justify-center py-8">
                    <p className="text-muted-foreground">Carregando exames...</p>
                </CardContent>
            </Card>
        )
    }

    if (exams.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Exames Externos
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                        <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>Nenhum exame externo enviado ainda.</p>
                        <p className="text-sm mt-1">Use o botão "Upload de Exame Externo" para adicionar.</p>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Exames Externos ({exams.length})
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                {exams.map((exam) => (
                    <div
                        key={exam.id}
                        className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3 flex-1">
                                <div className="mt-1">
                                    {getFileIcon(exam.file_type)}
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-medium">{exam.file_name}</h4>
                                    <div className="flex flex-wrap gap-2 mt-2 text-sm text-muted-foreground">
                                        <div className="flex items-center gap-1">
                                            <Calendar className="h-3 w-3" />
                                            {new Date(exam.uploaded_at).toLocaleDateString('pt-BR')}
                                        </div>
                                        {exam.uploaded_by_name && (
                                            <div className="flex items-center gap-1">
                                                <User className="h-3 w-3" />
                                                {exam.uploaded_by_name}
                                            </div>
                                        )}
                                        <Badge variant="secondary">{exam.file_type}</Badge>
                                    </div>
                                    {exam.notes && (
                                        <p className="text-sm text-muted-foreground mt-2 italic">
                                            "{exam.notes}"
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div className="flex gap-2 ml-4">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleView(exam)}
                                    className="h-8 w-8 p-0"
                                    title="Visualizar"
                                >
                                    <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleDownload(exam)}
                                    className="h-8 w-8 p-0"
                                    title="Baixar"
                                >
                                    <Download className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    )
}
