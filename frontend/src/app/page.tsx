import Header1 from "@/components/mvpblocks/header-1";
import Hero1 from "@/components/mvpblocks/hero-1";
import Feature1 from "@/components/mvpblocks/feature-1";
import Testimonial1 from "@/components/mvpblocks/testimonial-1";
import Pricing1 from "@/components/mvpblocks/pricing-1";
import Faq1 from "@/components/mvpblocks/faq-1";
import CTA1 from "@/components/mvpblocks/cta-1";
import Footer4Col from "@/components/mvpblocks/footer-4col";

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
