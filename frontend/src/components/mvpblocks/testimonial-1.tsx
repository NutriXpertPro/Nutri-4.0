import { Star } from 'lucide-react';
import Image from 'next/image';

const testimonials = [
    {
        name: 'Dra. Ana Silva',
        role: 'Nutricionista Esportiva',
        image: '/avatars/ana.png', // Placeholder, using generic fallback in component
        content: "O Nutri Xpert Pro mudou completamente a forma como atendo. A anamnese inteligente me poupa horas toda semana, e os pacientes amam o aplicativo!",
        rating: 5,
    },
    {
        name: 'Dr. Lucas Oliveira',
        role: 'Nutricionista Clínico',
        image: '/avatars/lucas.png',
        content: "A melhor plataforma que já usei. A migração foi super tranquila e o suporte é incrível. Me sinto muito mais profissional e organizado.",
        rating: 5,
    },
    {
        name: 'Dra. Mariana Costa',
        role: 'Nutricionista Materno-Infantil',
        image: '/avatars/mariana.png',
        content: "Meus pacientes se sentem muito mais acolhidos com o acompanhamento pelo app. A taxa de adesão às dietas aumentou significativamente.",
        rating: 5,
    },
];

export default function Testimonial1() {
    return (
        <section id="testimonials" className="py-20 bg-[#0d1117] border-t border-[#21262d] relative overflow-hidden">
            {/* Mist Effect */}
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                <div className="absolute top-[20%] left-[10%] w-96 h-96 bg-blue-500 rounded-full blur-[100px] animate-pulse"></div>
                <div className="absolute bottom-[20%] right-[10%] w-96 h-96 bg-purple-500 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }}></div>
            </div>

            <div className="mx-auto max-w-screen-xl px-4 md:px-8 relative z-10">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl mb-4">
                        Quem usa, não <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">troca</span>
                    </h2>
                    <p className="text-[#8b949e] text-lg max-w-2xl mx-auto">
                        Veja como nutricionistas de todo o Brasil estão transformando seus consultórios com o Nutri Xpert Pro.
                    </p>
                </div>

                <div className="grid gap-8 md:grid-cols-3">
                    {testimonials.map((item, idx) => (
                        <div
                            key={idx}
                            className="bg-[#161b22] border border-[#30363d] p-8 rounded-2xl relative hover:bg-[#21262d] transition-all duration-300 group"
                        >
                            <div className="flex gap-1 text-yellow-500 mb-4">
                                {[...Array(item.rating)].map((_, i) => (
                                    <Star key={i} className="h-4 w-4 fill-current" />
                                ))}
                            </div>

                            <p className="text-gray-300 mb-6 italic leading-relaxed">
                                "{item.content}"
                            </p>

                            <div className="flex items-center gap-4 mt-auto">
                                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm">
                                    {item.name.charAt(4)}
                                </div>
                                <div>
                                    <h4 className="text-white font-semibold text-sm">{item.name}</h4>
                                    <p className="text-[#8b949e] text-xs">{item.role}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
