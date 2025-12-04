"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useTheme } from "next-themes"
import { useColor } from "@/components/color-provider"
import { Moon, Sun, LogOut, Users, Calendar, FileText, Activity } from "lucide-react"

export default function DashboardPage() {
    const router = useRouter()
    const { theme, setTheme } = useTheme()
    const { color, setColor } = useColor()
    const [isAuthenticated, setIsAuthenticated] = useState(false)

    useEffect(() => {
        // Verificar se o usuário está autenticado
        const token = localStorage.getItem("accessToken")
        if (!token) {
            router.push("/login")
        } else {
            setIsAuthenticated(true)
        }
    }, [router])

    const handleLogout = () => {
        localStorage.removeItem("accessToken")
        localStorage.removeItem("refreshToken")
        router.push("/login")
    }

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="animate-pulse text-muted-foreground">Carregando...</div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="border-b bg-card">
                <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <span className="text-2xl">🥗</span>
                        <h1 className="text-xl font-bold">NutriXpertPro</h1>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Theme Toggle */}
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                            className="rounded-full"
                        >
                            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                        </Button>

                        {/* Color Selector */}
                        <div className="flex gap-1">
                            {["monochrome", "teal", "blue", "violet", "pink"].map((c) => (
                                <button
                                    key={c}
                                    onClick={() => setColor(c as any)}
                                    className={`w-4 h-4 rounded-full border-2 transition-all ${c === "monochrome" ? "bg-zinc-500" :
                                            c === "teal" ? "bg-teal-400" :
                                                c === "blue" ? "bg-blue-400" :
                                                    c === "violet" ? "bg-violet-400" : "bg-pink-400"
                                        } ${color === c ? "ring-2 ring-offset-1 border-foreground" : "border-transparent"}`}
                                />
                            ))}
                        </div>

                        {/* User Menu */}
                        <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                                <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                                    NP
                                </AvatarFallback>
                            </Avatar>
                            <Button variant="ghost" size="icon" onClick={handleLogout}>
                                <LogOut className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 py-8">
                <div className="mb-8">
                    <h2 className="text-3xl font-bold">Bem-vindo(a) de volta! 👋</h2>
                    <p className="text-muted-foreground mt-1">
                        Aqui está o resumo do seu dia.
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid md:grid-cols-4 gap-6 mb-8">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Pacientes Ativos
                            </CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">32</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                <span className="text-green-500">+5</span> este mês
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Consultas Hoje
                            </CardTitle>
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">8</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Próxima às <span className="text-primary font-medium">14:30</span>
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Dietas Ativas
                            </CardTitle>
                            <FileText className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">42</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                <span className="text-amber-500">3</span> vencem em breve
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Taxa de Adesão
                            </CardTitle>
                            <Activity className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">87%</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                <span className="text-green-500">+2%</span> vs mês anterior
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Actions */}
                <Card>
                    <CardHeader>
                        <CardTitle>Ações Rápidas</CardTitle>
                        <CardDescription>O que você gostaria de fazer agora?</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-wrap gap-3">
                        <Button>
                            <Users className="mr-2 h-4 w-4" />
                            Novo Paciente
                        </Button>
                        <Button variant="secondary">
                            <FileText className="mr-2 h-4 w-4" />
                            Criar Dieta
                        </Button>
                        <Button variant="outline">
                            <Calendar className="mr-2 h-4 w-4" />
                            Agendar Consulta
                        </Button>
                    </CardContent>
                </Card>
            </main>
        </div>
    )
}
