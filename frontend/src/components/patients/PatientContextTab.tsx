"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { User, HeartPulse, Stethoscope, AlertCircle } from "lucide-react"
import { IconWrapper } from "@/components/ui/IconWrapper"

export function PatientContextTab() {
    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7 pb-10">
            {/* Dados Pessoais - Coluna Esquerda */}
            <Card variant="glass" className="col-span-3 border-none bg-background/50">
                <CardHeader className="flex flex-row items-center gap-4 pb-2">
                    <IconWrapper icon={User} variant="blue" size="md" />
                    <div>
                        <CardTitle className="text-xl font-black tracking-tight">Dados Pessoais</CardTitle>
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Informações Cadastrais</p>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6 pt-4">
                    <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                        <div className="space-y-1">
                            <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-60">Data Nascimento</div>
                            <div className="text-sm font-bold text-foreground">15/04/1992 <span className="text-primary font-black ml-1">(32 anos)</span></div>
                        </div>
                        <div className="space-y-1">
                            <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-60">Ocupação</div>
                            <div className="text-sm font-bold text-foreground">Advogada</div>
                        </div>
                        <div className="space-y-1">
                            <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-60">Estado Civil</div>
                            <div className="text-sm font-bold text-foreground">Casada</div>
                        </div>
                        <div className="space-y-1">
                            <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-60">Filhos</div>
                            <div className="text-sm font-bold text-foreground flex items-center gap-2">
                                01 <Badge variant="secondary" className="text-[9px] font-black bg-primary/10 text-primary border-none">2 anos</Badge>
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-border/5">
                        <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-60 mb-2">Contato Principal</div>
                        <div className="flex items-center gap-2 text-sm font-bold">
                            <span className="text-primary">adv.patricia@exemplo.com</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Histórico Clínico - Coluna Direita */}
            <Card variant="glass" className="col-span-4 border-none bg-background/50">
                <CardHeader className="flex flex-row items-center gap-4 pb-2">
                    <IconWrapper icon={HeartPulse} variant="emerald" size="md" />
                    <div>
                        <CardTitle className="text-xl font-black tracking-tight">Histórico de Saúde</CardTitle>
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Condições & Patologias</p>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6 pt-4">
                    <div className="bg-destructive/5 p-5 rounded-[1.5rem] border border-destructive/10">
                        <div className="font-black text-[11px] mb-3 flex items-center gap-2 text-destructive uppercase tracking-widest">
                            <AlertCircle className="h-4 w-4" />
                            Alergias & Restrições
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <Badge variant="destructive" className="font-black px-3 py-1 rounded-lg uppercase text-[10px] tracking-tight">Lactose</Badge>
                            <Badge variant="outline" className="font-black px-3 py-1 rounded-lg border-destructive/20 text-destructive/80 uppercase text-[10px] tracking-tight">Glúten (sensibilidade)</Badge>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <div className="font-black text-[11px] flex items-center gap-2 text-primary uppercase tracking-widest">
                                <Stethoscope className="h-4 w-4" />
                                Patologias
                            </div>
                            <ul className="space-y-2">
                                <li className="flex items-center gap-2 text-sm font-bold text-muted-foreground">
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                                    Hipotireoidismo <span className="text-[9px] font-black text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded ml-auto">Controlado</span>
                                </li>
                                <li className="flex items-center gap-2 text-sm font-bold text-muted-foreground">
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                                    Gastrite nervosa
                                </li>
                            </ul>
                        </div>

                        <div className="space-y-3">
                            <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-60">Medicamentos em uso</div>
                            <div className="bg-background/40 p-3 rounded-2xl border border-border/5">
                                <p className="text-sm font-bold text-foreground">Puran T4 <span className="text-primary">50mcg</span></p>
                                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-tighter mt-1">Uso contínuo (em jejum)</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Rotina Alimentar - Largura total */}
            <Card variant="glass" className="col-span-full border-none bg-background/50">
                <CardHeader className="flex flex-row items-center gap-4 pb-2">
                    <IconWrapper icon={User} variant="violet" size="md" />
                    <div>
                        <CardTitle className="text-xl font-black tracking-tight">Rotina e Hábitos</CardTitle>
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Estilo de Vida</p>
                    </div>
                </CardHeader>
                <CardContent className="pt-4">
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="p-5 rounded-[2rem] bg-indigo-500/5 border border-indigo-500/10 hover:bg-indigo-500/10 transition-all">
                            <h4 className="text-[11px] font-black text-indigo-600 uppercase tracking-[0.1em] mb-2 font-mono">SONO</h4>
                            <p className="text-sm font-bold text-foreground mb-1">Dorme ~6h por noite</p>
                            <p className="text-[10px] font-bold text-muted-foreground">Relata acordar frequentemente com sensação de cansaço.</p>
                        </div>
                        <div className="p-5 rounded-[2rem] bg-sky-500/5 border border-sky-500/10 hover:bg-sky-500/10 transition-all">
                            <h4 className="text-[11px] font-black text-sky-600 uppercase tracking-[0.1em] mb-2 font-mono">HIDRATAÇÃO</h4>
                            <p className="text-sm font-bold text-foreground mb-1">~1.5L por dia</p>
                            <div className="flex items-center gap-2 mt-2">
                                <div className="flex-1 h-1.5 bg-sky-500/10 rounded-full overflow-hidden">
                                    <div className="h-full bg-sky-500 w-[60%] shadow-[0_0_8px_rgba(14,165,233,0.4)]" />
                                </div>
                                <span className="text-[10px] font-black text-sky-600">60% DA META</span>
                            </div>
                        </div>
                        <div className="p-5 rounded-[2rem] bg-emerald-500/5 border border-emerald-500/10 hover:bg-emerald-500/10 transition-all">
                            <h4 className="text-[11px] font-black text-emerald-600 uppercase tracking-[0.1em] mb-2 font-mono">ATIVIDADE FÍSICA</h4>
                            <p className="text-sm font-bold text-foreground mb-1">Musculação</p>
                            <p className="text-[10px] font-bold text-muted-foreground">Frequência: <span className="text-emerald-600">3x/semana</span> • Nível: Iniciante</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
