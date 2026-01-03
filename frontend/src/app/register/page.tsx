"use client"

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
    const router = useRouter();

    useEffect(() => {
        // Redireciona para a página de autenticação combinada com a aba de registro ativa
        router.push("/auth?tab=register");
    }, [router]);

    return null; // Não renderiza nada pois redireciona imediatamente
}
