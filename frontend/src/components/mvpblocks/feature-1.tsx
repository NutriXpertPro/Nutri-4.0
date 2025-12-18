import {
  FileText,
  BarChart,
  Smartphone,
  MessageCircle,
  Users,
  BrainCircuit,
} from 'lucide-react';
import BorderBeam from './border-beam';

const features = [
  {
    icon: <BrainCircuit className="h-6 w-6" />,
    title: 'Anamnese Inteligente',
    desc: 'Economize tempo com preenchimento automático e sugestões baseadas em IA para anamneses completas.',
  },
  {
    icon: <FileText className="h-6 w-6" />,
    title: 'Prescrição Dietética',
    desc: 'Crie planos alimentares personalizados em minutos com nossa vasta base de alimentos e modelos prontos.',
  },
  {
    icon: <Smartphone className="h-6 w-6" />,
    title: 'App do Paciente',
    desc: 'Seu paciente com acesso ao plano, alertas de hidratação e chat direto com você na palma da mão.',
  },
  {
    icon: <BarChart className="h-6 w-6" />,
    title: 'Gestão Financeira',
    desc: 'Controle consultas, pagamentos e emita recibos automaticamente. Diga adeus às planilhas.',
  },
  {
    icon: <MessageCircle className="h-6 w-6" />,
    title: 'Marketing Automatizado',
    desc: 'Ferramentas integradas para atrair e fidelizar pacientes, com campanhas de e-mail e mensagens.',
  },
  {
    icon: <Users className="h-6 w-6" />,
    title: 'Comunidade Xpert',
    desc: 'Acesso exclusivo a uma rede de nutricionistas de alta performance para troca de experiências.',
  },
];
export default function Feature1() {
  return (
    <section id="features" className="relative py-20 bg-[#0d1117] overflow-hidden">
      {/* Background Glow - Similar ao pricing */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] opacity-20 pointer-events-none">
        <div className="absolute inset-0 bg-linear-to-r from-emerald-400 to-blue-500 blur-[100px] rounded-full mix-blend-screen animate-pulse" style={{ animationDuration: '4s' }}></div>
      </div>

      <div className="mx-auto max-w-7xl px-4 md:px-8 relative z-10">
        <div className="relative mx-auto max-w-2xl sm:text-center">
          <div className="relative z-10">
            <h3 className="font-geist mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
              Ferramentas de um profissional <span className="text-transparent bg-clip-text bg-linear-to-r from-emerald-400 to-blue-500">Xpert</span>
            </h3>
            <p className="font-geist text-[#8b949e] mt-3 text-lg">
              Tudo o que você precisa para atender com excelência, fidelizar pacientes e escalar seu consultório.
            </p>
          </div>
          <div
            className="absolute inset-0 mx-auto h-44 max-w-xs blur-[118px]"
            style={{
              background:
                'linear-gradient(152.92deg, rgba(192, 15, 102, 0.2) 4.54%, rgba(192, 11, 109, 0.26) 34.2%, rgba(192, 15, 102, 0.1) 77.55%)',
            }}
          ></div>
        </div>

        <div className="relative mt-12">
          <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((item, idx) => (
              <div
                key={idx}
                className="relative flex flex-col p-6 rounded-2xl border border-purple-500 bg-[#161b22] shadow-[0_0_30px_rgba(168,85,247,0.15)] transition-all hover:border-[#8b949e] group overflow-hidden"
              >
                <BorderBeam
                  size={200}
                  duration={12}
                  delay={0}
                  colorFrom="#ffaa40"
                  colorTo="#9c40ff"
                  className="absolute inset-0 rounded-2xl"
                />
                <div className="flex flex-col h-full">
                  <div className="text-emerald-400 bg-emerald-400/10 w-fit transform-gpu rounded-full border border-emerald-400/20 p-4">
                    {item.icon}
                  </div>
                  <div className="mt-4 flex-1">
                    <h4 className="font-geist text-xl font-bold tracking-tight text-white">
                      {item.title}
                    </h4>
                    <p className="text-[#8b949e] mt-2">{item.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
