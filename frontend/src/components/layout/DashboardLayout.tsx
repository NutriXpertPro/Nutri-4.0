"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Sidebar } from "./Sidebar"
import { Header } from "./Header"

interface DashboardLayoutProps {
    children: React.ReactNode
    className?: string
}

export function DashboardLayout({ children, className }: DashboardLayoutProps) {
    const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false)

    // Detectar mudança no tamanho da sidebar através de observer ou estado compartilhado
    // Por enquanto, usamos estado local que será sincronizado depois

    return (
        <div className="min-h-screen bg-background">
            {/* Sidebar */}
            <Sidebar
                collapsed={sidebarCollapsed}
                onToggle={setSidebarCollapsed}
            />

            {/* Header */}
            <Header sidebarCollapsed={sidebarCollapsed} />

            {/* Main Content */}
            <main
                className={cn(
                    "min-h-screen pt-16 transition-all duration-300 ease-in-out",
                    // Desktop
                    sidebarCollapsed ? "lg:pl-[60px]" : "lg:pl-[240px]",
                    // Mobile (sem sidebar fixa)
                    "pl-0",
                    className
                )}
            >
                <div className="p-4 lg:p-6 w-full">
                    {children}
                </div>
            </main>
        </div>
    )
}

// Export componentes para uso individual se necessário
export { Sidebar } from "./Sidebar"
export { Header } from "./Header"
