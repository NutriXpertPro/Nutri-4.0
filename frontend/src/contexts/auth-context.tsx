"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import Cookies from "js-cookie"
import { useRouter } from "next/navigation"

interface User {
    id: number
    email: string
    name?: string
    user_type?: string
    professional_title?: string
    gender?: string
}

interface AuthContextType {
    user: User | null
    isAuthenticated: boolean
    isLoading: boolean
    login: (tokens: { access: string; refresh: string }, redirect?: boolean) => void
    logout: () => void
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    login: () => { },
    logout: () => { },
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const router = useRouter()

    const fetchUserProfile = async (token: string) => {
        try {
            const response = await fetch("http://127.0.0.1:8000/users/me/", {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            })
            if (response.ok) {
                const userData = await response.json()
                setUser(userData)
            }
        } catch (error) {
            // Silently ignore 401/403 errors during dev as we might use mock data
            // console.error("Failed to fetch user profile", error) 
        }
    }

    useEffect(() => {
        const initAuth = async () => {
            const token = Cookies.get("accessToken")
            if (token) {
                setIsAuthenticated(true)
                await fetchUserProfile(token)
            }
            setIsLoading(false)
        }
        initAuth()
    }, [])

    const login = async (tokens: { access: string; refresh: string }, redirect = true) => {
        Cookies.set("accessToken", tokens.access, { expires: 1 }) // 1 day
        Cookies.set("refreshToken", tokens.refresh, { expires: 7 }) // 7 days
        setIsAuthenticated(true)
        await fetchUserProfile(tokens.access)

        if (redirect) {
            router.push("/dashboard")
        }
    }

    const logout = () => {
        Cookies.remove("accessToken")
        Cookies.remove("refreshToken")
        setUser(null)
        setIsAuthenticated(false)
        router.push("/login")
    }

    return (
        <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)
