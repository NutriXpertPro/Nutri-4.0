"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useTheme } from "next-themes"
import { useColor } from "@/components/color-provider"
import { Moon, Sun, Eye, EyeOff, Loader2 } from "lucide-react"
import { FcGoogle } from "react-icons/fc"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"

export default function PatientLoginPage() {
    const router = useRouter()
    const { theme, setTheme } = useTheme()
    const { color, setColor } = useColor()

    const { login } = useAuth()
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        setIsLoading(true)

        try {
            // Chamada para a API de autenticação JWT do Django
            const response = await fetch("http://localhost:8000/api/token/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: email,
                    password: password,
                }),
            })

            if (!response.ok) {
                throw new Error("Credenciais inválidas")
            }

            const data = await response.json()

            // Usar o contexto para login (salva cookies e redireciona)
            // Pacientes vão para o dashboard/paciente
            login(data, false)
            router.push("/dashboard/paciente")

        } catch (err) {
            setError("Email ou senha incorretos. Tente novamente.")
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            {/* Theme Controls (canto superior direito) */}
            <div className="fixed top-4 right-4 flex items-center gap-4">
                {/* Dark/Light Toggle */}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                    className="rounded-full"
                >
                    {theme === "dark" ? (
                        <Sun className="h-5 w-5" />
                    ) : (
                        <Moon className="h-5 w-5" />
                    )}
                </Button>

                {/* Color Selector */}
                <div className="flex gap-1">
                    <button
                        onClick={() => setColor("monochrome")}
                        className={`w-5 h-5 rounded-full bg-zinc-500 border-2 transition-all ${color === "monochrome" ? "ring-2 ring-offset-2 ring-zinc-500 border-foreground" : "border-transparent"
                            }`}
                    />
                    <button
                        onClick={() => setColor("teal")}
                        className={`w-5 h-5 rounded-full bg-teal-400 border-2 transition-all ${color === "teal" ? "ring-2 ring-offset-2 ring-teal-400 border-foreground" : "border-transparent"
                            }`}
                    />
                    <button
                        onClick={() => setColor("blue")}
                        className={`w-5 h-5 rounded-full bg-blue-400 border-2 transition-all ${color === "blue" ? "ring-2 ring-offset-2 ring-blue-400 border-foreground" : "border-transparent"
                            }`}
                    />
                    <button
                        onClick={() => setColor("violet")}
                        className={`w-5 h-5 rounded-full bg-violet-400 border-2 transition-all ${color === "violet" ? "ring-2 ring-offset-2 ring-violet-400 border-foreground" : "border-transparent"
                            }`}
                    />
                    <button
                        onClick={() => setColor("pink")}
                        className={`w-5 h-5 rounded-full bg-pink-400 border-2 transition-all ${color === "pink" ? "ring-2 ring-offset-2 ring-pink-400 border-foreground" : "border-transparent"
                            }`}
                    />
                </div>
            </div>

            {/* Login Card */}
            <Card className="w-full max-w-md shadow-xl border border-border">
                <CardHeader className="text-center space-y-4">
                    {/* Logo/Brand */}
                    <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-3xl">👤</span>
                    </div>
                    <div>
                        <CardTitle className="text-2xl font-bold">NutriXpertPro</CardTitle>
                        <CardDescription className="mt-2">
                            Acompanhe sua evolução nutricional
                        </CardDescription>
                    </div>
                    <Badge variant="secondary" className="mx-auto">
                        Acesso Paciente
                    </Badge>
                </CardHeader>

                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4">
                        {/* Email */}
                        <div className="space-y-2">
                            <label htmlFor="email" className="text-sm font-medium">
                                Email
                            </label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="seu@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                autoComplete="email"
                                className="h-11"
                            />
                        </div>

                        {/* Password */}
                        <div className="space-y-2">
                            <label htmlFor="password" className="text-sm font-medium">
                                Senha
                            </label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    autoComplete="current-password"
                                    className="h-11 pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 p-3 rounded-md">
                                {error}
                            </div>
                        )}
                    </CardContent>

                    <CardFooter className="flex flex-col gap-4">
                        <Button
                            type="submit"
                            className="w-full h-11 text-base font-medium"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Entrando...
                                </>
                            ) : (
                                "Entrar"
                            )}
                        </Button>

                        <div className="relative w-full">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-border" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-background px-2 text-muted-foreground">
                                    Ou continue com
                                </span>
                            </div>
                        </div>

                        <Button
                            type="button"
                            variant="outline"
                            className="w-full h-11 text-base font-medium"
                            disabled={isLoading}
                        >
                            <FcGoogle className="mr-2 h-5 w-5" />
                            Entrar com Google
                        </Button>

                        <button
                            type="button"
                            className="text-sm text-muted-foreground hover:text-primary transition-colors"
                        >
                            Esqueceu sua senha?
                        </button>
                    </CardFooter>
                </form>
            </Card>

            {/* Footer */}
            <div className="fixed bottom-4 text-center text-xs text-muted-foreground">
                © 2024 NutriXpertPro. Todos os direitos reservados.
            </div>
        </div>
    )
}
