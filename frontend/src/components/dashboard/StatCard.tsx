"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { LucideIcon } from "lucide-react"

interface StatCardProps {
    title: string
    value: number | string
    icon: LucideIcon
    trend?: {
        value: number
        label?: string
        isPositive?: boolean
    }
    subtitle?: string
    variant?: "theme" | "blue" | "amber" | "green" | "violet"
    className?: string
}

// Hook para animar números
function useCountUp(end: number, duration: number = 1500) {
    const [count, setCount] = React.useState(0)
    const [hasAnimated, setHasAnimated] = React.useState(false)

    React.useEffect(() => {
        if (hasAnimated) return

        let startTime: number
        let animationFrame: number

        const animate = (currentTime: number) => {
            if (!startTime) startTime = currentTime
            const progress = Math.min((currentTime - startTime) / duration, 1)

            // Easing function (ease-out)
            const easeOut = 1 - Math.pow(1 - progress, 3)
            setCount(Math.floor(easeOut * end))

            if (progress < 1) {
                animationFrame = requestAnimationFrame(animate)
            } else {
                setHasAnimated(true)
            }
        }

        animationFrame = requestAnimationFrame(animate)
        return () => cancelAnimationFrame(animationFrame)
    }, [end, duration, hasAnimated])

    return count
}

const variantStyles = {
    blue: {
        gradient: "from-blue-500/10 via-transparent to-transparent",
        iconBg: "bg-blue-500/10",
        iconColor: "text-blue-500",
    },
    amber: {
        gradient: "from-amber-500/10 via-transparent to-transparent",
        iconBg: "bg-amber-500/10",
        iconColor: "text-amber-500",
    },
    green: {
        gradient: "from-green-500/10 via-transparent to-transparent",
        iconBg: "bg-green-500/10",
        iconColor: "text-green-500",
    },
    violet: {
        gradient: "from-violet-500/10 via-transparent to-transparent",
        iconBg: "bg-violet-500/10",
        iconColor: "text-violet-500",
    },
    theme: {
        gradient: "from-primary/10 via-transparent to-transparent",
        iconBg: "bg-primary/10",
        iconColor: "text-primary",
    },
}

export function StatCard({
    title,
    value,
    icon: Icon,
    trend,
    subtitle,
    variant = "theme",
    className,
}: StatCardProps) {
    const numericValue = typeof value === "number" ? value : parseInt(value.toString()) || 0
    const animatedValue = useCountUp(numericValue)
    const styles = variantStyles[variant]

    return (
        <Card
            className={cn(
                "relative overflow-hidden transition-all duration-300 ease-out",
                "hover:shadow-lg hover:-translate-y-1",
                // Glassmorphism
                "bg-card/80 backdrop-blur-sm border-border/50",
                className
            )}
        >
            {/* Gradient Background */}
            <div
                className={cn(
                    "absolute inset-0 bg-gradient-to-br opacity-50",
                    styles.gradient
                )}
            />

            <CardContent className="relative p-6">
                <div className="flex items-start justify-between">
                    {/* Content */}
                    <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                            {title}
                        </p>
                        <p className="text-4xl font-bold tracking-tight">
                            {typeof value === "string" && value.includes("%")
                                ? `${animatedValue}%`
                                : animatedValue}
                        </p>
                        {(trend || subtitle) && (
                            <div className="flex items-center gap-2 text-sm">
                                {trend && (
                                    <span
                                        className={cn(
                                            "font-medium",
                                            trend.isPositive !== false
                                                ? "text-green-500"
                                                : "text-red-500"
                                        )}
                                    >
                                        {trend.isPositive !== false ? "+" : ""}
                                        {trend.value}
                                        {trend.isPositive !== false ? "↑" : "↓"}
                                    </span>
                                )}
                                <span className="text-muted-foreground">
                                    {trend?.label || subtitle}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Icon */}
                    <div
                        className={cn(
                            "flex items-center justify-center w-12 h-12 rounded-xl",
                            styles.iconBg
                        )}
                    >
                        <Icon className={cn("h-6 w-6", styles.iconColor)} />
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

// Skeleton version for loading state
export function StatCardSkeleton() {
    return (
        <Card className="relative overflow-hidden">
            <CardContent className="p-6">
                <div className="flex items-start justify-between">
                    <div className="space-y-3">
                        <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                        <div className="h-10 w-16 bg-muted animate-pulse rounded" />
                        <div className="h-4 w-32 bg-muted animate-pulse rounded" />
                    </div>
                    <div className="w-12 h-12 bg-muted animate-pulse rounded-xl" />
                </div>
            </CardContent>
        </Card>
    )
}
