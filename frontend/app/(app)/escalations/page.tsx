"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowPathIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { focusRing } from "@/lib/ui";

type TicketStatus = "open" | "in_progress" | "resolved";

type SupportTicket = {
  id: string;
  business_id: string;
  customer_question: string;
  escalation_reason: string;
  status: TicketStatus;
  created_at: string;
  updated_at: string;
};

type StatusFilter = "all" | TicketStatus;

const statusConfig: Record<
  TicketStatus,
  {
    label: string;
    className: string;
    dotClassName: string;
  }
> = {
  open: {
    label: "Open",
    className: "bg-[#FEF7E0] text-[#B06000]",
    dotClassName: "bg-[#B06000]",
  },
  in_progress: {
    label: "In progress",
    className: "bg-[#E8F0FE] text-[#1967D2]",
    dotClassName: "bg-[#1967D2]",
  },
  resolved: {
    label: "Resolved",
    className: "bg-[#E6F4EA] text-[#1E8E3E]",
    dotClassName: "bg-[#1E8E3E]",
  },
};

function StatusBadge({ status }: { status: TicketStatus }) {
  const config = statusConfig[status];

  return (
    <span
      className={`inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${config.className}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${config.dotClassName}`}
      />
      {config.label}
    </span>
  );
}

function formatTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unknown";
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function timeAgo(value: string) {
  const date = new Date(value);
  const now = Date.now();
  const difference = now - date.getTime();

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const minutes = Math.floor(difference / 60000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);

  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);

  if (days < 7) return `${days}d ago`;

  return formatTime(value);
}

function SummaryCard({
  label,
  value,
  icon: Icon,
  className,
}: {
  label: string;
  value: number;
  icon: typeof ClockIcon;
  className: string;
}) {
  return (
    <section className="rounded-2xl bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.03)]">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-[#6B6B6B]">{label}</p>
          <p className="mt-2 text-3xl font-bold tracking-[-0.04em]">
            {value}
          </p>
        </div>

        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${className}`}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </section>
  );
}

export default function EscalationsPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  async function loadTickets(showRefreshState = false) {
    if (showRefreshState) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      const response = await fetch("/api/backend/support-tickets", {
        method: "GET",
        cache: "no-store",
      });

      if (!response.ok) {
        let message = "Unable to load escalations.";

        try {
          const data = await response.json();

          if (typeof data?.detail === "string") {
            message = data.detail;
          }
        } catch {
          // Keep the default error message.
        }

        throw new Error(message);
      }

      const data = await response.json();

      if (!Array.isArray(data)) {
        throw new Error("The server returned an invalid escalation list.");
      }

      setTickets(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load escalations.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    void loadTickets();
  }, []);

  async function updateStatus(
    ticketId: string,
    status: TicketStatus,
  ) {
    setUpdatingId(ticketId);
    setError("");

    try {
      const response = await fetch(
        `/api/backend/support-tickets/${ticketId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status }),
        },
      );

      if (!response.ok) {
        let message = "Unable to update the escalation.";

        try {
          const data = await response.json();

          if (typeof data?.detail === "string") {
            message = data.detail;
          }
        } catch {
          // Keep the default error message.
        }

        throw new Error(message);
      }

      const updatedTicket: SupportTicket = await response.json();

      setTickets((current) =>
        current.map((ticket) =>
          ticket.id === updatedTicket.id ? updatedTicket : ticket,
        ),
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update the escalation.",
      );
    } finally {
      setUpdatingId(null);
    }
  }

  const counts = useMemo(
    () => ({
      open: tickets.filter((ticket) => ticket.status === "open").length,
      inProgress: tickets.filter(
        (ticket) => ticket.status === "in_progress",
      ).length,
      resolved: tickets.filter(
        (ticket) => ticket.status === "resolved",
      ).length,
    }),
    [tickets],
  );

  const filteredTickets = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return tickets.filter((ticket) => {
      const matchesStatus =
        statusFilter === "all" || ticket.status === statusFilter;

      if (!matchesStatus) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      return (
        ticket.customer_question.toLowerCase().includes(normalizedSearch) ||
        ticket.escalation_reason.toLowerCase().includes(normalizedSearch)
      );
    });
  }, [tickets, search, statusFilter]);

  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10">
      <header className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="mb-1 text-2xl font-bold tracking-[-0.03em] sm:text-[28px]">
            Escalations
          </h1>
          <p className="text-[15px] text-[#6B6B6B]">
            Review conversations that need human attention.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void loadTickets(true)}
          disabled={refreshing || loading}
          className={`inline-flex items-center justify-center gap-2 rounded-[10px] bg-white px-4 py-2.5 text-sm font-semibold shadow-[0_1px_2px_rgba(0,0,0,0.05)] transition hover:shadow-[0_4px_12px_rgba(0,0,0,0.07)] disabled:cursor-not-allowed disabled:opacity-60 ${focusRing}`}
        >
          <ArrowPathIcon
            className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
          />
          Refresh
        </button>
      </header>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <SummaryCard
          label="Open"
          value={counts.open}
          icon={ExclamationTriangleIcon}
          className="bg-[#FEF7E0] text-[#B06000]"
        />

        <SummaryCard
          label="In progress"
          value={counts.inProgress}
          icon={ClockIcon}
          className="bg-[#E8F0FE] text-[#1967D2]"
        />

        <SummaryCard
          label="Resolved"
          value={counts.resolved}
          icon={CheckCircleIcon}
          className="bg-[#E6F4EA] text-[#1E8E3E]"
        />
      </div>

      <section className="overflow-hidden rounded-2xl bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.03)]">
        <div className="border-b border-black/[0.06] p-4 sm:p-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative min-w-0 flex-1 lg:max-w-md">
              <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8A8A8A]" />

              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search escalations..."
                aria-label="Search escalations"
                className={`w-full rounded-[10px] border border-black/[0.08] bg-[#FAFAF9] py-2.5 pl-9 pr-3 text-sm outline-none transition placeholder:text-[#9A9A9A] focus:border-black/20 focus:bg-white ${focusRing}`}
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto">
              <FunnelIcon className="h-4 w-4 shrink-0 text-[#8A8A8A]" />

              {(
                [
                  ["all", "All"],
                  ["open", "Open"],
                  ["in_progress", "In progress"],
                  ["resolved", "Resolved"],
                ] as const
              ).map(([value, label]) => {
                const active = statusFilter === value;

                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setStatusFilter(value)}
                    className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold transition ${focusRing} ${
                      active
                        ? "bg-black text-white"
                        : "bg-black/[0.04] text-[#6B6B6B] hover:bg-black/[0.08] hover:text-black"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {error ? (
          <div className="m-4 rounded-xl border border-[#D93025]/15 bg-[#FCE8E6] p-4 text-sm text-[#A50E0E] sm:m-5">
            {error}
          </div>
        ) : null}

        {loading ? (
          <div className="divide-y divide-black/[0.05]">
            {[1, 2, 3].map((item) => (
              <div key={item} className="animate-pulse p-5 sm:p-6">
                <div className="h-4 w-2/3 rounded bg-black/[0.06]" />
                <div className="mt-3 h-3 w-1/2 rounded bg-black/[0.05]" />
                <div className="mt-4 h-3 w-1/3 rounded bg-black/[0.04]" />
              </div>
            ))}
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="px-5 py-16 text-center sm:px-8">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-black/[0.04]">
              <CheckCircleIcon className="h-6 w-6 text-[#8A8A8A]" />
            </div>

            <h2 className="mt-4 text-base font-bold">
              {tickets.length === 0
                ? "No escalations yet"
                : "No matching escalations"}
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-[#6B6B6B]">
              {tickets.length === 0
                ? "Escalations created when the AI agent needs human assistance will appear here."
                : "Try changing the status filter or search term."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-black/[0.05]">
            {filteredTickets.map((ticket) => (
              <article
                key={ticket.id}
                className="p-5 transition hover:bg-black/[0.012] sm:p-6"
              >
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusBadge status={ticket.status} />

                        <span className="text-xs text-[#8A8A8A]">
                          {timeAgo(ticket.created_at)}
                        </span>
                      </div>

                      <h2 className="mt-3 text-[15px] font-bold leading-relaxed sm:text-base">
                        {ticket.customer_question}
                      </h2>
                    </div>

                    <div className="shrink-0 text-xs text-[#8A8A8A] sm:text-right">
                      <div>Created</div>
                      <div className="mt-1 font-medium text-[#6B6B6B]">
                        {formatTime(ticket.created_at)}
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl bg-[#F7F6F3] p-4">
                    <div className="text-xs font-semibold uppercase tracking-[0.06em] text-[#8A8A8A]">
                      Escalation reason
                    </div>

                    <p className="mt-2 text-sm leading-relaxed text-[#5F5F5F]">
                      {ticket.escalation_reason}
                    </p>
                  </div>

                  <div className="flex flex-col gap-3 border-t border-black/[0.05] pt-4 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-xs text-[#8A8A8A]">
                      Last updated {timeAgo(ticket.updated_at)}
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {ticket.status === "open" ? (
                        <button
                          type="button"
                          disabled={updatingId === ticket.id}
                          onClick={() =>
                            void updateStatus(ticket.id, "in_progress")
                          }
                          className={`rounded-[9px] bg-black px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#2a2a2a] disabled:cursor-not-allowed disabled:opacity-60 ${focusRing}`}
                        >
                          {updatingId === ticket.id
                            ? "Updating..."
                            : "Start working"}
                        </button>
                      ) : null}

                      {ticket.status === "in_progress" ? (
                        <button
                          type="button"
                          disabled={updatingId === ticket.id}
                          onClick={() =>
                            void updateStatus(ticket.id, "resolved")
                          }
                          className={`rounded-[9px] bg-black px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#2a2a2a] disabled:cursor-not-allowed disabled:opacity-60 ${focusRing}`}
                        >
                          {updatingId === ticket.id
                            ? "Updating..."
                            : "Mark resolved"}
                        </button>
                      ) : null}

                      {ticket.status === "resolved" ? (
                        <button
                          type="button"
                          disabled={updatingId === ticket.id}
                          onClick={() =>
                            void updateStatus(ticket.id, "open")
                          }
                          className={`rounded-[9px] border border-black/[0.08] bg-white px-3 py-2 text-xs font-semibold text-[#5F5F5F] transition hover:border-black/20 hover:text-black disabled:cursor-not-allowed disabled:opacity-60 ${focusRing}`}
                        >
                          Reopen
                        </button>
                      ) : null}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {!loading && filteredTickets.length > 0 ? (
          <div className="border-t border-black/[0.06] bg-[#FAFAF9] px-5 py-3 text-xs text-[#8A8A8A]">
            Showing {filteredTickets.length} of {tickets.length} escalation
            {tickets.length === 1 ? "" : "s"}
          </div>
        ) : null}
      </section>
    </div>
  );
}
