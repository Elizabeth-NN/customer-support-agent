import Link from "next/link";
import ChatActionButton from "@/components/home/ChatActionButton";

const productLinks = [
  { label: "Features", href: "/#features" },
  { label: "Documents", href: "/#documents" },
  { label: "FAQ", href: "/#faq" },
  { label: "Early access", href: "/#early-access" },
];

const exploreLinks = [
  { label: "Try the demo", href: "/demo" },
  { label: "Talk to us", href: "#support-chat" },
  { label: "Dashboard", href: "/dashboard" },
  { label: "Sign in", href: "/sign-in" },
];

const legalLinks = [
  { label: "Privacy policy", href: "/privacy" },
  { label: "Terms of use", href: "/terms" },
  { label: "Cookie policy", href: "/cookies" },
  { label: "Data processing", href: "/data-processing" },
  { label: "AI disclosure", href: "/ai-disclosure" },
];

export default function Footer() {
  return (
    <footer className="w-full border-t border-stone-200 bg-white px-6 py-16 md:px-8 md:py-20">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-10 md:grid-cols-4 lg:grid-cols-5">
        <div className="col-span-2">
          <Link
            href="/"
            className="mb-5 flex items-center gap-2.5 font-display text-xl font-semibold tracking-tight"
          >
            <span className="logo-mark" aria-hidden="true" />
            Rafiki
          </Link>

          <p className="mb-8 max-w-xs text-sm leading-relaxed text-stone-600">
            Answers from your own documents, with your support team kept in the
            loop.
          </p>

          <ChatActionButton className="btn-primary rounded-lg px-4 py-2 text-sm font-semibold">
            Chat with us
          </ChatActionButton>
        </div>

        <FooterColumn title="Product" links={productLinks} />
        <FooterColumn title="Explore" links={exploreLinks} />
        <FooterColumn title="Legal" links={legalLinks} />
      </div>

      <div className="mx-auto mt-16 max-w-7xl border-t border-stone-200 pt-8 text-sm text-stone-500 md:mt-20">
        © {new Date().getFullYear()} Rafiki. All rights reserved.
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div>
      <h4 className="mb-5 text-sm font-semibold text-ink">{title}</h4>

      <ul className="space-y-3 text-sm text-stone-600">
        {links.map((link) => (
          <li key={link.label}>
            {link.href === "#support-chat" ? (
              <ChatActionButton className="text-left transition-colors hover:text-ink">
                {link.label}
              </ChatActionButton>
            ) : (
              <Link
                href={link.href}
                className="transition-colors hover:text-ink"
              >
                {link.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
