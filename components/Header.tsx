"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { UserDropdown } from "@/components/auth/UserDropdown";
import { LoginForm } from "@/components/auth/LoginForm";
import { SignupForm } from "@/components/auth/SignupForm";
import { Button } from "@/components/ui/button";

export const Header = () => {
  const [open, setOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const { user, loading } = useAuth();

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Our Story", href: "/about" },
    { label: "Collection", href: "/collection" },
    { label: "Membership", href: "/membership" },
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

        {/* Authentication Section */}
        <div className="hidden md:flex items-center">
          {loading ? (
            <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
          ) : user ? (
            <UserDropdown />
          ) : (
            <Button
              onClick={() => setShowLogin(true)}
              className="bg-brand-green text-white hover:bg-brand-darkgreen"
            >
              Sign In
            </Button>
          )}
        </div>

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
          
          {/* Mobile Auth */}
          <div className="mt-4">
            {loading ? (
              <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse mx-auto" />
            ) : user ? (
              <div className="text-center">
                <p className="text-brand-brown font-medium">
                  {user.email?.split('@')[0]}
                </p>
                <Link
                  href="/profile"
                  className="text-brand-green hover:text-brand-darkgreen"
                  onClick={() => setOpen(false)}
                >
                  View Profile
                </Link>
              </div>
            ) : (
              <Button
                onClick={() => {
                  setShowLogin(true);
                  setOpen(false);
                }}
                className="bg-brand-green text-white hover:bg-brand-darkgreen"
              >
                Sign In
              </Button>
            )}
          </div>

          <button
            className="absolute top-4 right-4 text-[var(--color-brand-green)]"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
          >
            <X size={28} />
          </button>
        </div>
      )}

      {/* Auth Modals */}
      {showLogin && (
        <LoginForm
          onClose={() => setShowLogin(false)}
          onSwitchToSignup={() => {
            setShowLogin(false);
            setShowSignup(true);
          }}
        />
      )}

      {showSignup && (
        <SignupForm
          onClose={() => setShowSignup(false)}
          onSwitchToLogin={() => {
            setShowSignup(false);
            setShowLogin(true);
          }}
        />
      )}
    </header>
  );
};
