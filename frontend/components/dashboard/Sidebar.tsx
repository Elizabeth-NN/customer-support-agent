"use client";

import { useEffect, useState, type ComponentType, type SVGProps } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  useAuth,
  useClerk,
  useUser,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";
import {
  ArrowRightOnRectangleIcon,
  BookOpenIcon,
  ChatBubbleLeftRightIcon,
  ChevronUpDownIcon,
  Cog6ToothIcon,
  ExclamationTriangleIcon,
  HomeIcon,
  ShieldCheckIcon,
  WrenchScrewdriverIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { focusRing } from "@/lib/ui";

export type NavItem = {
  label: string;
  href: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  count?: number;
};

export type NavGroup = {
  group: string;
  items: NavItem[];
};

const navigation: NavGroup[] = [
  {
    group: "Platform",
    items: [
      { label: "Overview", href: "/dashboard", icon: HomeIcon },
      { label: "Conversations", href: "/conversations", icon: ChatBubbleLeftRightIcon },
      {
        label: "Escalations",
        href: "/escalations",
        icon: ExclamationTriangleIcon,
      },
    ],
  },
  {
    group: "Knowledge",
    items: [
      { label: "Documents", href: "/documents", icon: BookOpenIcon },
      { label: "Tools", href: "/tools", icon: WrenchScrewdriverIcon },
    ],
  },
  {
    group: "Quality",
    items: [
      { label: "Evaluations", href: "/evaluations", icon: ShieldCheckIcon },
      { label: "Settings", href: "/settings", icon: Cog6ToothIcon },
    ],
  },
];

function SidebarUser() {
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const { signOut } = useClerk();

  if (!isLoaded) {
    return (
      <div className="flex items-center gap-3 px-3 py-1">
        <div className="h-8 w-8 animate-pulse rounded-full bg-black/10" />
        <div className="h-4 w-24 animate-pulse rounded bg-black/10" />
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="flex flex-col gap-2 px-1">
        <SignInButton mode="modal">
          <button
            type="button"
            className={`rounded-lg px-3 py-2 text-sm font-semibold transition hover:bg-black/[0.05] ${focusRing}`}
          >
            Sign in
          </button>
        </SignInButton>
        <SignUpButton mode="modal">
          <button
            type="button"
            className={`rounded-lg bg-black px-3 py-2 text-sm font-semibold text-white transition hover:bg-[#2a2a2a] ${focusRing}`}
          >
            Sign up
          </button>
        </SignUpButton>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 px-3 py-1">
      <UserButton appearance={{ elements: { avatarBox: "h-8 w-8" } }} />

      <div className="min-w-0 flex-1 text-[13px] leading-[1.4]">
        <div className="truncate font-semibold">
          {user?.fullName ?? user?.username ?? "Account"}
        </div>
        <div className="truncate text-xs text-[#8A8A8A]">
          {user?.primaryEmailAddress?.emailAddress}
        </div>
      </div>

      <button
        type="button"
        onClick={() => signOut({ redirectUrl: "/" })}
        aria-label="Sign out"
        title="Sign out"
        className={`shrink-0 rounded-lg p-2 text-[#6B6B6B] transition hover:bg-black/[0.05] hover:text-black ${focusRing}`}
      >
        <ArrowRightOnRectangleIcon className="h-[18px] w-[18px]" />
      </button>
    </div>
  );
}

type SidebarOverview = {
  document_count: number;
  open_ticket_count: number;
  in_progress_ticket_count: number;
};

type SidebarSettings = {
  name: string;
};

type SidebarProps = {
  open: boolean;
  onClose: () => void;
  items?: NavGroup[];
};

export default function Sidebar({
  open,
  onClose,
  items = navigation,
}: SidebarProps) {
  const pathname = usePathname();

  const [overview, setOverview] = useState<SidebarOverview | null>(null);
  const [businessName, setBusinessName] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadSidebarData() {
      const [overviewResult, settingsResult] = await Promise.allSettled([
        fetch("/api/backend/overview", {
          cache: "no-store",
        }),
        fetch("/api/backend/settings", {
          cache: "no-store",
        }),
      ]);

      if (cancelled) return;

      if (
        overviewResult.status === "fulfilled" &&
        overviewResult.value.ok
      ) {
        try {
          const data = await overviewResult.value.json();
          if (!cancelled) {
            setOverview(data);
          }
        } catch {
          // Keep counts hidden if the response is invalid.
        }
      }

      if (
        settingsResult.status === "fulfilled" &&
        settingsResult.value.ok
      ) {
        try {
          const data = (await settingsResult.value.json()) as SidebarSettings;
          if (!cancelled && data.name?.trim()) {
            setBusinessName(data.name.trim());
          }
        } catch {
          // Keep the generic workspace label if settings cannot be read.
        }
      }
    }

    void loadSidebarData();

    return () => {
      cancelled = true;
    };
  }, []);

  const unresolvedCount = overview
    ? overview.open_ticket_count + overview.in_progress_ticket_count
    : undefined;

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  return (
    <>
      {/* Mobile / tablet backdrop */}
      <AnimatePresence>
        {open && (
          <motion.button
            type="button"
            aria-label="Close navigation"
            onClick={onClose}
            className="fixed inset-0 z-30 cursor-default bg-black/30 backdrop-blur-[2px] lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        id="app-sidebar"
        aria-label="Main navigation"
        className={`fixed inset-y-0 left-0 z-40 flex w-[280px] max-w-[85vw] flex-col border-r border-black/[0.06] bg-[#F2F0EB] px-4 py-5 transition-transform duration-200 ease-out lg:sticky lg:top-0 lg:h-screen lg:w-[248px] lg:max-w-none lg:shrink-0 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-3 pb-6">
          <div className="flex items-center gap-2.5 text-base font-bold tracking-[-0.02em]">
            <div className="h-6 w-6 rounded-md bg-black" />
            RafikiSupport AI
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation"
            className={`rounded-lg p-1.5 text-[#6B6B6B] transition hover:bg-black/[0.05] hover:text-black lg:hidden ${focusRing}`}
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <nav className="-mx-1 flex-1 overflow-y-auto px-1">
          {items.map((section, i) => (
            <div key={section.group} className={i > 0 ? "mt-6" : ""}>
              <div className="mb-2 px-3 text-xs font-medium text-[#8A8A8A]">
                {section.group}
              </div>

              <ul className="space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  const count =
                    item.href === "/escalations"
                      ? unresolvedCount
                      : item.href === "/documents"
                        ? overview?.document_count
                        : item.count;

                  return (
                    <li key={item.label}>
                      <Link
                        href={item.href}
                        onClick={onClose}
                        aria-current={active ? "page" : undefined}
                        className={`flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition ${focusRing} ${
                          active
                            ? "bg-white text-black shadow-[0_1px_2px_rgba(0,0,0,0.05),0_4px_12px_rgba(0,0,0,0.03)]"
                            : "text-[#5F5F5F] hover:bg-black/[0.04] hover:text-black"
                        }`}
                      >
                        <Icon
                          className={`mr-3 h-[18px] w-[18px] ${
                            active ? "opacity-100" : "opacity-60"
                          }`}
                        />

                        <span className="flex-1">{item.label}</span>

                        {count !== undefined && count > 0 ? (
                          <span className="rounded-full bg-black px-1.5 py-0.5 text-[11px] font-semibold leading-none text-white">
                            {count}
                          </span>
                        ) : null}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="border-t border-black/[0.06] pt-4">
          <button
            type="button"
            className={`mb-3 flex w-full items-center justify-between rounded-lg bg-white px-3 py-2.5 text-left shadow-[0_1px_2px_rgba(0,0,0,0.05)] transition hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] ${focusRing}`}
          >
            <span className="truncate text-[13px] font-semibold">{businessName ?? "Business workspace"}</span>
            <ChevronUpDownIcon className="h-4 w-4 text-[#8A8A8A]" />
          </button>

          <SidebarUser />
        </div>
      </aside>
    </>
  );
}