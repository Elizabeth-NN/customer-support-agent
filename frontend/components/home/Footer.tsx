import Link from "next/link";

const productLinks = ["Overview", "Features", "Integrations", "Pricing"];
const companyLinks = ["About", "Careers", "Blog", "Contact"];
const legalLinks = ["Privacy", "Terms", "Security"];

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

          <div className="flex gap-4">
            <SocialButton label="X">
              <span className="text-xs font-bold">X</span>
            </SocialButton>

            <SocialButton label="LinkedIn">
              <span className="text-xs font-bold">in</span>
            </SocialButton>
          </div>
        </div>

        <FooterColumn title="Product" links={productLinks} />
        <FooterColumn title="Company" links={companyLinks} />
        <FooterColumn title="Legal" links={legalLinks} />
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
  links: string[];
}) {
  return (
    <div>
      <h4 className="mb-6 text-sm font-bold uppercase tracking-wider">
        {title}
      </h4>

      <ul className="space-y-4 text-sm font-medium text-stone-500">
        {links.map((link) => (
          <li key={link}>
            <Link
              href="#"
              className="inline-block transition-all duration-200 hover:translate-x-0.5 hover:text-black"
            >
              {link}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SocialButton({
  children,
  label,
}: {
  children: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      className="flex h-8 w-8 items-center justify-center rounded-full bg-stone-200 transition-all duration-200 hover:-translate-y-0.5 hover:bg-stone-300 hover:shadow-sm active:translate-y-0"
    >
      {children}
    </button>
  );
}