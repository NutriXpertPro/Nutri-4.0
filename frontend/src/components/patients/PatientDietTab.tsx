"use client"

import { IconWrapper } from "@/components/ui/IconWrapper"

export function PatientDietTab() {
    return (
        <div className="space-y-8 pb-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-1">
                <div>
                    <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-1">Prescrição Atual</p>
                    <h3 className="text-2xl font-black tracking-tight text-foreground flex items-center gap-3">
                        Plano Alimentar
                        <Badge variant="secondary" className="bg-primary/5 text-primary border-none text-[10px] font-black uppercase tracking-widest px-3">
                            Low Carb - Fase 2
                        </Badge>
                    </h3>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="h-10 px-5 rounded-xl border-border/10 text-[10px] font-black uppercase tracking-widest gap-2 hover:bg-muted/50">
                        <Share2 className="h-3.5 w-3.5" />
                        Enviar
                    </Button>
                    <Button variant="outline" className="h-10 px-5 rounded-xl border-border/10 text-[10px] font-black uppercase tracking-widest gap-2 hover:bg-muted/50">
                        <Download className="h-3.5 w-3.5" />
                        PDF
                    </Button>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* Café da Manhã */}
                <Card variant="glass" className="border-none bg-background/50 hover:bg-background/60 transition-all shadow-xl group">
                    <CardHeader className="pb-4">
                        <div className="flex items-center justify-between mb-2">
                            <Badge variant="outline" className="border-primary/20 text-primary font-black bg-primary/5 text-[10px]">07:30</Badge>
                            <IconWrapper icon={Utensils} variant="blue" size="sm" />
                        </div>
                        <CardTitle className="text-lg font-black tracking-tight group-hover:text-primary transition-colors">Café da Manhã</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="space-y-2">
                            <p className="text-sm font-bold text-foreground flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                                2 Ovos mexidos com cúrcuma
                            </p>
                            <p className="text-sm font-bold text-foreground flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                                1 fatia queijo minas curado
                            </p>
                            <p className="text-sm font-bold text-muted-foreground/60 flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary/20" />
                                Café preto s/ açúcar
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Colação */}
                <Card variant="glass" className="border-none bg-background/50 hover:bg-background/60 transition-all shadow-xl group">
                    <CardHeader className="pb-4">
                        <div className="flex items-center justify-between mb-2">
                            <Badge variant="outline" className="border-primary/20 text-primary font-black bg-primary/5 text-[10px]">10:30</Badge>
                            <IconWrapper icon={Utensils} variant="emerald" size="sm" />
                        </div>
                        <CardTitle className="text-lg font-black tracking-tight group-hover:text-primary transition-colors">Colação</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="space-y-2">
                            <p className="text-sm font-bold text-foreground flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                                5 Castanhas de Caju
                            </p>
                            <p className="text-sm font-bold text-foreground flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                                1 fruta (Maçã/Pera)
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Almoço - Destacado */}
                <Card variant="glass" className="border-none bg-primary/[0.07] ring-1 ring-primary/20 shadow-2xl group shadow-primary/10">
                    <CardHeader className="pb-4">
                        <div className="flex items-center justify-between mb-2">
                            <Badge className="bg-primary hover:bg-primary/90 font-black text-[10px]">13:00</Badge>
                            <IconWrapper icon={Utensils} variant="ghost" size="sm" className="bg-primary/20 text-primary" />
                        </div>
                        <CardTitle className="text-lg font-black tracking-tight text-primary">Almoço <span className="text-[10px] uppercase ml-2 opacity-60">(Atual)</span></CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="space-y-2.5">
                            <p className="text-sm font-bold text-foreground flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                150g Frango ou Peixe grelhado
                            </p>
                            <p className="text-sm font-bold text-foreground flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                100g Legumes no vapor
                            </p>
                            <p className="text-sm font-bold text-foreground flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                Salada de folhas à vontade
                            </p>
                            <p className="text-sm font-bold text-muted-foreground/60 italic flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                                2 col. sopa Arroz integral
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Tarde */}
                <Card variant="glass" className="border-none bg-background/50 hover:bg-background/60 transition-all shadow-xl group">
                    <CardHeader className="pb-4">
                        <div className="flex items-center justify-between mb-2">
                            <Badge variant="outline" className="border-primary/20 text-primary font-black bg-primary/5 text-[10px]">16:00</Badge>
                            <IconWrapper icon={Utensils} variant="amber" size="sm" />
                        </div>
                        <CardTitle className="text-lg font-black tracking-tight group-hover:text-primary transition-colors">Lanche da Tarde</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="space-y-2">
                            <p className="text-sm font-bold text-foreground flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                                Iogurte Natural Integral
                            </p>
                            <p className="text-sm font-bold text-foreground flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                                1 col. sopa Chia
                            </p>
                            <p className="text-sm font-bold text-foreground flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                                5 Morangos picados
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Jantar */}
                <Card variant="glass" className="border-none bg-background/50 hover:bg-background/60 transition-all shadow-xl group">
                    <CardHeader className="pb-4">
                        <div className="flex items-center justify-between mb-2">
                            <Badge variant="outline" className="border-primary/20 text-primary font-black bg-primary/5 text-[10px]">19:30</Badge>
                            <IconWrapper icon={Utensils} variant="violet" size="sm" />
                        </div>
                        <CardTitle className="text-lg font-black tracking-tight group-hover:text-primary transition-colors">Jantar</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="space-y-2">
                            <p className="text-sm font-bold text-foreground flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                                Omelete de 2 ovos com espinafre
                            </p>
                            <p className="text-sm font-bold text-foreground flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                                Salada de tomate e pepino
                            </p>
                            <p className="text-sm font-bold text-muted-foreground/60 italic flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary/20" />
                                Chá de camomila
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Button variant="ghost" className="w-full h-14 rounded-2xl border border-dashed border-border/10 hover:bg-primary/5 text-[11px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-all">
                Ver lista completa de substituições <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
        </div>
    )
}
