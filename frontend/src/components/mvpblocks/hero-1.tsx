import React from 'react';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from "@/components/ui/button";

export default function Hero1() {
  return (
    <div className="relative w-full bg-[#0d1117] overflow-hidden min-h-screen flex items-center justify-center">
      <div
        className="absolute inset-0 z-0 opacity-100"
        style={{
          backgroundImage: "url('/backgrounds/hero-bg.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      <div className="absolute top-0 z-[0] h-full w-full bg-neutral-900/10 bg-[radial-gradient(ellipse_20%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]"></div>

      <section className="relative z-1 mx-auto max-w-full flex-grow flex items-center justify-center pb-32">
        <div className="pointer-events-none absolute h-full w-full overflow-hidden opacity-50 [perspective:200px]">
          <div className="absolute inset-0 [transform:rotateX(35deg)]">
            <div className="animate-grid [inset:0%_0px] [margin-left:-50%] [height:300vh] [width:600vw] [transform-origin:100%_0_0] [background-image:linear-gradient(to_right,rgba(255,255,255,0.25)_1px,transparent_0),linear-gradient(to_bottom,rgba(255,255,255,0.2)_1px,transparent_0)] [background-size:120px_120px] [background-repeat:repeat]"></div>
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#0d1117] to-transparent to-90%"></div>
        </div>

        <div className="relative z-20 mx-auto max-w-screen-xl gap-8 px-4 text-center md:px-8 flex flex-col items-center">
          <div className="mx-auto max-w-4xl space-y-6 text-center">

            <div className="mb-6 flex justify-center">
              <Image
                src="/nome.png"
                alt="Nutri Xpert Pro"
                width={500}
                height={116}
                style={{ width: 'auto', height: 'auto' }}
                priority
              />
            </div>

            <h1
              className="text-3xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4 text-white"
              style={{ textShadow: "0 4px 20px rgba(0, 0, 0, 0.5), 0 2px 8px rgba(0, 0, 0, 0.3)" }}
            >
              A Plataforma para Nutricionistas de Alta Performance
            </h1>

            <p className="mx-auto max-w-2xl text-[#8b949e] text-lg md:text-xl">
              Mais produtividade, mais autoridade e mais resultados com o poder do modo Xpert.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
              <span className="relative inline-block overflow-hidden rounded-full p-[1.5px]">
                <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" />
                <div className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-gray-950 text-xs font-medium text-gray-50 backdrop-blur-3xl">
                  <Link
                    href="/login"
                    className="group flex w-full h-14 items-center justify-center rounded-full bg-[#0d1117] px-8 text-lg font-semibold text-white transition-all hover:bg-neutral-900 sm:w-auto"
                  >
                    Começar Grátis
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </div>
              </span>

              <Button size="lg" variant="outline" className="text-lg px-8 h-14 rounded-full border-[#30363d] text-white hover:bg-[#21262d] bg-transparent backdrop-blur-sm">
                Ver Demonstração
              </Button>
            </div>
          </div>
        </div>

        {/* Glows intensos */}
        <div
          className="absolute bottom-[-200px] left-1/2 -translate-x-1/2 w-[1800px] h-[800px] z-10 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse 80% 50% at 50% 100%, rgba(168, 85, 247, 0.4) 0%, rgba(236, 72, 153, 0.25) 25%, transparent 80%)",
          }}
        />
      </section>
    </div>
  );
}
