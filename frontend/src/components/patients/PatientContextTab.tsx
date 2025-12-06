"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { User, HeartPulse, Stethoscope, AlertCircle } from "lucide-react"

export function PatientContextTab() {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            {/* Dados Pessoais - Coluna Esquerda */}
            <Card className="col-span-3">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5 text-primary" />
                        Dados Pessoais
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <div className="text-sm font-medium text-muted-foreground">Data Nascimento</div>
                            <div>15/04/1992 (32 anos)</div>
                        </div>
                        <div>
                            <div className="text-sm font-medium text-muted-foreground">Ocupação</div>
                            <div>Advogada</div>
                        </div>
                        <div>
                            <div className="text-sm font-medium text-muted-foreground">Estado Civil</div>
                            <div>Casada</div>
                        </div>
                        <div>
                            <div className="text-sm font-medium text-muted-foreground">Filhos</div>
                            <div>1 (2 anos)</div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Histórico Clínico - Coluna Direita */}
            <Card className="col-span-4">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <HeartPulse className="h-5 w-5 text-primary" />
                        Histórico de Saúde
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="bg-muted/30 p-4 rounded-lg">
                        <div className="font-semibold mb-2 flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 text-destructive" />
                            Alergias & Restrições
                        </div>
                        <div className="flex gap-2">
                            <Badge variant="destructive">Lactose</Badge>
                            <Badge variant="outline">Glúten (sensibilidade)</Badge>
                        </div>
                    </div>

                    <div>
                        <div className="font-semibold mb-2 flex items-center gap-2">
                            <Stethoscope className="h-4 w-4 text-primary" />
                            Doenças Crônicas / Patologias
                        </div>
                        <ul className="list-disc pl-5 text-sm space-y-1 text-muted-foreground">
                            <li>Hipotireoidismo (controlado)</li>
                            <li>Gastrite nervosa</li>
                        </ul>
                    </div>

                    <div>
                        <div className="text-sm font-medium mb-1">Medicamentos em uso</div>
                        <p className="text-sm text-muted-foreground">Puran T4 50mcg (jejum)</p>
                    </div>
                </CardContent>
            </Card>

            {/* Rotina Alimentar - Largura total */}
            <Card className="col-span-full">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5 text-primary" />
                        Rotina e Hábitos
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <h4 className="font-medium text-sm">Sono</h4>
                            <p className="text-sm text-muted-foreground">Dorme ~6h por noite. Acorda cansada.</p>
                        </div>
                        <div className="space-y-2">
                            <h4 className="font-medium text-sm">Água</h4>
                            <p className="text-sm text-muted-foreground">~1.5L por dia (meta: 2.5L).</p>
                        </div>
                        <div className="space-y-2">
                            <h4 className="font-medium text-sm">Atividade Física</h4>
                            <p className="text-sm text-muted-foreground">Musculação 3x/semana (Iniciante).</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
