import { CheckIcon } from "@heroicons/react/24/outline";

export default function Pricing() {
  return (
    <section
      id="pricing"
      className="w-full scroll-mt-24 border-y border-stone-100 bg-white px-8 py-20"
    >
      <div className="mx-auto max-w-6xl">
        <div
          className="mb-16 text-center"
          style={{ animation: "fadeInUp 0.55s ease both" }}
        >
          <div className="badge badge-blue mb-4">Pricing</div>

          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            Simple pricing that scales with you
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-stone-500">
            All plans billed monthly in Kenyan Shillings. No setup fees, cancel
            anytime.
          </p>
        </div>

        <div className="grid grid-cols-1 items-stretch gap-8 md:grid-cols-3">
          <PricingCard
            badge="Starter"
            badgeClass="badge-blue"
            price="KES 4,900"
            description="For small teams putting their first AI agent on the front line."
            features={[
              "1,000 AI resolutions / month",
              "1 connected inbox (Zendesk or Intercom)",
              "Knowledge base ingestion",
              "Basic handoff summaries",
            ]}
            button="Start free trial"
            delay="0.1s"
          />

          <div
            className="dashboard-card relative flex flex-col overflow-hidden rounded-[18px] bg-black p-8 text-white shadow-[0_12px_32px_rgba(0,0,0,0.15)]"
            style={{ animationDelay: "0.18s" }}
          >
            <span className="badge badge-green mb-5 self-start">
              Most Popular
            </span>

            <div className="mb-3 flex items-baseline gap-2">
              <span className="text-4xl font-bold tracking-tight">
                KES 14,900
              </span>

              <span className="text-sm font-semibold text-stone-400">
                /month
              </span>
            </div>

            <p className="mb-8 text-sm leading-relaxed text-stone-400">
              For growing teams that need Rafiki acting, not just answering.
            </p>

            <FeatureList
              features={[
                "10,000 AI resolutions / month",
                "Unlimited connected inboxes",
                "CRM & API actions — refunds, resets, lookups",
                "Knowledge gap alerts & auto-updates",
              ]}
              dark
            />

            <button
              type="button"
              className="mt-auto w-full rounded-[12px] bg-white py-3 font-bold text-black transition-all duration-200 hover:-translate-y-0.5 hover:bg-stone-100"
            >
              Start free trial
            </button>
          </div>

          <PricingCard
            badge="Enterprise"
            badgeClass="badge-amber"
            price="Custom"
            description="Tailored KES pricing for high-volume support operations."
            features={[
              "Unlimited AI resolutions",
              "Dedicated success manager",
              "Custom integrations, SLAs & SSO",
              "24/7 priority support",
            ]}
            button="Talk to sales"
            delay="0.26s"
          />
        </div>

        <p
          className="mt-12 text-center text-xs font-bold uppercase tracking-widest text-stone-400"
          style={{ animation: "fadeIn 0.6s ease 0.4s both" }}
        >
          All prices in KES, excluding VAT · Every plan starts with a 14-day
          free trial
        </p>
      </div>
    </section>
  );
}

function PricingCard({
  badge,
  badgeClass,
  price,
  description,
  features,
  button,
  delay,
}: {
  badge: string;
  badgeClass: string;
  price: string;
  description: string;
  features: string[];
  button: string;
  delay: string;
}) {
  return (
    <div
      className="dashboard-card card flex flex-col p-8"
      style={{ animationDelay: delay }}
    >
      <span className={`badge ${badgeClass} mb-5 self-start`}>{badge}</span>

      <div className="mb-3 flex items-baseline gap-2">
        <span className="text-4xl font-bold tracking-tight">{price}</span>

        {price !== "Custom" && (
          <span className="text-sm font-semibold text-stone-400">/month</span>
        )}
      </div>

      <p className="mb-8 text-sm leading-relaxed text-stone-500">
        {description}
      </p>

      <FeatureList features={features} />

      <button
        type="button"
        className="btn-secondary mt-auto w-full rounded-[12px] py-3 font-bold"
      >
        {button}
      </button>
    </div>
  );
}

function FeatureList({
  features,
  dark = false,
}: {
  features: string[];
  dark?: boolean;
}) {
  return (
    <ul className="mb-10 space-y-3 text-sm font-medium">
      {features.map((feature) => (
        <li key={feature} className="flex items-center gap-3">
          <div
            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
              dark ? "bg-white/10" : "bg-stone-100"
            }`}
          >
            <CheckIcon
              className={`h-3 w-3 ${dark ? "text-white" : "text-black"}`}
              strokeWidth={3}
            />
          </div>

          <span>{feature}</span>
        </li>
      ))}
    </ul>
  );
}