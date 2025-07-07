/* eslint-disable react/no-unescaped-entities */
// components/about/FounderSpotlight.tsx
import Image from "next/image";
import { ScrollReveal } from "../ScrollReveal";

export const FounderSpotlight = () => {
  return (
    <section className=" py-20 px-4">
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-12">
        {/* Images Section */}
        <div className="flex flex-col sm:flex-row gap-6">
          <div className="relative w-60 h-80 rounded-xl overflow-hidden shadow-lg border border-[var(--color-brand-green)]">
            <Image
              src="/adam 2 (1).jpg"
              alt="Adam Jacoby Paul smiling in front of mural"
              fill
              className="object-cover"
            />
          </div>
        </div>

        {/* Text Content */}
        <div className="text-[var(--color-text)] max-w-xl">
          <h3 className="text-2xl font-serif text-[var(--color-brand-brown)] mb-4">
            Meet the Founder
          </h3>
          <p className="text-sm uppercase text-[var(--color-brand-green)] font-semibold tracking-widest mb-1">
            Adam Jacoby Paul
          </p>
          <p className="text-base font-medium text-[var(--color-brand-brown)] mb-6">
            Chief Researcher
          </p>

          <blockquote className="italic border-l-4 border-[var(--color-brand-green)] pl-4 text-[var(--color-text)] leading-relaxed">
            “I have always seen genealogy as a gateway for People of Color to
            access long lost, and often withheld information about their
            familial past in the Western hemisphere. It is my mission to make
            history more accessible, in order to allow future generations a
            fuller and more accurate narrative.”
          </blockquote>
        </div>
      </div>
      <ScrollReveal>
        <div className="bg-white mt-16 px-4">
          <div className="max-w-5xl mx-auto bg-[var(--color-brand-green)] text-[var(--color-brand-white)] rounded-xl p-8 md:p-12 shadow-md text-center">
            <h4 className="text-2xl font-serif mb-4">
              Continuing the Journey of Truth and Ancestry
            </h4>
            <p className="text-sm md:text-base mb-6 max-w-2xl mx-auto opacity-90">
              Our work doesn’t stop at discovery—it moves communities forward.
              Learn how we can help you uncover your family's story and build a
              legacy of understanding.
            </p>
            <a
              href="/booking"
              className="inline-block mt-2 bg-[var(--color-brand-white)] text-[var(--color-brand-green)] px-6 py-3 rounded-full font-semibold text-sm hover:bg-[var(--color-brand-tan)] transition"
            >
              Explore Our Research Services
            </a>
          </div>
        </div>
      </ScrollReveal>
    </section>
  );
};
