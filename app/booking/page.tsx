"use client";

import { useState } from "react";
import { CheckCircle, BookOpen, Users } from "lucide-react";

const SESSION_TYPES = [
  {
    key: "standard",
    title: "Standard Research Package",
    description:
      "Get step-by-step guidance on how to use the Reparation Road Library and resources for independent research. This session does not include personal ancestry research.",
    icon: BookOpen,
    details: [
      "Personalized walkthrough of the site",
      "Tips for using research tools",
      "Best practices for self-guided searches",
    ],
  },
  {
    key: "genealogy",
    title: "Genealogy Consultation",
    description:
      "Book a 1-on-1 session to trace your family roots. Receive hands-on help, expert insight, and recommendations for ancestry and historical research.",
    icon: Users,
    details: [
      "1-on-1 consultation with Adam Jacoby Paul",
      "Assistance tracing family history",
      "Advice on public/private record access",
    ],
  },
];

export default function Booking() {
  const [selected, setSelected] = useState<"standard" | "genealogy" | null>(
    null
  );
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");

  // --- Form handler ---
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("loading");
    const formData = new FormData(e.currentTarget);

    const body = {
      name: formData.get("name"),
      email: formData.get("email"),
      message: formData.get("message"),
      sessionType: selected,
    };

    const res = await fetch("/api/booking", {
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
    <main className="bg-[var(--color-brand-white)] min-h-screen">
      {/* Hero / Intro */}
      <section className="py-20 text-center bg-[var(--color-brand-tan)]">
        <h1 className="text-4xl font-serif text-[var(--color-brand-green)] mb-4">
          Book a Session
        </h1>
        <p className="text-[var(--color-text)] max-w-2xl mx-auto">
          Whether you’re seeking expert guidance on navigating our resources or
          ready to dive into your family’s story, Reparation Road is here to
          help.
        </p>
      </section>

      {/* Session Type Selector */}
      <section className="max-w-3xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-serif text-[var(--color-brand-brown)] mb-6 text-center">
          Choose Your Session
        </h2>
        <div className="grid md:grid-cols-2 gap-8 mb-10">
          {SESSION_TYPES.map(
            ({ key, title, description, icon: Icon, details }) => (
              <button
                key={key}
                type="button"
                onClick={() => setSelected(key as "standard" | "genealogy")}
                className={`border-2 rounded-xl p-6 text-left shadow-sm transition 
                ${
                  selected === key
                    ? "border-[var(--color-brand-green)] bg-[var(--color-brand-tan)]"
                    : "border-[var(--color-brand-tan)] bg-white hover:border-[var(--color-brand-green)]"
                }
                group focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-green)]`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <Icon size={28} className="text-[var(--color-brand-green)]" />
                  <h3 className="text-lg font-serif text-[var(--color-brand-green)]">
                    {title}
                  </h3>
                  {selected === key && (
                    <CheckCircle
                      size={22}
                      className="text-[var(--color-brand-green)]"
                    />
                  )}
                </div>
                <p className="text-sm text-[var(--color-text)] mb-3">
                  {description}
                </p>
                <ul className="list-disc ml-6 text-xs text-[var(--color-text)] opacity-80">
                  {details.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </button>
            )
          )}
        </div>

        {/* Booking Form */}
        <form
          onSubmit={handleSubmit}
          className="space-y-6 bg-white p-8 rounded-xl border border-[var(--color-brand-tan)] shadow-lg"
        >
          <input type="hidden" name="sessionType" value={selected ?? ""} />
          <h3 className="text-xl font-serif text-[var(--color-brand-brown)] mb-2">
            Booking Details
          </h3>
          {!selected && (
            <div className="text-[var(--color-brand-green)] font-semibold mb-4">
              Please select a session type above before submitting.
            </div>
          )}
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
              How can we help?
            </label>
            <textarea
              id="message"
              name="message"
              rows={4}
              required
              className="w-full rounded-md border border-[var(--color-brand-tan)] px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-green)]"
            />
          </div>
          <button
            type="submit"
            disabled={!selected || status === "loading"}
            className={`px-6 py-3 rounded-xl bg-[var(--color-brand-green)] text-[var(--color-brand-white)] text-sm font-semibold transition hover:opacity-90 ${
              !selected ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {status === "loading" ? "Sending..." : "Submit Booking Request"}
          </button>
          {status === "success" && (
            <p className="text-green-700 mt-3">
              Your request was sent! We’ll contact you soon.
            </p>
          )}
          {status === "error" && (
            <p className="text-red-700 mt-3">
              Something went wrong. Please try again.
            </p>
          )}
        </form>
      </section>
    </main>
  );
}
