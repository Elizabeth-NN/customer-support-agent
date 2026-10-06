import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="relative z-50 flex w-full items-center justify-between px-8 py-6">
      <div className="flex items-center gap-10">
        <Link
          href="/"
          className="flex items-center gap-3 text-lg font-bold tracking-tight"
        >
          <span className="logo-mark" />
          rafikiSupport AI
        </Link>

        <div className="hidden items-center gap-8 text-sm font-medium text-stone-600 md:flex">
          <Link
            href="#platform"
            className="transition-colors hover:text-black"
          >
            Platform
          </Link>

          <Link
            href="#knowledge"
            className="transition-colors hover:text-black"
          >
            Knowledge
          </Link>

          <Link
            href="#case-studies"
            className="transition-colors hover:text-black"
          >
            Case Studies
          </Link>

          <Link
            href="#pricing"
            className="transition-colors hover:text-black"
          >
            Pricing
          </Link>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          type="button"
          className="px-4 py-2 text-sm font-semibold transition-opacity hover:opacity-70"
        >
          Sign in
        </button>

        <button
          type="button"
          className="btn-primary rounded-[8px] px-6 py-2.5 text-sm font-semibold"
        >
          Start free trial
        </button>
      </div>
    </nav>
  );
}
