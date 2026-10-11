import type { ReactNode } from "react";
import Link from "next/link";
import Navbar from "@/components/home/Navbar";
import Footer from "@/components/home/Footer";
import PublicChatWidget from "@/components/chat/PublicChatWidget";

export type LegalSection = {
  heading: string;
  paragraphs?: string[];
  bullets?: string[];
  content?: ReactNode;
};

type LegalPageProps = {
  title: string;
  summary: string;
  sections: LegalSection[];
};

export default function LegalPage({
  title,
  summary,
  sections,
}: LegalPageProps) {
  return (
    <div className="min-h-screen bg-paper">
      <Navbar />

      <main className="px-5 py-12 sm:px-8 sm:py-16">
        <article className="mx-auto max-w-4xl">
          <Link
            href="/"
            className="text-sm font-semibold text-rafiki hover:text-rafiki-dark"
          >
            ← Back to Rafiki
          </Link>

          <header className="mt-8 border-b border-stone-200 pb-8">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-rafiki">
              RafikiSupport AI · Legal information
            </p>

            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
              {title}
            </h1>

            <p className="mt-5 max-w-3xl text-base leading-8 text-stone-600">
              {summary}
            </p>

            <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
              <strong>Draft for review.</strong> This page is a starting
              template, not legal advice. Confirm that it matches the deployed
              product, the responsible business, its data practices, and the
              applicable law before relying on it in production.
            </div>

            <p className="mt-4 text-xs text-stone-500">
              Draft version 1.0 · 11 October 2026
            </p>
          </header>

          <div className="divide-y divide-stone-200">
            {sections.map((section, index) => (
              <section
                key={section.heading}
                className="py-8 sm:py-9"
                aria-labelledby={`legal-section-${index}`}
              >
                <h2
                  id={`legal-section-${index}`}
                  className="text-xl font-semibold text-ink sm:text-2xl"
                >
                  {section.heading}
                </h2>

                {section.paragraphs?.map((paragraph) => (
                  <p
                    key={paragraph}
                    className="mt-4 text-sm leading-7 text-stone-700 sm:text-base"
                  >
                    {paragraph}
                  </p>
                ))}

                {section.bullets && (
                  <ul className="mt-4 list-disc space-y-2 pl-6 text-sm leading-7 text-stone-700 sm:text-base">
                    {section.bullets.map((bullet) => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>
                )}

                {section.content && (
                  <div className="mt-4 text-sm leading-7 text-stone-700 sm:text-base">
                    {section.content}
                  </div>
                )}
              </section>
            ))}
          </div>

          <div className="border-t border-stone-200 py-8 text-sm leading-7 text-stone-600">
            Questions about this document? Contact the responsible service
            operator using the contact details supplied for the service.
            Replace this general wording with a verified legal or privacy
            contact before production.
          </div>
        </article>
      </main>

      <Footer />
      <PublicChatWidget />
    </div>
  );
}
