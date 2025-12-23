"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { LucideIcon } from "lucide-react"
import { IconWrapper } from "@/components/ui/IconWrapper"

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

    // Map variant to IconWrapper variant
    const iconVariant = variant === "theme" ? "default" : variant

    return (
        <Card
            variant="glass"
            className={cn(
                "group relative overflow-hidden",
                className
            )}
        >
            <CardContent className="relative p-6">
                <div className="flex items-start justify-between">
                    {/* Content */}
                    <div className="space-y-2">
                        <p className="text-data-label">
                            {title}
                        </p>
                        <p className="text-data-value text-4xl !font-normal">
                            {typeof value === "string" && value.includes("%")
                                ? `${animatedValue}%`
                                : animatedValue}
                        </p>
                        {(trend || subtitle) && (
                            <div className="flex items-center gap-2">
                                {trend && (
                                    <span
                                        className={cn(
                                            "text-xs px-1.5 py-0.5 rounded-full flex items-center gap-0.5",
                                            trend.isPositive !== false
                                                ? "bg-green-500/10 text-green-500"
                                                : "bg-red-500/10 text-red-500"
                                        )}
                                    >
                                        {trend.isPositive !== false ? "+" : ""}
                                        {trend.value}
                                        {trend.isPositive !== false ? "↑" : "↓"}
                                    </span>
                                )}
                                <span className="text-subtitle text-[11px]">
                                    {trend?.label || subtitle}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Icon */}
                    <IconWrapper
                        icon={Icon}
                        variant={iconVariant as any}
                        size="xl"
                        glow
                        className="group-hover:scale-110 group-hover:rotate-3 transition-transform"
                    />
                </div>
            </CardContent>
        </Card>
    )
}

// Skeleton version for loading state
export function StatCardSkeleton() {
    return (
        <Card variant="glass" className="relative overflow-hidden">
            <CardContent className="p-6">
                <div className="flex items-start justify-between">
                    <div className="space-y-3">
                        <div className="h-3 w-24 bg-muted animate-pulse rounded" />
                        <div className="h-10 w-16 bg-muted animate-pulse rounded" />
                        <div className="h-3 w-32 bg-muted animate-pulse rounded" />
                    </div>
                    <div className="w-12 h-12 bg-muted animate-pulse rounded-xl" />
                </div>
            </CardContent>
        </Card>
    )
}
