import { ArrowRight, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";

export default function CTA1() {
  return (
    <div className="w-full bg-[#0d1117]">
      <section className="mx-auto max-w-7xl px-4 py-6 lg:px-8 lg:py-20">
        <div className="relative isolate w-full px-4 py-16 sm:px-24 text-center lg:text-left flex flex-col lg:flex-row items-center justify-between gap-10">
          <div className="max-w-2xl">
            <p className="w-fit mx-auto lg:mx-0 rounded-xl bg-emerald-500/10 backdrop-blur-sm px-4 py-1 text-center text-sm font-semibold text-emerald-400 uppercase border border-emerald-500/20">
              Transforme sua carreira
            </p>
            <h2 className="mt-6 text-4xl font-bold text-white md:text-5xl leading-tight">
              Pronto para se tornar um <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-500">Xpert</span>?
            </h2>
            <p className="mt-4 text-lg text-gray-400">
              Junte-se a mais de 500 nutricionistas que já elevaram o nível dos seus atendimentos e resultados.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Button size="lg" className="bg-[#238636] hover:bg-[#2ea043] text-white font-bold text-lg h-14 px-8 rounded-full" asChild>
              <Link href="/login">
                Criar Conta Grátis
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="border-[#30363d] text-white hover:bg-[#21262d] font-bold text-lg h-14 px-8 rounded-full bg-transparent" asChild>
              <Link href="#">
                <MessageCircle className="mr-2 h-5 w-5" />
                Falar com Consultor
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
