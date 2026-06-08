import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/sections/Hero";
import LogoTicker from "@/components/sections/LogoTicker";
import Services from "@/components/sections/Services";
import Projects from "@/components/sections/Projects";
import Process from "@/components/sections/Process";
import CallToAction from "@/components/sections/CTA";
import Footer from "@/components/layout/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] selection:bg-[var(--primary)] selection:text-white">
      <Navbar />
      <Hero />
      <Services />
      <Projects />
      <LogoTicker />
      <Process />
      <CallToAction />
      <Footer />
    </main>
  );
}