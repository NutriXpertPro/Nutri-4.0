"use client";

import React from "react";
import { motion } from "framer-motion";
import { BrainCircuit, Smartphone, TrendingUp, Users, Zap, ShieldCheck } from "lucide-react";

const features = [
  {
    title: "Anamnese Inteligente (IA)",
    description: "Nossa IA analisa padrões nas respostas do paciente e sugere estratégias nutricionais antes mesmo da consulta começar.",
    icon: BrainCircuit,
    colSpan: "md:col-span-2",
    bg: "bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/20",
    textAccent: "text-indigo-400"
  },
  {
    title: "App do Paciente Incluso",
    description: "Fidelize com um app exclusivo onde seu paciente registra diário, vê a dieta e recebe alertas de hidratação.",
    icon: Smartphone,
    colSpan: "md:col-span-1",
    bg: "bg-neutral-900/50 border-neutral-800",
    textAccent: "text-emerald-400"
  },
  {
    title: "Gestão Financeira",
    description: "Controle pagamentos, emita recibos e visualize seu faturamento anual com gráficos claros.",
    icon: TrendingUp,
    colSpan: "md:col-span-1",
    bg: "bg-neutral-900/50 border-neutral-800",
    textAccent: "text-blue-400"
  },
  {
    title: "Comunidade Xpert",
    description: "Acesso exclusivo a grupos de mentoria e discussão de casos clínicos complexos.",
    icon: Users,
    colSpan: "md:col-span-2",
    bg: "bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-emerald-500/20",
    textAccent: "text-teal-400"
  },
];

export default function FeatureGrid() {
  return (
    <section className="py-24 bg-[#050505] relative overflow-hidden">
      <div className="container px-4 md:px-6 mx-auto">
        
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Tecnologia que <span className="text-emerald-500">potencializa</span> seu talento.
          </h2>
          <p className="text-neutral-400 text-lg">
            Ferramentas desenhadas para eliminar a burocracia e colocar o foco onde ele deve estar: no resultado do seu paciente.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`p-8 rounded-3xl border backdrop-blur-sm relative group overflow-hidden ${feature.colSpan} ${feature.bg}`}
            >
              <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                <feature.icon className="w-24 h-24" />
              </div>
              
              <div className="relative z-10">
                <div className={`p-3 rounded-xl bg-white/5 w-fit mb-6 ${feature.textAccent}`}>
                  <feature.icon className="w-8 h-8" />
                </div>
                
                <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-emerald-400 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-neutral-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
