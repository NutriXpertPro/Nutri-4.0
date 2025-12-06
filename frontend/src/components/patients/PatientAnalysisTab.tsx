"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts'
import { TrendingDown, User } from "lucide-react"

const weightData = [
    { date: 'Jan', peso: 85.0 },
    { date: 'Fev', peso: 83.5 },
    { date: 'Mar', peso: 81.2 },
    { date: 'Abr', peso: 79.8 },
    { date: 'Mai', peso: 78.5 },
    { date: 'Jun', peso: 76.0 },
    { date: 'Jul', peso: 74.5 },
    { date: 'Ago', peso: 72.5 }, // Atual
]

const compositionData = [
    { name: 'Massa Magra', atual: 32, meta: 35 },
    { name: 'Gordura', atual: 28, meta: 22 },
    { name: 'Água', atual: 55, meta: 60 },
]

export function PatientAnalysisTab() {
    // Função para pegar a cor primária do CSS variable (simplificada para o exemplo, idealmente usaria um hook de tema)
    // Como o Recharts precisa de hex, vamos usar uma cor padrão que combina com tudo ou tentar ler do style qdo possível
    // Para simplificar e garantir coesão, vamos usar classes tailwind para textos/icones e cores neutras/primárias nos gráficos

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h3 className="text-lg font-medium">Análise Corporal</h3>
                    <p className="text-sm text-muted-foreground">Evolução dos indicadores físicos nos últimos 6 meses</p>
                </div>
                <Select defaultValue="6m">
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Período" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="3m">Últimos 3 meses</SelectItem>
                        <SelectItem value="6m">Últimos 6 meses</SelectItem>
                        <SelectItem value="1y">Último ano</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Gráfico de Evolução de Peso */}
                <Card className="col-span-2 lg:col-span-1 border-primary/20 bg-primary/5">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingDown className="h-5 w-5 text-primary" />
                            Evolução de Peso
                        </CardTitle>
                        <CardDescription>
                            Redução total de <span className="font-bold text-primary">12.5kg</span> desde o início
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={weightData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorPeso" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}kg`} domain={['dataMin - 5', 'dataMax + 5']} />
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '12px', borderColor: 'hsl(var(--border))', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        itemStyle={{ color: 'hsl(var(--foreground))' }}
                                        labelStyle={{ color: 'hsl(var(--muted-foreground))' }}
                                        formatter={(value) => [`${value} kg`, 'Peso']}
                                    />
                                    <Area type="monotone" dataKey="peso" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorPeso)" strokeWidth={2} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Composição Corporal */}
                <Card className="col-span-2 lg:col-span-1">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5 text-primary" />
                            Composição Corporal vs. Meta
                        </CardTitle>
                        <CardDescription>
                            Comparativo da última avaliação física
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={compositionData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e5e7eb" />
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 12 }} axisLine={false} />
                                    <Tooltip
                                        cursor={{ fill: 'transparent' }}
                                        contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '12px', borderColor: 'hsl(var(--border))' }}
                                        itemStyle={{ color: 'hsl(var(--foreground))' }}
                                    />
                                    <Legend />
                                    <Bar dataKey="atual" name="Atual (%)" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} barSize={20} />
                                    <Bar dataKey="meta" name="Meta (%)" fill="hsl(var(--muted))" radius={[0, 4, 4, 0]} barSize={20} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
