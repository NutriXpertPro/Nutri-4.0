"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="md:hidden">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(true)}
        className="text-white hover:bg-white/10"
      >
        <Menu className="h-6 w-6" />
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex flex-col">
          <div className="p-6 flex justify-end">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-white/10"
            >
              <X className="h-6 w-6" />
            </Button>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center space-y-8">
            <Link
              href="#features"
              className="text-2xl font-medium text-white hover:text-emerald-400 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Funcionalidades
            </Link>
            <Link
              href="#methodology"
              className="text-2xl font-medium text-white hover:text-emerald-400 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Metodologia
            </Link>
            <Link
              href="#testimonials"
              className="text-2xl font-medium text-white hover:text-emerald-400 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Depoimentos
            </Link>
            <Link
              href="#pricing"
              className="text-2xl font-medium text-white hover:text-emerald-400 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Planos
            </Link>
          </div>

          <div className="p-6 flex flex-col gap-4">
            <Link
              href="/login/paciente"
              className="text-center text-base sm:text-lg font-medium text-blue-400 hover:text-blue-300 transition-colors py-2"
              onClick={() => setIsOpen(false)}
            >
              Sou Paciente
            </Link>
            <Link
              href="/auth"
              className="w-full px-6 py-3 text-base sm:text-lg font-bold bg-white text-black rounded-full hover:bg-emerald-400 hover:text-black transition-all text-center"
              onClick={() => setIsOpen(false)}
            >
              Entrar
            </Link>
            <Link
              href="/auth?tab=register"
              className="w-full px-6 py-3 text-base sm:text-lg font-medium text-neutral-300 hover:text-white transition-colors text-center border border-white/10 rounded-full"
              onClick={() => setIsOpen(false)}
            >
              Começar Agora
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}