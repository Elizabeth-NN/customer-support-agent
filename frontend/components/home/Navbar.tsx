"use client";

import { useState } from "react";
import Link from "next/link";
import {
  useAuth,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";
import {
  Bars3Icon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

const navLinks = [
  { label: "Platform", href: "#platform" },
  { label: "Knowledge", href: "#knowledge" },
  { label: "Case Studies", href: "#case-studies" },
  { label: "Pricing", href: "#pricing" },
];

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isLoaded, isSignedIn } = useAuth();

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-stone-200/60 bg-[#F2F0EB]/95 backdrop-blur-md">
      <div className="flex w-full items-center justify-between px-6 py-4 md:px-8 md:py-6">
        <div className="flex items-center gap-10">
          <Link
            href="/"
            onClick={closeMobileMenu}
            className="flex items-center gap-3 text-lg font-bold tracking-tight"
          >
            <span className="logo-mark" />
            rafikiSupport AI
          </Link>

          {/* Desktop navigation */}
          <div className="hidden items-center gap-8 text-sm font-medium text-stone-600 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="transition-colors hover:text-black"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        
        {/* Desktop actions */}
        <div className="hidden items-center gap-4 md:flex">
          {!isLoaded ? null : isSignedIn ? (
            <>
              <Link
                href="/dashboard"
                className="rounded-[8px] px-4 py-2 text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5 hover:bg-stone-100 hover:shadow-sm"
              >
                Dashboard
              </Link>

              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "h-9 w-9",
                  },
                }}
              />
            </>
          ) : (
            <>
              <SignInButton mode="redirect">
                <button
                  type="button"
                  className="rounded-[8px] px-4 py-2 text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5 hover:bg-stone-100 hover:shadow-sm active:translate-y-0"
                >
                  Sign in
                </button>
              </SignInButton>

              <SignUpButton mode="redirect">
                <button
                  type="button"
                  className="btn-primary rounded-[8px] px-6 py-2.5 text-sm font-semibold transition-all duration-200 hover:-translate-y-1 hover:shadow-lg active:translate-y-0"
                >
                  Start free trial
                </button>
              </SignUpButton>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileMenuOpen}
          onClick={() => setMobileMenuOpen((open) => !open)}
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-stone-200 bg-white transition-colors hover:bg-stone-50 md:hidden"
        >
          {mobileMenuOpen ? (
            <XMarkIcon className="h-6 w-6" />
          ) : (
            <Bars3Icon className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Mobile navigation */}
      {mobileMenuOpen && (
        <div className="border-t border-stone-200 bg-[#F2F0EB] px-6 pb-6 md:hidden">
          <div className="flex flex-col gap-1 pt-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={closeMobileMenu}
                className="rounded-lg px-4 py-3 text-sm font-semibold text-stone-700 transition-colors hover:bg-white hover:text-black"
              >
                {link.label}
              </Link>
            ))}

            {!isLoaded ? null : isSignedIn ? (
              <>
                <Link
                  href="/dashboard"
                  onClick={closeMobileMenu}
                  className="rounded-lg px-4 py-3 text-sm font-semibold text-stone-700 hover:bg-white hover:text-black"
                >
                  Dashboard
                </Link>

                <div className="flex items-center gap-3 px-4 py-3">
                  <UserButton
                    appearance={{
                      elements: {
                        avatarBox: "h-8 w-8",
                      },
                    }}
                  />
                  <span className="text-sm font-semibold">Account</span>
                </div>
              </>
            ) : (
              <>
                <SignInButton mode="redirect">
                  <button
                    type="button"
                    className="w-full rounded-lg px-4 py-3 text-left text-sm font-semibold text-stone-700 hover:bg-white hover:text-black"
                  >
                    Sign in
                  </button>
                </SignInButton>

                <SignUpButton mode="redirect">
                  <button
                    type="button"
                    className="btn-primary w-full rounded-[8px] px-6 py-3 text-sm font-semibold"
                  >
                    Start free trial
                  </button>
                </SignUpButton>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}