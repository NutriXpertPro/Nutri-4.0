import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Lista de rotas que requerem autenticação
const protectedRoutes = [
    '/dashboard',
    '/patients',
    '/anamnesis',
    '/diets',
    '/calendar',
    '/messages',
    '/evaluations',
    '/lab-exams',
    '/notifications',
    '/settings',
]

// Lista de rotas públicas (não autenticadas)
const publicRoutes = ['/login', '/register', '/auth', '/']

export function middleware(request: NextRequest) {
    const token = request.cookies.get('accessToken')?.value
    const { pathname } = request.nextUrl

    // Verifica se é uma rota protegida
    const isProtectedRoute = protectedRoutes.some(route =>
        pathname === route || pathname.startsWith(`${route}/`)
    )

    // Rotas protegidas precisam de token
    if (isProtectedRoute && !token) {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    // Essa verificação foi removida para evitar loops de redirecionamento.
    // O AuthContext no cliente fará a validação real do token e redirecionará se necessário.
    /*
    if ((pathname === '/login' || pathname === '/register' || pathname === '/auth') && token) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    */

    return NextResponse.next()
}

export const config = {
    matcher: [
        // Rotas protegidas
        '/dashboard/:path*',
        '/patients/:path*',
        '/anamnesis/:path*',
        '/diets/:path*',
        '/calendar/:path*',
        '/messages/:path*',
        '/evaluations/:path*',
        '/lab-exams/:path*',
        '/notifications/:path*',
        '/settings/:path*',
        // Rotas públicas
        '/login/:path*',
        '/register/:path*',
        '/auth/:path*',
    ],
}

