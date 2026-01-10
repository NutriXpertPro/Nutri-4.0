"use client"

import { Bell, Moon, Sun, Palette, User, LogOut } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { usePatient } from "@/contexts/patient-context"
import { useTheme } from "next-themes"
import { useColorTheme } from "@/contexts/color-theme-context"
import { useState, useEffect } from "react"
import { useMessages } from "@/hooks/useMessages"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/contexts/auth-context"
import { notificationService } from "@/services/notification-service"

export function PatientHeaderV2({ onNavigate }: { onNavigate?: (tab: string) => void }) {
  const { patient } = usePatient()
  const { conversations } = useMessages()
  const { logout } = useAuth()
  const totalUnread = conversations.reduce((acc: number, conv: any) => acc + (conv.unread || 0), 0)
  const hasUnread = totalUnread > 0

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 px-4 flex items-center justify-between
      bg-background/60 backdrop-blur-xl border-b border-white/5 supports-[backdrop-filter]:bg-background/20 max-w-md mx-auto">

      {/* Brand Identity */}
      <div className="flex items-center gap-2 drop-shadow-sm">
        <div className="flex items-center gap-0 group select-none cursor-default">
          <div className="text-xl font-bold text-foreground flex items-center transition-all duration-300">
            <span className="mr-0.5" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.1)' }}>
              <span className="text-zinc-950 dark:text-white" style={{ fontSize: '1.2em', textShadow: '1px 1px 2px rgba(0,0,0,0.2)' }}>N</span>utri
            </span>
            <span className="text-emerald-500" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.1)' }}>
              <span className="text-[1.2em] font-black" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.2)' }}>X</span>pert
            </span>
            <span className="ml-0.5 text-foreground" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.1)' }}>
              <span className="text-[1.2em]" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.2)' }}>P</span>ro
            </span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* Toggle Theme */}
        <ThemeToggle />

        {/* Toggle Color */}
        <ColorToggle />

        <Button
          variant="ghost"
          size="icon"
          onClick={() => onNavigate?.('notifications')}
          className={`rounded-full w-9 h-9 relative ${hasUnread ? "text-red-500 animate-pulse" : "text-muted-foreground hover:text-foreground"}`}
        >
          <Bell className="w-5 h-5" />
          {hasUnread && (
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-background shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
          )}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="rounded-full p-0 w-9 h-9 border-2 border-emerald-500/20 ring-2 ring-background overflow-hidden hover:opacity-80 transition-opacity">
              <Avatar className="w-full h-full">
                <AvatarImage src={patient?.avatar} className="object-cover" />
                <AvatarFallback className="bg-emerald-500/10 text-emerald-500 font-medium">
                  {patient?.name?.[0] || "P"}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onNavigate?.('profile')}>
              <User className="mr-2 h-4 w-4" />
              Meu Perfil
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => notificationService.playNotificationSound()}>
              <Bell className="mr-2 h-4 w-4" />
              Testar Som 🔔
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}

function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="rounded-full w-9 h-9 opacity-0">
        <Sun className="w-5 h-5 text-muted-foreground" />
      </Button>
    )
  }

  return (
    <Button variant="ghost" size="icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="rounded-full w-9 h-9">
      {theme === 'dark' ? <Sun className="w-5 h-5 text-muted-foreground" /> : <Moon className="w-5 h-5 text-muted-foreground" />}
    </Button>
  )
}

function ColorToggle() {
  const { colorTheme, setColorTheme } = useColorTheme()

  const cycleColor = () => {
    const themes: ('monochrome' | 'teal' | 'blue' | 'violet' | 'pink' | 'amber' | 'emerald')[] =
      ['emerald', 'blue', 'violet', 'pink', 'amber', 'teal', 'monochrome']
    const currentIndex = themes.indexOf(colorTheme)
    const nextIndex = (currentIndex + 1) % themes.length
    setColorTheme(themes[nextIndex])
  }

  return (
    <Button variant="ghost" size="icon" onClick={cycleColor} className="rounded-full w-9 h-9">
      <Palette className="w-5 h-5 text-muted-foreground" />
    </Button>
  )
}
