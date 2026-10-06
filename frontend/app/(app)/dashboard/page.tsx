"use client";

import { useEffect, useState } from "react";
import {
  ArrowDownTrayIcon,
  ArrowRightIcon,
  Bars3Icon,
  BellAlertIcon,
} from "@heroicons/react/24/outline";
import Sidebar from "@/components/dashboard/Sidebar";
import { focusRing } from "@/lib/ui";

type Tone = "blue" | "green" | "red" | "amber";

const escalations = [
  { title: "Refund policy dispute", category: "High priority", tone: "amber" as Tone, time: "3m ago" },
  { title: "Account lockout assistance", category: "Technical", tone: "blue" as Tone, time: "12m ago" },
  { title: "Enterprise upgrade inquiry", category: "Sales", tone: "green" as Tone, time: "45m ago" },
];

const conversations = [
  { visitor: "Visitor #8291", message: "How do I reset my password via SMS?", status: "Resolved by AI" },
  { visitor: "Sarah Jenkins", message: "I need to cancel my subscription immediately.", status: "Transferred" },
];

const toneStyles: Record<Tone, { pill: string; dot: string }> = {
  blue: { pill: "bg-[#E8F0FE] text-[#1967D2]", dot: "bg-[#1967D2]" },
  green: { pill: "bg-[#E6F4EA] text-[#1E8E3E]", dot: "bg-[#1E8E3E]" },
  red: { pill: "bg-[#FCE8E6] text-[#D93025]", dot: "bg-[#D93025]" },
  amber: { pill: "bg-[#FEF7E0] text-[#B06000]", dot: "bg-[#B06000]" },
};

function Badge({ children, tone }: { children: React.ReactNode; tone: Tone }) {
  return (
    <span
      className={`inline-flex w-fit items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${toneStyles[tone].pill}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${toneStyles[tone].dot}`} />
      {children}
    </span>
  );
}

function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-2xl bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.03)] sm:p-6 ${className}`}
    >
      {children}
    </section>
  );
}

export default function DashboardPage() {
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
          <div className="w-10" />
        </div>

        <main className="mx-auto w-full max-w-[1200px] flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10">
          <header className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="mb-1 text-2xl font-bold tracking-[-0.03em] sm:text-[28px]">
                Overview
              </h1>
              <p className="text-[15px] text-[#6B6B6B]">
                Real-time performance of your AI support agent
              </p>
            </div>

            <div className="flex gap-3">
              <button
                className={`flex flex-1 items-center justify-center gap-2 rounded-[10px] bg-white px-4 py-2.5 text-sm font-semibold shadow-[0_1px_2px_rgba(0,0,0,0.05)] transition hover:shadow-[0_4px_12px_rgba(0,0,0,0.07)] sm:flex-none ${focusRing}`}
              >
                <ArrowDownTrayIcon className="h-4 w-4" />
                Export data
              </button>
              <button
                className={`flex-1 rounded-[10px] bg-black px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#2a2a2a] sm:flex-none ${focusRing}`}
              >
                Edit agent
              </button>
            </div>
          </header>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-6 md:gap-5 lg:grid-cols-12 lg:gap-6">
            {/* Hero metric */}
            <Card className="md:col-span-6 lg:col-span-6">
              <div className="text-sm font-medium text-[#6B6B6B]">Resolution rate</div>
              <div className="mt-2 flex items-baseline gap-3">
                <span className="text-5xl font-bold tabular-nums tracking-[-0.045em] sm:text-6xl">
                  94.2%
                </span>
                <Badge tone="green">Today</Badge>
              </div>

              <div
                className="mt-6 h-2 overflow-hidden rounded-full bg-black/[0.06]"
                role="progressbar"
                aria-valuenow={94.2}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Resolution rate"
              >
                <div className="h-full w-[94.2%] rounded-full bg-black" />
              </div>
              <p className="mt-3 text-sm leading-relaxed text-[#6B6B6B]">
                AI successfully handled 1,240 of 1,316 queries today.
              </p>
            </Card>

            <Card className="md:col-span-3 lg:col-span-3">
              <div className="text-sm font-medium text-[#6B6B6B]">Avg response</div>
              <div className="mt-2 text-4xl font-bold tabular-nums tracking-[-0.04em]">
                1.4s
              </div>
              <p className="mt-3 text-sm leading-relaxed text-[#6B6B6B]">
                Maintaining target performance under peak load.
              </p>
            </Card>

            <Card className="md:col-span-3 lg:col-span-3">
              <div className="text-sm font-medium text-[#6B6B6B]">Human handoffs</div>
              <div className="mt-2 text-4xl font-bold tabular-nums tracking-[-0.04em]">
                18
              </div>
              <p className="mt-3 text-sm leading-relaxed text-[#6B6B6B]">
                Complexity triggers reached for financial verification.
              </p>
            </Card>

            {/* Escalations */}
            <Card className="md:col-span-6 lg:col-span-8">
              <div className="mb-2 flex items-center justify-between">
                <h2 className="text-[17px] font-bold leading-snug">Pending escalations</h2>
                <a
                  href="#"
                  className={`rounded text-sm font-medium text-[#6B6B6B] hover:text-black ${focusRing}`}
                >
                  View all
                </a>
              </div>

              <ul>
                {escalations.map((item) => (
                  <li
                    key={item.title}
                    className="flex flex-col gap-2 border-b border-black/[0.05] py-4 last:border-0 last:pb-1 sm:grid sm:grid-cols-[1fr_auto_72px] sm:items-center sm:gap-5"
                  >
                    <span className="text-sm font-semibold">{item.title}</span>
                    <div className="flex items-center justify-between gap-3 sm:contents">
                      <Badge tone={item.tone}>{item.category}</Badge>
                      <span className="text-[13px] text-[#8A8A8A] sm:text-right">
                        {item.time}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </Card>

            {/* Critical alert */}
            <Card className="flex flex-col md:col-span-6 lg:col-span-4">
              <Badge tone="red">Critical alert</Badge>
              <h2 className="mb-2 mt-4 text-[17px] font-bold leading-snug">
                Documentation gap
              </h2>
              <p className="flex-1 text-sm leading-relaxed text-[#6B6B6B]">
                Users are asking about &quot;v2.4 API keys&quot;, but no relevant
                documents were found in the current knowledge base.
              </p>
              <button
                className={`mt-5 flex w-full items-center justify-center gap-2 rounded-[10px] bg-black px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#2a2a2a] ${focusRing}`}
              >
                Add documentation
                <ArrowRightIcon className="h-4 w-4" />
              </button>
            </Card>

            {/* Conversations */}
            <Card className="md:col-span-6 lg:col-span-8">
              <div className="mb-2 flex items-center justify-between">
                <h2 className="text-[17px] font-bold leading-snug">Recent conversations</h2>
                <a
                  href="#"
                  className={`rounded text-sm font-medium text-[#6B6B6B] hover:text-black ${focusRing}`}
                >
                  View all
                </a>
              </div>

              <ul>
                {conversations.map((c) => (
                  <li
                    key={c.visitor}
                    className="flex flex-col gap-1 border-b border-black/[0.05] py-4 last:border-0 last:pb-1 sm:grid sm:grid-cols-[150px_1fr_auto] sm:items-center sm:gap-5"
                  >
                    <span className="text-sm font-semibold">{c.visitor}</span>
                    <span className="text-sm text-[#6B6B6B]">&quot;{c.message}&quot;</span>
                    <span className="text-[13px] text-[#8A8A8A] sm:text-right">
                      {c.status}
                    </span>
                  </li>
                ))}
              </ul>
            </Card>

            <button
              className={`flex min-h-[120px] items-center justify-center rounded-2xl border-2 border-dashed border-black/10 font-medium text-[#8A8A8A] transition hover:border-black/25 hover:text-[#4a4a4a] md:col-span-6 lg:col-span-4 lg:min-h-0 ${focusRing}`}
            >
              + Add widget
            </button>

            {/* Status bar */}
            <section className="flex flex-col gap-4 rounded-2xl bg-black p-5 text-white sm:flex-row sm:items-center sm:justify-between sm:p-6 md:col-span-6 lg:col-span-12">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10">
                  <BellAlertIcon className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm font-semibold">AI agent status</div>
                  <div className="mt-1 text-xs leading-relaxed text-white/60">
                    All systems operational. RAG pipeline responding normally.
                  </div>
                </div>
              </div>

              <span className="flex items-center gap-2 text-xs font-semibold">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#4ADE80] opacity-60 motion-reduce:animate-none" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-[#4ADE80]" />
                </span>
                Operational
              </span>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}