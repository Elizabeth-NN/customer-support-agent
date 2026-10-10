"use client";

import { useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import {
  CheckBadgeIcon,
  ArrowsRightLeftIcon,
  DocumentMagnifyingGlassIcon,
  CheckCircleIcon,
  WrenchScrewdriverIcon,
} from "@heroicons/react/24/outline";

/* -------------------------------------------------------------------------- */
/* Data                                                                       */
/* -------------------------------------------------------------------------- */

type CapabilityId = "resolve" | "handoff" | "knowledge";

const capabilities: {
  id: CapabilityId;
  title: string;
  description: string;
  metric: string;
  icon: typeof CheckBadgeIcon;
  iconClass: string;
  dotClass: string;
}[] = [
  {
    id: "resolve",
    title: "Knowledge-Based Answers",
    description:
      "Rafiki retrieves relevant information from your published documents to help answer customer questions.",
    metric: "Answers grounded in your documents",
    icon: CheckBadgeIcon,
    iconClass: "bg-blue-50 text-blue-600",
    dotClass: "bg-green-500",
  },
  {
    id: "handoff",
    title: "Human Attention",
    description:
      "When the available information is insufficient, Rafiki can flag a question for human attention.",
    metric: "Contextual summaries",
    icon: ArrowsRightLeftIcon,
    iconClass: "bg-amber-50 text-amber-600",
    dotClass: "bg-blue-500",
  },
  {
    id: "knowledge",
    title: "Knowledge Visibility",
    description:
      "Use customer questions to identify topics your documentation may need to cover. Automated gap detection is not yet available.",
    metric: "Review documentation needs",
    icon: DocumentMagnifyingGlassIcon,
    iconClass: "bg-red-50 text-red-600",
    dotClass: "bg-red-500",
  },
];

const gaps = [
  { id: "g1", question: "How do I change my M-Pesa payout number?", count: 23 },
  { id: "g2", question: "Can I export invoices as CSV?", count: 14 },
  { id: "g3", question: "What happens to my plan if I pause billing?", count: 9 },
];

/* -------------------------------------------------------------------------- */
/* Demo panels                                                                */
/* -------------------------------------------------------------------------- */

function Bubble({
  from,
  children,
}: {
  from: "customer" | "rafiki";
  children: ReactNode;
}) {
  const isCustomer = from === "customer";
  return (
    <div className={`flex ${isCustomer ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
          isCustomer
            ? "rounded-br-sm bg-stone-900 text-white"
            : "rounded-bl-sm bg-stone-100 text-stone-800"
        }`}
      >
        {children}
      </div>
    </div>
  );
}

function ToolCall({ name, result }: { name: string; result: string }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm">
      <WrenchScrewdriverIcon className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
      <div className="min-w-0">
        <p className="font-medium text-stone-800">{name}</p>
        <p className="text-stone-500">{result}</p>
      </div>
    </div>
  );
}

function ResolvePanel() {
  return (
    <div className="space-y-3">
      <div className="mb-2 text-xs font-bold uppercase tracking-wide text-stone-400">
        Illustrative example
      </div>
      <Bubble from="customer">
        Where can I find your refund policy?
      </Bubble>
      <ToolCall
        name="Knowledge retrieval"
        result="Searching the published documents for relevant information."
      />
      <Bubble from="rafiki">
        I can help answer this using the available documentation. The answer
        depends on whether a relevant refund policy has been uploaded and
        published for this knowledge base.
      </Bubble>
      <div className="flex items-center gap-2 pt-2 text-sm text-stone-600">
        <CheckCircleIcon className="h-5 w-5" />
        Answers can include references to relevant source material
      </div>
    </div>
  );
}

function HandoffPanel() {
  return (
    <div className="space-y-4">
      <div className="text-xs font-bold uppercase tracking-wide text-stone-400">
        Illustrative example
      </div>
      <Bubble from="customer">
        I cannot find the information I need in your help documents.
      </Bubble>
      <div className="rounded-xl border border-stone-200 bg-white">
        <div className="border-b border-stone-100 px-4 py-3 text-sm font-semibold text-stone-800">
          Example review summary
        </div>
        <dl className="divide-y divide-stone-100">
          {[
            ["Question", "The customer's request"],
            ["Knowledge check", "Relevant published information may be missing"],
            ["Suggested next step", "A support team member reviews the question"],
          ].map(([term, detail]) => (
            <div
              key={term}
              className="grid grid-cols-[7rem_1fr] gap-3 px-4 py-3 text-sm"
            >
              <dt className="text-stone-400">{term}</dt>
              <dd className="text-stone-700">{detail}</dd>
            </div>
          ))}
        </dl>
      </div>
      <p className="text-sm text-stone-500">
        This is a conceptual workflow, not a live ticket or a connected helpdesk.
      </p>
    </div>
  );
}

function KnowledgePanel() {
  const exampleQuestions = [
    "Where can customers find the refund policy?",
    "How can customers contact the support team?",
    "Which documents explain the service process?",
  ];

  return (
    <div className="space-y-3">
      <div className="text-xs font-bold uppercase tracking-wide text-stone-400">
        Illustrative review checklist
      </div>
      <p className="text-sm text-stone-500">
        Example questions a team could use when reviewing its documentation.
        These are not analytics collected by Rafiki.
      </p>
      <ul className="space-y-2">
        {exampleQuestions.map((question) => (
          <li
            key={question}
            className="flex items-start gap-3 rounded-xl border border-stone-200 bg-white px-4 py-3"
          >
            <DocumentMagnifyingGlassIcon className="mt-0.5 h-5 w-5 shrink-0 text-stone-500" />
            <p className="text-sm font-medium text-stone-800">{question}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

const panels: Record<CapabilityId, () => ReactNode> = {
  resolve: () => <ResolvePanel />,
  handoff: () => <HandoffPanel />,
  knowledge: () => <KnowledgePanel />,
};

const windowTitles: Record<CapabilityId, string> = {
  resolve: "Example: knowledge answer",
  handoff: "Example: human attention",
  knowledge: "Example: documentation review",
};

/* -------------------------------------------------------------------------- */
/* Section                                                                    */
/* -------------------------------------------------------------------------- */

export default function Capabilities() {
  const [active, setActive] = useState<CapabilityId>("resolve");
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  function onKeyDown(e: KeyboardEvent, index: number) {
    const last = capabilities.length - 1;
    let next = index;
    if (e.key === "ArrowDown" || e.key === "ArrowRight")
      next = index === last ? 0 : index + 1;
    else if (e.key === "ArrowUp" || e.key === "ArrowLeft")
      next = index === 0 ? last : index - 1;
    else return;
    e.preventDefault();
    const id = capabilities[next].id;
    setActive(id);
    tabRefs.current[id]?.focus();
  }

  return (
    <section
      id="features"
      className="mx-auto w-full max-w-7xl scroll-mt-24 px-6 py-24 md:px-8 md:py-32"
    >
      <div className="mb-14 text-center md:mb-16 animate-fade-in-up">
        <div className="badge badge-green mb-4">Capabilities</div>
        <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
          Give your support team a more useful AI assistant.
        </h2>
      </div>

      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[5fr_7fr] lg:gap-12">
        {/* Tabs */}
        <div
          role="tablist"
          aria-orientation="vertical"
          aria-label="Rafiki capabilities"
          className="flex flex-col gap-3"
        >
          {capabilities.map((c, index) => {
            const Icon = c.icon;
            const selected = c.id === active;
            return (
              <button
                key={c.id}
                ref={(el) => {
                  tabRefs.current[c.id] = el;
                }}
                role="tab"
                id={`tab-${c.id}`}
                aria-selected={selected}
                aria-controls={`panel-${c.id}`}
                tabIndex={selected ? 0 : -1}
                onClick={() => setActive(c.id)}
                onKeyDown={(e) => onKeyDown(e, index)}
                className={`rounded-2xl border p-5 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-900 ${
                  selected
                    ? "border-stone-200 bg-white shadow-sm"
                    : "border-transparent hover:bg-stone-50"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${c.iconClass}`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-bold">{c.title}</h3>
                </div>

                {/* Grid-rows trick animates height without measuring */}
                <div
                  className={`grid transition-[grid-template-rows] duration-300 motion-reduce:transition-none ${
                    selected ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="mt-3 text-sm leading-relaxed text-stone-500">
                      {c.description}
                    </p>
                    <div className="mt-4 flex items-center gap-2">
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${c.dotClass}`}
                      />
                      <span className="text-xs font-semibold text-stone-500">
                        {c.metric}
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Demo window */}
        <div className="card dashboard-card overflow-hidden">
          <div className="flex items-center gap-2 border-b border-stone-100 px-5 py-3">
            <span className="h-2.5 w-2.5 rounded-full bg-stone-200" />
            <span className="h-2.5 w-2.5 rounded-full bg-stone-200" />
            <span className="h-2.5 w-2.5 rounded-full bg-stone-200" />
            <span className="ml-3 text-xs font-medium text-stone-400">
              {windowTitles[active]}
            </span>
          </div>

          <div
            key={active}
            role="tabpanel"
            id={`panel-${active}`}
            aria-labelledby={`tab-${active}`}
            tabIndex={0}
            className="min-h-[26rem] bg-stone-50/50 p-5 md:p-8 animate-fade-in-up focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-stone-900"
          >
            {panels[active]()}
          </div>
        </div>
      </div>
    </section>
  );
}