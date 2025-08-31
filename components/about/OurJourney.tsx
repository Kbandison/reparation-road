"use client";

import { ScrollReveal } from "@/components/ScrollReveal";

const milestones = [
  {
    year: "2020",
    title: "Founded",
    description:
      "Reparation Road begins its mission to reconnect families through history, research, and truth.",
  },
  {
    year: "2021",
    title: "Digital Archive Launched",
    description:
      "Key historical collections and educational resources were digitized and made accessible.",
  },
  {
    year: "2022",
    title: "Workshops & Community Reach",
    description:
      "Hosted genealogy events and cultural workshops for communities across the U.S.",
  },
  {
    year: "2024",
    title: "Genealogy Services Expanded",
    description:
      "Introduced advanced tools and research services tailored for personal and investigative use.",
  },
];

export const OurJourney = () => {
  return (
    <ScrollReveal>
      <section className="bg-[var(--color-brand-white)] py-24">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-serif text-[var(--color-brand-green)] text-center mb-12">
            Our Journey
          </h2>

          <ol className="relative border-l border-[var(--color-brand-green)] pl-6 space-y-10">
            {milestones.map(({ year, title, description }) => (
              <li key={year} className="relative">
                <div className="absolute -left-3.5 w-6 h-6 bg-[var(--color-brand-green)] rounded-full border-4 border-[var(--color-brand-white)]" />

                <h3 className="text-lg font-serif text-[var(--color-brand-brown)]">
                  {year} — {title}
                </h3>
                <p className="text-sm text-[var(--color-text)] mt-1 max-w-lg">
                  {description}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </ScrollReveal>
  );
};
