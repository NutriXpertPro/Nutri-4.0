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

interface SidebarItem {
    icon: React.ReactNode
    label: string
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
    patients: 32,
    appointments: 8,
    messages: 3,
    anamnesis: 2,
    notifications: 5,
}

export function Sidebar({ className, collapsed, onToggle }: SidebarProps) {
    const pathname = usePathname()
    // Estado interno caso não seja controlado externamente
    const [internalCollapsed, setInternalCollapsed] = React.useState(false)
    const [isMobileOpen, setIsMobileOpen] = React.useState(false)

    // Usa prop se definida, senão usa estado interno
    const isCollapsed = collapsed !== undefined ? collapsed : internalCollapsed

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
            icon: <MessageSquare className="h-5 w-5" />,
            label: "Xpert Messenger",
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
            badge: mockBadges.notifications,
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
                                className="text-lg font-bold tracking-tighter transition-colors ml-[-12px] text-foreground"
                                suppressHydrationWarning
                            >
                                Nutri<span className="text-emerald-500">Xpert</span>Pro
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
                                        title={isCollapsed ? item.label : undefined}
                                    >
                                        <span className={cn(
                                            "flex-shrink-0",
                                            isActive(item.href) && "text-primary",
                                            item.badgeVariant === "destructive" && item.badge && "animate-pulse text-destructive"
                                        )}>
                                            {item.icon}
                                        </span>
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
