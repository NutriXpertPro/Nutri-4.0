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

    const fetchUserProfile = async (token: string): Promise<boolean> => {
        try {
            // Use localhost and add /api/v1/ prefix
            const response = await fetch("http://localhost:8000/api/v1/users/me/", {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            })
            if (response.ok) {
                const userData = await response.json()
                setUser(userData)
                return true
            }
            return false
        } catch (error) {
            // Silently ignore 401/403 errors during dev as we might use mock data
            // console.error("Failed to fetch user profile", error) 
            return false
        }
    }

    useEffect(() => {
        const initAuth = async () => {
            const token = Cookies.get("accessToken")
            if (token) {
                // Keep token sync in case it's valid, but verify first
                localStorage.setItem('access_token', token)

                const isValid = await fetchUserProfile(token)

                if (isValid) {
                    setIsAuthenticated(true)
                } else {
                    // Token invalid/expired - cleanup
                    Cookies.remove("accessToken")
                    Cookies.remove("refreshToken")
                    localStorage.removeItem('access_token')
                    localStorage.removeItem('refresh_token')
                    setIsAuthenticated(false)
                    setUser(null)
                }
            } else {
                setIsAuthenticated(false)
                setUser(null)
            }
            setIsLoading(false)
        }
        initAuth()
    }, [])

    const login = async (tokens: { access: string; refresh: string }, redirect = true) => {
        Cookies.set("accessToken", tokens.access, { expires: 1 }) // 1 day
        Cookies.set("refreshToken", tokens.refresh, { expires: 7 }) // 7 days

        // Sync with localStorage for api.ts interceptor
        localStorage.setItem('access_token', tokens.access)
        localStorage.setItem('refresh_token', tokens.refresh)

        setIsAuthenticated(true)
        await fetchUserProfile(tokens.access)

        if (redirect) {
            router.push("/dashboard")
        }
    }

    const logout = () => {
        Cookies.remove("accessToken")
        Cookies.remove("refreshToken")

        // Clear localStorage
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')

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
