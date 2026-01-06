"use client"

import * as React from "react"

export type ThemeColor = "monochrome" | "teal" | "blue" | "violet" | "pink" | "amber" | "emerald"


interface ColorContextType {
    color: ThemeColor
    setColor: (color: ThemeColor) => void
}

const ColorContext = React.createContext<ColorContextType>({
    color: "monochrome",
    setColor: () => null,
})

export function ColorProvider({ children }: { children: React.ReactNode }) {
    const [color, setColorCurrent] = React.useState<ThemeColor>("blue")

    React.useEffect(() => {
        const root = document.documentElement
        root.classList.remove("theme-teal", "theme-blue", "theme-violet", "theme-pink", "theme-amber", "theme-emerald")

        if (color !== "monochrome") {
            root.classList.add(`theme-${color}`)
        }
    }, [color])

    const setColor = (newColor: ThemeColor) => {
        if (newColor === color) return
        setColorCurrent(newColor)
    }

    return (
        <ColorContext.Provider value={{ color, setColor }}>
            {children}
        </ColorContext.Provider>
    )
}

export const useColor = () => React.useContext(ColorContext)
