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
    Check,
    Volume2,
    VolumeX
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
    const previousUnreadCountRef = React.useRef(0);
    const isFirstLoad = React.useRef(true);

    // Helper para cores do tema
    const getThemeStyles = (colorId: string) => {
        const styles: Record<string, { icon: string, bg: string, text: string, dot: string, hover: string }> = {
            monochrome: {
                icon: "text-zinc-500",
                bg: "bg-zinc-500/10",
                text: "text-zinc-700 dark:text-zinc-300",
                dot: "bg-zinc-500",
                hover: "hover:bg-zinc-500/10"
            },
            teal: {
                icon: "text-teal-500",
                bg: "bg-teal-500/10",
                text: "text-teal-700 dark:text-teal-300",
                dot: "bg-teal-500",
                hover: "hover:bg-teal-500/10"
            },
            blue: {
                icon: "text-blue-500",
                bg: "bg-blue-500/10",
                text: "text-blue-700 dark:text-blue-300",
                dot: "bg-blue-500",
                hover: "hover:bg-blue-500/10"
            },
            violet: {
                icon: "text-violet-500",
                bg: "bg-violet-500/10",
                text: "text-violet-700 dark:text-violet-300",
                dot: "bg-violet-500",
                hover: "hover:bg-violet-500/10"
            },
            pink: {
                icon: "text-pink-500",
                bg: "bg-pink-500/10",
                text: "text-pink-700 dark:text-pink-300",
                dot: "bg-pink-500",
                hover: "hover:bg-pink-500/10"
            },
            amber: {
                icon: "text-amber-500",
                bg: "bg-amber-500/10",
                text: "text-amber-700 dark:text-amber-300",
                dot: "bg-amber-500",
                hover: "hover:bg-amber-500/10"
            },
            emerald: {
                icon: "text-emerald-500",
                bg: "bg-emerald-500/10",
                text: "text-emerald-700 dark:text-emerald-300",
                dot: "bg-emerald-500",
                hover: "hover:bg-emerald-500/10"
            }
        };
        return styles[colorId] || styles.blue; // Fallback para blue
    };

    const themeStyles = getThemeStyles(color);

    React.useEffect(() => {
        setMounted(true)
    }, [])

    React.useEffect(() => {
        console.log('Header renderizado')
    }, [])

    const [soundEnabled, setSoundEnabled] = React.useState(true);

    React.useEffect(() => {
        setSoundEnabled(notificationService.isSoundEnabled());
    }, []);

    const toggleNotificationSound = () => {
        const newState = notificationService.toggleSound();
        setSoundEnabled(newState || false);
    };

    // Carregar notificações e contagem não lida
    React.useEffect(() => {
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

                // Tocar som se houver NOVAS notificações não lidas (aumento na contagem)
                if (unread > previousUnreadCountRef.current) {
                    notificationService.playNotificationSound();
                }

                previousUnreadCountRef.current = unread;
                setUnreadCount(unread);

                // Atualizar badge externa (se houver implementação para favicon/título)
                // notificationService.updateNotificationBadge(unread); // Removido para evitar conflito com React
            } catch (error) {
                console.error('Erro ao carregar notificações:', error);
                // Em caso de erro, definir contagem como 0 para evitar confusão
                setUnreadCount(0);
            }
        };

        if (user) {
            fetchNotifications();

            // Configurar polling para atualizações (a cada 30 segundos)
            const interval = setInterval(fetchNotifications, 30000);

            return () => clearInterval(interval);
        }
    }, [user]);

    const handleNotificationClick = async (notification: any) => {
        try {
            // Marcar como lida
            if (!notification.is_read) {
                await notificationService.markAsRead(notification.id);
                // Atualizar localmente para feedback imediato
                setNotifications(prev => prev.map(n =>
                    n.id === notification.id ? { ...n, is_read: true } : n
                ));
                setUnreadCount(prev => Math.max(0, prev - 1));
            }

            // Navegação baseada no tipo
            if (notification.type === 'new_message' && notification.patient_id) {
                router.push(`/patient-dashboard-v2?patientId=${notification.patient_id}&tab=messages`);
            } else if (notification.type === 'appointment_reminder') {
                router.push('/appointments');
            } else if (notification.type === 'diet_expiry') {
                if (notification.patient_id) {
                    // Redireciona para a dieta do paciente ou perfil
                    router.push(`/patients/${notification.patient_id}`);
                } else {
                    router.push('/diets');
                }
            } else {
                // Default fallback
                router.push('/notifications');
            }
        } catch (error) {
            console.error("Erro ao processar clique na notificação:", error);
        }
    };

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

                    {/* Notifications */}
                    {mounted && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className={cn(
                                        "relative rounded-full transition-all duration-300",
                                        unreadCount > 0 && "text-red-500 animate-pulse"
                                    )}
                                    aria-label="Notifications"
                                >
                                    <Bell className="h-4 w-4" id="notification-icon" />
                                    {unreadCount > 0 && (
                                        <Badge
                                            id="notification-badge"
                                            variant="destructive"
                                            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px]"
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
                                        onClick={() => handleNotificationClick(notification)}
                                        className={cn(
                                            "flex items-start gap-3 p-3 cursor-pointer w-full focus:bg-transparent",
                                            !notification.is_read && themeStyles.bg,
                                            themeStyles.hover
                                        )}
                                    >
                                        <div className="flex-shrink-0 mt-0.5">
                                            {notification.patient_avatar ? (
                                                <Avatar className="h-9 w-9 border border-border/50">
                                                    <AvatarImage src={notification.patient_avatar} className="object-cover" />
                                                    <AvatarFallback className="text-[10px] bg-muted text-muted-foreground">
                                                        {(notification.patient_name || notification.title || "?").substring(0, 2).toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>
                                            ) : (
                                                <div className={cn("p-2 rounded-full", themeStyles.bg)}>
                                                    {notification.type === 'message' ? (
                                                        <MessageSquare className={cn("h-4 w-4", themeStyles.icon)} />
                                                    ) : notification.type === 'appointment' ? (
                                                        <Calendar className={cn("h-4 w-4", themeStyles.icon)} />
                                                    ) : notification.type === 'diet' ? (
                                                        <UtensilsCrossed className={cn("h-4 w-4", themeStyles.icon)} />
                                                    ) : (
                                                        <Bell className={cn("h-4 w-4", themeStyles.icon)} />
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start">
                                                <p className={cn(
                                                    "text-sm",
                                                    !notification.is_read ? `font-semibold ${themeStyles.text}` : "font-medium"
                                                )}>
                                                    {notification.patient_name || notification.title}
                                                </p>
                                                {!notification.is_read && (
                                                    <span className={cn("flex-shrink-0 w-2 h-2 rounded-full", themeStyles.dot)} />
                                                )}
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 leading-snug">
                                                {notification.message}
                                            </p>
                                            <p className="text-[10px] text-muted-foreground mt-1.5 opacity-70">
                                                {new Date(notification.sent_at || notification.created_at).toLocaleString('pt-BR', {
                                                    day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
                                                })}
                                            </p>
                                        </div>
                                    </DropdownMenuItem>
                                ))}
                                {notifications.length === 0 && (
                                    <div className="py-6 text-center text-muted-foreground text-sm">
                                        Nenhuma notificação nova
                                    </div>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}

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
                                <DropdownMenuItem onClick={toggleNotificationSound}>
                                    {soundEnabled ? (
                                        <Volume2 className="mr-2 h-4 w-4" />
                                    ) : (
                                        <VolumeX className="mr-2 h-4 w-4 text-muted-foreground" />
                                    )}
                                    {soundEnabled ? "Som Ativado" : "Som Desativado"}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => {
                                    console.log('Testando som via botão...');
                                    notificationService.playNotificationSound();
                                }}>
                                    <Bell className="mr-2 h-4 w-4" />
                                    Testar Som
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
