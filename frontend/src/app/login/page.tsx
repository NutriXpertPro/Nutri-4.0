"use client"

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const router = useRouter();

    useEffect(() => {
        // Redireciona para a página de autenticação combinada com a aba de login ativa
        router.push("/auth?tab=login");
    }, [router]);

    return null; // Não renderiza nada pois redireciona imediatamente
}
