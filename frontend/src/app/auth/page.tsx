"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useTheme } from "next-themes"
import { useColor } from "@/components/color-provider"
import { Moon, Sun, Eye, EyeOff, Loader2 } from "lucide-react"
import { FcGoogle } from "react-icons/fc"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/contexts/auth-context"
import { getBaseURL } from "@/services/api"

export default function AuthPage() {
    const router = useRouter()
    const { theme, setTheme } = useTheme()
    const { color, setColor } = useColor()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    // Login states
    const { login } = useAuth()
    const [loginEmail, setLoginEmail] = useState("")
    const [loginPassword, setLoginPassword] = useState("")
    const [loginRememberMe, setLoginRememberMe] = useState(false)
    const [loginShowPassword, setLoginShowPassword] = useState(false)
    const [loginIsLoading, setLoginIsLoading] = useState(false)
    const [loginError, setLoginError] = useState("")

    // Register states
    const [registerFormData, setRegisterFormData] = useState({
        name: "",
        email: "",
        professional_title: "",
        gender: "",
        password: "",
        confirm_password: "",
    })
    const [registerShowPassword, setRegisterShowPassword] = useState(false)
    const [registerIsLoading, setRegisterIsLoading] = useState(false)
    const [registerError, setRegisterError] = useState("")

    // Handle login
    const handleLoginSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoginError("")
        setLoginIsLoading(true)

        try {
            const response = await fetch(`${getBaseURL()}auth/token/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: loginEmail,
                    password: loginPassword,
                }),
            })

            if (!response.ok) {
                throw new Error("Credenciais inválidas")
            }

            const data = await response.json()
            login(data)
        } catch (err) {
            setLoginError("Email ou senha incorretos. Tente novamente.")
            setLoginIsLoading(false)
        }
    }

    // Handle register
    const handleRegisterSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setRegisterError("")
        setRegisterIsLoading(true)

        if (registerFormData.password !== registerFormData.confirm_password) {
            setRegisterError("As senhas não coincidem.")
            setRegisterIsLoading(false)
            return
        }

        try {
            console.log("Sending data:", registerFormData)
            const response = await fetch(`${getBaseURL()}users/register/nutricionista/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: registerFormData.name,
                    email: registerFormData.email,
                    password: registerFormData.password,
                    confirm_password: registerFormData.confirm_password,
                    professional_title: registerFormData.professional_title,
                    gender: registerFormData.gender,
                }),
            })

            const data = await response.json()
            console.log("Response data:", data)

            if (!response.ok) {
                let errorMessage = "Erro ao criar conta."
                if (data.detail) errorMessage = data.detail
                else if (data.email) errorMessage = `Email: ${data.email[0]}`
                else if (data.password) errorMessage = `Senha: ${data.password[0]}`
                else if (data.professional_title) errorMessage = `Título: ${data.professional_title[0]}`
                else if (data.gender) errorMessage = `Gênero: ${data.gender[0]}`
                else errorMessage = JSON.stringify(data)

                throw new Error(errorMessage)
            }

            // Success - redirect to login
            router.push("/auth?tab=login&registered=true")
        } catch (err: any) {
            console.error("Registration error:", err)
            setRegisterError(err.message || "Ocorreu um erro ao registrar.")
        } finally {
            setRegisterIsLoading(false)
        }
    }

    const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target
        setRegisterFormData((prev) => ({ ...prev, [id]: value }))
    }

    const handleRegisterSelectChange = (value: string) => {
        setRegisterFormData((prev) => ({ ...prev, gender: value }))
    }

    if (!mounted) return null

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
                    {mounted ? (
                        theme === "dark" ? (
                            <Sun className="h-5 w-5" />
                        ) : (
                            <Moon className="h-5 w-5" />
                        )
                    ) : (
                        <Sun className="h-5 w-5" />
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

            {/* Auth Card */}
            <Card className="w-full max-w-md shadow-xl border border-border">
                <CardHeader className="text-center space-y-4">
                    <div>
                        <CardTitle className="text-2xl font-bold tracking-tighter flex items-center justify-center">
                            <span className="mr-1" style={{ textShadow: '1px 1px 2px rgba(255,255,255,0.1)' }}>
                                <span style={{ fontSize: '1.3em', textShadow: '1px 1px 2px rgba(255,255,255,0.2)' }}>N</span>utri
                            </span>
                            <span className="text-emerald-500" style={{ textShadow: '1px 1px 2px rgba(255,255,255,0.1)' }}>
                                <span className="text-[1.3em]" style={{ textShadow: '1px 1px 2px rgba(255,255,255,0.2)' }}>X</span>pert
                            </span>
                            <span className="ml-1" style={{ textShadow: '1px 1px 2px rgba(255,255,255,0.1)' }}>
                                <span className="text-[1.3em]" style={{ textShadow: '1px 1px 2px rgba(255,255,255,0.2)' }}>P</span>ro
                            </span>
                        </CardTitle>
                        <CardDescription className="mt-2">
                            Sistema Avançado de Nutrição
                        </CardDescription>
                    </div>
                    <Badge variant="secondary" className="mx-auto">
                        Acesso Nutricionista
                    </Badge>
                </CardHeader>

                <CardContent>
                    <Tabs defaultValue="login" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="login">Fazer Login</TabsTrigger>
                            <TabsTrigger value="register">Fazer Cadastro</TabsTrigger>
                        </TabsList>
                        <TabsContent value="login">
                            <form onSubmit={handleLoginSubmit}>
                                <CardContent className="space-y-4 p-0 pt-4">
                                    {/* Email */}
                                    <div className="space-y-2">
                                        <label htmlFor="loginEmail" className="text-sm font-medium">
                                            Email
                                        </label>
                                        <Input
                                            id="loginEmail"
                                            type="email"
                                            placeholder="seu@email.com"
                                            value={loginEmail}
                                            onChange={(e) => setLoginEmail(e.target.value)}
                                            required
                                            autoComplete="email"
                                            className="h-11"
                                        />
                                    </div>

                                    {/* Password */}
                                    <div className="space-y-2">
                                        <label htmlFor="loginPassword" className="text-sm font-medium">
                                            Senha
                                        </label>
                                        <div className="relative">
                                            <Input
                                                id="loginPassword"
                                                type={loginShowPassword ? "text" : "password"}
                                                placeholder="••••••••"
                                                value={loginPassword}
                                                onChange={(e) => setLoginPassword(e.target.value)}
                                                required
                                                autoComplete="current-password"
                                                className="h-11 pr-10"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setLoginShowPassword(!loginShowPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                            >
                                                {loginShowPassword ? (
                                                    <EyeOff className="h-4 w-4" />
                                                ) : (
                                                    <Eye className="h-4 w-4" />
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Remember Me & Forgot Password - Row */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="loginRemember"
                                                checked={loginRememberMe}
                                                onCheckedChange={(checked) => setLoginRememberMe(checked as boolean)}
                                            />
                                            <label
                                                htmlFor="loginRemember"
                                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                            >
                                                Lembrar-me
                                            </label>
                                        </div>
                                        <Link
                                            href="/auth/forgot-password"
                                            className="text-sm text-muted-foreground hover:text-primary transition-colors"
                                        >
                                            Esqueceu sua senha?
                                        </Link>
                                    </div>

                                    {/* Error Message */}
                                    {loginError && (
                                        <div className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 p-3 rounded-md">
                                            {loginError}
                                        </div>
                                    )}
                                </CardContent>

                                <CardFooter className="flex flex-col gap-4 p-0 pt-4">
                                    <Button
                                        type="submit"
                                        className="w-full h-11 text-base font-medium"
                                        disabled={loginIsLoading}
                                    >
                                        {loginIsLoading ? (
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
                                        disabled={loginIsLoading}
                                    >
                                        <FcGoogle className="mr-2 h-5 w-5" />
                                        Entrar com Google
                                    </Button>

                                    <div className="text-sm text-center text-muted-foreground">
                                        É paciente?{" "}
                                        <Link href="/login/paciente" className="text-primary hover:underline font-medium">
                                            Acesse aqui
                                        </Link>
                                    </div>
                                </CardFooter>
                            </form>
                        </TabsContent>
                        <TabsContent value="register">
                            <form onSubmit={handleRegisterSubmit}>
                                <CardContent className="space-y-4 p-0 pt-4">
                                    {/* Nome */}
                                    <div className="space-y-2">
                                        <label htmlFor="name" className="text-sm font-medium">Nome Completo</label>
                                        <Input
                                            id="name"
                                            placeholder="Ex: Ana Silva"
                                            value={registerFormData.name}
                                            onChange={handleRegisterChange}
                                            required
                                            className="h-11"
                                        />
                                    </div>

                                    {/* Email */}
                                    <div className="space-y-2">
                                        <label htmlFor="email" className="text-sm font-medium">Email</label>
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="seu@email.com"
                                            value={registerFormData.email}
                                            onChange={handleRegisterChange}
                                            required
                                            className="h-11"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        {/* Titulo Profissional */}
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Título Profissional</label>
                                            <select
                                                value={registerFormData.professional_title}
                                                onChange={(e) => setRegisterFormData(prev => ({ ...prev, professional_title: e.target.value }))}
                                                required
                                                className="w-full h-11 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                <option value="">Selecione</option>
                                                <option value="NUT">Nutricionista</option>
                                                <option value="DR">Dr.</option>
                                                <option value="DRA">Dra.</option>
                                                <option value="ESP">Especialista</option>
                                                <option value="MTR">Mestre</option>
                                                <option value="PHD">PhD</option>
                                            </select>
                                        </div>

                                        {/* Genero */}
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Gênero</label>
                                            <select
                                                value={registerFormData.gender}
                                                onChange={(e) => setRegisterFormData(prev => ({ ...prev, gender: e.target.value }))}
                                                required
                                                className="w-full h-11 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                <option value="">Selecione</option>
                                                <option value="M">Masculino</option>
                                                <option value="F">Feminino</option>
                                                <option value="O">Outro</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Password */}
                                    <div className="space-y-2">
                                        <label htmlFor="password" className="text-sm font-medium">Senha</label>
                                        <div className="relative">
                                            <Input
                                                id="password"
                                                type={registerShowPassword ? "text" : "password"}
                                                placeholder="••••••••"
                                                value={registerFormData.password}
                                                onChange={handleRegisterChange}
                                                required
                                                className="h-11 pr-10"
                                            />
                                            <button type="button" onClick={() => setRegisterShowPassword(!registerShowPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                                                {registerShowPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Confirm Password */}
                                    <div className="space-y-2">
                                        <label htmlFor="confirm_password" className="text-sm font-medium">Confirmar Senha</label>
                                        <Input
                                            id="confirm_password"
                                            type={registerShowPassword ? "text" : "password"}
                                            placeholder="••••••••"
                                            value={registerFormData.confirm_password}
                                            onChange={handleRegisterChange}
                                            required
                                            className="h-11"
                                        />
                                    </div>

                                    {registerError && (
                                        <div className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 p-3 rounded-md">
                                            {registerError}
                                        </div>
                                    )}
                                </CardContent>

                                <CardFooter className="flex flex-col gap-4 p-0 pt-4">
                                    <Button type="submit" className="w-full h-11 text-base font-medium" disabled={registerIsLoading}>
                                        {registerIsLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Registrando...</> : "Criar Conta"}
                                    </Button>

                                    <div className="text-sm text-center text-muted-foreground">
                                        Já tem uma conta?{" "}
                                        <Link href="/auth?tab=login" className="text-primary hover:underline font-medium">
                                            Fazer Login
                                        </Link>
                                    </div>
                                </CardFooter>
                            </form>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>

            {/* Footer */}
            <div className="fixed bottom-4 text-center text-xs text-muted-foreground">
                © 2024 NutriXpertPro. Todos os direitos reservados.
            </div>
        </div>
    )
}