import Link from "next/link";
import { CheckIcon } from "@heroicons/react/24/outline";
import ChatActionButton from "@/components/home/ChatActionButton";

const currentCapabilities = [
  "Upload supported business documents",
  "Retrieve relevant knowledge for customer questions",
  "Provide source references when available",
  "Flag questions that may need human attention",
];

export default function Pricing() {
  return (
    <section
      id="pricing"
      className="w-full scroll-mt-24 border-y border-stone-100 bg-white px-6 py-20 md:px-8 md:py-24"
    >
      <div className="mx-auto max-w-4xl">
        <div className="mb-12 text-center">
          <div className="badge badge-blue mb-4">Early access</div>

          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            Explore Rafiki before plans are published.
          </h2>

          <p className="mx-auto mt-4 max-w-xl leading-relaxed text-stone-500">
            Pricing and subscription limits have not been finalised. Try the
            interactive demo or get in touch to discuss early access.
          </p>
        </div>

        <div className="dashboard-card mx-auto max-w-2xl rounded-[18px] p-8 md:p-10">
          <div className="mb-3 text-2xl font-bold">What you can explore</div>

          <p className="mb-8 text-sm leading-relaxed text-stone-500">
            The current product focuses on document-based knowledge retrieval
            and support responses. Availability depends on the configured
            knowledge base and application setup.
          </p>

          <ul className="mb-10 space-y-4 text-sm font-medium">
            {currentCapabilities.map((feature) => (
              <li key={feature} className="flex items-start gap-3">
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-stone-100">
                  <CheckIcon
                    className="h-3 w-3 text-black"
                    strokeWidth={3}
                  />
                </div>
                <span>{feature}</span>
              </li>
            ))}
          </ul>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/demo"
              className="btn-primary flex-1 rounded-[12px] px-6 py-3 text-center font-bold"
            >
              Try the demo
            </Link>

            <ChatActionButton className="btn-secondary flex-1 rounded-[12px] px-6 py-3 font-bold">
              Ask about early access
            </ChatActionButton>
          </div>
        </div>

        <p className="mt-8 text-center text-xs leading-relaxed text-stone-400">
          No published subscription prices or free-trial terms are being
          advertised at this stage.
        </p>
      </div>
    </section>
  );
}
