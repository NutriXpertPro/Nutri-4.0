"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Sidebar } from "./Sidebar"
import { Header } from "./Header"

interface DashboardLayoutProps {
    children: React.ReactNode
    className?: string
    hideHeader?: boolean
}

export function DashboardLayout({ children, className, hideHeader = false }: DashboardLayoutProps) {
    const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false)

    // Detectar mudança no tamanho da sidebar através de observer ou estado compartilhado
    // Por enquanto, usamos estado local que será sincronizado depois

    return (
        <div className="min-h-screen bg-background">
            {/* Sidebar - Only render if Header is NOT hidden (Standard Mode) */}
            {!hideHeader && (
                <Sidebar
                    collapsed={sidebarCollapsed}
                    onToggle={setSidebarCollapsed}
                />
            )}

            {/* Header (Optional) */}
            {!hideHeader && <Header sidebarCollapsed={sidebarCollapsed} />}

            {/* Main Content */}
            <main
                className={cn(
                    "min-h-screen transition-all duration-300 ease-in-out",
                    !hideHeader && "pt-16",
                    // Desktop Logic: Only apply padding if header/sidebar are visible
                    !hideHeader && (sidebarCollapsed ? "lg:pl-[60px]" : "lg:pl-[240px]"),
                    // If hiding header (Immersive), no padding
                    hideHeader && "p-0",
                    // Mobile (sem sidebar fixa)
                    "pl-0",
                    className
                )}
            >
                {/* Remove inner padding wrapper if className controls it, or allow children to fill height */}
                <div className={cn("w-full h-full", (className?.includes("p-0") || hideHeader) ? "p-0" : "p-4 lg:p-6")} style={{ overflow: 'hidden' }}>
                    {children}
                </div>
            </main>
        </div>
    )
}

// Export componentes para uso individual se necessário
export { Sidebar } from "./Sidebar"
export { Header } from "./Header"
