"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";

export const Header = () => {
  const [open, setOpen] = useState(false);

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Our Story", href: "/about" },
    { label: "Collection", href: "/collection" },
    // { label: "Shop", href: "/shop" },
    { label: "Booking", href: "/booking" },
  ];

  return (
    <header className="bg-[var(--color-brand-tan)] text-[var(--color-brand-brown)] sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo Brand */}
        <Link href="/" className="flex items-center space-x-2">
          <Image
            src="/Reparation Road-01.png"
            alt="Reparation Road logo"
            width={140}
            height={40}
            className="h-10 w-auto object-contain"
            priority
          />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex gap-10 items-center mx-auto">
          {navLinks.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              className="relative text-sm font-medium group"
            >
              <span className="group-hover:text-[var(--color-brand-green)] transition-colors">
                {label}
              </span>
              <span className="block h-[2px] bg-[var(--color-brand-green)] scale-x-0 group-hover:scale-x-100 transition-transform origin-left mt-1" />
            </Link>
          ))}
        </nav>
        {/* <div>
          <button className="border border-[var(--color-brand-brown)] px-10 py-2 rounded-xl bg-[var(--color-brand-green)] text-white font-bold hover:bg-[var(--color-brand-brown)] hover:text-[var(--color-brand-tan)] hover:font-semibold duration-200 cursor-pointer">
            Log In
          </button>
        </div> */}

        {/* Mobile Toggle */}
        <button
          className="md:hidden text-[var(--color-brand-green)]"
          onClick={() => setOpen(!open)}
          aria-label="Toggle mobile menu"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Fullscreen Menu */}
      {open && (
        <div className="md:hidden fixed inset-0 bg-[var(--color-brand-tan)] z-40 flex flex-col items-center justify-center gap-6 animate-in slide-in-from-top-4 fade-in">
          {navLinks.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              className="text-xl font-medium text-[var(--color-text)] hover:text-[var(--color-brand-green)] transition"
              onClick={() => setOpen(false)}
            >
              {label}
            </Link>
          ))}
          <button
            className="absolute top-4 right-4 text-[var(--color-brand-green)]"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
          >
            <X size={28} />
          </button>
        </div>
      )}
    </header>
  );
};
