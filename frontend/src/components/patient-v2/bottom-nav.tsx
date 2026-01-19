"use client"

import { Home, Calendar, UtensilsCrossed, TrendingUp, Menu, MessageSquare, FileText } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

interface PatientBottomNavProps {
  activeTab: string
  onTabChange: (id: string) => void
}

export function PatientBottomNav({ activeTab, onTabChange }: PatientBottomNavProps) {

  const navItems = [
    { id: "home", icon: Home, label: "Início" },
    { id: "diet", icon: UtensilsCrossed, label: "Dieta" },
    { id: "agenda", icon: Calendar, label: "Agenda" },
    { id: "evolution", icon: TrendingUp, label: "Evolução" },
    { id: "messages", icon: MessageSquare, label: "Msgs" }, // Shortened label for space
    { id: "exams", icon: FileText, label: "Exames" }, // Shortened label for space
    { id: "menu", icon: Menu, label: "Menu" },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 px-6 pb-6 pt-2
      bg-gradient-to-t from-background via-background/90 to-transparent">

      <div className="mx-auto max-w-md bg-card/90 backdrop-blur-xl border border-border/50 
        rounded-full h-16 px-2 flex items-center justify-between shadow-xl shadow-black/10 dark:shadow-black/50 transition-all duration-300">

        {navItems.map((item) => {
          const isActive = activeTab === item.id
          const Icon = item.icon

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className="relative flex flex-1 flex-col items-center justify-center h-full min-w-0"
            >
              {isActive && (
                <motion.div
                  layoutId="nav-pill"
                  className="absolute inset-0 bg-emerald-500/20 rounded-full my-2 mx-1"
                  initial={false}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}

              <Icon
                className={cn(
                  "w-6 h-6 transition-all duration-300 relative z-10",
                  isActive ? "text-emerald-400 scale-110" : "text-zinc-500 hover:text-zinc-300"
                )}
                strokeWidth={isActive ? 2.5 : 2}
              />
            </button>
          )
        })}
      </div>
    </nav>
  )
}
