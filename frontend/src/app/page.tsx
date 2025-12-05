"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Check, ChevronDown, ChevronUp,
  Users, FileText, Calendar, BarChart3,
  Shield, Smartphone,
  Star, ArrowRight, Menu, X
} from "lucide-react"

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const features = [
    { icon: FileText, title: "Planos Alimentares", description: "Monte dietas completas e personalizadas para cada perfil de paciente." },
    { icon: Users, title: "Gestão de Pacientes", description: "Cadastro completo com anamnese, medidas e histórico de consultas." },
    { icon: Calendar, title: "Agenda de Consultas", description: "Organize sua agenda e envie lembretes automáticos por WhatsApp." },
    { icon: BarChart3, title: "Evolução Nutricional", description: "Acompanhe peso, medidas e metas com gráficos claros." },
    { icon: Smartphone, title: "Acesso do Paciente", description: "Seu paciente acessa o plano alimentar pelo celular a qualquer hora." },
    { icon: Shield, title: "Segurança LGPD", description: "Dados protegidos com criptografia e conformidade total com a lei." },
  ]

  const testimonials = [
    { name: "Dra. Maria Silva", role: "Nutricionista Clínica", avatar: "MS", text: "Meus atendimentos ficaram muito mais organizados. Recomendo demais!" },
    { name: "Dr. João Santos", role: "Nutricionista Esportivo", avatar: "JS", text: "Os atletas amam receber o plano no celular. Facilitou muito meu trabalho." },
    { name: "Dra. Ana Costa", role: "Nutricionista Funcional", avatar: "AC", text: "Sistema completo e fácil de usar. Meus pacientes elogiam muito." },
    { name: "Dr. Pedro Lima", role: "Nutricionista Hospitalar", avatar: "PL", text: "Gerencio todos os pacientes do setor sem dificuldade. Excelente!" },
    { name: "Dra. Carla Rocha", role: "Nutricionista Pediátrica", avatar: "CR", text: "As mães adoram o acesso fácil às dietas das crianças. Muito prático!" },
    { name: "Dr. Lucas Mendes", role: "Nutricionista Oncológico", avatar: "LM", text: "Consegui organizar todo o acompanhamento nutricional da clínica." },
  ]

  const plans = [
    {
      name: "Free",
      price: "R$ 0",
      period: "/mês",
      description: "Para começar a usar",
      features: ["Até 10 pacientes", "Planos alimentares básicos", "1 modelo de dieta", "Suporte por email"],
      cta: "Começar Grátis",
      popular: false,
    },
    {
      name: "Xpert",
      price: "R$ 97",
      period: "/mês",
      description: "Para consultórios em crescimento",
      features: ["Até 100 pacientes", "Planos ilimitados", "Todos os modelos", "App do paciente", "Agenda integrada", "Suporte prioritário"],
      cta: "Assinar Xpert",
      popular: true,
    },
    {
      name: "Pro",
      price: "R$ 197",
      period: "/mês",
      description: "Para clínicas e equipes",
      features: ["Pacientes ilimitados", "Múltiplos nutricionistas", "Relatórios avançados", "Sua marca no app", "Configuração assistida", "Suporte 24/7"],
      cta: "Falar com Vendas",
      popular: false,
    },
  ]

  const faqs = [
    { question: "Posso testar antes de assinar?", answer: "Sim! O plano Free é gratuito para sempre e permite até 10 pacientes. Você pode fazer upgrade a qualquer momento." },
    { question: "Como meu paciente acessa a dieta?", answer: "Ele recebe um link por email ou WhatsApp e acessa pelo celular, sem precisar instalar nenhum app." },
    { question: "Meus dados estão seguros?", answer: "Sim. Usamos criptografia de ponta e seguimos todas as normas da LGPD. Seus dados nunca são compartilhados." },
    { question: "Posso cancelar quando quiser?", answer: "Sim, sem multas ou burocracia. Você mantém acesso até o fim do período pago." },
    { question: "Vocês dão treinamento?", answer: "Sim! Temos vídeos tutoriais para todos os planos. O plano Pro inclui treinamento personalizado." },
  ]

  return (
    <div className="min-h-screen bg-[#0d1117] text-white overflow-x-hidden">
      {/* Header Transparente */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-transparent">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Image src="/logo.png" alt="Logo" width={50} height={50} className="rounded-xl" />

          <nav className="hidden md:flex items-center gap-10">
            <a href="#features" className="text-base text-white font-bold hover:text-[#3fb950] transition-colors">Recursos</a>
            <a href="#pricing" className="text-base text-white font-bold hover:text-[#3fb950] transition-colors">Planos</a>
            <a href="#testimonials" className="text-base text-white font-bold hover:text-[#3fb950] transition-colors">Depoimentos</a>
            <a href="#faq" className="text-base text-white font-bold hover:text-[#3fb950] transition-colors">Dúvidas</a>
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" className="text-white font-bold hover:bg-white/10">Entrar</Button>
            </Link>
            <Link href="/login">
              <Button className="bg-[#238636] hover:bg-[#2ea043] text-white font-bold">Criar Conta</Button>
            </Link>
          </div>

          <Button variant="ghost" size="icon" className="md:hidden text-white" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden bg-[#0d1117]/95 backdrop-blur-sm p-4 space-y-4">
            <a href="#features" className="block text-base text-white font-bold">Recursos</a>
            <a href="#pricing" className="block text-base text-white font-bold">Planos</a>
            <a href="#testimonials" className="block text-base text-white font-bold">Depoimentos</a>
            <a href="#faq" className="block text-base text-white font-bold">Dúvidas</a>
            <hr className="border-[#30363d]" />
            <Link href="/login"><Button className="w-full bg-[#238636] font-bold">Entrar</Button></Link>
          </div>
        )}
      </header>

      {/* HERO - Centralizado verticalmente */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background de moléculas */}
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: "url('/backgrounds/hero-bg.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />

        {/* Efeito de luz de baixo para cima */}
        <div
          className="absolute bottom-0 left-0 right-0 h-[60%] z-10 pointer-events-none"
          style={{
            background: "linear-gradient(to top, rgba(139, 92, 246, 0.12) 0%, rgba(236, 72, 153, 0.08) 40%, transparent 100%)",
          }}
        />

        {/* Glow central */}
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[1200px] h-[400px] z-10 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse at bottom, rgba(139, 92, 246, 0.2) 0%, transparent 70%)",
          }}
        />

        {/* Conteúdo do Hero - Centralizado */}
        <div className="relative z-20 max-w-5xl mx-auto px-4 text-center">
          {/* Nome grande - maior que antes */}
          <div className="mb-6">
            <Image
              src="/nome.png"
              alt="Nutri Xpert Pro"
              width={600}
              height={140}
              className="mx-auto"
              priority
            />
          </div>

          <h1
            className="text-3xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 text-white"
            style={{ textShadow: "0 4px 20px rgba(0, 0, 0, 0.5), 0 2px 8px rgba(0, 0, 0, 0.3)" }}
          >
            A Plataforma para Nutricionistas de Alta Performance
          </h1>

          <p className="text-lg md:text-xl text-[#8b949e] max-w-2xl mx-auto mb-8">
            Mais produtividade, mais autoridade e mais resultados com o poder do modo Xpert.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
            <Link href="/login">
              <Button size="lg" className="text-lg px-8 h-14 bg-white hover:bg-gray-100 text-[#0d1117] font-semibold">
                Começar Grátis
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="text-lg px-8 h-14 border-[#30363d] text-white hover:bg-[#21262d] bg-transparent">
              Ver Demonstração
            </Button>
          </div>

          <p className="text-sm text-[#8b949e]">
            ✓ Grátis para até 10 pacientes &nbsp; ✓ Pronto em 2 minutos &nbsp; ✓ Cancele quando quiser
          </p>
        </div>

        {/* Fade para próxima seção */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#0d1117] to-transparent z-20" />
      </section>

      {/* SEÇÃO 2: Features */}
      <section id="features" className="py-20 px-4 bg-[#0d1117]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ferramentas de um profissional Xpert
            </h2>
            <p className="text-[#8b949e] text-lg max-w-2xl mx-auto">
              Ferramentas pensadas para facilitar seu dia a dia no consultório.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="bg-[#161b22] border-[#30363d] hover:border-[#8b949e] transition-all">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#238636] to-[#2ea043] flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-lg text-white">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-[#8b949e]">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* SEÇÃO 3: Stats */}
      <section className="py-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0d1117] via-[#161b22] to-[#0d1117]" />

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-8">
            <Badge className="bg-[#238636]/20 text-[#3fb950] border-[#238636]/30 px-4 py-1">
              ✨ +500 nutricionistas já utilizam o Nutri Xpert Pro
            </Badge>
          </div>
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div className="p-6">
              <div className="text-4xl font-bold bg-gradient-to-r from-[#79c0ff] to-[#d2a8ff] bg-clip-text text-transparent mb-2">500+</div>
              <div className="text-[#8b949e]">Nutricionistas</div>
            </div>
            <div className="p-6">
              <div className="text-4xl font-bold bg-gradient-to-r from-[#d2a8ff] to-[#ff7b72] bg-clip-text text-transparent mb-2">50mil+</div>
              <div className="text-[#8b949e]">Pacientes cadastrados</div>
            </div>
            <div className="p-6">
              <div className="text-4xl font-bold bg-gradient-to-r from-[#ff7b72] to-[#ffa657] bg-clip-text text-transparent mb-2">200mil+</div>
              <div className="text-[#8b949e]">Planos criados</div>
            </div>
            <div className="p-6">
              <div className="text-4xl font-bold bg-gradient-to-r from-[#3fb950] to-[#79c0ff] bg-clip-text text-transparent mb-2">4.9/5</div>
              <div className="text-[#8b949e]">Nota dos usuários</div>
            </div>
          </div>
        </div>
      </section>

      {/* SEÇÃO 4: Testimonials */}
      <section id="testimonials" className="py-20 px-4 bg-[#0d1117]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <Badge className="bg-[#238636]/20 text-[#3fb950] border-[#238636]/30 mb-4">Depoimentos</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Xperts confiam em nós
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-[#161b22] border-[#30363d]">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#79c0ff] to-[#d2a8ff] flex items-center justify-center text-[#0d1117] font-semibold">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <CardTitle className="text-base text-white">{testimonial.name}</CardTitle>
                      <CardDescription className="text-[#8b949e]">{testimonial.role}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-1 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-[#ffa657] text-[#ffa657]" />
                    ))}
                  </div>
                  <p className="text-[#8b949e] italic">"{testimonial.text}"</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* SEÇÃO 5: Pricing */}
      <section id="pricing" className="py-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[#161b22]" />

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-12">
            <Badge className="bg-[#238636]/20 text-[#3fb950] border-[#238636]/30 mb-4">Planos</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Evolua para o nível Xpert
            </h2>
            <p className="text-[#8b949e] text-lg">
              Comece grátis e evolua conforme sua necessidade
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plans.map((plan, index) => (
              <Card
                key={index}
                className={`relative bg-[#0d1117] ${plan.popular ? 'border-[#238636] shadow-lg shadow-[#238636]/20' : 'border-[#30363d]'}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-[#238636] text-white">Mais Popular</Badge>
                  </div>
                )}
                <CardHeader className="text-center pb-2">
                  <CardTitle className="text-xl text-white">{plan.name}</CardTitle>
                  <CardDescription className="text-[#8b949e]">{plan.description}</CardDescription>
                  <div className="pt-4">
                    <span className="text-4xl font-bold text-white">{plan.price}</span>
                    <span className="text-[#8b949e]">{plan.period}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-[#8b949e]">
                        <Check className="h-4 w-4 text-[#3fb950] flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button className={`w-full ${plan.popular ? 'bg-[#238636] hover:bg-[#2ea043] text-white' : 'bg-[#21262d] hover:bg-[#30363d] text-white border border-[#30363d]'}`}>
                    {plan.cta}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* SEÇÃO 6: FAQ */}
      <section id="faq" className="py-20 px-4 bg-[#0d1117]">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <Badge className="bg-[#238636]/20 text-[#3fb950] border-[#238636]/30 mb-4">Dúvidas</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Perguntas Frequentes
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <Card key={index} className="bg-[#161b22] border-[#30363d]">
                <button
                  className="w-full text-left p-6 flex items-center justify-between"
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                >
                  <span className="font-medium text-white">{faq.question}</span>
                  {openFaq === index ? <ChevronUp className="h-5 w-5 text-[#8b949e]" /> : <ChevronDown className="h-5 w-5 text-[#8b949e]" />}
                </button>
                {openFaq === index && <div className="px-6 pb-6 text-[#8b949e]">{faq.answer}</div>}
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* SEÇÃO 7: CTA Final */}
      <section className="py-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0d1117] to-[#161b22]" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Pronto para se tornar um Xpert?
          </h2>
          <p className="text-xl text-[#8b949e] mb-8">
            Dê o próximo passo na sua carreira e destaque-se no mercado.
          </p>
          <Link href="/login">
            <Button size="lg" className="text-lg px-10 h-14 bg-white hover:bg-gray-100 text-[#0d1117] font-semibold">
              Criar Conta Grátis
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#30363d] py-12 px-4 bg-[#0d1117]">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="font-semibold mb-4 text-white">Produto</h3>
              <ul className="space-y-2 text-sm text-[#8b949e]">
                <li><a href="#features" className="hover:text-[#58a6ff]">Recursos</a></li>
                <li><a href="#pricing" className="hover:text-[#58a6ff]">Planos</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4 text-white">Suporte</h3>
              <ul className="space-y-2 text-sm text-[#8b949e]">
                <li><a href="#faq" className="hover:text-[#58a6ff]">Dúvidas</a></li>
                <li><a href="#" className="hover:text-[#58a6ff]">Contato</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4 text-white">Legal</h3>
              <ul className="space-y-2 text-sm text-[#8b949e]">
                <li><a href="#" className="hover:text-[#58a6ff]">Termos de Uso</a></li>
                <li><a href="#" className="hover:text-[#58a6ff]">Privacidade</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-[#30363d] pt-8 text-center">
            <p className="text-sm text-[#8b949e]">© 2024 Nutri Xpert Pro. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
