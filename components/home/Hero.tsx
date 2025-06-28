// components/home/Hero.tsx
import Link from "next/link";
import { ScrollReveal } from "../ScrollReveal";

export const Hero = () => {
  return (
    <ScrollReveal>
      <section
        className="relative bg-cover bg-center bg-no-repeat text-[var(--color-brand-white)]"
        style={{
          backgroundImage:
            "url('/20250627_1854_Uplifting Learning Moment_remix_01jyssfe9me00req20eyf0nm6a.png')",
        }}
      >
        {/* Optional overlay tint (can be reduced/removed if glass box is strong enough) */}
        <div className="absolute inset-0 bg-[var(--color-brand-brown)] opacity-40 pointer-events-none z-0" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 py-32 grid md:grid-cols-2 gap-10 items-center">
          {/* Text Content with Glassmorphic Background */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 border border-white/20 shadow-lg">
            <h1 className="text-4xl md:text-5xl font-serif leading-tight mb-6 text-[var(--color-brand-white)]">
              Restoring History Through
              <br className="hidden sm:block" /> Research and Advocacy
            </h1>
            <p className="text-base mb-6 max-w-lg text-[var(--color-brand-white)] opacity-90">
              Reparation Road is a cultural and historical resource dedicated to
              uncovering Black history and empowering communities through
              research and education.
            </p>
            <Link
              href="/booking"
              className="inline-block px-6 py-3 rounded-xl bg-[var(--color-brand-green)] text-[var(--color-brand-white)] text-sm font-semibold transition hover:opacity-90 hover:bg-[var(--color-brand-brown)] hover:text-[var(--color-brand-tan)]"
            >
              Book Your Research Session
            </Link>
          </div>
        </div>
      </section>
    </ScrollReveal>
  );
};
