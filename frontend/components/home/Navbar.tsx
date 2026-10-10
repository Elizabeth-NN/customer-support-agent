"use client";

import { useState } from "react";
import Link from "next/link";
import {
  useAuth,
  SignInButton,
  UserButton,
} from "@clerk/nextjs";
import {
  Bars3Icon,
  XMarkIcon,
} from "@heroicons/react/24/outline";


const navLinks = [
  { label: "Features", href: "/#features" },
  { label: "Integrations", href: "/#integrations" },
  { label: "Our approach", href: "/#case-studies" },
  { label: "Pricing", href: "/#pricing" },
];

const whatsappUrl =
  "https://wa.me/254715099503?text=Hi%2C%20I%27d%20like%20to%20book%20a%20personalized%20demo%20of%20Rafiki.";

const quietLink =
  "rounded-lg px-4 py-2 text-sm font-semibold text-stone-700 transition-colors hover:bg-stone-100 hover:text-ink";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isLoaded, isSignedIn } = useAuth();

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-stone-200 bg-paper/90 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-3.5 md:px-8">
        <div className="flex items-center gap-10">
          <Link
            href="/"
            onClick={closeMobileMenu}
            className="flex items-center gap-2.5 font-display text-xl font-semibold tracking-tight"
          >
            <span className="logo-mark" aria-hidden="true" />
            Rafiki
          </Link>

          <div className="hidden items-center gap-7 text-sm font-medium text-stone-600 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="transition-colors hover:text-ink"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <Link href="/demo" className={quietLink}>
            Try the demo
          </Link>

          {!isLoaded ? null : isSignedIn ? (
            <>
              <Link href="/dashboard" className={quietLink}>
                Dashboard
              </Link>
              <UserButton
                appearance={{
                  elements: { avatarBox: "h-9 w-9" },
                }}
              />
            </>
          ) : (
            <>
              <SignInButton mode="redirect">
                <button type="button" className={quietLink}>
                  Sign in
                </button>
              </SignInButton>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary rounded-lg px-5 py-2.5 text-sm font-semibold"
              >
                Book a demo
              </a>
            </>
          )}
        </div>

        <button
          type="button"
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-menu"
          onClick={() => setMobileMenuOpen((open) => !open)}
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-stone-300 bg-white transition-colors hover:bg-stone-50 md:hidden"
        >
          {mobileMenuOpen ? (
            <XMarkIcon className="h-6 w-6" />
          ) : (
            <Bars3Icon className="h-6 w-6" />
          )}
        </button>
      </div>

      {mobileMenuOpen && (
        <div
          id="mobile-menu"
          className="border-t border-stone-200 bg-paper px-6 pb-6 md:hidden"
        >
          <div className="flex flex-col gap-1 pt-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={closeMobileMenu}
                className="rounded-lg px-4 py-3 text-sm font-semibold text-stone-700 transition-colors hover:bg-stone-100 hover:text-ink"
              >
                {link.label}
              </Link>
            ))}

            <Link
              href="/demo"
              onClick={closeMobileMenu}
              className="rounded-lg px-4 py-3 text-sm font-semibold text-stone-700 transition-colors hover:bg-stone-100 hover:text-ink"
            >
              Try the demo
            </Link>

            {!isLoaded ? null : isSignedIn ? (
              <>
                <Link
                  href="/dashboard"
                  onClick={closeMobileMenu}
                  className="rounded-lg px-4 py-3 text-sm font-semibold text-stone-700 hover:bg-stone-100 hover:text-ink"
                >
                  Dashboard
                </Link>
                <div className="flex items-center gap-3 px-4 py-3">
                  <UserButton
                    appearance={{
                      elements: { avatarBox: "h-8 w-8" },
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
                    onClick={closeMobileMenu}
                    className="w-full rounded-lg px-4 py-3 text-left text-sm font-semibold text-stone-700 hover:bg-stone-100 hover:text-ink"
                  >
                    Sign in
                  </button>
                </SignInButton>

                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={closeMobileMenu}
                  className="btn-primary mt-2 rounded-lg px-6 py-3 text-center text-sm font-semibold"
                >
                  Book a demo on WhatsApp
                </a>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}