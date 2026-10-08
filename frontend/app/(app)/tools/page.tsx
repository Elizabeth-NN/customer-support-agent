"use client";

import { FormEvent, useState } from "react";
import {
  ArrowPathIcon,
  CheckCircleIcon,
  MagnifyingGlassIcon,
  UserIcon,
  WrenchScrewdriverIcon,
} from "@heroicons/react/24/outline";

type OrderResult = {
  id: string;
  order_number: string;
  status: string;
  total_amount: string | number;
  currency: string;
  created_at: string;
  updated_at: string;
  customer_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
};

type CustomerResult = {
  id: string;
  external_id: string | null;
  name: string;
  email: string;
  phone: string | null;
  created_at: string;
};

type ToolStatus = "active" | "connected";

function StatusBadge({ status }: { status: ToolStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
        status === "active"
          ? "bg-[#E6F4EA] text-[#1E8E3E]"
          : "bg-[#E8F0FE] text-[#1967D2]"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          status === "active" ? "bg-[#1E8E3E]" : "bg-[#1967D2]"
        }`}
      />
      {status === "active" ? "Active" : "Connected"}
    </span>
  );
}

function ToolCard({
  icon,
  title,
  description,
  status,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  status: ToolStatus;
  children?: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.03)] sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#F2F0EB]">
            {icon}
          </div>

          <div>
            <h2 className="font-bold tracking-[-0.02em]">{title}</h2>
            <p className="mt-1 text-sm leading-5 text-stone-500">
              {description}
            </p>
          </div>
        </div>

        <StatusBadge status={status} />
      </div>

      {children && (
        <div className="mt-6 border-t border-black/[0.06] pt-5">
          {children}
        </div>
      )}
    </section>
  );
}

function ErrorMessage({ message }: { message: string }) {
  return (
    <div className="mt-4 rounded-xl bg-[#FCE8E6] px-4 py-3 text-sm text-[#B3261E]">
      {message}
    </div>
  );
}

export default function ToolsPage() {
  const [orderNumber, setOrderNumber] = useState("");
  const [order, setOrder] = useState<OrderResult | null>(null);
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderError, setOrderError] = useState("");

  const [customerIdentifier, setCustomerIdentifier] = useState("");
  const [customer, setCustomer] = useState<CustomerResult | null>(null);
  const [customerLoading, setCustomerLoading] = useState(false);
  const [customerError, setCustomerError] = useState("");

  async function handleOrderLookup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const identifier = orderNumber.trim();

    if (!identifier || orderLoading) {
      return;
    }

    setOrder(null);
    setOrderError("");
    setOrderLoading(true);

    try {
      const response = await fetch(
        `/api/backend/tools/orders/${encodeURIComponent(identifier)}`,
        {
          method: "GET",
        },
      );

      if (!response.ok) {
        let message = "Order could not be found.";

        try {
          const data = await response.json();
          message = data.detail || message;
        } catch {
          // Keep default message.
        }

        throw new Error(message);
      }

      const data = (await response.json()) as OrderResult;
      setOrder(data);
    } catch (error) {
      setOrderError(
        error instanceof Error
          ? error.message
          : "Something went wrong while looking up the order.",
      );
    } finally {
      setOrderLoading(false);
    }
  }

  async function handleCustomerLookup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const identifier = customerIdentifier.trim();

    if (!identifier || customerLoading) {
      return;
    }

    setCustomer(null);
    setCustomerError("");
    setCustomerLoading(true);

    try {
      const response = await fetch(
        `/api/backend/tools/customers/${encodeURIComponent(identifier)}`,
        {
          method: "GET",
        },
      );

      if (!response.ok) {
        let message = "Customer could not be found.";

        try {
          const data = await response.json();
          message = data.detail || message;
        } catch {
          // Keep default message.
        }

        throw new Error(message);
      }

      const data = (await response.json()) as CustomerResult;
      setCustomer(data);
    } catch (error) {
      setCustomerError(
        error instanceof Error
          ? error.message
          : "Something went wrong while looking up the customer.",
      );
    } finally {
      setCustomerLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10">
      <header className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-400">
          Agent tools
        </p>

        <h1 className="mt-2 text-2xl font-bold tracking-[-0.03em] sm:text-[28px]">
          Tools
        </h1>

        <p className="mt-2 max-w-2xl text-[15px] leading-6 text-[#6B6B6B]">
          Connect your AI agent to business systems so it can retrieve
          customer information, check orders, and hand conversations to a
          human when needed.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <ToolCard
          icon={<MagnifyingGlassIcon className="h-5 w-5" />}
          title="Order Lookup"
          description="Look up order status using an order number."
          status="connected"
        >
          <form onSubmit={handleOrderLookup}>
            <label
              htmlFor="order-number"
              className="text-sm font-semibold"
            >
              Order number
            </label>

            <div className="mt-2 flex flex-col gap-2 sm:flex-row">
              <input
                id="order-number"
                value={orderNumber}
                onChange={(event) => setOrderNumber(event.target.value)}
                placeholder="e.g. RFK-10482"
                className="min-w-0 flex-1 rounded-[10px] border border-black/10 bg-[#FAFAF9] px-3.5 py-2.5 text-sm outline-none transition placeholder:text-stone-400 focus:border-black/30 focus:ring-2 focus:ring-black/5"
              />

              <button
                type="submit"
                disabled={orderLoading || !orderNumber.trim()}
                className="inline-flex items-center justify-center gap-2 rounded-[10px] bg-black px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#2a2a2a] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {orderLoading && (
                  <ArrowPathIcon className="h-4 w-4 animate-spin" />
                )}
                Look up
              </button>
            </div>
          </form>

          {orderError && <ErrorMessage message={orderError} />}

          {order && (
            <div className="mt-4 rounded-xl bg-[#F7F6F3] p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-stone-400">
                    Order
                  </p>
                  <p className="mt-1 font-bold">{order.order_number}</p>
                </div>

                <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold capitalize shadow-sm">
                  {order.status}
                </span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-stone-400">Customer</p>
                  <p className="mt-1 font-medium">{order.customer_name}</p>
                </div>

                <div>
                  <p className="text-xs text-stone-400">Total</p>
                  <p className="mt-1 font-medium">
                    {order.currency} {Number(order.total_amount).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="mt-3 text-xs text-stone-500">
                {order.customer_email}
              </div>

              <div className="mt-3 text-xs text-stone-500">
                {order.customer_phone}
              </div>
            </div>
          )}
        </ToolCard>

        <ToolCard
          icon={<UserIcon className="h-5 w-5" />}
          title="Customer Lookup"
          description="Retrieve customer or account information."
          status="connected"
        >
          <form onSubmit={handleCustomerLookup}>
            <label
              htmlFor="customer-identifier"
              className="text-sm font-semibold"
            >
              Email, phone, or customer ID
            </label>

            <div className="mt-2 flex flex-col gap-2 sm:flex-row">
              <input
                id="customer-identifier"
                value={customerIdentifier}
                onChange={(event) =>
                  setCustomerIdentifier(event.target.value)
                }
                placeholder="e.g. customer@example.com"
                className="min-w-0 flex-1 rounded-[10px] border border-black/10 bg-[#FAFAF9] px-3.5 py-2.5 text-sm outline-none transition placeholder:text-stone-400 focus:border-black/30 focus:ring-2 focus:ring-black/5"
              />

              <button
                type="submit"
                disabled={customerLoading || !customerIdentifier.trim()}
                className="inline-flex items-center justify-center gap-2 rounded-[10px] bg-black px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#2a2a2a] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {customerLoading && (
                  <ArrowPathIcon className="h-4 w-4 animate-spin" />
                )}
                Look up
              </button>
            </div>
          </form>

          {customerError && <ErrorMessage message={customerError} />}

          {customer && (
            <div className="mt-4 rounded-xl bg-[#F7F6F3] p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white">
                  <UserIcon className="h-5 w-5" />
                </div>

                <div>
                  <p className="font-bold">{customer.name}</p>
                  <p className="text-sm text-stone-500">{customer.email}</p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-stone-400">Phone</p>
                  <p className="mt-1 font-medium">
                    {customer.phone || "Not provided"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-stone-400">Customer ID</p>
                  <p className="mt-1 break-all font-medium">
                    {customer.external_id || customer.id}
                  </p>
                </div>
              </div>
            </div>
          )}
        </ToolCard>

        <ToolCard
          icon={<WrenchScrewdriverIcon className="h-5 w-5" />}
          title="Create Support Ticket"
          description="Create a ticket when an issue needs follow-up from your support team."
          status="active"
        >
          <div className="flex items-start gap-3 rounded-xl bg-[#F7F6F3] p-4">
            <CheckCircleIcon className="mt-0.5 h-5 w-5 shrink-0 text-[#1E8E3E]" />

            <div>
              <p className="text-sm font-semibold">
                Connected to the escalation pipeline
              </p>
              <p className="mt-1 text-sm leading-5 text-stone-500">
                When the agent cannot resolve a request confidently, it can
                create a support ticket automatically.
              </p>
            </div>
          </div>
        </ToolCard>

        <ToolCard
          icon={<UserIcon className="h-5 w-5" />}
          title="Human Handoff"
          description="Escalate conversations when the AI confidence is too low."
          status="active"
        >
          <div className="flex items-start gap-3 rounded-xl bg-[#F7F6F3] p-4">
            <CheckCircleIcon className="mt-0.5 h-5 w-5 shrink-0 text-[#1E8E3E]" />

            <div>
              <p className="text-sm font-semibold">
                Confidence-based escalation enabled
              </p>
              <p className="mt-1 text-sm leading-5 text-stone-500">
                Low-confidence conversations are routed to your escalation
                queue instead of allowing the AI to guess.
              </p>
            </div>
          </div>
        </ToolCard>
      </div>
    </div>
  );
}
