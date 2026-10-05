"use client";

import type { ComponentType, SVGProps } from "react";
import {
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

type NavItem = {
  label: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  active?: boolean;
  count?: number;
};

type NavGroup = { group: string; items: NavItem[] };

const navigation: NavGroup[] = [
  {
    group: "Platform",
    items: [
      { label: "Overview", icon: HomeIcon, active: true },
      { label: "Conversations", icon: ChatBubbleLeftRightIcon },
      { label: "Escalations", icon: ExclamationTriangleIcon, count: 3 },
    ],
  },
  {
    group: "Knowledge",
    items: [
      { label: "Documents", icon: BookOpenIcon },
      { label: "Tools", icon: WrenchScrewdriverIcon },
    ],
  },
  {
    group: "Quality",
    items: [
      { label: "Evaluations", icon: ShieldCheckIcon },
      { label: "Settings", icon: Cog6ToothIcon },
    ],
  },
];

type SidebarProps = {
  /** Whether the drawer is open (only affects screens below `lg`). */
  open: boolean;
  onClose: () => void;
  /** Override the default navigation groups. */
  items?: NavGroup[];
};

export default function Sidebar({
  open,
  onClose,
  items = navigation,
}: SidebarProps) {
  return (
    <>
      {/* Backdrop (mobile / tablet only) */}
      <div
        onClick={onClose}
        aria-hidden="true"
        className={`fixed inset-0 z-30 bg-black/30 backdrop-blur-[2px] transition-opacity duration-200 motion-reduce:transition-none lg:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <aside
        id="app-sidebar"
        aria-label="Main navigation"
        className={`fixed inset-y-0 left-0 z-40 flex w-[280px] max-w-[85vw] flex-col border-r border-black/[0.06] bg-[#F2F0EB] px-4 py-5 transition-transform duration-200 ease-out motion-reduce:transition-none lg:sticky lg:top-0 lg:h-screen lg:w-[248px] lg:max-w-none lg:shrink-0 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full max-lg:invisible"
        }`}
      >
        <div className="flex items-center justify-between px-3 pb-6">
          <div className="flex items-center gap-2.5 text-base font-bold tracking-[-0.02em]">
            <div className="h-6 w-6 rounded-md bg-black" />
            RafikiSupport AI
          </div>
          <button
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
                  return (
                    <li key={item.label}>
                      <a
                        href="#"
                        onClick={onClose}
                        aria-current={item.active ? "page" : undefined}
                        className={`flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition ${focusRing} ${
                          item.active
                            ? "bg-white text-black shadow-[0_1px_2px_rgba(0,0,0,0.05),0_4px_12px_rgba(0,0,0,0.03)]"
                            : "text-[#5F5F5F] hover:bg-black/[0.04] hover:text-black"
                        }`}
                      >
                        <Icon
                          className={`mr-3 h-[18px] w-[18px] ${
                            item.active ? "opacity-100" : "opacity-60"
                          }`}
                        />
                        <span className="flex-1">{item.label}</span>
                        {item.count ? (
                          <span className="rounded-full bg-black px-1.5 py-0.5 text-[11px] font-semibold leading-none text-white">
                            {item.count}
                          </span>
                        ) : null}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="border-t border-black/[0.06] pt-4">
          <button
            className={`mb-3 flex w-full items-center justify-between rounded-lg bg-white px-3 py-2.5 text-left shadow-[0_1px_2px_rgba(0,0,0,0.05)] transition hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] ${focusRing}`}
          >
            <span className="text-[13px] font-semibold">Acme Corp</span>
            <ChevronUpDownIcon className="h-4 w-4 text-[#8A8A8A]" />
          </button>

          <div className="flex items-center gap-3 px-3 py-1">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#DAD6CC] text-xs font-semibold">
              JV
            </div>
            <div className="min-w-0 text-[13px] leading-[1.4]">
              <div className="truncate font-semibold">Julian Voss</div>
              <div className="text-xs text-[#8A8A8A]">Administrator</div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
