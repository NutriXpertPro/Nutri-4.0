"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Utensils, Clock, ChevronRight, Download, Share2 } from "lucide-react"

export function PatientDietTab() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-medium">Plano Alimentar Ativo</h3>
                    <p className="text-sm text-muted-foreground">Dieta Low Carb - Fase 2</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                        <Share2 className="h-4 w-4 mr-2" />
                        Enviar
                    </Button>
                    <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        PDF
                    </Button>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {/* Café da Manhã */}
                <Card>
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <Badge variant="secondary">07:30</Badge>
                            <Utensils className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <CardTitle className="text-base mt-2">Café da Manhã</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm space-y-2">
                        <p>• 2 Ovos mexidos com cúrcuma</p>
                        <p>• 1 fatia queijo minas curado</p>
                        <p>• Café preto s/ açúcar</p>
                    </CardContent>
                </Card>

                {/* Colação */}
                <Card>
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <Badge variant="secondary">10:30</Badge>
                            <Utensils className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <CardTitle className="text-base mt-2">Colação</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm space-y-2">
                        <p>• 5 Castanhas de Caju</p>
                        <p>• 1 fruta (Maçã/Pera)</p>
                    </CardContent>
                </Card>

                {/* Almoço */}
                <Card className="border-primary/20 bg-primary/5">
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <Badge className="bg-primary hover:bg-primary/90">13:00</Badge>
                            <Utensils className="h-4 w-4 text-primary" />
                        </div>
                        <CardTitle className="text-base mt-2">Almoço</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm space-y-2">
                        <p>• 150g Frango ou Peixe grelhado</p>
                        <p>• 100g Legumes no vapor (brócolis, cenoura)</p>
                        <p>• Salada de folhas à vontade (azeite oliva)</p>
                        <p>• 2 col. sopa Arroz integral (opcional)</p>
                    </CardContent>
                </Card>

                {/* Tarde */}
                <Card>
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <Badge variant="secondary">16:00</Badge>
                            <Utensils className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <CardTitle className="text-base mt-2">Lanche da Tarde</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm space-y-2">
                        <p>• Iogurte Natural Integral</p>
                        <p>• 1 col. sopa Chia</p>
                        <p>• 5 Morangos picados</p>
                    </CardContent>
                </Card>

                {/* Jantar */}
                <Card>
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <Badge variant="secondary">19:30</Badge>
                            <Utensils className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <CardTitle className="text-base mt-2">Jantar</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm space-y-2">
                        <p>• Omelete de 2 ovos com espinafre</p>
                        <p>• Salada de tomate e pepino</p>
                        <p>• Chá de camomila</p>
                    </CardContent>
                </Card>
            </div>

            <Button variant="ghost" className="w-full">
                Ver lista de substituições <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
        </div>
    )
}
