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
} from "lucide-react"
import { useTheme } from "next-themes"
import { useColor } from "@/components/color-provider"
import { useAuth } from "@/contexts/auth-context"

interface HeaderProps {
    className?: string
    sidebarCollapsed?: boolean
}

// Mock notifications - será substituído por dados da API
const mockNotifications = [
    {
        id: 1,
        type: "message",
        icon: <MessageSquare className="h-4 w-4 text-blue-500" />,
        title: "Maria Silva enviou mensagem",
        time: "há 5 min",
        isUrgent: true, // Mensagem não respondida 24h+
    },
    {
        id: 2,
        type: "appointment",
        icon: <Calendar className="h-4 w-4 text-amber-500" />,
        title: "Consulta com João em 1 hora",
        time: "há 30 min",
        isUrgent: false,
    },
    {
        id: 3,
        type: "diet",
        icon: <UtensilsCrossed className="h-4 w-4 text-green-500" />,
        title: "Dieta de Ana vence em 3 dias",
        time: "há 2h",
        isUrgent: false,
    },
]

export function Header({ className, sidebarCollapsed }: HeaderProps) {
    const router = useRouter()
    const { theme, setTheme } = useTheme()
    const { color, setColor } = useColor()
    const { user, logout } = useAuth()
    const [mounted, setMounted] = React.useState(false)
    const [searchFocused, setSearchFocused] = React.useState(false)

    React.useEffect(() => {
        setMounted(true)
    }, [])

    React.useEffect(() => {
        console.log('Header renderizado')
    }, [])

    const unreadCount = mockNotifications.length

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
                    {/* Logo for mobile (hidden on desktop where sidebar shows it) */}
                    <div className="flex items-center gap-2 lg:hidden ml-10">
                        <span className="text-xl">🥗</span>
                        <span className="font-bold text-sm">NutriXpert</span>
                    </div>

                    {/* Search Bar */}
                    <div className={cn(
                        "relative flex-1 max-w-md hidden sm:block",
                        searchFocused && "max-w-lg"
                    )}>
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
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
                            {theme === "dark" ? (
                                <Sun className="h-4 w-4" />
                            ) : (
                                <Moon className="h-4 w-4" />
                            )}
                        </Button>
                    )}

                    {/* Color Selector */}
                    <div className="hidden md:flex gap-3 px-4">
                        {(["monochrome", "teal", "blue", "violet", "pink"] as const).map((c) => (
                            <button
                                key={c}
                                onClick={() => setColor(c)}
                                className={cn(
                                    "w-4 h-4 rounded-full border-2 transition-all",
                                    c === "monochrome" && "bg-zinc-500",
                                    c === "teal" && "bg-teal-400",
                                    c === "blue" && "bg-blue-400",
                                    c === "violet" && "bg-violet-400",
                                    c === "pink" && "bg-pink-400",
                                    color === c
                                        ? "ring-2 ring-offset-1 ring-offset-background border-foreground"
                                        : "border-transparent"
                                )}
                            />
                        ))}
                    </div>

                    {/* Notifications */}
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
                                <Button variant="link" size="sm" className="h-auto p-0 text-xs">
                                    Ver todas
                                </Button>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {mockNotifications.map((notification) => (
                                <DropdownMenuItem
                                    key={notification.id}
                                    className={cn(
                                        "flex items-start gap-3 p-3 cursor-pointer",
                                        notification.isUrgent && "bg-destructive/5 border-l-2 border-destructive"
                                    )}
                                >
                                    <span className="mt-0.5">{notification.icon}</span>
                                    <div className="flex-1 min-w-0">
                                        <p className={cn(
                                            "text-sm truncate",
                                            notification.isUrgent && "font-medium text-destructive"
                                        )}>
                                            {notification.title}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {notification.time}
                                        </p>
                                    </div>
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Profile Dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="flex items-center gap-2 px-2">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={user?.avatar} />
                                    <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                                        {user?.name?.substring(0, 2).toUpperCase() || "NP"}
                                    </AvatarFallback>
                                </Avatar>
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
                </div>
            </div>
        </header>
    )
}
