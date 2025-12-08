"use client"

import React from 'react'
import { cn } from '@/lib/utils'
import { motion, HTMLMotionProps } from 'framer-motion'

interface GlassPanelProps extends HTMLMotionProps<"div"> {
    children: React.ReactNode
    className?: string
    variant?: 'base' | 'hover' | 'active'
}

export function GlassPanel({ children, className, variant = 'base', ...props }: GlassPanelProps) {
    const variants = {
        base: "bg-background/40 backdrop-blur-xl border border-border/10 shadow-lg",
        hover: "bg-card/60 backdrop-blur-2xl border border-primary/30 shadow-primary/10",
        active: "bg-primary/20 backdrop-blur-2xl border border-primary/50 shadow-primary/20"
    }

    return (
        <motion.div
            className={cn(
                "rounded-2xl transition-all duration-300",
                variants[variant],
                className
            )}
            {...props}
        >
            {children}
        </motion.div>
    )
}

export function NeonText({ children, className, color = 'indigo' }: { children: React.ReactNode, className?: string, color?: 'indigo' | 'green' | 'orange' }) {
    // Map internal colors to design system vars roughly
    const colors = {
        indigo: "text-primary drop-shadow-[0_0_8px_rgba(var(--primary),0.5)]",
        green: "text-emerald-500 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]", // Keep some distinct colors for status
        orange: "text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]"
    }

    return (
        <span className={cn("font-mono font-medium tracking-tight", colors[color], className)}>
            {children}
        </span>
    )
}
