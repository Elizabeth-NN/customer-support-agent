import {
  DocumentTextIcon,
  DocumentIcon,
  CodeBracketIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";

const documentFormats = [
  {
    name: "PDF",
    description: "Portable documents",
    icon: DocumentIcon,
  },
  {
    name: "DOCX",
    description: "Word documents",
    icon: DocumentTextIcon,
  },
  {
    name: "Markdown",
    description: "MD and Markdown files",
    icon: CodeBracketIcon,
  },
  {
    name: "Plain text",
    description: "TXT files",
    icon: MagnifyingGlassIcon,
  },
];

export default function Integrations() {
  return (
    <section
      id="integrations"
      className="scroll-mt-24 w-full bg-white px-6 py-20 md:px-8 md:py-24"
    >
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-12 lg:flex-row lg:gap-16">
        <div className="animate-fade-in-up lg:w-1/2">
          <div className="badge badge-amber mb-6">Knowledge sources</div>

          <h2 className="mb-6 text-3xl font-bold leading-tight tracking-tight md:text-4xl">
            Build your support knowledge base.
          </h2>

          <p className="mb-8 text-lg leading-relaxed text-stone-500">
            Upload your existing business documents. Rafiki processes supported
            files so relevant information can be retrieved when a customer asks
            a question.
          </p>

          <ul className="space-y-4">
            {[
              "Upload PDF, DOCX, Markdown, and TXT documents",
              "Manage documents in your knowledge base",
              "Ground answers in retrieved information",
              "Show source references when available",
            ].map((item, index) => (
              <li
                key={item}
                className="flex items-center gap-3 animate-fade-in-up"
                style={{ animationDelay: `${index * 100 + 150}ms` }}
              >
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-stone-100">
                  <DocumentTextIcon className="h-3 w-3 text-black" />
                </div>
                <span className="font-medium">{item}</span>
              </li>
            ))}
          </ul>

          <p className="mt-6 text-sm leading-relaxed text-stone-500">
            Direct integrations with external helpdesks and business systems
            are not yet available.
          </p>
        </div>

        <div className="grid w-full grid-cols-2 gap-4 lg:w-1/2">
          {documentFormats.map((format, index) => {
            const Icon = format.icon;

            return (
              <div
                key={format.name}
                className="card integration-card group flex flex-col items-center justify-center gap-4 bg-stone-50/50 p-6 animate-fade-in-up"
                style={{ animationDelay: `${index * 100 + 200}ms` }}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white shadow-sm transition-transform duration-300 group-hover:-translate-y-1">
                  <Icon className="h-6 w-6 text-stone-700" />
                </div>
                <span className="text-xs font-bold text-stone-700">
                  {format.name}
                </span>
                <span className="text-center text-xs text-stone-400">
                  {format.description}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
