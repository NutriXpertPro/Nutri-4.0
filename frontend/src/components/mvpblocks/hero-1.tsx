import React from 'react';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image'; /* mantém para outras imagens */
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import adipometro from '@/assets/adipometro.png';
import nome from '@/assets/nome.png';

export default function Hero1() {
  return (
    <div className="relative w-full bg-[#0d1117] overflow-hidden h-screen flex items-center justify-center">
      <div className="absolute inset-0 z-0">
        <Image
          src="/backgrounds/hero-bg.png"
          alt="Background"
          fill
          priority
          quality={100}
          unoptimized
          sizes="100vw"
          className="object-cover object-center"
        />
      </div>

      <div className="absolute top-0 z-[0] h-full w-full bg-neutral-900/10 bg-[radial-gradient(ellipse_20%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]"></div>

      <section className="relative z-1 w-full h-full flex items-center justify-center pb-20">
        <div className="relative z-20 mx-auto max-w-7xl gap-8 px-4 text-center md:px-8 flex flex-col items-center">
          <div className="mx-auto max-w-7xl space-y-6 text-center">

            <div className="mb-2 flex justify-start items-center ml-[157px]">
              <div className="relative">
                <img
                  src={nome.src}
                  alt="Nutri Xpert Pro"
                  className="mt-4 object-contain bg-transparent"
                  style={{ height: '370px', background: 'transparent' }}
                  loading="eager"
                  decoding="async"
                />
                <img
                  src={adipometro.src}
                  alt="Adipômetro"
                  width={110}
                  height={110}
                  className="absolute top-[233px] left-[-63px] object-contain bg-transparent"
                  style={{ background: 'transparent' }}
                  loading="eager"
                  decoding="async"
                />
              </div>
            </div>

            <h1
              className="text-3xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4 text-white relative top-[-16px]"
              style={{ textShadow: "0 4px 20px rgba(0, 0, 0, 0.5), 0 2px 8px rgba(0, 0, 0, 0.3)" }}
            >
              A Plataforma para Nutricionistas<br />
              de Alta Performance
            </h1>

            <p className="mx-auto max-w-2xl text-[#8b949e] text-lg md:text-xl whitespace-nowrap relative top-[-16px]">
              Mais produtividade, mais autoridade e mais resultados com o poder do modo Xpert.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10 relative top-[-16px]">
              <Button size="lg" className="bg-[#238636] hover:bg-[#2ea043] text-white font-bold h-12 px-8 text-lg" asChild>
                <Link href="/login">
                  Sou Nutricionista
                </Link>
              </Button>

              <Button size="lg" className="bg-[#3B82F6] hover:bg-[#2563EB] text-white font-bold h-12 px-8 text-lg" asChild>
                <Link href="/login/paciente">
                  Sou Paciente
                </Link>
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
