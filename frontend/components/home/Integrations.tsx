const integrations = [
  {
    name: "ZENDESK",
    mark: "Z",
  },
  {
    name: "INTERCOM",
    mark: "I",
    className: "text-blue-600 italic",
  },
  {
    name: "STRIPE",
    mark: "S",
    className: "text-indigo-600",
  },
  {
    name: "NOTION",
    mark: "N",
  },
];

export default function Integrations() {
  return (
    <section className="w-full bg-white px-8 py-24">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-16 lg:flex-row">
        <div className="lg:w-1/2">
          <div className="badge badge-amber mb-6">Integrations</div>

          <h2 className="mb-6 text-4xl font-bold leading-tight tracking-tight">
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
            ].map((item) => (
              <li key={item} className="flex items-center gap-3">
                <CheckIcon />
                <span className="font-medium">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="grid w-full grid-cols-2 gap-4 lg:w-1/2">
          {integrations.map((integration) => (
            <div
              key={integration.name}
              className="card flex flex-col items-center justify-center gap-4 bg-stone-50/50 p-6"
            >
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-lg bg-white font-bold shadow-sm ${
                  integration.className ?? ""
                }`}
              >
                {integration.mark}
              </div>

              <span className="text-xs font-bold text-stone-400">
                {integration.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CheckIcon() {
  return (
    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-stone-100">
      <svg
        className="h-3 w-3 text-black"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="3"
          d="M5 13l4 4L19 7"
        />
      </svg>
    </div>
  );
}
