"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
// import logo from "@/assets/logo.svg"; // Arquivo não existe
import {
    Home,
    Users,
    UtensilsCrossed,
    Calendar,
    MessageSquare,
    ClipboardList,
    Activity,
    TestTube2,
    Bell,
    Settings,
    Menu,
    X,
    ChevronLeft,
    ChevronRight,
} from "lucide-react"
import { motion } from "framer-motion"
import { useColor } from "@/components/color-provider"

interface SidebarItem {
    icon: React.ReactNode
    label: React.ReactNode
    href: string
    badge?: number | string
    badgeVariant?: "default" | "destructive" | "warning"
    isDivider?: boolean
}

interface SidebarProps {
    className?: string
    collapsed?: boolean
    onToggle?: (collapsed: boolean) => void
}

// Mock data - será substituído por dados reais da API
const mockBadges = {
    patients: 0,
    appointments: 0,
    messages: 0,
    anamnesis: 0,
}

export function Sidebar({ className, collapsed, onToggle }: SidebarProps) {
    const pathname = usePathname()
    // Estado interno caso não seja controlado externamente
    const [internalCollapsed, setInternalCollapsed] = React.useState(false)
    const [isMobileOpen, setIsMobileOpen] = React.useState(false)
    const [notificationCount, setNotificationCount] = React.useState(0)

    // Usa prop se definida, senão usa estado interno
    const isCollapsed = collapsed !== undefined ? collapsed : internalCollapsed
    const { color } = useColor()
    const [animateTrigger, setAnimateTrigger] = React.useState(0)

    // Trigger animation when color changes
    React.useEffect(() => {
        setAnimateTrigger(prev => prev + 1)
    }, [color])

    // Efeito para buscar o número de notificações não lidas
    React.useEffect(() => {
        const fetchNotificationCount = async () => {
            try {
                // Importar o serviço de notificações dinamicamente
                const notificationServiceModule = await import('@/services/notification-service');
                const notificationService = notificationServiceModule.notificationService;
                const count = await notificationService.fetchUnreadCount();
                setNotificationCount(count);
            } catch (error) {
                console.error('Erro ao buscar contagem de notificações:', error);
            }
        };

        fetchNotificationCount();

        // Atualizar periodicamente (a cada 30 segundos)
        const interval = setInterval(fetchNotificationCount, 30000);

        return () => clearInterval(interval);
    }, []);

    const handleToggle = () => {
        const newState = !isCollapsed
        if (onToggle) {
            onToggle(newState)
        } else {
            setInternalCollapsed(newState)
        }
    }

    const sidebarItems: SidebarItem[] = [
        {
            icon: <Home className="h-5 w-5" />,
            label: "Dashboard",
            href: "/dashboard",
        },
        {
            icon: <Users className="h-5 w-5" />,
            label: "Pacientes",
            href: "/patients",
            badge: mockBadges.patients,
            badgeVariant: "default",
        },
        {
            icon: <UtensilsCrossed className="h-5 w-5" />,
            label: "Dietas",
            href: "/diets",
        },
        {
            icon: <Calendar className="h-5 w-5" />,
            label: "Agenda",
            href: "/calendar",
            badge: mockBadges.appointments,
            badgeVariant: "default",
        },
        {
            icon: <MessageSquare className="h-5 w-5 text-emerald-500" />,
            label: (
                <span className="flex items-baseline group/lbl">
                    <span className="text-emerald-500 font-bold group-hover/lbl:drop-shadow-[0_0_8px_rgba(16,185,129,0.4)] transition-all drop-shadow-[0_1px_2px_rgba(16,185,129,0.2)]">
                        <span className="text-lg">X</span>pert
                    </span>
                    <span className="ml-1 text-black font-bold dark:text-white">Messenger</span>
                </span>
            ),
            href: "/messages",
            badge: mockBadges.messages,
            badgeVariant: "destructive", // Vermelho para mensagens não lidas
        },
        {
            icon: <ClipboardList className="h-5 w-5" />,
            label: "Anamneses",
            href: "/anamnesis",
            badge: mockBadges.anamnesis,
            badgeVariant: "warning",
        },
        {
            icon: <Activity className="h-5 w-5" />,
            label: "Avaliações",
            href: "/evaluations",
        },
        {
            icon: <TestTube2 className="h-5 w-5" />,
            label: "Exames",
            href: "/lab-exams",
        },
        { isDivider: true, icon: null, label: "", href: "" },
        {
            icon: <Bell className="h-5 w-5" />,
            label: "Notificações",
            href: "/notifications",
            badge: notificationCount,
            badgeVariant: "default",
        },
        {
            icon: <Settings className="h-5 w-5" />,
            label: "Configurações",
            href: "/settings",
        },
    ]

    const isActive = (href: string) => pathname === href

    return (
        <>
            {/* Mobile Hamburger Button */}
            <Button
                variant="ghost"
                size="icon"
                className="fixed top-4 left-4 z-[60] lg:hidden"
                onClick={() => setIsMobileOpen(!isMobileOpen)}
            >
                {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>

            {/* Mobile Overlay */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={cn(
                    "fixed left-0 top-0 z-40 h-screen bg-card border-r transition-all duration-300 ease-in-out",
                    // Desktop
                    "hidden lg:flex lg:flex-col",
                    isCollapsed ? "lg:w-[60px]" : "lg:w-[240px]",
                    // Mobile
                    isMobileOpen && "flex flex-col w-[240px] lg:hidden",
                    !isMobileOpen && "lg:flex",
                    className
                )}
            >
                {/* Logo */}
                <div className={cn(
                    "flex items-center border-b h-20",
                    isCollapsed ? "justify-center px-2" : "justify-center"
                )}>
                    <Link href="/dashboard" className="flex items-center group">
                        <div className="relative w-28 h-28 flex-shrink-0">
                            <img
                                src="/logo.png"
                                alt="Logo"
                                className="w-full h-full object-contain group-hover:scale-110 transition-transform"
                                style={{ filter: 'contrast(110%) brightness(105%)' }}
                            />
                        </div>
                        {!isCollapsed && (
                            <div
                                className="text-lg font-bold tracking-tighter transition-colors ml-[-15px] text-foreground flex items-center"
                                suppressHydrationWarning
                            >
                                <span className="mr-1 text-foreground drop-shadow-sm">
                                    <span className="text-2xl font-bold">N</span>utri
                                </span>
                                <span className="text-emerald-500 drop-shadow-[0_1px_2px_rgba(16,185,129,0.2)]">
                                    <span className="text-3xl font-black">X</span>pert
                                </span>
                                <span className="ml-1 text-foreground drop-shadow-sm">
                                    <span className="text-2xl font-bold">P</span>ro
                                </span>
                            </div>
                        )}
                    </Link>
                </div>

                {/* Navigation Items */}
                <nav className="flex-1 overflow-y-auto py-2">
                    <ul className="space-y-1 px-2">
                        {sidebarItems.map((item, index) => {
                            if (item.isDivider) {
                                return (
                                    <li key={`divider-${index}`} className="py-2">
                                        <div className="border-t mx-2" />
                                    </li>
                                )
                            }

                            return (
                                <li key={item.href}>
                                    <Link
                                        href={item.href}
                                        onClick={() => setIsMobileOpen(false)}
                                        className={cn(
                                            "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                                            "hover:bg-accent hover:text-accent-foreground",
                                            isActive(item.href) && "bg-primary/10 text-primary font-medium",
                                            isCollapsed && "justify-center px-2"
                                        )}
                                        title={isCollapsed && typeof item.label === 'string' ? item.label : undefined}
                                    >
                                        <motion.span
                                            key={`${item.href}-${animateTrigger}`}
                                            initial={{ scale: 1 }}
                                            animate={{ scale: [1, 1.3, 1] }}
                                            transition={{ duration: 0.4, ease: "easeOut" }}
                                            className={cn(
                                                "flex-shrink-0",
                                                isActive(item.href) && "text-primary",
                                                item.badgeVariant === "destructive" && item.badge && "animate-pulse text-destructive"
                                            )}
                                        >
                                            {item.icon}
                                        </motion.span>
                                        {!isCollapsed && (
                                            <>
                                                <span className="flex-1 truncate">{item.label}</span>
                                                {item.badge !== undefined && (
                                                    <Badge
                                                        variant={item.badgeVariant === "destructive" ? "destructive" : "secondary"}
                                                        className={cn(
                                                            "h-5 min-w-[20px] flex items-center justify-center text-xs",
                                                            item.badgeVariant === "destructive" && "animate-pulse",
                                                            item.badgeVariant === "warning" && "bg-amber-500 text-white"
                                                        )}
                                                    >
                                                        {item.badge}
                                                    </Badge>
                                                )}
                                            </>
                                        )}
                                        {isCollapsed && item.badge !== undefined && (
                                            <span className={cn(
                                                "absolute right-1 top-1 h-2 w-2 rounded-full",
                                                item.badgeVariant === "destructive" ? "bg-destructive animate-pulse" : "bg-primary"
                                            )} />
                                        )}
                                    </Link>
                                </li>
                            )
                        })}
                    </ul>
                </nav>

                {/* Collapse Toggle (Desktop only) */}
                <div className="hidden lg:flex border-t p-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-center"
                        onClick={handleToggle}
                    >
                        {isCollapsed ? (
                            <ChevronRight className="h-4 w-4" />
                        ) : (
                            <>
                                <ChevronLeft className="h-4 w-4 mr-2" />
                                <span>Recolher</span>
                            </>
                        )}
                    </Button>
                </div>
            </aside>
        </>
    )
}
