import Link from "next/link";
import ChatActionButton from "@/components/home/ChatActionButton";

const productLinks = [
  { label: "Overview", href: "#platform" },
  { label: "Features", href: "#knowledge" },
  { label: "Integrations", href: "#integrations" },
  { label: "Pricing", href: "#pricing" },
];
const companyLinks = [
  { label: "Case studies", href: "#case-studies" },
  { label: "Talk to us", href: "#support-chat" },
  { label: "Dashboard", href: "/dashboard" },
  { label: "Sign in", href: "/sign-in" },
];

export default function Footer() {
  return (
    <footer className="w-full border-t border-stone-200 px-6 py-16 md:px-8 md:py-20">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-12 animate-fade-in-up md:grid-cols-4 lg:grid-cols-5">
        <div className="col-span-2">
          <Link
            href="/"
            className="mb-6 flex items-center gap-3 text-lg font-bold tracking-tight"
          >
            <span className="logo-mark" />
            rafikiSupport AI
          </Link>

          <p className="mb-8 max-w-xs text-sm leading-relaxed text-stone-500">
            The intelligent layer between your customers and your support team.
            Human-centered AI that actually works.
          </p>

          <ChatActionButton
            className="rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white transition hover:bg-stone-800"
          >
            Chat with support
          </ChatActionButton>
        </div>

        <FooterColumn title="Product" links={productLinks} />
        <FooterColumn title="Explore" links={companyLinks} />
      </div>

      <div className="mx-auto mt-16 flex max-w-7xl flex-col justify-between gap-4 border-t border-stone-100 pt-8 text-xs font-bold text-stone-400 md:mt-20 md:flex-row">
        <div>© 2026 RAFIKI SUPPORT AI. ALL RIGHTS RESERVED.</div>

        <div className="flex flex-wrap gap-6">
          <span>BUILT WITH PRECISION</span>
          <span>SYSTEM STATUS: OPERATIONAL</span>
        </div>
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
      <h4 className="mb-6 text-sm font-bold uppercase tracking-wider">
        {title}
      </h4>

      <ul className="space-y-4 text-sm font-medium text-stone-500">
        {links.map((link) => (
          <li key={link.label}>
            {link.href === "#support-chat" ? (
              <ChatActionButton className="inline-block text-left transition-all duration-200 hover:translate-x-0.5 hover:text-black">
                {link.label}
              </ChatActionButton>
            ) : (
              <Link
                href={link.href}
                className="inline-block transition-all duration-200 hover:translate-x-0.5 hover:text-black"
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
