/* eslint-disable react/no-unescaped-entities */
"use client";

import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { CheckCircle, BookOpen, Users, CalendarDays, X } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

// --- Session Types ---
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

// --- Utility: generate time slots ---
function getTimeSlots(start = 9, end = 18, interval = 30) {
  const slots = [];
  const startMins = start * 60,
    endMins = end * 60;
  for (let mins = startMins; mins < endMins; mins += interval) {
    const hour = Math.floor(mins / 60);
    const minute = mins % 60;
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 === 0 ? 12 : hour % 12;
    const label = `${displayHour}:${minute.toString().padStart(2, "0")} ${ampm}`;
    slots.push(label);
  }
  return slots;
}
const TIME_SLOTS = getTimeSlots(9, 18, 30);

// --- DateTime Modal Component, rendered with Portal ---
type DateTimeModalProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  date: Date | null;
  setDate: (date: Date | null) => void;
  time: string | null;
  setTime: (time: string | null) => void;
  bookedSlots: string[];
  loadingSlots: boolean;
};

function DateTimeModal({
  open,
  onClose,
  onConfirm,
  date,
  setDate,
  time,
  setTime,
  bookedSlots,
  loadingSlots,
}: DateTimeModalProps) {
  const [step, setStep] = useState(1);

  useEffect(() => {
    if (!open) setStep(1);
  }, [open]);

  console.log("bookedSlots", bookedSlots); // E.g., ["1:30 PM", "12:30 PM"]
  console.log("TIME_SLOTS", TIME_SLOTS); // E.g., ["9:00 AM", ..., "1:30 PM"]

  // For SSR safety
  if (typeof window === "undefined" || !open) return null;

  // This modal is now rendered via portal to document.body (outside any form)
  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="relative rounded-2xl shadow-2xl border border-[var(--color-brand-green)] bg-[var(--color-brand-tan)] w-[90vw] max-w-md p-4 md:p-8 flex flex-col items-center">
        <div className="flex items-center justify-between mb-4 w-full">
          <span className="text-lg font-serif text-[var(--color-brand-brown)]">
            {step === 1 ? "Select Date" : "Select Time"}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-[var(--color-brand-green)] hover:bg-[var(--color-brand-green)] hover:text-[var(--color-brand-tan)] transition"
            aria-label="Close"
          >
            <X size={24} />
          </button>
        </div>
        {step === 1 && (
          <>
            <div className="flex justify-center w-full">
              <DatePicker
                selected={date}
                onChange={(d) => {
                  setDate(d);
                  setTime(null);
                }}
                minDate={new Date()}
                filterDate={(d) => d.getDay() !== 0}
                inline
                calendarClassName="custom-datepicker"
                dayClassName={(d) =>
                  d && date?.toDateString() === d.toDateString()
                    ? "bg-[var(--color-brand-green)] text-white rounded-full"
                    : ""
                }
              />
            </div>
            <div className="flex justify-end gap-2 mt-6 w-full">
              <button
                type="button"
                className="px-4 py-2 rounded-lg bg-white border border-[var(--color-brand-green)] text-[var(--color-brand-green)] font-semibold hover:bg-[var(--color-brand-green)] hover:text-white transition"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                type="button"
                className="px-4 py-2 rounded-lg bg-[var(--color-brand-green)] text-[var(--color-brand-tan)] font-semibold shadow hover:bg-[var(--color-brand-brown)] hover:text-white transition"
                disabled={!date}
                onClick={() => setStep(2)}
              >
                Next
              </button>
            </div>
          </>
        )}
        {step === 2 && (
          <>
            {loadingSlots ? (
              <div className="flex items-center justify-center h-32 w-full">
                <span className="text-[var(--color-brand-green)] font-semibold">
                  Loading slots…
                </span>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto mb-4 w-full">
                {TIME_SLOTS.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    disabled={bookedSlots.includes(slot)}
                    aria-disabled={bookedSlots.includes(slot)}
                    tabIndex={bookedSlots.includes(slot) ? -1 : 0}
                    className={`px-2 py-2 rounded text-sm font-semibold border transition flex items-center justify-center
        ${
          bookedSlots.includes(slot)
            ? "bg-gray-200 border-gray-300 text-gray-400 opacity-70 cursor-not-allowed"
            : time === slot
              ? "bg-[var(--color-brand-green)] text-white border-[var(--color-brand-green)]"
              : "bg-white text-[var(--color-brand-brown)] border-[var(--color-brand-green)] hover:bg-[var(--color-brand-green)] hover:text-white"
        }`}
                    onClick={() => !bookedSlots.includes(slot) && setTime(slot)}
                  >
                    <span>
                      {slot}
                      {bookedSlots.includes(slot) && (
                        <span className="ml-1 text-xs font-normal">
                          (Booked)
                        </span>
                      )}
                    </span>
                  </button>
                ))}
              </div>
            )}
            <div className="flex justify-between gap-2 mt-4 w-full">
              <button
                type="button"
                className="px-4 py-2 rounded-lg bg-white border border-[var(--color-brand-green)] text-[var(--color-brand-green)] font-semibold hover:bg-[var(--color-brand-green)] hover:text-white transition"
                onClick={() => setStep(1)}
              >
                Back
              </button>
              <button
                type="button"
                className="px-4 py-2 rounded-lg bg-[var(--color-brand-green)] text-[var(--color-brand-tan)] font-semibold shadow hover:bg-[var(--color-brand-brown)] hover:text-white transition"
                disabled={!time}
                onClick={() => {
                  onConfirm();
                  setStep(1);
                }}
              >
                Confirm
              </button>
            </div>
          </>
        )}
      </div>
    </div>,
    document.body
  );
}

// --- Main BookingPage Component ---
export default function BookingPage() {
  const [selected, setSelected] = useState<string | null>(null);
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [date, setDate] = useState<Date | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [calendarOpen, setCalendarOpen] = useState(false);

  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [dateTimeError, setDateTimeError] = useState("");

  // Form fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  // Fetch booked slots when modal opens or date changes
  useEffect(() => {
    if (calendarOpen && date) {
      setLoadingSlots(true);
      const ymd = date.toISOString().split("T")[0];
      fetch(`/api/bookings?date=${ymd}`)
        .then((res) => res.json())
        .then((data) => setBookedSlots(data.times || []))
        .finally(() => setLoadingSlots(false));
    }
    if (!date) setBookedSlots([]);
  }, [date, calendarOpen]);

  // --- Form handler with custom validation ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected || !date || !time) {
      setDateTimeError(
        "Please select a session type, date, and time before submitting."
      );
      return;
    }
    setDateTimeError("");
    setStatus("loading");
    const body = {
      name,
      email,
      message,
      sessionType: selected,
      date: date ? date.toISOString().split("T")[0] : "",
      time: time ?? "",
    };

    const res = await fetch("/api/bookings", {
      method: "POST",
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" },
    });

    if (res.ok) {
      setStatus("success");
      setDate(null);
      setSelected(null);
      setTime(null);
      setName("");
      setEmail("");
      setMessage("");
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
                onClick={() => setSelected(key)}
                className={`border-2 rounded-xl p-6 text-left shadow-sm transition 
                ${
                  selected === key
                    ? "border-[var(--color-brand-green)] bg-[var(--color-brand-tan)]"
                    : "border-[var(--color-brand-tan)] bg-white hover:border-[var(--color-brand-green)]"
                }
                group focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-green)]`}
                aria-pressed={selected === key}
                aria-label={`Select ${title} session`}
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
          autoComplete="off"
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

          {/* Date/Time Picker with Modal */}
          <div>
            <label
              htmlFor="date"
              className="block text-sm font-medium text-[var(--color-text)] mb-1"
            >
              Preferred Date & Time
            </label>
            <div className="flex items-center gap-3 relative">
              <button
                type="button"
                className="rounded-full p-2 border border-[var(--color-brand-green)] bg-white text-[var(--color-brand-green)] hover:bg-[var(--color-brand-green)] hover:text-white transition"
                onClick={() => setCalendarOpen(true)}
                aria-label="Pick date and time"
              >
                <CalendarDays size={24} />
              </button>
              {/* Not required! */}
              <input
                type="text"
                value={
                  date && time ? `${date.toLocaleDateString()} @ ${time}` : ""
                }
                readOnly
                placeholder="Select date and time"
                className="w-full rounded-md border border-[var(--color-brand-tan)] px-4 py-2 text-sm bg-white cursor-pointer"
                onFocus={() => setCalendarOpen(true)}
                tabIndex={0}
              />
              <DateTimeModal
                open={calendarOpen}
                onClose={() => setCalendarOpen(false)}
                onConfirm={() => setCalendarOpen(false)}
                date={date}
                setDate={setDate}
                time={time}
                setTime={setTime}
                bookedSlots={bookedSlots}
                loadingSlots={loadingSlots}
              />
            </div>
            {/* Custom error below */}
            {dateTimeError && (
              <div className="text-red-600 mt-1 text-sm">{dateTimeError}</div>
            )}
          </div>

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
              value={name}
              onChange={(e) => setName(e.target.value)}
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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border border-[var(--color-brand-tan)] px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-green)]"
            />
          </div>
          <div>
            <label
              htmlFor="message"
              className="block text-sm font-medium text-[var(--color-text)] mb-1"
            >
              Anything you'd like to tell us?
            </label>
            <textarea
              id="message"
              name="message"
              rows={4}
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full rounded-md border border-[var(--color-brand-tan)] px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-green)]"
            />
          </div>
          <button
            type="submit"
            disabled={!selected || !date || !time || status === "loading"}
            className={`px-6 py-3 rounded-xl bg-[var(--color-brand-green)] text-[var(--color-brand-white)] text-sm font-semibold transition hover:opacity-90 ${
              !selected || !date || !time ? "opacity-50 cursor-not-allowed" : ""
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
