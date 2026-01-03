"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, Play, Hexagon, ShieldCheck, Zap, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HeroSection() {
  const [logoError, setLogoError] = useState(false);

  return (
    <section className="relative w-full min-h-screen flex flex-col items-center justify-center overflow-hidden bg-[#050505] text-white pt-20">
      {/* Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2310b981' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}
        />
        <div className="absolute top-[-20%] left-[20%] w-[500px] h-[500px] bg-emerald-500/20 blur-[150px] rounded-full mix-blend-screen animate-pulse" />
        <div className="absolute bottom-[10%] right-[10%] w-[400px] h-[400px] bg-purple-600/10 blur-[120px] rounded-full mix-blend-screen" />
      </div>

      <div className="container relative z-10 px-4 md:px-6 flex flex-col items-center text-center flex-1 justify-center">

        {/* Badge de Atualização */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0a0a0a] border border-emerald-500/30 text-emerald-400 text-sm font-semibold mb-6 shadow-[0_0_20px_-5px_rgba(16,185,129,0.3)] whitespace-nowrap flex-shrink-0"
        >
          <Hexagon className="w-3 h-3 fill-current animate-pulse" />
          VERSÃO <span className="text-emerald-500" style={{ textShadow: '1px 1px 2px rgba(255,255,255,0.1)' }}><span style={{ fontSize: '20px', textShadow: '1px 1px 2px rgba(255,255,255,0.2)' }}>X</span>pert</span> 4.0 DISPONÍVEL
        </motion.div>

        {/* Headline Principal */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 max-w-5xl leading-tight"
        >
          BIOQUÍMICA APLICADA <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500 drop-shadow-[0_0_25px_rgba(16,185,129,0.4)]">
            EM ALTA PERFORMANCE
          </span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-lg md:text-xl text-neutral-400 max-w-3xl mb-10 leading-relaxed font-light whitespace-nowrap text-center mx-auto"
        >
          Aqui a <strong>Elite da Nutrição</strong> transforma seu consultório em um Ecosistema de monitoramento nutricional.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-5 items-center w-full justify-center mb-20"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative group"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl blur opacity-25 transition duration-1000"></div>
            <Button
              size="lg"
              className="relative h-14 px-10 text-lg bg-black hover:bg-black text-white border-0 shadow-[0_0_40px_-10px_rgba(0,0,0,0.6)] font-bold tracking-wide overflow-hidden"
              asChild
            >
              <Link href="/register">
                <span className="relative z-10 flex items-center">
                  Seja um<span className="ml-2 text-emerald-500" style={{ textShadow: '1px 1px 2px rgba(255,255,255,0.1)' }}><span style={{ fontSize: '20px', textShadow: '1px 1px 2px rgba(255,255,255,0.2)' }}>X</span>pert</span>
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </span>
                {/* Shine Effect with Frame Motion */}
                <motion.span
                  className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none"
                  initial={{ x: '-100%' }}
                  whileHover={{ x: '100%' }}
                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                />
              </Link>
            </Button>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="relative"
          >
            <Button
              size="lg"
              variant="outline"
              className="group h-14 px-8 text-lg border-neutral-700 bg-black/40 text-neutral-300 hover:bg-white/5 hover:text-white transition-all backdrop-blur-sm hover:border-emerald-500/50 overflow-hidden relative"
              asChild
            >
              <Link href="#tour" className="flex items-center">
                <Play className="mr-2 h-4 w-4 fill-current group-hover:scale-125 transition-transform text-emerald-500" />
                Tour pela Plataforma
                <motion.div
                  className="absolute inset-0 border border-emerald-500/0 group-hover:border-emerald-500/50 rounded-md"
                  initial={false}
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                />
              </Link>
            </Button>
          </motion.div>
        </motion.div>
      </div>

    </section>
  );
}
