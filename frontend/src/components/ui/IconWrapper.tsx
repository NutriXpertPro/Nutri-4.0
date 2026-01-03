import * as React from "react"
import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"

const iconWrapperVariants = cva(
    "relative flex items-center justify-center shrink-0 rounded-xl transition-all duration-300",
    {
        variants: {
            variant: {
                default: "bg-primary/10 text-primary",
                blue: "bg-blue-500/10 text-blue-500",
                amber: "bg-amber-500/10 text-amber-500",
                green: "bg-green-500/10 text-green-500",
                violet: "bg-violet-500/10 text-violet-500",
                emerald: "bg-emerald-500/10 text-emerald-500",
                rose: "bg-rose-500/10 text-rose-500",
                pink: "bg-pink-500/10 text-pink-500",
                indigo: "bg-indigo-500/10 text-indigo-500",
                ghost: "bg-transparent text-muted-foreground",
            },
            size: {
                sm: "h-8 w-8",
                md: "h-10 w-10",
                lg: "h-12 w-12",
                xl: "h-14 w-14", // Novo tamanho adicionado
            },
            glow: {
                true: "after:absolute after:inset-0 after:rounded-full after:bg-current after:opacity-10 after:blur-md",
                false: "",
            }
        },
        defaultVariants: {
            variant: "default",
            size: "md",
            glow: false,
        },
    }
)

interface IconWrapperProps extends VariantProps<typeof iconWrapperVariants> {
    icon: LucideIcon
    className?: string
    iconClassName?: string
}

export function IconWrapper({
    icon: Icon,
    variant,
    size,
    glow,
    className,
    iconClassName
}: IconWrapperProps) {
    const iconSizes = {
        sm: "h-4 w-4",
        md: "h-5 w-5",
        lg: "h-6 w-6",
        xl: "h-7 w-7", // Tamanho correspondente para o ícone
    }

    return (
        <div className={cn(iconWrapperVariants({ variant, size, glow, className }))}>
            <Icon className={cn(iconSizes[size || "md"], iconClassName)} />
        </div>
    )
}
