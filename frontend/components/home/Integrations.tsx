import {
  CheckIcon,
  ArrowPathIcon,
  BoltIcon,
  CircleStackIcon,
  RectangleStackIcon,
} from "@heroicons/react/24/outline";

const integrations = [
  {
    name: "ZENDESK",
    mark: "Z",
    icon: RectangleStackIcon,
  },
  {
    name: "INTERCOM",
    mark: "I",
    className: "text-blue-600 italic",
    icon: ArrowPathIcon,
  },
  {
    name: "STRIPE",
    mark: "S",
    className: "text-indigo-600",
    icon: BoltIcon,
  },
  {
    name: "NOTION",
    mark: "N",
    icon: CircleStackIcon,
  },
];

export default function Integrations() {
  return (
    <section id="integrations" className="scroll-mt-24 w-full bg-white px-6 py-20 md:px-8 md:py-24">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-12 lg:flex-row lg:gap-16">
        <div className="lg:w-1/2 animate-fade-in-up">
          <div className="badge badge-amber mb-6">Integrations</div>

          <h2 className="mb-6 text-3xl font-bold leading-tight tracking-tight md:text-4xl">
            Connects to the tools
            <br />
            you already use.
          </h2>

          <p className="mb-8 text-lg leading-relaxed text-stone-500">
            Rafiki doesn&apos;t just talk; it acts. By connecting to your
            existing CRM, database, and internal APIs, it can verify identities,
            process refunds, and reset credentials securely.
          </p>

          <ul className="space-y-4">
            {[
              "Direct Zendesk & Intercom Sync",
              "Secure API Webhooks for custom actions",
              "Knowledge base ingestion from Notion & HelpDocs",
            ].map((item, index) => (
              <li
                key={item}
                className="flex items-center gap-3 animate-fade-in-up"
                style={{
                  animationDelay: `${index * 100 + 150}ms`,
                }}
              >
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-stone-100">
                  <CheckIcon className="h-3 w-3 text-black" strokeWidth={3} />
                </div>

                <span className="font-medium">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="grid w-full grid-cols-2 gap-4 lg:w-1/2">
          {integrations.map((integration, index) => {
            const Icon = integration.icon;

            return (
              <div
                key={integration.name}
                className="card integration-card group flex flex-col items-center justify-center gap-4 bg-stone-50/50 p-6 animate-fade-in-up"
                style={{
                  animationDelay: `${index * 100 + 200}ms`,
                }}
              >
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-lg bg-white font-bold shadow-sm transition-transform duration-300 group-hover:-translate-y-1 ${
                    integration.className ?? ""
                  }`}
                >
                  <span className="group-hover:hidden">
                    {integration.mark}
                  </span>

                  <Icon className="hidden h-6 w-6 group-hover:block" />
                </div>

                <span className="text-xs font-bold text-stone-400 transition-colors duration-300 group-hover:text-black">
                  {integration.name}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}