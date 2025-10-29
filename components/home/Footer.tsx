// components/shared/Footer.tsx
"use client";

import Link from "next/link";
import { Instagram, Twitter, Facebook } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-[var(--color-brand-green)] text-[var(--color-brand-white)] py-12 mt-24">
      <div className="max-w-7xl mx-auto px-4 grid gap-10 md:grid-cols-3">
        {/* Logo & Blurb */}
        <div>
          <h3 className="text-xl font-serif mb-2">Reparation Road</h3>
          <p className="text-sm opacity-80 max-w-sm leading-relaxed mb-4">
            Preserving history. Empowering communities. Advancing justice
            through knowledge and access.
          </p>

          {/* Social Media Links */}
          <div className="flex gap-4 mt-4">
            <a
              href="https://www.instagram.com/reparation_road/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:opacity-80 transition-opacity"
              aria-label="Follow us on Instagram"
            >
              <Instagram className="w-6 h-6" />
            </a>
            <a
              href="https://x.com/ReparationRoad"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:opacity-80 transition-opacity"
              aria-label="Follow us on X (Twitter)"
            >
              <Twitter className="w-6 h-6" />
            </a>
            <a
              href="#"
              className="hover:opacity-80 transition-opacity opacity-40 cursor-not-allowed"
              aria-label="Facebook (Coming Soon)"
              onClick={(e) => e.preventDefault()}
            >
              <Facebook className="w-6 h-6" />
            </a>
          </div>
        </div>

        {/* Navigation Links */}
        <div>
          <h4 className="text-sm font-semibold mb-3">Site Links</h4>
          <ul className="space-y-2 text-sm">
            {[
              { label: "Home", href: "/" },
              { label: "Our Story", href: "/about" },
              { label: "Collection", href: "/collection" },
              { label: "Forum", href: "/forum" },
              { label: "Library", href: "/library" },
              { label: "Membership", href: "/membership" },
              { label: "Booking", href: "/booking" },
            ].map(({ label, href }) => (
              <li key={href}>
                <Link href={href} className="hover:underline">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Copyright */}
        <div className="md:text-right flex items-end justify-start md:justify-end">
          <p className="text-sm opacity-70">
            &copy; {new Date().getFullYear()} Reparation Road. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
