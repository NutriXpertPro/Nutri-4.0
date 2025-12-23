"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Check, Star, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

export default function PricingSection() {
  const [isAnnual, setIsAnnual] = useState(false);

  return (
    <section className="py-24 bg-[#080808] border-t border-white/5 relative overflow-hidden">
      {/* Glow Background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="container px-4 md:px-6 mx-auto relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Investimento Inteligente.</h2>
          <p className="text-neutral-400 mb-8">Escolha o plano que vai escalar seu consultório.</p>
          
          <div className="flex items-center justify-center gap-4 text-white mb-8">
            <span className={`text-sm ${!isAnnual ? 'text-white font-bold' : 'text-neutral-400'}`}>Mensal</span>
            <Switch 
              checked={isAnnual} 
              onCheckedChange={setIsAnnual} 
              className="data-[state=checked]:bg-emerald-500"
            />
            <span className={`text-sm ${isAnnual ? 'text-white font-bold' : 'text-neutral-400'}`}>
              Anual <span className="text-emerald-400 text-xs ml-1 font-normal">(Maior Desconto)</span>
            </span>
          </div>
        </div>

        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8 items-stretch">
            {/* Plano Mensal Promocional */}
            <motion.div 
              whileHover={{ y: -5 }}
              className={`p-8 rounded-3xl border relative flex flex-col ${!isAnnual ? 'bg-[#111] border-emerald-500/50 shadow-[0_0_40px_-10px_rgba(16,185,129,0.2)]' : 'bg-[#0d0d0d] border-white/10 opacity-60 grayscale'}`}
            >
                {!isAnnual && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-emerald-500 to-teal-500 text-black font-bold text-xs px-4 py-1.5 rounded-full shadow-lg flex items-center gap-2">
                        <Zap className="w-3 h-3 fill-black" />
                        OFERTA POR TEMPO LIMITADO
                    </div>
                )}
                
                <h3 className="text-xl font-bold text-white mb-2">Plano Xpert Mensal</h3>
                <p className="text-neutral-400 text-sm mb-6 h-10">
                    Flexibilidade total para você começar agora.
                </p>

                <div className="mb-8">
                    <div className="text-neutral-500 line-through text-lg font-medium">De R$ 69,90</div>
                    <div className="flex items-baseline gap-1">
                        <span className="text-5xl font-bold text-white">R$ 49,90</span>
                        <span className="text-neutral-400">/mês</span>
                    </div>
                    <p className="text-emerald-400 text-xs mt-2 font-medium">
                        *Preço garantido nos 3 primeiros meses.
                    </p>
                </div>
                
                <ul className="space-y-4 mb-8 flex-1">
                    {[
                        'Pacientes Ilimitados', 
                        'App do Paciente Completo',
                        'Anamnese Metabólica',
                        'Suporte Prioritário'
                    ].map((item, i) => (
                        <li key={i} className="flex items-center gap-3 text-neutral-300">
                            <Check className="w-5 h-5 text-emerald-500 shrink-0" />
                            {item}
                        </li>
                    ))}
                </ul>

                <Button className="w-full h-14 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-lg" asChild>
                    <Link href="/register?plan=monthly_promo">
                        Quero o Desconto Agora
                    </Link>
                </Button>
            </motion.div>

            {/* Plano Anual Pro */}
            <motion.div 
              whileHover={{ y: -5 }}
              className={`p-8 rounded-3xl border relative flex flex-col ${isAnnual ? 'bg-[#111] border-purple-500/50 shadow-[0_0_40px_-10px_rgba(168,85,247,0.2)]' : 'bg-[#0d0d0d] border-white/10'}`}
            >
                 {isAnnual && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-xs px-4 py-1.5 rounded-full shadow-lg">
                        MELHOR CUSTO-BENEFÍCIO
                    </div>
                )}

                <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                    Xpert Anual Pro <Star className="w-4 h-4 fill-purple-500 text-purple-500" />
                </h3>
                <p className="text-neutral-400 text-sm mb-6 h-10">
                    Compromisso de longo prazo com sua carreira.
                </p>
                
                <div className="mb-8">
                    <div className="text-neutral-500 text-lg font-medium">Equivalente a</div>
                    <div className="flex items-baseline gap-1">
                        <span className="text-5xl font-bold text-white">R$ 41,58</span>
                        <span className="text-neutral-400">/mês</span>
                    </div>
                    <p className="text-purple-400 text-xs mt-2 font-medium">
                        Faturado anualmente R$ 499,00 (Economia de R$ 339/ano)
                    </p>
                </div>
                
                <ul className="space-y-4 mb-8 flex-1">
                    {[
                        'Tudo do Plano Mensal', 
                        'Selo "Nutri Xpert" Verificado',
                        'Acesso à Comunidade VIP',
                        'Mentoria Trimestral em Grupo',
                        'Early Access a Novas Funcionalidades'
                    ].map((item, i) => (
                        <li key={i} className="flex items-center gap-3 text-white">
                            <div className="p-1 rounded-full bg-purple-500/20">
                                <Check className="w-4 h-4 text-purple-400 shrink-0" />
                            </div>
                            {item}
                        </li>
                    ))}
                </ul>
                
                <Button 
                    className={`w-full h-14 font-bold text-lg ${isAnnual ? 'bg-purple-600 hover:bg-purple-500 text-white' : 'bg-neutral-800 hover:bg-neutral-700 text-white'}`}
                    asChild
                >
                    <Link href="/register?plan=annual_pro">
                        Assinar Anual Pro
                    </Link>
                </Button>
            </motion.div>
        </div>

        <p className="text-center text-neutral-500 text-sm mt-8">
            * O valor promocional de R$ 49,90/mês no plano mensal é válido pelos primeiros 3 meses. Após este período, o valor retorna para R$ 69,90/mês.
        </p>
      </div>
    </section>
  );
}