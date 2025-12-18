'use client';

import { Star } from 'lucide-react';
import { useState, useEffect } from 'react';

// Adicionando 6 novos depoimentos para um total de 9
const testimonials = [
    {
        name: 'Dra. Ana Silva',
        role: 'Nutricionista Esportiva',
        content: "O Nutri Xpert Pro mudou completamente a forma como atendo. A anamnese inteligente me poupa horas toda semana, e os pacientes amam o aplicativo!",
        rating: 5,
    },
    {
        name: 'Dr. Lucas Oliveira',
        role: 'Nutricionista Clínico',
        content: "A melhor plataforma que já usei. A migração foi super tranquila e o suporte é incrível. Me sinto muito mais profissional e organizado.",
        rating: 5,
    },
    {
        name: 'Dra. Mariana Costa',
        role: 'Nutricionista Materno-Infantil',
        content: "Meus pacientes se sentem muito mais acolhidos com o acompanhamento pelo app. A taxa de adesão às dietas aumentou significativamente.",
        rating: 5,
    },
    {
        name: 'Dr. Carlos Souza',
        role: 'Nutricionista Funcional',
        content: "A IA do sistema me ajuda a tomar decisões mais assertivas. Minhas consultas foram otimizadas em 40% e a satisfação dos pacientes aumentou.",
        rating: 5,
    },
    {
        name: 'Dra. Fernanda Almeida',
        role: 'Nutricionista Estética',
        content: "Agora posso acompanhar meus pacientes em tempo real. As avaliações de composição corporal são impressionantes e ajudam muito no engajamento.",
        rating: 5,
    },
    {
        name: 'Dr. Roberto Santos',
        role: 'Nutricionista Vegetariano',
        content: "O banco de dados de alimentos é completo e a personalização das dietas é muito precisa. O sistema se adapta perfeitamente à minha especialidade.",
        rating: 5,
    },
    {
        name: 'Dra. Camila Ribeiro',
        role: 'Nutricionista do Esporte',
        content: "A automação de planilhas e relatórios me economiza horas semanais. Agora posso focar no que realmente importa: a saúde dos meus atletas.",
        rating: 5,
    },
    {
        name: 'Dr. Gabriel Lima',
        role: 'Nutricionista Clínico',
        content: "A integração com outros profissionais da saúde é excelente. Consigo coordenar melhor os tratamentos e manter todos informados.",
        rating: 5,
    },
    {
        name: 'Dra. Juliana Pereira',
        role: 'Nutricionista Pediátrica',
        content: "As ferramentas educativas para pais e responsáveis são muito úteis. A plataforma me ajuda a ensinar e engajar as famílias de forma eficaz.",
        rating: 5,
    },
];

export default function Testimonial1() {
    const [currentIndex, setCurrentIndex] = useState(0);

    // Configuração do slider automático - avança de 3 em 3 depoimentos
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prevIndex) => {
                // Avança para o próximo grupo de 3 depoimentos (0, 3, 6, ...)
                const nextGroupIndex = prevIndex + 3;
                if (nextGroupIndex >= testimonials.length) {
                    return 0; // Volta ao início se atingir o final
                }
                return nextGroupIndex;
            });
        }, 5000); // Muda a cada 5 segundos

        return () => clearInterval(interval);
    }, []);

    return (
        <section id="testimonials" className="relative py-20 bg-[#0d1117] border-t border-[#21262d] overflow-hidden">
            {/* Background Glows - similar ao estilo da área de planos */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] opacity-20 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 blur-[100px] rounded-full mix-blend-screen animate-pulse" style={{ animationDuration: '6s' }}></div>
            </div>

            <div className="mx-auto max-w-7xl px-4 md:px-8 relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl mb-4">
                        Depoimentos que <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500">inspiram</span>
                    </h2>
                    <p className="text-[#8b949e] text-lg">
                        Veja como nutricionistas de todo o Brasil estão transformando seus consultórios com o Nutri Xpert Pro.
                    </p>
                </div>

                {/* Slider container - Exibindo 3 depoimentos por vez */}
                <div className="relative overflow-hidden">
                    <div className="overflow-hidden">
                        <div
                            className="flex transition-transform duration-700 ease-in-out"
                            style={{
                                transform: `translateX(-${Math.floor(currentIndex / 3) * 33.33}%)`,
                            }}
                        >
                            {Array.from({ length: Math.ceil(testimonials.length / 3) }).map((_, slideIndex) => (
                                <div key={slideIndex} className="flex-shrink-0 w-full px-4">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 h-full">
                                        {testimonials.slice(slideIndex * 3, (slideIndex + 1) * 3).map((item, idx) => {
                                            // Destacar o segundo item de cada grupo (índice 1 dentro de cada grupo de 3)
                                            const isHighlighted = idx === 1;

                                            return (
                                                <div
                                                    key={slideIndex * 3 + idx}
                                                    className={`relative flex flex-col p-8 rounded-2xl border transition-all duration-300 ${
                                                        isHighlighted ? 'border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.15)] bg-gradient-to-b from-[#1a1f2d] to-[#161b22]' : 'border-[#30363d] bg-[#161b22]'
                                                    } hover:border-[#8b949e]`}
                                                >
                                                    <div className="flex gap-1 text-yellow-500 mb-4">
                                                        {[...Array(item.rating)].map((_, i) => (
                                                            <Star key={i} className="h-4 w-4 fill-current" />
                                                        ))}
                                                    </div>

                                                    <p className="text-gray-300 mb-6 italic leading-relaxed text-center text-lg">
                                                        "{item.content}"
                                                    </p>

                                                    <div className="flex items-center justify-center gap-4 mt-auto">
                                                        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                                                            {item.name.charAt(0)}
                                                        </div>
                                                        <div className="text-center">
                                                            <h4 className="text-white font-semibold">{item.name}</h4>
                                                            <p className="text-[#8b949e] text-sm">{item.role}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Navegação do slider */}
                    <div className="flex justify-center mt-8 space-x-2">
                        {Array.from({ length: Math.ceil(testimonials.length / 3) }).map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentIndex(idx * 3)}
                                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                                    Math.floor(currentIndex / 3) === idx ? 'bg-emerald-500 w-6' : 'bg-[#30363d]'
                                }`}
                                aria-label={`Ir para grupo de depoimentos ${idx + 1}`}
                            />
                        ))}
                    </div>

                    {/* Botões de navegação anterior/próximo */}
                    <div className="flex justify-center mt-6 space-x-4">
                        <button
                            onClick={() => {
                                const prevIndex = (Math.floor(currentIndex / 3) - 1 + Math.ceil(testimonials.length / 3)) % Math.ceil(testimonials.length / 3);
                                setCurrentIndex(prevIndex * 3);
                            }}
                            className="px-4 py-2 text-white border border-[#30363d] rounded-lg hover:bg-[#21262d] transition-colors"
                            aria-label="Grupo anterior de depoimentos"
                        >
                            Anterior
                        </button>
                        <button
                            onClick={() => {
                                const nextIndex = (Math.floor(currentIndex / 3) + 1) % Math.ceil(testimonials.length / 3);
                                setCurrentIndex(nextIndex * 3);
                            }}
                            className="px-4 py-2 text-white border border-[#30363d] rounded-lg hover:bg-[#21262d] transition-colors"
                            aria-label="Próximo grupo de depoimentos"
                        >
                            Próximo
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}
