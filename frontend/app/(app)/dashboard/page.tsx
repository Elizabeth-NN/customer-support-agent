
"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import {
  ArrowDownTrayIcon,
  ArrowRightIcon,
  BellAlertIcon,
} from "@heroicons/react/24/outline";
import { focusRing } from "@/lib/ui";

type TicketStatus = "open" | "in_progress" | "resolved";

type RecentTicket = {
  id: string;
  customer_question: string;
  escalation_reason: string | null;
  status: TicketStatus;
  created_at: string | null;
};

type OverviewData = {
  document_count: number;
  ticket_count: number;
  open_ticket_count: number;
  in_progress_ticket_count: number;
  recent_tickets: RecentTicket[];
};

type Tone = "blue" | "green" | "red" | "amber";

const toneStyles: Record<Tone, { pill: string; dot: string }> = {
  blue: { pill: "bg-[#E8F0FE] text-[#1967D2]", dot: "bg-[#1967D2]" },
  green: { pill: "bg-[#E6F4EA] text-[#1E8E3E]", dot: "bg-[#1E8E3E]" },
  red: { pill: "bg-[#FCE8E6] text-[#D93025]", dot: "bg-[#D93025]" },
  amber: { pill: "bg-[#FEF7E0] text-[#B06000]", dot: "bg-[#B06000]" },
};

function Badge({
  children,
  tone,
}: {
  children: ReactNode;
  tone: Tone;
}) {
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
  children: ReactNode;
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

function formatDate(value: string | null) {
  if (!value) return "Date unavailable";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Date unavailable";

  return new Intl.DateTimeFormat("en-KE", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function statusTone(status: TicketStatus): Tone {
  if (status === "resolved") return "green";
  if (status === "in_progress") return "blue";
  return "amber";
}

function statusLabel(status: TicketStatus) {
  if (status === "in_progress") return "In progress";
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export default function DashboardPage() {
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadOverview() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch("/api/backend/overview", {
          method: "GET",
          cache: "no-store",
        });

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error("Your session may have expired. Please sign in again.");
          }

          if (response.status === 404) {
            throw new Error(
              "No business is associated with this account yet.",
            );
          }

          throw new Error("Unable to load dashboard data. Please try again.");
        }

        const data: OverviewData = await response.json();

        if (!cancelled) {
          setOverview(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "An unexpected error occurred.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadOverview();

    return () => {
      cancelled = true;
    };
  }, []);

  function exportData() {
    if (!overview) return;

    const rows = [
      ["Metric", "Value"],
      ["Knowledge documents", overview.document_count],
      ["Total support tickets", overview.ticket_count],
      ["Open tickets", overview.open_ticket_count],
      ["In-progress tickets", overview.in_progress_ticket_count],
      [],
      ["Ticket ID", "Customer question", "Escalation reason", "Status", "Created at"],
      ...overview.recent_tickets.map((ticket) => [
        ticket.id,
        ticket.customer_question,
        ticket.escalation_reason ?? "",
        ticket.status,
        ticket.created_at ?? "",
      ]),
    ];

    const csv = rows
      .map((row) =>
        row
          .map((cell) => {
            const value = String(cell ?? "");
            return `"${value.replace(/"/g, '""')}"`;
          })
          .join(","),
      )
      .join("\r\n");

    const blob = new Blob(["\uFEFF", csv], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = "customer-support-overview.csv";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10">
      <header className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="mb-1 text-2xl font-bold tracking-[-0.03em] sm:text-[28px]">
            Overview
          </h1>
          <p className="text-[15px] text-[#6B6B6B]">
            Your knowledge base and customer support activity
          </p>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={exportData}
            disabled={!overview || loading}
            className={`flex flex-1 items-center justify-center gap-2 rounded-[10px] bg-white px-4 py-2.5 text-sm font-semibold shadow-[0_1px_2px_rgba(0,0,0,0.05)] transition hover:shadow-[0_4px_12px_rgba(0,0,0,0.07)] disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none ${focusRing}`}
          >
            <ArrowDownTrayIcon className="h-4 w-4" />
            Export data
          </button>

          <Link
            href="/settings"
            className={`flex flex-1 items-center justify-center rounded-[10px] bg-black px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#2a2a2a] sm:flex-none ${focusRing}`}
          >
            Edit settings
          </Link>
        </div>
      </header>

      {error && (
        <div
          role="alert"
          className="mb-5 flex flex-col gap-3 rounded-xl border border-[#F1C6C3] bg-[#FCE8E6] p-4 text-sm text-[#8B1E18] sm:flex-row sm:items-center sm:justify-between"
        >
          <p>{error}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className={`w-fit rounded-lg bg-white px-3 py-2 font-semibold ${focusRing}`}
          >
            Retry
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-6 md:gap-5 lg:grid-cols-12 lg:gap-6">
        <Card className="md:col-span-2 lg:col-span-4">
          <div className="text-sm font-medium text-[#6B6B6B]">
            Knowledge documents
          </div>
          <div className="mt-2 text-4xl font-bold tabular-nums tracking-[-0.04em]">
            {loading ? "—" : (overview?.document_count ?? "—")}
          </div>
          <p className="mt-3 text-sm leading-relaxed text-[#6B6B6B]">
            Documents stored in your knowledge base.
          </p>
          <Link
            href="/documents"
            className={`mt-4 inline-flex items-center gap-2 text-sm font-semibold hover:underline ${focusRing}`}
          >
            Manage documents <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </Card>

        <Card className="md:col-span-2 lg:col-span-4">
          <div className="text-sm font-medium text-[#6B6B6B]">
            Total support tickets
          </div>
          <div className="mt-2 text-4xl font-bold tabular-nums tracking-[-0.04em]">
            {loading ? "—" : (overview?.ticket_count ?? "—")}
          </div>
          <p className="mt-3 text-sm leading-relaxed text-[#6B6B6B]">
            Tickets recorded for your business.
          </p>
          <Link
            href="/escalations"
            className={`mt-4 inline-flex items-center gap-2 text-sm font-semibold hover:underline ${focusRing}`}
          >
            View support tickets <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </Card>

        <Card className="md:col-span-2 lg:col-span-4">
          <div className="text-sm font-medium text-[#6B6B6B]">
            Open tickets
          </div>
          <div className="mt-2 text-4xl font-bold tabular-nums tracking-[-0.04em]">
            {loading ? "—" : (overview?.open_ticket_count ?? "—")}
          </div>
          <p className="mt-3 text-sm leading-relaxed text-[#6B6B6B]">
            Tickets awaiting resolution.
          </p>
          <div className="mt-4 text-sm text-[#6B6B6B]">
            In progress:{" "}
            <span className="font-semibold text-black">
              {loading ? "—" : (overview?.in_progress_ticket_count ?? "—")}
            </span>
          </div>
        </Card>

        <Card className="md:col-span-6 lg:col-span-8">
          <div className="mb-2 flex items-center justify-between gap-3">
            <h2 className="text-[17px] font-bold leading-snug">
              Recent support tickets
            </h2>
            <Link
              href="/escalations"
              className={`rounded text-sm font-medium text-[#6B6B6B] hover:text-black ${focusRing}`}
            >
              View all
            </Link>
          </div>

          {loading ? (
            <p className="py-8 text-sm text-[#6B6B6B]" role="status">
              Loading your support tickets…
            </p>
          ) : !overview?.recent_tickets.length ? (
            <div className="py-8">
              <p className="text-sm font-semibold">No support tickets yet</p>
              <p className="mt-1 text-sm text-[#6B6B6B]">
                Tickets will appear here when they are created.
              </p>
            </div>
          ) : (
            <ul>
              {overview.recent_tickets.map((ticket) => (
                <li
                  key={ticket.id}
                  className="flex flex-col gap-2 border-b border-black/[0.05] py-4 last:border-0 last:pb-1 sm:flex-row sm:items-start sm:justify-between sm:gap-5"
                >
                  <div className="min-w-0 flex-1">
                    <p className="break-words text-sm font-semibold">
                      {ticket.customer_question}
                    </p>
                    {ticket.escalation_reason && (
                      <p className="mt-1 break-words text-sm text-[#6B6B6B]">
                        {ticket.escalation_reason}
                      </p>
                    )}
                    <p className="mt-2 text-xs text-[#8A8A8A]">
                      {formatDate(ticket.created_at)}
                    </p>
                  </div>
                  <Badge tone={statusTone(ticket.status)}>
                    {statusLabel(ticket.status)}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="flex flex-col md:col-span-6 lg:col-span-4">
          <Badge tone="blue">Knowledge base</Badge>
          <h2 className="mb-2 mt-4 text-[17px] font-bold leading-snug">
            Keep your answers up to date
          </h2>
          <p className="flex-1 text-sm leading-relaxed text-[#6B6B6B]">
            Add or update business documents so your support agent can use the
            latest available information when answering questions.
          </p>
          <Link
            href="/documents"
            className={`mt-5 flex w-full items-center justify-center gap-2 rounded-[10px] bg-black px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#2a2a2a] ${focusRing}`}
          >
            Manage documentation
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </Card>

        <section className="flex flex-col gap-4 rounded-2xl bg-black p-5 text-white sm:flex-row sm:items-center sm:justify-between sm:p-6 md:col-span-6 lg:col-span-12">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10">
              <BellAlertIcon className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm font-semibold">Dashboard data</div>
              <div className="mt-1 text-xs leading-relaxed text-white/60">
                {error
                  ? "The latest business data could not be loaded."
                  : loading
                    ? "Retrieving your business records."
                    : "Metrics and tickets are loaded from your business records."}
              </div>
            </div>
          </div>

          <span className="flex items-center gap-2 text-xs font-semibold">
            <span
              className={`h-2 w-2 rounded-full ${
                error ? "bg-[#F87171]" : loading ? "bg-[#FBBF24]" : "bg-[#4ADE80]"
              }`}
            />
            {error ? "Needs attention" : loading ? "Loading" : "Data loaded"}
          </span>
        </section>
      </div>
    </div>
  );
}