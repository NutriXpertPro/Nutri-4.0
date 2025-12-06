"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useTheme } from "next-themes"
import { useColor } from "@/components/color-provider"
import { Moon, Sun, Eye, EyeOff, Loader2, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function RegisterPage() {
    const router = useRouter()
    const { theme, setTheme } = useTheme()
    const { color, setColor } = useColor()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        professional_title: "",
        gender: "",
        password: "",
        confirm_password: "",
    })

    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target
        setFormData((prev) => ({ ...prev, [id]: value }))
    }

    const handleSelectChange = (value: string) => {
        setFormData((prev) => ({ ...prev, gender: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        setIsLoading(true)

        if (formData.password !== formData.confirm_password) {
            setError("As senhas não coincidem.")
            setIsLoading(false)
            return
        }

        try {
            console.log("Sending data:", formData) // Log data being sent
            const response = await fetch("http://127.0.0.1:8000/users/register/nutricionista/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                    confirm_password: formData.confirm_password,
                    professional_title: formData.professional_title,
                    gender: formData.gender,
                }),
            })

            const data = await response.json()
            console.log("Response data:", data) // Log backend response

            if (!response.ok) {
                // Tenta pegar erro específico do DJango ou usa mensagem genérica
                let errorMessage = "Erro ao criar conta."
                if (data.detail) errorMessage = data.detail
                else if (data.email) errorMessage = `Email: ${data.email[0]}`
                else if (data.password) errorMessage = `Senha: ${data.password[0]}`
                else if (data.professional_title) errorMessage = `Título: ${data.professional_title[0]}`
                else if (data.gender) errorMessage = `Gênero: ${data.gender[0]}`
                else errorMessage = JSON.stringify(data) // Fallback to show full object

                throw new Error(errorMessage)
            }

            // Sucesso - redirecionar para login
            router.push("/login?registered=true")
        } catch (err: any) {
            console.error("Registration error:", err)
            setError(err.message || "Ocorreu um erro ao registrar.")
        } finally {
            setIsLoading(false)
        }
    }

    if (!mounted) return null // Prevent hydration mismatch by rendering nothing until mounted

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            {/* Theme Controls */}
            <div className="fixed top-4 right-4 flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="rounded-full">
                    {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </Button>
                <div className="flex gap-1">
                    {["monochrome", "teal", "blue", "violet", "pink"].map((c) => (
                        <button
                            key={c}
                            onClick={() => setColor(c as any)}
                            className={`w-5 h-5 rounded-full border-2 transition-all ${color === c ? `ring-2 ring-offset-2 border-foreground` : "border-transparent"
                                }`}
                            style={{ backgroundColor: `var(--${c}-500)` }} // Fallback approximation or use specific classes if setup
                        >
                            <span className={`block w-full h-full rounded-full bg-${c}-400 opacity-0`}></span> {/* Hack hack due to dynamic classes */}
                        </button>
                    ))}
                    {/* Re-implementing specific colors clearly like login page to ensure compilation */}
                    <button onClick={() => setColor("monochrome")} className={`w-5 h-5 rounded-full bg-zinc-500 border-2 ${color === "monochrome" ? "ring-2 ring-offset-2 ring-zinc-500 border-foreground" : "border-transparent"}`} />
                    <button onClick={() => setColor("teal")} className={`w-5 h-5 rounded-full bg-teal-400 border-2 ${color === "teal" ? "ring-2 ring-offset-2 ring-teal-400 border-foreground" : "border-transparent"}`} />
                    <button onClick={() => setColor("blue")} className={`w-5 h-5 rounded-full bg-blue-400 border-2 ${color === "blue" ? "ring-2 ring-offset-2 ring-blue-400 border-foreground" : "border-transparent"}`} />
                    <button onClick={() => setColor("violet")} className={`w-5 h-5 rounded-full bg-violet-400 border-2 ${color === "violet" ? "ring-2 ring-offset-2 ring-violet-400 border-foreground" : "border-transparent"}`} />
                    <button onClick={() => setColor("pink")} className={`w-5 h-5 rounded-full bg-pink-400 border-2 ${color === "pink" ? "ring-2 ring-offset-2 ring-pink-400 border-foreground" : "border-transparent"}`} />
                </div>
            </div>

            <Card className="w-full max-w-lg shadow-xl border border-border mt-8 mb-8">
                <CardHeader className="text-center space-y-4">
                    <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-3xl">🥗</span>
                    </div>
                    <div>
                        <CardTitle className="text-2xl font-bold">Criar Conta</CardTitle>
                        <CardDescription className="mt-2">
                            Junte-se ao NutriXpertPro
                        </CardDescription>
                    </div>
                </CardHeader>

                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4">
                        {/* Nome */}
                        <div className="space-y-2">
                            <label htmlFor="name" className="text-sm font-medium">Nome Completo</label>
                            <Input id="name" placeholder="Ex: Ana Silva" value={formData.name} onChange={handleChange} required className="h-11" />
                        </div>

                        {/* Email */}
                        <div className="space-y-2">
                            <label htmlFor="email" className="text-sm font-medium">Email</label>
                            <Input id="email" type="email" placeholder="seu@email.com" value={formData.email} onChange={handleChange} required className="h-11" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {/* Titulo Profissional */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Título Profissional</label>
                                <Select onValueChange={(value) => setFormData(prev => ({ ...prev, professional_title: value }))} required>
                                    <SelectTrigger className="h-11">
                                        <SelectValue placeholder="Selecione" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="NUT">Nutricionista</SelectItem>
                                        <SelectItem value="DR">Dr.</SelectItem>
                                        <SelectItem value="DRA">Dra.</SelectItem>
                                        <SelectItem value="ESP">Especialista</SelectItem>
                                        <SelectItem value="MTR">Mestre</SelectItem>
                                        <SelectItem value="PHD">PhD</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Genero */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Gênero</label>
                                <Select onValueChange={handleSelectChange} required>
                                    <SelectTrigger className="h-11">
                                        <SelectValue placeholder="Selecione" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="M">Masculino</SelectItem>
                                        <SelectItem value="F">Feminino</SelectItem>
                                        <SelectItem value="O">Outro</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Password */}
                        <div className="space-y-2">
                            <label htmlFor="password" className="text-sm font-medium">Senha</label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    className="h-11 pr-10"
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>

                        {/* Confirm Password */}
                        <div className="space-y-2">
                            <label htmlFor="confirm_password" className="text-sm font-medium">Confirmar Senha</label>
                            <Input
                                id="confirm_password"
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                value={formData.confirm_password}
                                onChange={handleChange}
                                required
                                className="h-11"
                            />
                        </div>

                        {error && (
                            <div className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 p-3 rounded-md">
                                {error}
                            </div>
                        )}
                    </CardContent>

                    <CardFooter className="flex flex-col gap-4">
                        <Button type="submit" className="w-full h-11 text-base font-medium" disabled={isLoading}>
                            {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Registrando...</> : "Criar Conta"}
                        </Button>

                        <div className="text-sm text-center text-muted-foreground">
                            Já tem uma conta?{" "}
                            <Link href="/login" className="text-primary hover:underline font-medium">
                                Fazer Login
                            </Link>
                        </div>
                    </CardFooter>
                </form>
            </Card>
        </div>
    )
}
