import Header1 from "@/components/mvpblocks/header-1";
import Hero1 from "@/components/mvpblocks/hero-1";
import dynamic from "next/dynamic";

// Lazy load componentes abaixo da dobra para acelerar carregamento inicial
const Feature1 = dynamic(() => import("@/components/mvpblocks/feature-1"));
const Testimonial1 = dynamic(() => import("@/components/mvpblocks/testimonial-1"));
const Pricing1 = dynamic(() => import("@/components/mvpblocks/pricing-1"));
const Faq1 = dynamic(() => import("@/components/mvpblocks/faq-1"));
const CTA1 = dynamic(() => import("@/components/mvpblocks/cta-1"));
const Footer4Col = dynamic(() => import("@/components/mvpblocks/footer-4col"));

export default function LandingPage() {
  return (
    <div className="bg-[#0d1117] min-h-screen w-full overflow-x-hidden">
      <Header1 />
      <main className="flex flex-col">
        <Hero1 />
        <Feature1 />
        <Testimonial1 />
        <Pricing1 />
        <Faq1 />
        <CTA1 />
      </main>
      <Footer4Col />
    </div>
  );
}
