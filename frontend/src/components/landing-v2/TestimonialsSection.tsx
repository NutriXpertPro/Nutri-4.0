"use client";

import React from "react";
import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Dra. Juliana Mendes",
    role: "Nutricionista Esportiva",
    text: "O nível de detalhe da anamnese metabólica mudou minha forma de atender. Consigo identificar problemas no sono e digestão que passavam despercebidos. O app do paciente reduziu em 80% as mensagens de dúvida no WhatsApp.",
    rating: 5
  },
  {
    name: "Dr. Ricardo Alencar",
    role: "Especialista em Hipertrofia",
    text: "Saí de planilhas de Excel para o Nutri Xpert Pro e meu faturamento dobrou. A gestão financeira integrada me mostrou onde eu estava perdendo dinheiro. A interface dark é linda e os pacientes adoram.",
    rating: 5
  },
  {
    name: "Dra. Carla Souza",
    role: "Nutrição Funcional",
    text: "Finalmente um software que entende a bioquímica e não apenas calorias. As ferramentas de rastreamento de sintomas são fantásticas. O suporte é rápido e eficiente.",
    rating: 5
  }
];

export default function TestimonialsSection() {
  return (
    <section className="py-24 bg-[#050505] relative border-t border-white/5">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Aprovado por Quem Vive de Nutrição.
          </h2>
          <p className="text-neutral-400">
            Junte-se a centenas de profissionais que elevaram o padrão de seus consultórios.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2 }}
              className="bg-[#0a0a0a] border border-white/5 p-8 rounded-2xl relative hover:border-emerald-500/30 transition-colors group"
            >
              <Quote className="absolute top-6 right-6 w-8 h-8 text-white/5 group-hover:text-emerald-500/20 transition-colors" />
              
              <div className="flex gap-1 mb-6">
                {[...Array(t.rating)].map((_, starI) => (
                  <Star key={starI} className="w-4 h-4 fill-emerald-500 text-emerald-500" />
                ))}
              </div>
              
              <p className="text-neutral-300 mb-8 leading-relaxed">
                "{t.text}"
              </p>
              
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neutral-700 to-neutral-800 flex items-center justify-center font-bold text-white">
                  {t.name.charAt(4)}
                </div>
                <div>
                  <h4 className="text-white font-medium">{t.name}</h4>
                  <p className="text-emerald-500 text-xs uppercase tracking-wider">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
