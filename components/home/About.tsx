// components/home/AboutSection.tsx
import Link from "next/link";
import Image from "next/image";
import { ScrollReveal } from "../ScrollReveal";

export const About = () => {
  return (
    <ScrollReveal>
      <section className="bg-[var(--color-brand-tan)] py-24">
        <div className="max-w-5xl mx-auto px-4">
          <div className="bg-[var(--color-brand-white)] rounded-2xl shadow-lg border border-[var(--color-brand-green)] p-8 md:p-12">
            <div className="grid md:grid-cols-[1fr_220px] gap-10 items-start">
              {/* Text Content */}
              <div>
                <h2 className="text-3xl font-serif text-[var(--color-brand-green)] mb-4 leading-snug">
                  “Preserving Truth. Empowering Community.”
                </h2>
                <p className="text-[var(--color-text)] text-sm md:text-base mb-6 leading-relaxed">
                  At Reparation Road, we’re committed to uncovering the past and
                  empowering the future. Through research, education, and
                  digital preservation, we help individuals reconnect with their
                  roots while advocating for historical justice. Our work honors
                  the resilience and legacy of Black communities across
                  generations.
                </p>
                <Link
                  href="/about"
                  className="inline-block text-sm font-medium text-[var(--color-brand-green)] underline underline-offset-4 hover:opacity-80 transition"
                >
                  Learn more about our mission →
                </Link>
              </div>

              {/* Image */}
              <div className="relative w-full h-48 md:h-full rounded-xl overflow-hidden shadow-md border border-[var(--color-brand-tan)]">
                <Image
                  src="/20250626_0830_Vintage Desk Legacy_simple_compose_01jyp3brxdfdtbe2693rmngbcx.png"
                  alt="About Reparation Road"
                  fill
                  className="object-cover object-center"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </ScrollReveal>
  );
};
