import { toast as sonnerToast } from "sonner"

export const useToast = () => {
    return {
        toast: (props: any) => {
            const { title, description, variant, duration = 5000, className, ...rest } = props

            if (variant === "destructive") {
                sonnerToast.error(title, {
                    description: description,
                    duration: duration,
                    ...rest
                })
            } else if (className?.includes("bg-green") || variant === "success") {
                sonnerToast.success(title, {
                    description: description,
                    duration: duration,
                    ...rest
                })
            } else {
                sonnerToast(title, {
                    description: description,
                    duration: duration,
                    ...rest
                })
            }
        },
        dismiss: (dismissId?: string) => { },
    }
}

export const toast = (props: any) => {
    const { title, description, duration = 5000 } = props
    sonnerToast(title, {
        description: description,
        duration: duration
    })
}
