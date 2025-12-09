"use client"

import * as React from "react"

type ThemeColor = "monochrome" | "teal" | "blue" | "violet" | "pink"

interface ColorContextType {
    color: ThemeColor
    setColor: (color: ThemeColor) => void
}

const ColorContext = React.createContext<ColorContextType>({
    color: "monochrome",
    setColor: () => null,
})

export function ColorProvider({ children }: { children: React.ReactNode }) {
    const [color, setColor] = React.useState<ThemeColor>("blue")

    React.useEffect(() => {
        const root = document.documentElement
        root.classList.remove("theme-teal", "theme-blue", "theme-violet", "theme-pink")

        if (color !== "monochrome") {
            root.classList.add(`theme-${color}`)
        }
    }, [color])

    return (
        <ColorContext.Provider value={{ color, setColor }}>
            {children}
        </ColorContext.Provider>
    )
}

export const useColor = () => React.useContext(ColorContext)
