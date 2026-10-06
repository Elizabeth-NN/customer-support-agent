"use client";

import { useEffect, useState } from "react";
import { Bars3Icon } from "@heroicons/react/24/outline";
import { UserButton } from "@clerk/nextjs";
import Sidebar from "@/components/dashboard/Sidebar";
import { focusRing } from "@/lib/ui";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Close on Escape, lock body scroll while the drawer is open
  useEffect(() => {
    if (!sidebarOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setSidebarOpen(false);
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [sidebarOpen]);

  return (
    <div className="flex min-h-screen bg-[#F2F0EB] text-[#141414]">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile / tablet top bar */}
        <div className="sticky top-0 z-20 flex items-center justify-between border-b border-black/[0.06] bg-[#F2F0EB]/90 px-4 py-3 backdrop-blur lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            aria-label="Open navigation"
            aria-expanded={sidebarOpen}
            aria-controls="app-sidebar"
            className={`-ml-1 rounded-lg p-2 transition hover:bg-black/[0.05] ${focusRing}`}
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
          <div className="flex items-center gap-2 text-sm font-bold tracking-[-0.02em]">
            <div className="h-5 w-5 rounded-[5px] bg-black" />
            RafikiSupport AI
          </div>
          <div className="flex w-10 justify-end">
            <UserButton appearance={{ elements: { avatarBox: "h-8 w-8" } }} />
          </div>
        </div>

        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}