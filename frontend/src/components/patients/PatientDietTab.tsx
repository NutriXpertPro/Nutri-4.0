"use client"

import { IconWrapper } from "@/components/ui/IconWrapper"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Utensils, Share2, Download, ChevronRight } from "lucide-react"
import { useState } from "react"
import { PatientDietPDFView } from "./PatientDietPDFView"

export function PatientDietTab() {
    const [showPDFPreview, setShowPDFPreview] = useState(false);

    // Função para lidar com o envio para o app do paciente
    const handleSendToPatient = async () => {
        // Simular envio para o app do paciente
        try {
            // Aqui seria implementada a chamada real para a API
            // await api.post('/diet/send-to-patient/', { /* dados da dieta */ });

            // Mostrar feedback de sucesso
            alert('Dieta enviada com sucesso para o app do paciente!');
        } catch (error) {
            console.error('Erro ao enviar dieta para o paciente:', error);
            alert('Erro ao enviar dieta. Por favor, tente novamente.');
        }
    };

    // Função para gerar dados de dieta realistas
    const generateDietData = () => {
        return {
            patientName: "Maria Silva",
            patientAge: 32,
            patientGoal: "Emagrecimento",
            dietName: "Plano Alimentar",
            dietType: "Low Carb - Fase 2",
            targetCalories: 1800,
            targetProtein: 120,
            targetCarbs: 90,
            targetFats: 100,
            meals: [
                {
                    name: "Café da Manhã",
                    time: "07:30",
                    items: [
                        { name: "2 Ovos mexidos com cúrcuma", quantity: "2 unidades", calories: 140, protein: 12, carbs: 1, fats: 10 },
                        { name: "1 fatia queijo minas curado", quantity: "40g", calories: 120, protein: 7, carbs: 0, fats: 10 },
                        { name: "Café preto s/ açúcar", quantity: "150ml", calories: 5, protein: 0, carbs: 0, fats: 0 }
                    ]
                },
                {
                    name: "Lanche da Manhã",
                    time: "10:30",
                    items: [
                        { name: "5 Castanhas de Caju", quantity: "25g", calories: 160, protein: 5, carbs: 8, fats: 14 },
                        { name: "1 fruta (Maçã/Pera)", quantity: "150g", calories: 80, protein: 0, carbs: 20, fats: 0 }
                    ]
                },
                {
                    name: "Almoço",
                    time: "13:00",
                    items: [
                        { name: "150g Frango ou Peixe grelhado", quantity: "150g", calories: 200, protein: 35, carbs: 0, fats: 5 },
                        { name: "100g Legumes no vapor", quantity: "100g", calories: 30, protein: 2, carbs: 6, fats: 0 },
                        { name: "Salada de folhas à vontade", quantity: "100g", calories: 15, protein: 1, carbs: 2, fats: 0 },
                        { name: "2 col. sopa Arroz integral", quantity: "60g", calories: 65, protein: 2, carbs: 14, fats: 0 }
                    ]
                },
                {
                    name: "Lanche da Tarde",
                    time: "16:00",
                    items: [
                        { name: "Iogurte Natural Integral", quantity: "150g", calories: 100, protein: 6, carbs: 7, fats: 6 },
                        { name: "1 col. sopa Chia", quantity: "10g", calories: 50, protein: 2, carbs: 3, fats: 4 },
                        { name: "5 Morangos picados", quantity: "50g", calories: 15, protein: 0, carbs: 3, fats: 0 }
                    ]
                },
                {
                    name: "Jantar",
                    time: "19:30",
                    items: [
                        { name: "Omelete de 2 ovos com espinafre", quantity: "2 unidades", calories: 140, protein: 12, carbs: 1, fats: 10 },
                        { name: "Salada de tomate e pepino", quantity: "100g", calories: 20, protein: 1, carbs: 4, fats: 0 },
                        { name: "Chá de camomila", quantity: "200ml", calories: 2, protein: 0, carbs: 0, fats: 0 }
                    ]
                },
                {
                    name: "Ceia",
                    time: "21:30",
                    items: [
                        { name: "1 col. sopa Aveia", quantity: "10g", calories: 35, protein: 1, carbs: 6, fats: 1 },
                        { name: "1 col. chá Mel", quantity: "10g", calories: 30, protein: 0, carbs: 8, fats: 0 }
                    ]
                }
            ]
        };
    };

    // Função para gerar PDF
    const handleGeneratePDF = () => {
        setShowPDFPreview(true);
    };

    const dietData = generateDietData();

    return (
        <div className="space-y-8 pb-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-1">
                <div>
                    <p className="text-[10px] font-normal text-primary uppercase tracking-[0.2em] mb-1">Prescrição Atual</p>
                    <h3 className="text-2xl font-normal tracking-tight text-foreground flex items-center gap-3">
                        Plano Alimentar
                        <Badge variant="secondary" className="bg-primary/5 text-primary border-none text-[10px] font-normal uppercase tracking-widest px-3">
                            Low Carb - Fase 2
                        </Badge>
                    </h3>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        className="h-10 px-5 rounded-xl border-border/10 text-[10px] font-normal uppercase tracking-widest gap-2 hover:bg-muted/50"
                        onClick={handleSendToPatient}
                    >
                        <Share2 className="h-3.5 w-3.5" />
                        Enviar
                    </Button>
                    <Button
                        variant="outline"
                        className="h-10 px-5 rounded-xl border-border/10 text-[10px] font-normal uppercase tracking-widest gap-2 hover:bg-muted/50"
                        onClick={handleGeneratePDF}
                    >
                        <Download className="h-3.5 w-3.5" />
                        PDF
                    </Button>
                </div>
            </div>

            {showPDFPreview && (
                <PatientDietPDFView
                    dietData={dietData}
                    onClose={() => setShowPDFPreview(false)}
                />
            )}

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* Café da Manhã */}
                <Card variant="glass" className="border-none bg-background/50 hover:bg-background/60 transition-all shadow-xl group">
                    <CardHeader className="pb-4">
                        <div className="flex items-center justify-between mb-2">
                            <Badge className="bg-primary hover:bg-primary/90 font-normal text-[10px]">07:30</Badge>
                            <IconWrapper icon={Utensils} variant="blue" size="sm" />
                        </div>
                        <CardTitle className="text-lg font-normal tracking-tight text-primary">Café da Manhã</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="space-y-2">
                            <div className="text-sm font-normal text-foreground flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                                2 Ovos mexidos com cúrcuma
                            </div>
                            <div className="text-sm font-normal text-foreground flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                                1 fatia queijo minas curado
                            </div>
                            <div className="text-sm font-normal text-muted-foreground/60 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                                Café preto s/ açúcar
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Lanche da Manhã */}
                <Card variant="glass" className="border-none bg-background/50 hover:bg-background/60 transition-all shadow-xl group">
                    <CardHeader className="pb-4">
                        <div className="flex items-center justify-between mb-2">
                            <Badge className="bg-primary hover:bg-primary/90 font-normal text-[10px]">10:30</Badge>
                            <IconWrapper icon={Utensils} variant="emerald" size="sm" />
                        </div>
                        <CardTitle className="text-lg font-normal tracking-tight text-primary">Lanche da Manhã</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="space-y-2">
                            <div className="text-sm font-normal text-foreground flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                                5 Castanhas de Caju
                            </div>
                            <div className="text-sm font-normal text-foreground flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                                1 fruta (Maçã/Pera)
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Almoço - Destacado */}
                <Card variant="glass" className="border-none bg-primary/[0.07] ring-1 ring-primary/20 shadow-2xl group shadow-primary/10">
                    <CardHeader className="pb-4">
                        <div className="flex items-center justify-between mb-2">
                            <Badge className="bg-primary hover:bg-primary/90 font-normal text-[10px]">13:00</Badge>
                            <IconWrapper icon={Utensils} variant="ghost" size="sm" className="bg-primary/20 text-primary" />
                        </div>
                        <CardTitle className="text-lg font-normal tracking-tight text-primary">Almoço <span className="text-[10px] uppercase ml-2 opacity-60">(Atual)</span></CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="space-y-2.5">
                            <div className="text-sm font-normal text-foreground flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                                150g Frango ou Peixe grelhado
                            </div>
                            <div className="text-sm font-normal text-foreground flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                                100g Legumes no vapor
                            </div>
                            <div className="text-sm font-normal text-foreground flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                                Salada de folhas à vontade
                            </div>
                            <div className="text-sm font-normal text-muted-foreground/60 italic flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                                2 col. sopa Arroz integral
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Lanche da Tarde */}
                <Card variant="glass" className="border-none bg-background/50 hover:bg-background/60 transition-all shadow-xl group">
                    <CardHeader className="pb-4">
                        <div className="flex items-center justify-between mb-2">
                            <Badge className="bg-primary hover:bg-primary/90 font-normal text-[10px]">16:00</Badge>
                            <IconWrapper icon={Utensils} variant="amber" size="sm" />
                        </div>
                        <CardTitle className="text-lg font-normal tracking-tight text-primary">Lanche da Tarde</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="space-y-2">
                            <div className="text-sm font-normal text-foreground flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                                Iogurte Natural Integral
                            </div>
                            <div className="text-sm font-normal text-foreground flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                                1 col. sopa Chia
                            </div>
                            <div className="text-sm font-normal text-foreground flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                                5 Morangos picados
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Jantar */}
                <Card variant="glass" className="border-none bg-background/50 hover:bg-background/60 transition-all shadow-xl group">
                    <CardHeader className="pb-4">
                        <div className="flex items-center justify-between mb-2">
                            <Badge className="bg-primary hover:bg-primary/90 font-normal text-[10px]">19:30</Badge>
                            <IconWrapper icon={Utensils} variant="violet" size="sm" />
                        </div>
                        <CardTitle className="text-lg font-normal tracking-tight text-primary">Jantar</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="space-y-2">
                            <div className="text-sm font-normal text-foreground flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                                Omelete de 2 ovos com espinafre
                            </div>
                            <div className="text-sm font-normal text-foreground flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                                Salada de tomate e pepino
                            </div>
                            <div className="text-sm font-normal text-muted-foreground/60 italic flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                                Chá de camomila
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Ceia */}
                <Card variant="glass" className="border-none bg-background/50 hover:bg-background/60 transition-all shadow-xl group">
                    <CardHeader className="pb-4">
                        <div className="flex items-center justify-between mb-2">
                            <Badge className="bg-primary hover:bg-primary/90 font-normal text-[10px]">21:30</Badge>
                            <IconWrapper icon={Utensils} variant="rose" size="sm" />
                        </div>
                        <CardTitle className="text-lg font-normal tracking-tight text-primary">Ceia</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="space-y-2">
                            <div className="text-sm font-normal text-foreground flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                                1 col. sopa Aveia
                            </div>
                            <div className="text-sm font-normal text-foreground flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                                1 col. chá Mel
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Button variant="ghost" className="w-full h-14 rounded-2xl border border-dashed border-border/10 hover:bg-primary/5 text-[11px] font-normal uppercase tracking-widest text-muted-foreground hover:text-primary transition-all">
                Ver lista completa de substituições <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
        </div>
    )
}

