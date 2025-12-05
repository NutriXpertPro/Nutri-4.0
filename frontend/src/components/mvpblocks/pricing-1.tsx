import { Check } from 'lucide-react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";

const plans = [
    {
        name: 'Gratuito',
        price: 'R$0',
        period: '/mês',
        description: 'Para nutricionistas que estão começando.',
        features: [
            'Até 5 pacientes ativos',
            'Anamnese básica',
            'Prescrição de dietas simples',
            'App do paciente (limitado)',
        ],
        cta: 'Começar Grátis',
        href: '/signup',
        popular: false,
    },
    {
        name: 'Xpert Mensal',
        price: 'R$89,90',
        period: '/mês',
        description: 'Acelere seus resultados e fidelize mais.',
        features: [
            'Pacientes ilimitados',
            'Anamnese inteligente com IA',
            'Prescrição avançada e modelos',
            'App do paciente completo',
            'Gestão financeira',
            'Chat direto com paciente',
        ],
        cta: 'Assinar Mensal',
        href: '/signup?plan=monthly',
        popular: false,
    },
    {
        name: 'Xpert Anual',
        price: 'R$79,90',
        period: '/mês',
        description: 'Máxima performance com desconto exclusivo.',
        features: [
            'Tudo do plano Mensal',
            '2 meses grátis (pagamento anual)',
            'Mentoria em grupo trimestral',
            'Selo "Nutri Xpert" no perfil',
            'Prioridade no suporte',
        ],
        cta: 'Assinar Anual',
        href: '/signup?plan=annual',
        popular: true,
    },
];

export default function Pricing1() {
    return (
        <section id="pricing" className="relative py-20 bg-[#0d1117] overflow-hidden">
            {/* Background Glows */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] opacity-20 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 blur-[100px] rounded-full mix-blend-screen animate-pulse" style={{ animationDuration: '4s' }}></div>
            </div>

            <div className="mx-auto max-w-screen-xl px-4 md:px-8 relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl mb-4">
                        Planos que cabem no seu <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500">crescimento</span>
                    </h2>
                    <p className="text-[#8b949e] text-lg">
                        Escolha a melhor opção para o seu momento profissional. Sem taxas escondidas, cancele quando quiser.
                    </p>
                </div>

                <div className="grid gap-8 lg:grid-cols-3">
                    {plans.map((plan, idx) => (
                        <div
                            key={idx}
                            className={`relative flex flex-col p-8 rounded-2xl border ${plan.popular
                                    ? 'border-purple-500 bg-[#161b22] shadow-[0_0_30px_rgba(168,85,247,0.15)]'
                                    : 'border-[#30363d] bg-[#0d1117]'
                                } transition-all hover:border-[#8b949e]`}
                        >
                            {plan.popular && (
                                <div className="absolute top-0 right-0 -mt-3 mr-4">
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-sm">
                                        Recomendado
                                    </span>
                                </div>
                            )}

                            <div className="mb-4">
                                <h3 className="text-xl font-semibold text-white">{plan.name}</h3>
                                <p className="text-[#8b949e] text-sm mt-2">{plan.description}</p>
                            </div>

                            <div className="mb-6">
                                <span className="text-4xl font-bold text-white">{plan.price}</span>
                                <span className="text-[#8b949e] ml-2">{plan.period}</span>
                            </div>

                            <ul className="mb-8 space-y-4 flex-1">
                                {plan.features.map((feature, i) => (
                                    <li key={i} className="flex items-start">
                                        <Check className="h-5 w-5 text-green-500 mr-3 shrink-0" />
                                        <span className="text-sm text-gray-300">{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <Button
                                className={`w-full h-12 font-bold rounded-xl ${plan.popular
                                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white'
                                        : 'bg-[#21262d] hover:bg-[#30363d] text-white border border-[#30363d]'
                                    }`}
                                asChild
                            >
                                <Link href={plan.href}>
                                    {plan.cta}
                                </Link>
                            </Button>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
