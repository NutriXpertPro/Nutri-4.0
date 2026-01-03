import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Share2,
  Mail,
  Link,
  Copy,
  Check,
  Calendar,
  Target,
  TrendingUp,
  User,
  MessageSquare
} from "lucide-react"
import { toast } from "@/components/ui/use-toast"

interface ShareEvolutionProps {
  patientId: number
  evaluationId?: number
}

export function ShareEvolution({ patientId, evaluationId }: ShareEvolutionProps) {
  const [shareMethod, setShareMethod] = React.useState<"link" | "email" | "chat">("link")
  const [recipientEmail, setRecipientEmail] = React.useState("")
  const [isGenerating, setIsGenerating] = React.useState(false)
  const [shareLink, setShareLink] = React.useState("")
  const [isLinkCopied, setIsLinkCopied] = React.useState(false)

  const generateShareLink = async () => {
    setIsGenerating(true)

    try {
      // Simular geração de link (na implementação real, isso seria uma chamada API)
      await new Promise(resolve => setTimeout(resolve, 1000))

      const baseUrl = window.location.origin
      const link = evaluationId
        ? `${baseUrl}/patients/${patientId}/evaluations/${evaluationId}/share`
        : `${baseUrl}/patients/${patientId}/evolution`

      setShareLink(link)

      toast({
        title: "Link gerado",
        description: "O link de compartilhamento foi gerado com sucesso.",
      })
    } catch (error) {
      console.error("Erro ao gerar link:", error)
      toast({
        title: "Erro",
        description: "Falha ao gerar o link de compartilhamento.",
        variant: "destructive"
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const copyLinkToClipboard = () => {
    navigator.clipboard.writeText(shareLink)
    setIsLinkCopied(true)
    toast({
      title: "Link copiado",
      description: "O link foi copiado para a área de transferência.",
    })

    setTimeout(() => setIsLinkCopied(false), 2000)
  }

  const sendEmail = async () => {
    if (!recipientEmail) {
      toast({
        title: "Email não informado",
        description: "Por favor, informe o email do destinatário.",
        variant: "destructive"
      })
      return
    }

    setIsGenerating(true)

    try {
      // Simular envio de email (na implementação real, isso seria uma chamada API)
      await new Promise(resolve => setTimeout(resolve, 1500))

      toast({
        title: "Email enviado",
        description: `O relatório foi enviado para ${recipientEmail}.`,
      })
    } catch (error) {
      console.error("Erro ao enviar email:", error)
      toast({
        title: "Erro",
        description: "Falha ao enviar o email de compartilhamento.",
        variant: "destructive"
      })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Share2 className="h-5 w-5 text-violet-500" />
          Compartilhar Evolução
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={shareMethod === "link" ? "default" : "outline"}
            size="sm"
            onClick={() => setShareMethod("link")}
          >
            <Link className="h-4 w-4 mr-2 text-violet-500" />
            Link
          </Button>
          <Button
            variant={shareMethod === "email" ? "default" : "outline"}
            size="sm"
            onClick={() => setShareMethod("email")}
          >
            <Mail className="h-4 w-4 mr-2 text-violet-500" />
            Email
          </Button>
          <Button
            variant={shareMethod === "chat" ? "default" : "outline"}
            size="sm"
            onClick={() => setShareMethod("chat")}
          >
            <MessageSquare className="h-4 w-4 mr-2 text-emerald-500" />
            Xpert Messenger
          </Button>
        </div>

        {shareMethod === "link" ? (
          <div className="space-y-3">
            <div className="space-y-2">
              <Label>Link de Compartilhamento</Label>
              {!shareLink ? (
                <Button
                  className="w-full"
                  onClick={generateShareLink}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Gerando...
                    </>
                  ) : (
                    <>
                      <Share2 className="h-4 w-4 mr-2" />
                      Gerar Link de Compartilhamento
                    </>
                  )}
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Input value={shareLink} readOnly className="flex-1" />
                  <Button onClick={copyLinkToClipboard} disabled={isLinkCopied}>
                    {isLinkCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              )}
            </div>

            <div className="text-sm text-muted-foreground">
              <p>Este link permite acesso temporário ao relatório de evolução do paciente.</p>
              <p className="mt-1">O link expira em 7 dias.</p>
            </div>
          </div>
        ) : shareMethod === "email" ? (
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="recipient-email">Email do Destinatário</Label>
              <Input
                id="recipient-email"
                type="email"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                placeholder="exemplo@dominio.com"
              />
            </div>

            <Button
              className="w-full"
              onClick={sendEmail}
              disabled={isGenerating || !recipientEmail}
            >
              {isGenerating ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Enviando...
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4 mr-2" />
                  Enviar por Email
                </>
              )}
            </Button>

            <div className="text-sm text-muted-foreground">
              <p>O destinatário receberá um email com o relatório de evolução do paciente.</p>
              <p className="mt-1">O relatório será gerado automaticamente com base nas últimas avaliações.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="p-4 bg-muted/50 rounded-lg text-center">
              <MessageSquare className="h-12 w-12 mx-auto mb-2 text-primary opacity-80" />
              <h3 className="font-medium mb-1">Compartilhar via Xpert Messenger</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Envie o relatório diretamente para o paciente através do Xpert Messenger.
              </p>
              <Button
                className="w-full"
                onClick={() => window.location.href = '/messages'}
              >
                Ir para Xpert Messenger
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card >
  )
}