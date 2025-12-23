"use client";

import React from "react";
import { motion } from "framer-motion";
import { Dna, Activity, Wallet, Smartphone, ShieldCheck, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  {
    title: "Anamnese Metabólica 360º",
    subtitle: "RASTREAMENTO COMPLETO",
    description: "Não deixe nenhum detalhe fisiológico passar. Nosso módulo de anamnese investiga padrões de sono, funcionamento intestinal, histórico hormonal e carga de treino. Crie estratégias baseadas em dados reais, não apenas em calorias.",
    points: ["Análise de Ciclo Circadiano", "Rastreio de Disbiose Intestinal", "Histórico de Suplementação & Ergogênicos"],
    icon: Dna,
    color: "text-emerald-400",
    gradient: "from-emerald-500/20 to-teal-500/20"
  },
  {
    title: "App do Paciente Integrado",
    subtitle: "FIDELIZAÇÃO EXTREMA",
    description: "Seu paciente carrega sua prescrição no bolso. Diário alimentar com fotos, chat direto com você, alertas de hidratação e visualização de evolução de medidas. Transforme a adesão à dieta em uma experiência gamificada.",
    points: ["Diário Alimentar Fotográfico", "Gráficos de Evolução Corporal", "Chat Criptografado Nutri-Paciente"],
    icon: Smartphone,
    color: "text-purple-400",
    gradient: "from-purple-500/20 to-pink-500/20"
  },
  {
    title: "Gestão Financeira & Clínica",
    subtitle: "CONTROLE TOTAL",
    description: "Elimine planilhas paralelas. Gerencie pagamentos, emita recibos automáticos e visualize a saúde financeira do seu consultório em um dashboard intuitivo. Tenha clareza sobre seu faturamento mensal e anual.",
    points: ["Fluxo de Caixa em Tempo Real", "Emissão de Recibos em 1 Clique", "Agenda Inteligente Integrada"],
    icon: Wallet,
    color: "text-blue-400",
    gradient: "from-blue-500/20 to-indigo-500/20"
  }
];

export default function DetailedFeatures() {
  return (
    <section className="py-32 bg-[#050505] relative overflow-hidden">
      <div className="container px-4 md:px-6 mx-auto">
        
        <div className="mb-24 text-center max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Ferramentas de Elite para <br/>
            <span className="text-emerald-500">Nutricionistas Exigentes.</span>
          </h2>
          <p className="text-neutral-400 text-lg">
            O Nutri Xpert Pro não é apenas um software de dietas. É um ecossistema completo desenhado para centralizar sua operação clínica e elevar sua autoridade profissional.
          </p>
        </div>

        <div className="space-y-32">
          {features.map((feature, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7 }}
              className={`flex flex-col ${idx % 2 === 1 ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center gap-12 lg:gap-20`}
            >
              {/* Content Side */}
              <div className="flex-1 space-y-8">
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 ${feature.color} text-xs font-bold tracking-widest uppercase`}>
                  <feature.icon className="w-4 h-4" />
                  {feature.subtitle}
                </div>
                
                <h3 className="text-3xl md:text-4xl font-bold text-white leading-tight">
                  {feature.title}
                </h3>
                
                <p className="text-neutral-400 text-lg leading-relaxed">
                  {feature.description}
                </p>
                
                <ul className="space-y-4">
                  {feature.points.map((point, pIdx) => (
                    <li key={pIdx} className="flex items-center gap-3 text-neutral-200 font-medium">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center bg-white/5 ${feature.color}`}>
                        <ShieldCheck className="w-3 h-3" />
                      </div>
                      {point}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Visual Side (Mockup Placeholder) */}
              <div className="flex-1 w-full relative group">
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} blur-[80px] rounded-full opacity-40 group-hover:opacity-60 transition-opacity duration-1000`} />
                
                <div className="relative z-10 bg-[#0a0a0a] border border-white/10 rounded-2xl p-2 shadow-2xl overflow-hidden aspect-video flex items-center justify-center group-hover:scale-[1.02] transition-transform duration-500">
                    {/* Aqui entrariam os screenshots reais. Usando abstração geométrica por enquanto */}
                    <div className="w-full h-full bg-[#111] rounded-xl overflow-hidden relative">
                        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.02)_50%,transparent_75%,transparent_100%)] bg-[length:250%_250%] animate-[shimmer_3s_infinite]" />
                        
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                            <feature.icon className={`w-16 h-16 ${feature.color} opacity-20 mx-auto mb-4`} />
                            <p className="text-neutral-600 text-sm font-mono uppercase tracking-widest">Interface Preview</p>
                        </div>
                        
                        {/* Mock UI Elements */}
                        <div className="absolute top-4 left-4 right-4 h-4 bg-white/5 rounded w-1/3" />
                        <div className="absolute top-12 left-4 right-4 bottom-4 grid grid-cols-3 gap-4">
                            <div className="bg-white/5 rounded h-full col-span-2" />
                            <div className="bg-white/5 rounded h-full col-span-1" />
                        </div>
                    </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
