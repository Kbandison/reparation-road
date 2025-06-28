// components/home/Services.tsx
import { Users, Dna, Presentation, ArchiveRestore } from "lucide-react";
import { ScrollReveal } from "../ScrollReveal";

const services = [
  {
    title: "Family History Research",
    description:
      "Discover your roots with personalized and affordable family history research packages.",
    icon: Users,
  },
  {
    title: "Genetic Genealogy",
    description:
      "Use DNA insights to trace ancestry or assist in investigative research with direct-to-consumer genetics.",
    icon: Dna,
  },
  {
    title: "E-Learning & Workshops",
    description:
      "Attend engaging virtual or in-person workshops that explore history, identity, and cultural legacy.",
    icon: Presentation,
  },
  {
    title: "3D Preservation & Archiving",
    description:
      "Preserve historical documents, media, and artifacts with expert 3D rendering and digitization services.",
    icon: ArchiveRestore,
  },
];

export const Services = () => {
  return (
    <ScrollReveal>
      <section className="bg-[var(--color-brand-white)] py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-serif text-[var(--color-brand-green)] mb-4">
            What We Do
          </h2>
          <p className="text-[var(--color-text)] mb-12 max-w-2xl mx-auto">
            Explore the ways Reparation Road helps preserve history, empower
            communities, and promote education.
          </p>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {services.map(({ title, description, icon: Icon }) => (
              <div
                key={title}
                className="border border-[var(--color-brand-green)] rounded-xl p-6 text-left hover:shadow-md hover:-translate-y-1 transition-all bg-[var(--color-brand-white)]"
              >
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[var(--color-brand-tan)] mb-4">
                  <Icon className="text-[var(--color-brand-green)]" size={24} />
                </div>
                <h3 className="text-lg font-serif text-[var(--color-brand-green)] mb-2">
                  {title}
                </h3>
                <p className="text-sm text-[var(--color-text)]">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </ScrollReveal>
  );
};
