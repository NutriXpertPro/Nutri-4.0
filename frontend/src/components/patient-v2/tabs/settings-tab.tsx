import { Bell, Moon, Smartphone, Shield, LogOut, ChevronRight, Palette, Lock, Eye, Loader2, AlertCircle } from "lucide-react"
import { useState, useEffect } from "react"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useColorTheme } from "@/contexts/color-theme-context"
import { useSettings } from "@/hooks/useSettings"

export function SettingsTab({ onBack }: { onBack?: () => void }) {
    const { settings, loading, error, saving, updateSettings } = useSettings()
    const { colorTheme, setColorTheme } = useColorTheme()

    // Local state for form
    const [mealReminders, setMealReminders] = useState(true)
    const [mealAntecedence, setMealAntecedence] = useState("15")
    const [waterReminders, setWaterReminders] = useState(true)
    const [waterFrequency, setWaterFrequency] = useState("60")
    const [snoozeEnabled, setSnoozeEnabled] = useState(false)

    // Dialog States
    const [isThemeOpen, setIsThemeOpen] = useState(false)
    const [isPrivacyOpen, setIsPrivacyOpen] = useState(false)
    const [isLogoutOpen, setIsLogoutOpen] = useState(false)

    // Sync settings from API
    useEffect(() => {
        if (settings && settings.notifications) {
            setMealReminders(settings.notifications.email || false)
            setMealAntecedence(settings.notifications.reminderTime?.toString() || "15")
            setWaterReminders(settings.notifications.push || false)
            setSnoozeEnabled(settings.notifications.snooze || false)
        }
    }, [settings])

    // Handle save settings
    const handleSaveSettings = async () => {
        try {
            await updateSettings({
                notifications: {
                    email: mealReminders,
                    push: waterReminders,
                    sms: settings?.notifications.sms || false,
                    reminderTime: parseInt(mealAntecedence),
                    snooze: snoozeEnabled
                }
            })
        } catch (err) {
            console.error('Failed to save settings:', err)
        }
    }

    // Auto-save on changes
    useEffect(() => {
        if (settings && settings.notifications) {
            const timer = setTimeout(() => {
                handleSaveSettings()
            }, 1000)
            return () => clearTimeout(timer)
        }
    }, [mealReminders, mealAntecedence, waterReminders, snoozeEnabled])

    const themes = [
        { name: 'monochrome', label: 'Monocromático', color: 'bg-zinc-500' },
        { name: 'teal', label: 'Verde Mar', color: 'bg-teal-500' },
        { name: 'blue', label: 'Azul', color: 'bg-blue-500' },
        { name: 'violet', label: 'Violeta', color: 'bg-violet-500' },
        { name: 'pink', label: 'Rosa', color: 'bg-pink-500' },
        { name: 'amber', label: 'Âmbar', color: 'bg-amber-500' },
        { name: 'emerald', label: 'Esmeralda', color: 'bg-emerald-500' },
    ]

    // Loading state
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen pb-24">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Carregando configurações...</p>
                </div>
            </div>
        )
    }

    // Error state
    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen pb-24">
                <div className="text-center">
                    <AlertCircle className="w-8 h-8 text-destructive mx-auto mb-2" />
                    <p className="text-sm text-destructive mb-4">{error}</p>
                    <Button onClick={() => window.location.reload()} size="sm">
                        Tentar Novamente
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6 pb-20">
            <div className="px-1">
                <h2 className="text-2xl font-bold mb-2 text-foreground flex items-center gap-2">
                    Configurações
                    {saving && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
                </h2>
                <p className="text-muted-foreground text-sm">Gerencie suas preferências do app.</p>
            </div>

            <div className="space-y-4">
                {/* Meal Reminders Section */}
                <section className="bg-gradient-to-br from-card to-muted border-primary/50 shadow-lg shadow-primary/10 rounded-2xl overflow-hidden">
                    <div className="p-4 bg-primary/5 border-b border-primary/10">
                        <h3 className="font-semibold text-sm text-foreground flex items-center gap-2">
                            <Bell className="w-4 h-4 text-primary" /> Lembretes de Refeição
                        </h3>
                    </div>
                    <div className="p-4 space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-foreground">Receber Lembretes</p>
                                <p className="text-xs text-muted-foreground">Alertas antes das refeições</p>
                            </div>
                            <Switch
                                checked={mealReminders}
                                onCheckedChange={setMealReminders}
                                className="data-[state=checked]:bg-primary"
                            />
                        </div>

                        {mealReminders && (
                            <div className="space-y-4 pt-2 border-t border-border/5 animate-in slide-in-from-top-2 duration-200">
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <p className="text-sm text-muted-foreground">Antecedência</p>
                                        <select
                                            value={mealAntecedence}
                                            onChange={(e) => setMealAntecedence(e.target.value)}
                                            className="bg-background border border-border/10 text-xs text-foreground rounded-lg p-2 outline-none focus:ring-1 focus:ring-primary shadow-sm"
                                        >
                                            <option value="5">5 minutos</option>
                                            <option value="10">10 minutos</option>
                                            <option value="15">15 minutos</option>
                                            <option value="30">30 minutos</option>
                                        </select>
                                    </div>
                                    <p className="text-[10px] text-muted-foreground">Tempo para preparar ou aquecer sua refeição.</p>
                                </div>

                                <div className="flex items-center justify-between pt-2">
                                    <div>
                                        <p className="text-sm font-medium text-foreground">Soneca (Snooze)</p>
                                        <p className="text-xs text-muted-foreground">Adiar lembrete por 10 minutos</p>
                                    </div>
                                    <Switch
                                        checked={snoozeEnabled}
                                        onCheckedChange={setSnoozeEnabled}
                                        className="data-[state=checked]:bg-primary"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </section>

                {/* Water Reminders Section */}
                <section className="bg-gradient-to-br from-card to-muted border-blue-500/20 shadow-lg shadow-blue-500/5 rounded-2xl overflow-hidden">
                    <div className="p-4 bg-blue-500/5 border-b border-blue-500/10">
                        <h3 className="font-semibold text-sm text-foreground flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-blue-500" /> Lembretes de Hidratação
                        </h3>
                    </div>
                    <div className="p-4 space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-foreground">Receber Lembretes</p>
                                <p className="text-xs text-muted-foreground">Alertas para beber água</p>
                            </div>
                            <Switch
                                checked={waterReminders}
                                onCheckedChange={setWaterReminders}
                                className="data-[state=checked]:bg-blue-500"
                            />
                        </div>

                        {waterReminders && (
                            <div className="space-y-2 pt-2 border-t border-border/5 animate-in slide-in-from-top-2 duration-200">
                                <div className="flex justify-between items-center">
                                    <p className="text-sm text-muted-foreground">Frequência</p>
                                    <select
                                        value={waterFrequency}
                                        onChange={(e) => setWaterFrequency(e.target.value)}
                                        className="bg-background border border-border/10 text-xs text-foreground rounded-lg p-2 outline-none focus:ring-1 focus:ring-blue-500 shadow-sm"
                                    >
                                        <option value="30">30 minutos</option>
                                        <option value="60">1 hora</option>
                                        <option value="120">2 horas</option>
                                    </select>
                                </div>
                                <p className="text-[10px] text-muted-foreground">Intervalo entre lembretes de hidratação.</p>
                            </div>
                        )}
                    </div>
                </section>

                {/* Appearance */}
                <section className="bg-card/40 border border-border/10 rounded-2xl overflow-hidden">
                    <Dialog open={isThemeOpen} onOpenChange={setIsThemeOpen}>
                        <DialogTrigger asChild>
                            <button className="w-full p-4 flex items-center justify-between hover:bg-muted/10 transition-colors cursor-pointer">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-muted rounded-xl">
                                        <Palette className="w-5 h-5 text-primary" />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-sm font-medium text-foreground">Aparência</p>
                                        <p className="text-xs text-muted-foreground">Cores do tema</p>
                                    </div>
                                </div>
                                <ChevronRight className="w-5 h-5 text-muted-foreground" />
                            </button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                                <DialogTitle>Escolha seu Tema</DialogTitle>
                            </DialogHeader>
                            <div className="grid grid-cols-3 gap-3 py-4">
                                {themes.map(theme => (
                                    <button
                                        key={theme.name}
                                        onClick={() => {
                                            setColorTheme(theme.name as any)
                                            setIsThemeOpen(false)
                                        }}
                                        className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${colorTheme === theme.name ? 'border-primary bg-primary/5' : 'border-border/10 hover:border-border/30'
                                            }`}
                                    >
                                        <div className={`w-10 h-10 rounded-lg ${theme.color}`} />
                                        <span className="text-xs font-medium text-foreground">{theme.label}</span>
                                    </button>
                                ))}
                            </div>
                        </DialogContent>
                    </Dialog>
                </section>

                {/* Privacy */}
                <section className="bg-card/40 border border-border/10 rounded-2xl overflow-hidden">
                    <button className="w-full p-4 flex items-center justify-between hover:bg-muted/10 transition-colors">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-muted rounded-xl">
                                <Shield className="w-5 h-5 text-primary" />
                            </div>
                            <div className="text-left">
                                <p className="text-sm font-medium text-foreground">Privacidade</p>
                                <p className="text-xs text-muted-foreground">Dados e segurança</p>
                            </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    </button>
                </section>

                {/* Logout */}
                <Dialog open={isLogoutOpen} onOpenChange={setIsLogoutOpen}>
                    <DialogTrigger asChild>
                        <section className="bg-card/40 border border-destructive/20 rounded-2xl overflow-hidden hover:bg-destructive/5 transition-colors cursor-pointer">
                            <button className="w-full p-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-destructive/10 rounded-xl">
                                        <LogOut className="w-5 h-5 text-destructive" />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-sm font-medium text-destructive">Sair</p>
                                        <p className="text-xs text-muted-foreground">Desconectar da conta</p>
                                    </div>
                                </div>
                            </button>
                        </section>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Confirmar Saída</DialogTitle>
                        </DialogHeader>
                        <p className="text-sm text-muted-foreground py-4">
                            Você tem certeza que deseja sair da sua conta?
                        </p>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsLogoutOpen(false)}>
                                Cancelar
                            </Button>
                            <Button variant="destructive" onClick={() => {
                                localStorage.removeItem('access_token')
                                localStorage.removeItem('refresh_token')
                                window.location.href = '/login'
                            }}>
                                Sair
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    )
}
