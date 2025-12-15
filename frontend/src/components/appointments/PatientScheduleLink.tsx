"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Copy, Link as LinkIcon, Share } from "lucide-react"
import { toast } from "sonner"

interface PatientScheduleLinkProps {
    patientId: number
    patientName: string
}

export function PatientScheduleLink({ patientId, patientName }: PatientScheduleLinkProps) {
    const [link, setLink] = useState<string>("")
    const [isGenerating, setIsGenerating] = useState<boolean>(false)
    const [isOpen, setIsOpen] = useState<boolean>(false)

    const generateLink = () => {
        setIsGenerating(true)
        
        // Simular geração de link (em uma implementação real, isso seria feito via API)
        setTimeout(() => {
            const generatedLink = `${window.location.origin}/patient-schedule/${patientId}?token=${Math.random().toString(36).substring(2, 15)}`
            setLink(generatedLink)
            setIsGenerating(false)
            toast.success("Link de agendamento gerado com sucesso!")
        }, 800)
    }

    const copyToClipboard = () => {
        navigator.clipboard.writeText(link)
        toast.success("Link copiado para a área de transferência!")
    }

    const shareLink = () => {
        if (navigator.share) {
            navigator.share({
                title: 'Agende sua consulta',
                text: `Olá ${patientName}, agende sua consulta conosco usando este link:`,
                url: link
            })
        } else {
            copyToClipboard()
            toast.info("Link copiado. Compartilhe com seu paciente!")
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                    <LinkIcon className="h-4 w-4 mr-2" />
                    Link para Paciente
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Link de Agendamento para {patientName}</DialogTitle>
                    <DialogDescription>
                        Compartilhe este link com o paciente para que ele possa agendar sua própria consulta
                    </DialogDescription>
                </DialogHeader>
                
                <div className="flex items-center space-x-2 pt-4">
                    <div className="grid flex-1 gap-2">
                        <Label htmlFor="link" className="sr-only">Link</Label>
                        <Input
                            id="link"
                            value={link || "Clique em 'Gerar Link' para criar um novo link"}
                            readOnly
                            className="h-9"
                        />
                    </div>
                    <Button
                        type="submit"
                        size="sm"
                        className="px-3"
                        onClick={link ? copyToClipboard : generateLink}
                        disabled={isGenerating}
                    >
                        {isGenerating ? (
                            <span>Gerando...</span>
                        ) : link ? (
                            <Copy className="h-4 w-4" />
                        ) : (
                            <Share className="h-4 w-4" />
                        )}
                    </Button>
                </div>
                
                {link && (
                    <div className="flex pt-2">
                        <Button 
                            onClick={shareLink} 
                            className="w-full"
                            variant="secondary"
                        >
                            <Share className="h-4 w-4 mr-2" />
                            Compartilhar com Paciente
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}