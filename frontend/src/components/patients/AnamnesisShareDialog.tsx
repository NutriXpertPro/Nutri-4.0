import { useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Copy, Mail, MessageSquare, Check, ExternalLink } from "lucide-react"
import { AnamnesisTemplate } from "@/services/anamnesis-service"
import { messagesAPI } from "@/services/api"
import { toast } from "sonner" // Assuming sonner is used, or use standard toast

interface AnamnesisShareDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    patientId: number
    patientName: string
    patientEmail?: string
    templates: AnamnesisTemplate[]
}

export function AnamnesisShareDialog({
    open,
    onOpenChange,
    patientId,
    patientName,
    patientEmail,
    templates
}: AnamnesisShareDialogProps) {
    const [selectedTemplate, setSelectedTemplate] = useState<string>("standard")
    const [method, setMethod] = useState<"messenger" | "email" | "link">("messenger")
    const [isLoading, setIsLoading] = useState(false)
    const [copied, setCopied] = useState(false)

    const generateLink = () => {
        // Base URL dependent on environment
        const baseUrl = window.location.origin
        const templateParam = selectedTemplate === "standard" ? "type=standard" : `template=${selectedTemplate}`
        return `${baseUrl}/anamnesis/answer?patient=${patientId}&${templateParam}`
    }

    const handleSend = async () => {
        setIsLoading(true)
        const link = generateLink()
        const selectedTemplateName = selectedTemplate === "standard"
            ? "Anamnese Padrão"
            : templates.find(t => t.id.toString() === selectedTemplate)?.title || "Anamnese"

        try {
            if (method === "messenger") {
                // 1. Find or create conversation
                const conversation = await messagesAPI.findOrCreateByPatient(patientId)

                // 2. Send message
                const message = `Olá, ${patientName.split(" ")[0]}! \n\nEstou enviando o link da sua *${selectedTemplateName}* para preenchimento.\n\nPor favor, acesse o link abaixo para responder:\n${link}`

                await messagesAPI.sendMessage(conversation.id, message)

                toast.success("Link enviado via Xpert Messenger!")
                onOpenChange(false)

            } else if (method === "email") {
                if (!patientEmail) {
                    toast.error("Paciente não possui email cadastrado.")
                    setIsLoading(false)
                    return
                }

                const subject = encodeURIComponent(`Anamnese Nutricional - ${selectedTemplateName}`)
                const body = encodeURIComponent(
                    `Olá ${patientName},\n\n` +
                    `Estou enviando o link da sua ${selectedTemplateName} para preenchimento.\n\n` +
                    `Acesse o link abaixo para responder:\n${link}\n\n` +
                    `Atenciosamente,\nSeu Nutricionista`
                )

                window.open(`mailto:${patientEmail}?subject=${subject}&body=${body}`, '_blank')
                toast.success("Cliente de email aberto!")
                onOpenChange(false)

            } else if (method === "link") {
                await navigator.clipboard.writeText(link)
                setCopied(true)
                setTimeout(() => setCopied(false), 2000)
                toast.success("Link copiado para a área de transferência!")
            }

        } catch (error) {
            console.error("Erro ao compartilhar:", error)
            toast.error("Erro ao enviar o link. Tente novamente.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Compartilhar Anamnese</DialogTitle>
                    <DialogDescription>
                        Envie o link do questionário para {patientName} responder.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Template Selection */}
                    <div className="space-y-2">
                        <Label>Modelo de Anamnese</Label>
                        <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione o modelo" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="standard">Anamnese Padrão (Completa)</SelectItem>
                                {templates.map(t => (
                                    <SelectItem key={t.id} value={t.id.toString()}>
                                        {t.title}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Method Selection */}
                    <div className="space-y-3">
                        <Label>Como deseja enviar?</Label>
                        <RadioGroup value={method} onValueChange={(v: "messenger" | "email" | "link") => setMethod(v)} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <RadioGroupItem value="messenger" id="messenger" className="peer sr-only" />
                                <Label
                                    htmlFor="messenger"
                                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:text-primary cursor-pointer h-full"
                                >
                                    <MessageSquare className="mb-3 h-6 w-6" />
                                    <span className="text-xs font-medium text-center">Xpert Messenger</span>
                                </Label>
                            </div>
                            <div>
                                <RadioGroupItem value="email" id="email" className="peer sr-only" />
                                <Label
                                    htmlFor="email"
                                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:text-primary cursor-pointer h-full"
                                >
                                    <Mail className="mb-3 h-6 w-6" />
                                    <span className="text-xs font-medium text-center">E-mail</span>
                                </Label>
                            </div>
                            <div>
                                <RadioGroupItem value="link" id="link" className="peer sr-only" />
                                <Label
                                    htmlFor="link"
                                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:text-primary cursor-pointer h-full"
                                >
                                    <Copy className="mb-3 h-6 w-6" />
                                    <span className="text-xs font-medium text-center">Copiar Link</span>
                                </Label>
                            </div>
                        </RadioGroup>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancelar
                    </Button>
                    <Button onClick={handleSend} disabled={isLoading} className="gap-2">
                        {isLoading ? (
                            "Enviando..."
                        ) : method === "link" ? (
                            <>
                                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                {copied ? "Copiado!" : "Copiar"}
                            </>
                        ) : (
                            <>
                                <ExternalLink className="h-4 w-4" />
                                Enviar
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
