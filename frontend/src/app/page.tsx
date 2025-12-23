import React from "react";
import HeroSection from "@/components/landing-v2/HeroSection";
import DetailedFeatures from "@/components/landing-v2/DetailedFeatures";
import Methodology from "@/components/landing-v2/Methodology";
import TestimonialsSection from "@/components/landing-v2/TestimonialsSection";
import PricingSection from "@/components/landing-v2/PricingSection";
import Logo from "@/components/landing-v2/Logo";
import Link from "next/link";
import { Instagram, Linkedin, Twitter, MapPin } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const metadata = {
  title: "Nutri Xpert Pro | A Plataforma da Nutrição de Elite",
  description: "Software de nutrição com anamnese metabólica, app do paciente e gestão financeira.",
};

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#050505] selection:bg-emerald-500/30 font-sans">

      {/* Header Fixo Premium */}
      <header className="fixed top-0 w-full z-50 bg-[#050505]/80 backdrop-blur-xl border-b border-white/5 transition-all duration-300">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-0 group">
            <Logo />
            <div className="text-xl font-bold tracking-tighter text-white ml-[-15px]">
              Nutri<span className="text-emerald-500">Xpert</span>Pro
            </div>
          </Link>

          <nav className="hidden md:flex gap-8 text-sm font-medium text-neutral-400">
            <Link href="#features" className="hover:text-emerald-400 transition-colors">Funcionalidades</Link>
            <Link href="#methodology" className="hover:text-emerald-400 transition-colors">Metodologia</Link>
            <Link href="#testimonials" className="hover:text-emerald-400 transition-colors">Depoimentos</Link>
            <Link href="#pricing" className="hover:text-emerald-400 transition-colors">Planos</Link>
          </nav>

          <div className="flex items-center gap-4">
            <Link href="/login/paciente" className="text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors hidden sm:block">
              Sou Paciente
            </Link>
            <div className="h-4 w-px bg-white/10 hidden sm:block"></div>
            <Link href="/login" className="text-sm font-bold text-neutral-300 hover:text-white transition-colors">
              Entrar
            </Link>
            <Link
              href="/register"
              className="px-6 py-2.5 text-sm font-bold bg-white text-black rounded-full hover:bg-emerald-400 hover:text-black hover:scale-105 transition-all shadow-lg shadow-white/10"
            >
              Começar Agora
            </Link>
          </div>
        </div>
      </header>

      <HeroSection />

      <div id="features">
        <DetailedFeatures />
      </div>

      <div id="methodology">
        <Methodology />
      </div>

      <div id="testimonials">
        <TestimonialsSection />
      </div>

      <div id="pricing">
        <PricingSection />
      </div>

      {/* FAQ Section Minimalista */}
      <section id="faq" className="py-24 bg-[#080808] border-t border-white/5">
        <div className="container px-4 md:px-6 mx-auto max-w-3xl">
          <h2 className="text-3xl font-bold text-white mb-10 text-center">Perguntas Frequentes</h2>
          <Accordion type="single" collapsible className="w-full space-y-4">
            <AccordionItem value="item-1" className="border border-white/10 rounded-lg px-4 bg-[#111]">
              <AccordionTrigger className="text-white hover:text-emerald-400">Como funciona o desconto de R$ 49,90?</AccordionTrigger>
              <AccordionContent className="text-neutral-400">
                O desconto é automático para novos assinantes. Você paga apenas R$ 49,90 nos primeiros 3 meses. A partir do 4º mês, o valor se ajusta para R$ 69,90 mensais. Sem contratos de fidelidade no plano mensal.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2" className="border border-white/10 rounded-lg px-4 bg-[#111]">
              <AccordionTrigger className="text-white hover:text-emerald-400">Consigo importar dados de outros sistemas?</AccordionTrigger>
              <AccordionContent className="text-neutral-400">
                Sim! Nossa equipe de suporte auxilia na migração dos seus dados de pacientes (Dietbox, WebDiet, etc) via planilhas CSV para que você não perca seu histórico.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3" className="border border-white/10 rounded-lg px-4 bg-[#111]">
              <AccordionTrigger className="text-white hover:text-emerald-400">O App do paciente é pago à parte?</AccordionTrigger>
              <AccordionContent className="text-neutral-400">
                Não. O aplicativo para seus pacientes é 100% gratuito e ilimitado em todos os planos pagos. Seus pacientes baixam na loja e acessam com o login que você cria.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4" className="border border-white/10 rounded-lg px-4 bg-[#111]">
              <AccordionTrigger className="text-white hover:text-emerald-400">Meus dados estão seguros?</AccordionTrigger>
              <AccordionContent className="text-neutral-400">
                Absolutamente. Utilizamos criptografia de ponta a ponta e backups diários automáticos. Seguimos rigorosamente a LGPD para garantir a confidencialidade do seu consultório.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* Footer Profissional */}
      <footer className="pt-20 pb-10 bg-black border-t border-white/10">
        <div className="container px-6 mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-0 mb-6">
                <Logo />
                <div className="text-2xl font-bold tracking-tighter text-white ml-[-15px]">
                  Nutri<span className="text-emerald-500">Xpert</span>Pro
                </div>
              </div>
              <p className="text-neutral-500 max-w-sm mb-6">
                Tecnologia de ponta para nutricionistas que buscam excelência clínica e liberdade financeira.
              </p>
              <div className="flex gap-4">
                <Link href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-emerald-500 hover:text-black transition-all">
                  <Instagram className="w-5 h-5" />
                </Link>
                <Link href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-emerald-500 hover:text-black transition-all">
                  <Linkedin className="w-5 h-5" />
                </Link>
                <Link href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-emerald-500 hover:text-black transition-all">
                  <Twitter className="w-5 h-5" />
                </Link>
              </div>
            </div>

            <div>
              <h4 className="text-white font-bold mb-6">Produto</h4>
              <ul className="space-y-4 text-sm text-neutral-500">
                <li><Link href="#features" className="hover:text-emerald-400 transition-colors">Funcionalidades</Link></li>
                <li><Link href="#" className="hover:text-emerald-400 transition-colors">App do Paciente</Link></li>
                <li><Link href="#pricing" className="hover:text-emerald-400 transition-colors">Planos e Preços</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-6">Legal</h4>
              <ul className="space-y-4 text-sm text-neutral-500">
                <li><Link href="#" className="hover:text-emerald-400 transition-colors">Termos de Uso</Link></li>
                <li><Link href="#" className="hover:text-emerald-400 transition-colors">Política de Privacidade</Link></li>
                <li><Link href="#" className="hover:text-emerald-400 transition-colors">LGPD</Link></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-neutral-600 text-xs">
              © 2025 Nutri Xpert Pro. Todos os direitos reservados.
            </p>
            <div className="flex items-center gap-2 text-neutral-600 text-xs">
              <MapPin className="w-3 h-3" /> São Paulo, Brasil
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
