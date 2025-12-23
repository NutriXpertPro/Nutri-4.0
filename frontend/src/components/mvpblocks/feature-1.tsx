import {
  Zap,
  Apple,
  Camera,
  LayoutDashboard,
  ShieldCheck,
  Award,
} from 'lucide-react';

const features = [
  {
    icon: <Zap className="h-6 w-6" />,
    title: 'Diagnostique em 5 minutos o que levaria uma hora',
    desc: 'Utilize nossa anamnese inteligente com mais de 50 campos dinâmicos e preenchimento assistido. A aplicação cruza dados metabólicos e perfis laboratoriais automaticamente, fazendo você parecer um gênio da nutrição diante do paciente.',
  },
  {
    icon: <Apple className="h-6 w-6" />,
    title: 'Planos Alimentares Imbatíveis com 10.000+ Alimentos',
    desc: 'Tenha o poder das tabelas TACO, TBCA e USDA integradas. Conversão de medidas automática, "suplementos coringas" e salvamento de presets. Entregue PDFs de luxo ou sincronize direto no celular do paciente em segundos.',
  },
  {
    icon: <Camera className="h-6 w-6" />,
    title: 'Transforme Evolução em Emoção com Fotos e Métricas',
    desc: 'Compare fotos em 3 ângulos lado a lado com gráficos de bioimpedância e evolução física. Gere relatórios de progresso que viralizam e fazem o paciente chorar de alegria ao ver o próprio resultado materializado.',
  },
  {
    icon: <LayoutDashboard className="h-6 w-6" />,
    title: 'Antecipe Problemas com Visão de Águia',
    desc: 'Um painel inteligente que mostra quem está engajado e quem precisa de atenção. Visualize exames laboratoriais, métricas corporais e a taxa de adesão em tempo real. Tenha o controle absoluto de cada detalhe da jornada do seu cliente.',
  },
  {
    icon: <ShieldCheck className="h-6 w-6" />,
    title: 'Conquiste Pacientes sem Expor seu Número de Telefone',
    desc: 'Centralize toda comunicação no Xpert Messenger. Notificações inteligentes, link de agendamento automático sincronizado com Google Calendar e chat profissional. Atenda com proximidade sem abrir mão do seu descanso pessoal.',
  },
  {
    icon: <Award className="h-6 w-6" />,
    title: 'Torne-se o Nutricionista Mais Valorizado do Mercado',
    desc: 'Documentação completa com sua logo, CRM automático e assinatura digital integrada. Apareça como uma clínica de alto padrão, cobre o valor que você merece e multiplique sua autoridade instantaneamente.',
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
                className="relative flex flex-col p-6 rounded-2xl border border-purple-500 bg-[#161b22] shadow-[0_0_30px_rgba(168,85,247,0.15)] transition-all hover:border-[#8b949e] group"
              >
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
