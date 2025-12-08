// Simplified version of use-toast for immediate fix
import * as React from "react"

export const useToast = () => {
    return {
        toast: (props: any) => {
            console.log("Toast:", props)
            if (props.variant === "destructive") {
                alert(`Erro: ${props.title}\n${props.description}`)
            } else {
                alert(`${props.title}\n${props.description}`)
            }
        },
        dismiss: (dismissId?: string) => { },
    }
}

export const toast = (props: any) => {
    console.log("Toast:", props)
}
