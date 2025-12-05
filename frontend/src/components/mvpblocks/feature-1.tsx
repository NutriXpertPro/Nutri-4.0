import {
  FileText,
  BarChart,
  Smartphone,
  MessageCircle,
  Users,
  BrainCircuit,
} from 'lucide-react';

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
      <div className="mx-auto max-w-screen-xl px-4 md:px-8">
        <div className="relative mx-auto max-w-2xl sm:text-center">
          <div className="relative z-10">
            <h3 className="font-geist mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
              Ferramentas de um profissional <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-500">Xpert</span>
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
              <li
                key={idx}
                className="transform-gpu space-y-3 rounded-xl border border-[#30363d] bg-[#161b22] p-6 transition-all hover:bg-[#21262d] hover:border-[#8b949e]"
              >
                <div className="text-emerald-400 bg-emerald-400/10 w-fit transform-gpu rounded-full border border-emerald-400/20 p-4">
                  {item.icon}
                </div>
                <h4 className="font-geist text-xl font-bold tracking-tight text-white">
                  {item.title}
                </h4>
                <p className="text-[#8b949e]">{item.desc}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
