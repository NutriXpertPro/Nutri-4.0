"use client";

import React from "react";
import { motion } from "framer-motion";
import { Layers, Target, Clock, BarChart3, Users, Zap } from "lucide-react";

const steps = [
  {
    title: "Anamnese Metabólica 360º",
    desc: "Rastreamento profundo de sinais, sintomas e bioquímica para diagnósticos de precisão cirúrgica.",
    icon: Layers,
    color: "bg-blue-500"
  },
  {
    title: "Prescrição Inteligente",
    desc: "Algoritmos que otimizam calorias e macros baseados na individualidade bioquímica do seu paciente.",
    icon: Target,
    color: "bg-emerald-500"
  },
  {
    title: "App do Paciente Elite",
    desc: "Diário fotográfico, chat em tempo real e gráficos de evolução que garantem adesão extrema.",
    icon: Clock,
    color: "bg-purple-500"
  },
  {
    title: "Gestão Financeira Pro",
    desc: "Controle total de faturamento, recibos automáticos e fluxo de caixa integrados ao seu consultório.",
    icon: BarChart3,
    color: "bg-orange-500"
  },
  {
    title: (
      <>
        Comunidade <span className="text-emerald-500" style={{ textShadow: '1px 1px 2px rgba(255,255,255,0.1)' }}>
          <span style={{ fontSize: '1.3em', textShadow: '1px 1px 2px rgba(255,255,255,0.2)' }}>X</span>pert
        </span>
      </>
    ),
    desc: "Networking e mentoria direta com os maiores nomes da nutrição de alta performance.",
    icon: Users,
    color: "bg-teal-500"
  },
  {
    title: "Biofeedback em Tempo Real",
    desc: "Monitoramento constante da evolução para ajustes metabólicos imediatos e precisos.",
    icon: Zap,
    color: "bg-amber-500"
  }
];

export default function Methodology() {
  return (
    <section className="py-24 bg-[#080808] relative">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-3xl md:text-5xl font-black text-white mb-6 uppercase tracking-tighter">O Ecossistema <span className="text-emerald-500" style={{ textShadow: '1px 1px 2px rgba(255,255,255,0.1)' }}><span style={{ fontSize: '1.3em', textShadow: '1px 1px 2px rgba(255,255,255,0.2)' }}>X</span>pert</span></h2>
          <p className="text-neutral-500 max-w-2xl mx-auto text-lg">
            Muito além de um gerador de dietas. Uma metodologia completa para elevar o nível do seu atendimento.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all group"
            >
              <div className={`w-12 h-12 rounded-2xl ${step.color} flex items-center justify-center mb-6 shadow-lg shadow-black/20 group-hover:scale-110 transition-transform`}>
                <step.icon className="text-white w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">{step.title}</h3>
              <p className="text-neutral-400 text-sm leading-relaxed">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
