import { About } from "@/components/home/About";
import { ContactSection } from "@/components/home/ContactSection";
import { Hero } from "@/components/home/Hero";
import { Services } from "@/components/home/Services";

export default function Home() {
  return (
    <div className="">
      <Hero />
      <Services />
      <About />
      <ContactSection />
    </div>
  );
}
