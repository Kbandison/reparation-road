// components/shared/Footer.tsx
import Link from "next/link";

export const Footer = () => {
  return (
    <footer className="bg-[var(--color-brand-green)] text-[var(--color-brand-white)] py-12 mt-24">
      <div className="max-w-7xl mx-auto px-4 grid gap-10 md:grid-cols-3">
        {/* Logo & Blurb */}
        <div>
          <h3 className="text-xl font-serif mb-2">Reparation Road</h3>
          <p className="text-sm opacity-80 max-w-sm leading-relaxed">
            Preserving history. Empowering communities. Advancing justice
            through knowledge and access.
          </p>
        </div>

        {/* Navigation Links */}
        <div>
          <h4 className="text-sm font-semibold mb-3">Site Links</h4>
          <ul className="space-y-2 text-sm">
            {[
              { label: "About", href: "/about" },
              { label: "Library", href: "/library" },
              { label: "Genealogy", href: "/booking" },
              { label: "Contact", href: "/contact" },
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
