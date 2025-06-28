"use client";

import { ScrollReveal } from "@/components/ScrollReveal";
import { BookOpen, Users, Globe, ShieldCheck } from "lucide-react";

const values = [
  {
    title: "Historical Integrity",
    icon: ShieldCheck,
    description:
      "We honor the truth in all narratives and are committed to preserving authentic, documented histories.",
  },
  {
    title: "Community Empowerment",
    icon: Users,
    description:
      "Our work uplifts individuals and families, providing tools to rediscover and reclaim identity.",
  },
  {
    title: "Equity & Access",
    icon: Globe,
    description:
      "We believe historical records and genealogical tools should be available to all, not a privileged few.",
  },
  {
    title: "Lifelong Learning",
    icon: BookOpen,
    description:
      "Education is key. We build knowledge through workshops, tools, and storytelling.",
  },
];

export const CoreValues = () => {
  return (
    <ScrollReveal>
      <section className="bg-[var(--color-brand-white)] py-24">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-serif text-[var(--color-brand-green)] mb-4">
            Our Philosophy
          </h2>
          <p className="text-[var(--color-muted)] mb-12 max-w-2xl mx-auto">
            Our work is grounded in principles that honor the past, empower the
            present, and shape a more just future.
          </p>

          <div className="grid md:grid-cols-2 gap-10">
            {values.map(({ title, description, icon: Icon }) => (
              <div
                key={title}
                className="bg-[var(--color-brand-tan)] border border-[var(--color-brand-green)] rounded-xl p-6 text-left shadow-sm hover:shadow-md transition"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-[var(--color-brand-white)] flex items-center justify-center">
                    <Icon
                      size={24}
                      className="text-[var(--color-brand-green)]"
                    />
                  </div>
                  <h3 className="text-lg font-serif text-[var(--color-brand-green)]">
                    {title}
                  </h3>
                </div>
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
