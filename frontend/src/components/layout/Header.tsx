"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Search,
    Bell,
    Moon,
    Sun,
    LogOut,
    User,
    Settings,
    MessageSquare,
    Calendar,
    UtensilsCrossed,
    Palette,
    Check
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useTheme } from "next-themes"
import { useColor } from "@/components/color-provider"
import { useAuth } from "@/contexts/auth-context"
import api from "@/services/api";
import { notificationService } from "@/services/notification-service";

interface HeaderProps {
    className?: string
    sidebarCollapsed?: boolean
}

export function Header({ className, sidebarCollapsed }: HeaderProps) {
    const router = useRouter()
    const { theme, setTheme } = useTheme()
    const { color, setColor } = useColor()
    const { user, logout } = useAuth()
    const [mounted, setMounted] = React.useState(false)
    const [searchFocused, setSearchFocused] = React.useState(false)
    const [animateTrigger, setAnimateTrigger] = React.useState(0)

    // Trigger animation when color changes
    React.useEffect(() => {
        if (mounted) {
            setAnimateTrigger(prev => prev + 1)
        }
    }, [color])
    const [notifications, setNotifications] = React.useState<any[]>([]);
    const [unreadCount, setUnreadCount] = React.useState(0);

    React.useEffect(() => {
        setMounted(true)
    }, [])

    React.useEffect(() => {
        console.log('Header renderizado')
    }, [])

    // Carregar notificações e contagem não lida - Desativado temporariamente devido a erro no backend
    /* React.useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const response = await api.get('/notifications');
                const allNotifications = response.data;

                // Pegar as 5 mais recentes para mostrar no dropdown
                const recentNotifications = allNotifications.slice(0, 5);

                // Atualizar estado
                setNotifications(recentNotifications);

                // Calcular quantidade de não lidas
                const unread = allNotifications.filter((n: any) => !n.is_read).length;
                setUnreadCount(unread);

                // Atualizar badge no serviço de notificações
                notificationService.updateNotificationBadge(unread);
            } catch (error) {
                console.error('Erro ao carregar notificações:', error);
                // Em caso de erro, definir contagem como 0 para evitar confusão
                setUnreadCount(0);
                notificationService.updateNotificationBadge(0);
            }
        };

        if (user) {
            fetchNotifications();

            // Configurar polling para atualizações (a cada 30 segundos)
            const interval = setInterval(fetchNotifications, 30000);

            return () => clearInterval(interval);
        }
    }, [user]); */

    return (
        <header
            suppressHydrationWarning
            className={cn(
                "fixed top-0 right-0 z-50 h-16 bg-card/80 backdrop-blur-md border-b",
                "transition-all duration-300 ease-in-out",
                sidebarCollapsed ? "lg:left-[60px]" : "lg:left-[240px]",
                "left-0",
                className
            )}
            style={{ marginTop: '0' }}
        >
            <div className="flex items-center justify-between h-full px-4 lg:px-6">
                {/* Left: Logo (mobile) + Search */}
                <div className="flex items-center gap-4 flex-1">
                    {/* Logo/Brand Removed */}

                    {/* Search Bar */}
                    <div className={cn(
                        "relative flex-1 max-w-md hidden sm:block",
                        searchFocused && "max-w-lg"
                    )}>
                        <motion.div
                            key={`search-icon-${animateTrigger}`}
                            initial={{ scale: 1 }}
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 0.4 }}
                            className="absolute left-3 top-1/2 -translate-y-1/2"
                        >
                            <Search className="h-4 w-4 text-muted-foreground" />
                        </motion.div>
                        <input
                            type="text"
                            placeholder="Buscar pacientes, dietas... (Ctrl+K)"
                            className={cn(
                                "w-full h-9 pl-9 pr-4 rounded-lg",
                                "bg-muted/50 border border-transparent",
                                "text-sm placeholder:text-muted-foreground",
                                "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50",
                                "transition-all duration-200"
                            )}
                            onFocus={() => setSearchFocused(true)}
                            onBlur={() => setSearchFocused(false)}
                        />
                        <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden md:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground bg-muted rounded">
                            ⌘K
                        </kbd>
                    </div>
                </div>

                {/* Right: Theme, Notifications, Profile */}
                <div className="flex items-center gap-8">
                    {/* Theme Toggle */}
                    {mounted && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                            className="rounded-full"
                        >
                            <motion.div
                                key={`theme-icon-${animateTrigger}`}
                                initial={{ scale: 1 }}
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ duration: 0.4 }}
                            >
                                {theme === "dark" ? (
                                    <Sun className="h-4 w-4" />
                                ) : (
                                    <Moon className="h-4 w-4" />
                                )}
                            </motion.div>
                        </Button>
                    )}

                    {/* Experiment 1: Premium Color Selector */}
                    {mounted && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="rounded-full hover:bg-primary/10 hover:text-primary transition-all duration-300"
                                    title="Personalizar Cores"
                                >
                                    <motion.div
                                        key={`palette-icon-${animateTrigger}`}
                                        initial={{ scale: 1 }}
                                        animate={{ scale: [1, 1.2, 1] }}
                                        transition={{ duration: 0.4 }}
                                    >
                                        <Palette className="h-4 w-4" />
                                    </motion.div>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                align="end"
                                className="w-64 p-2 bg-background/80 backdrop-blur-xl border-border/40 shadow-2xl rounded-2xl overflow-hidden"
                            >
                                <DropdownMenuLabel className="px-3 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground opacity-70">
                                    Temas Profissionais
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator className="bg-border/10" />
                                <div className="grid grid-cols-1 gap-1 pt-1">
                                    {([
                                        { id: "monochrome", label: "Studio Minimal", color: "bg-zinc-500", desc: "Foco total no conteúdo" },
                                        { id: "teal", label: "Oceanic Zen", color: "bg-teal-400", desc: "Calma e equilíbrio" },
                                        { id: "blue", label: "Executive Blue", color: "bg-blue-400", desc: "Confiança e autoridade" },
                                        { id: "violet", label: "Royal Focus", color: "bg-violet-400", desc: "Criatividade e prestígio" },
                                        { id: "pink", label: "Vital Energy", color: "bg-pink-400", desc: "Vigor e proximidade" },
                                        { id: "amber", label: "Sunset Gold", color: "bg-amber-400", desc: "Calor e otimismo" },
                                        { id: "emerald", label: "Forest Zen", color: "bg-emerald-400", desc: "Saúde e vitalidade" }
                                    ] as const).map((c) => (
                                        <DropdownMenuItem
                                            key={c.id}
                                            onClick={() => setColor(c.id)}
                                            className={cn(
                                                "flex items-center gap-3 p-2.5 cursor-pointer rounded-xl transition-all duration-200",
                                                color === c.id ? "bg-primary/10 text-primary" : "hover:bg-muted/50"
                                            )}
                                        >
                                            <div className={cn("w-6 h-6 rounded-full border-2 border-white/20 shadow-sm flex items-center justify-center transition-transform", c.color, color === c.id && "scale-110")}>
                                                {color === c.id && <Check className="w-3 h-3 text-white" />}
                                            </div>
                                            <div className="flex flex-col min-w-0">
                                                <span className="text-xs font-semibold truncate">{c.label}</span>
                                                <span className="text-[10px] text-muted-foreground truncate opacity-70">{c.desc}</span>
                                            </div>
                                        </DropdownMenuItem>
                                    ))}
                                </div>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}

                    {/* Notifications - Desativado temporariamente devido a erro no backend */}
                    {/* {mounted && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="relative rounded-full">
                                    <Bell className="h-4 w-4" />
                                    {unreadCount > 0 && (
                                        <Badge
                                            variant="destructive"
                                            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px] animate-pulse"
                                        >
                                            {unreadCount}
                                        </Badge>
                                    )}
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-80">
                                <DropdownMenuLabel className="flex items-center justify-between">
                                    <span>Notificações</span>
                                    <Button
                                    variant="link"
                                    size="sm"
                                    className="h-auto p-0 text-xs"
                                    onClick={() => router.push('/notifications')}
                                >
                                    Ver todas
                                </Button>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                {notifications.map((notification) => (
                                    <DropdownMenuItem
                                        key={notification.id}
                                        className={cn(
                                            "flex items-start gap-3 p-3 cursor-pointer",
                                            !notification.is_read && "bg-accent"
                                        )}
                                    >
                                        <span className="mt-0.5">
                                            {notification.type === 'message' ? (
                                                <MessageSquare className="h-4 w-4 text-blue-500" />
                                            ) : notification.type === 'appointment' ? (
                                                <Calendar className="h-4 w-4 text-amber-500" />
                                            ) : notification.type === 'diet' ? (
                                                <UtensilsCrossed className="h-4 w-4 text-green-500" />
                                            ) : (
                                                <Bell className="h-4 w-4 text-gray-500" />
                                            )}
                                        </span>
                                        <div className="flex-1 min-w-0">
                                            <p className={cn(
                                                "text-sm truncate",
                                                !notification.is_read && "font-medium text-foreground"
                                            )}>
                                                {notification.title}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {new Date(notification.sent_at || notification.created_at).toLocaleString('pt-BR')}
                                            </p>
                                        </div>
                                        {!notification.is_read && (
                                            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                        )}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )} */}

                    {/* Profile Dropdown */}
                    {mounted && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="flex items-center gap-2 px-2">
                                    <motion.div
                                        key={`avatar-${animateTrigger}`}
                                        initial={{ scale: 1 }}
                                        animate={{ scale: [1, 1.1, 1] }}
                                        transition={{ duration: 0.4 }}
                                        className="h-8 w-8 rounded-full"
                                    >
                                        <Avatar className="h-8 w-8 overflow-hidden">
                                            <AvatarImage src={user?.avatar} className="h-full w-full object-cover" />
                                            <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                                                {user?.name?.substring(0, 2).toUpperCase() || "NP"}
                                            </AvatarFallback>
                                        </Avatar>
                                    </motion.div>
                                    <span className="hidden md:block text-sm font-medium max-w-[120px] truncate">
                                        {user?.name || "Nutricionista"}
                                    </span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => router.push("/profile")}>
                                    <User className="mr-2 h-4 w-4" />
                                    Perfil
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => router.push("/settings")}>
                                    <Settings className="mr-2 h-4 w-4" />
                                    Configurações
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive">
                                    <LogOut className="mr-2 h-4 w-4" />
                                    Sair
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>
            </div>
        </header>
    )
}
