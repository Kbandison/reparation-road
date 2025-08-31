/* eslint-disable react/no-unescaped-entities */
// components/about/GetInvolved.tsx
"use client";

import Link from "next/link";
import { ScrollReveal } from "@/components/ScrollReveal";

export const GetInvolved = () => {
  return (
    <ScrollReveal>
      <section className="bg-[var(--color-brand-tan)] py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-serif text-[var(--color-brand-brown)] mb-4">
            Want to be part of the journey?
          </h2>
          <p className="text-[var(--color-text)] max-w-xl mx-auto mb-8 text-sm md:text-base">
            Whether you're researching your ancestry, preserving your family
            legacy, or want to contribute to our cause, we're here to support
            and collaborate.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/booking"
              className="px-6 py-3 rounded-xl bg-[var(--color-brand-green)] text-[var(--color-brand-white)] text-sm font-semibold transition hover:opacity-90"
            >
              Start Your Research
            </Link>
            <Link
              href="/contact"
              className="px-6 py-3 rounded-xl border border-[var(--color-brand-green)] text-[var(--color-brand-green)] text-sm font-semibold transition hover:bg-[var(--color-brand-green)] hover:text-[var(--color-brand-white)]"
            >
              Contact the Team
            </Link>
          </div>
        </div>
      </section>
    </ScrollReveal>
  );
};
