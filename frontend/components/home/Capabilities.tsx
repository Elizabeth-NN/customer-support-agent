const capabilities = [
  {
    title: "Instant Resolution",
    description:
      "Rafiki learns from your documentation, past conversations, and API tools to solve problems, not just talk about them.",
    metric: "94.2% AI SUCCESS RATE",
    icon: "⚡",
    iconClass: "bg-blue-50 text-blue-600",
    dotClass: "bg-green-500",
  },
  {
    title: "Seamless Handoff",
    description:
      "When things get complex, Rafiki gathers all necessary context and hands off to your humans with a full summary.",
    metric: "CONTEXTUAL SUMMARIES",
    icon: "◉",
    iconClass: "bg-amber-50 text-amber-600",
    dotClass: "bg-blue-500",
  },
  {
    title: "Knowledge Auto-Update",
    description:
      "Identify documentation gaps automatically. Rafiki alerts you when users ask questions you haven't answered yet.",
    metric: "PROACTIVE FIXES",
    icon: "▤",
    iconClass: "bg-red-50 text-red-600",
    dotClass: "bg-red-500",
  },
];

export default function Capabilities() {
  return (
    <section id="knowledge" className="mx-auto w-full max-w-7xl px-8 py-32">
      <div className="mb-20 text-center">
        <div className="badge badge-green mb-4">Capabilities</div>

        <h2 className="text-4xl font-bold tracking-tight">
          Everything your support team
          <br />
          needs to scale infinitely.
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        {capabilities.map((capability) => (
          <div key={capability.title} className="card flex flex-col p-8">
            <div
              className={`mb-6 flex h-12 w-12 items-center justify-center rounded-xl text-xl font-bold ${capability.iconClass}`}
            >
              {capability.icon}
            </div>

            <h3 className="mb-3 text-xl font-bold">{capability.title}</h3>

            <p className="mb-6 text-sm leading-relaxed text-stone-500">
              {capability.description}
            </p>

            <div className="mt-auto border-t border-stone-50 pt-4">
              <div className="flex items-center gap-2">
                <div
                  className={`h-1.5 w-1.5 rounded-full ${capability.dotClass}`}
                />

                <span className="text-xs font-bold text-stone-400">
                  {capability.metric}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
