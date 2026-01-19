
import { MessageCircle, Calendar, Gift, Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { messagesAPI } from "@/services/api"
import { toast } from "sonner"

export interface BirthdayPatient {
    id: number
    name: string
    avatar: string | null
    age: number | null
    date: string
}

interface AniversariantesCardProps {
    patients?: BirthdayPatient[]
}

export function AniversariantesCard({ patients = [] }: AniversariantesCardProps) {
    const router = useRouter()
    const [sendingId, setSendingId] = useState<number | null>(null)

    const handleSendMessage = async (patientId: number) => {
        setSendingId(patientId)
        try {
            // 1. Encontrar ou criar conversa
            const conversation = await messagesAPI.findOrCreateByPatient(patientId)
            
            // 2. Enviar mensagem de aniversário
            const message = "Feliz aniversário! 🎉 Muita saúde e conquistas nesse novo ciclo. Conte comigo para alcançar seus objetivos!"
            await messagesAPI.sendMessage(conversation.id, message)
            
            toast.success("Mensagem de aniversário enviada!")
            
            // Opcional: redirecionar para o chat para continuar conversando
            // router.push(`/messages?conversation=${conversation.id}`)
        } catch (error) {
            console.error("Erro ao enviar mensagem:", error)
            toast.error("Erro ao enviar mensagem.")
        } finally {
            setSendingId(null)
        }
    }

    if (!patients || patients.length === 0) {
        return (
            <Card className="h-full border-border/50 shadow-sm bg-white/50 dark:bg-zinc-800/10 backdrop-blur-sm">
                <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-lg font-semibold flex items-center gap-2">
                                <Gift className="h-5 w-5 text-pink-500" />
                                Aniversariantes
                            </CardTitle>
                            <CardDescription>
                                Ninguém fazendo aniversário hoje
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground/60 h-[200px]">
                    <Calendar className="h-12 w-12 mb-3 opacity-20" />
                    <p>Sem aniversários hoje</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="h-full border-pink-100 dark:border-pink-900/20 shadow-sm bg-gradient-to-br from-white to-pink-50/30 dark:from-zinc-900 dark:to-pink-900/10">
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-lg font-semibold flex items-center gap-2">
                            <Gift className="h-5 w-5 text-pink-500" />
                            Aniversariantes do Dia
                        </CardTitle>
                        <CardDescription>
                            {patients.length} {patients.length === 1 ? "paciente celebrando" : "pacientes celebrando"} hoje! 🎉
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="pt-2">
                <div className="space-y-4">
                    {patients.map((patient) => (
                        <div
                            key={patient.id}
                            className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-zinc-800/50 border border-pink-100 dark:border-pink-900/20 shadow-sm hover:shadow-md transition-all group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <Avatar className="h-12 w-12 border-2 border-white dark:border-zinc-800 shadow-sm ring-2 ring-pink-100 dark:ring-pink-900/30">
                                        <AvatarImage src={patient.avatar || undefined} className="object-cover" />
                                        <AvatarFallback className="bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400">
                                            {patient.name.substring(0, 2).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-white dark:bg-zinc-800 text-xs shadow-sm border border-pink-100 dark:border-pink-900/20">
                                        🎂
                                    </span>
                                </div>
                                <div>
                                    <h4 className="font-medium text-foreground group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors">
                                        {patient.name}
                                    </h4>
                                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                                        {patient.age ? `${patient.age} anos` : 'Parabéns!'}
                                    </p>
                                </div>
                            </div>

                            <Button
                                size="sm"
                                variant="secondary"
                                className="bg-pink-50 dark:bg-pink-900/20 hover:bg-pink-100 dark:hover:bg-pink-900/40 text-pink-600 dark:text-pink-400 hover:text-pink-700 dark:hover:text-pink-300 border border-pink-200 dark:border-pink-900/30 shadow-sm"
                                onClick={() => handleSendMessage(patient.id)}
                                disabled={sendingId === patient.id}
                            >
                                {sendingId === patient.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                ) : (
                                    <MessageCircle className="h-4 w-4 mr-2" />
                                )}
                                {sendingId === patient.id ? "Enviando..." : "Enviar"}
                            </Button>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
