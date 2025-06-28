"use client";

import { useState } from "react";
import Link from "next/link";
import { ScrollReveal } from "../ScrollReveal";

export const ContactSection = () => {
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("loading");

    const formData = new FormData(e.currentTarget);
    const body = {
      name: formData.get("name"),
      email: formData.get("email"),
      message: formData.get("message"),
    };

    const res = await fetch("/api/contact", {
      method: "POST",
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" },
    });

    if (res.ok) {
      setStatus("success");
      e.currentTarget.reset();
    } else {
      setStatus("error");
    }
  };

  return (
    <ScrollReveal>
      <section className="bg-[var(--color-brand-white)] py-20 border-t border-[var(--color-brand-tan)]">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-serif text-[var(--color-brand-green)] mb-4">
            Have a Question?
          </h2>
          <p className="text-[var(--color-text)] mb-8">
            Reach out with any questions, ideas, or requests. We’d love to hear
            from you.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6 text-left">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-[var(--color-text)] mb-1"
              >
                Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="w-full rounded-md border border-[var(--color-brand-tan)] px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-green)]"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-[var(--color-text)] mb-1"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="w-full rounded-md border border-[var(--color-brand-tan)] px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-green)]"
              />
            </div>

            <div>
              <label
                htmlFor="message"
                className="block text-sm font-medium text-[var(--color-text)] mb-1"
              >
                Message
              </label>
              <textarea
                id="message"
                name="message"
                rows={4}
                required
                className="w-full rounded-md border border-[var(--color-brand-tan)] px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-green)]"
              />
            </div>

            <div className="flex flex-col md:flex-row items-center gap-4">
              <button
                type="submit"
                disabled={status === "loading"}
                className="px-6 py-3 rounded-xl bg-[var(--color-brand-green)] text-[var(--color-brand-white)] text-sm font-semibold transition hover:opacity-90 hover:bg-[var(--color-brand-brown)] hover:text-[var(--color-brand-tan)] cursor-pointer"
              >
                {status === "loading" ? "Sending..." : "Submit Message"}
              </button>

              <Link
                href="/booking"
                className="px-6 py-3 rounded-xl border border-[var(--color-brand-green)] text-[var(--color-brand-green)] text-sm font-semibold text-center transition hover:bg-[var(--color-brand-brown)] hover:text-[var(--color-brand-tan)]"
              >
                Book a Research Session
              </Link>
            </div>

            {status === "success" && (
              <p className="text-sm text-green-600 mt-4">
                Message sent successfully!
              </p>
            )}
            {status === "error" && (
              <p className="text-sm text-red-600 mt-4">
                Something went wrong. Please try again later.
              </p>
            )}
          </form>
        </div>
      </section>
    </ScrollReveal>
  );
};
