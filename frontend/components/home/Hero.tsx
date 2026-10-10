import Link from "next/link";
import { DocumentTextIcon, FlagIcon } from "@heroicons/react/24/outline";

const whatsappUrl =
  "https://wa.me/254715099503?text=Hi%2C%20I%27d%20like%20to%20book%20a%20personalized%20demo%20of%20Rafiki.";

export default function Hero() {
  return (
    <section className="mx-auto grid w-full max-w-7xl items-center gap-12 px-6 pb-24 pt-14 md:px-8 md:pb-32 md:pt-20 lg:grid-cols-[6fr_5fr] lg:gap-16">
      <div>
        <h1 className="max-w-xl text-4xl font-semibold leading-[1.1] md:text-6xl">
          Your documents answer customer questions. Your team handles the rest.
        </h1>

        <p className="mt-6 max-w-prose text-lg leading-relaxed text-stone-600">
          Upload your help articles, policies and guides. Rafiki answers
          customers from them, shows which document the answer came from, and
          passes anything it can&apos;t answer to your support team.
        </p>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary rounded-lg px-6 py-3.5 text-center text-base font-semibold"
          >
            Book a personalized demo
          </a>

          <Link
            href="/demo"
            className="btn-secondary rounded-lg px-6 py-3.5 text-center text-base font-semibold"
          >
            Try the demo
          </Link>
        </div>
      </div>

      <SampleConversation />
    </section>
  );
}

/* The one orchestrated moment on the page: the conversation plays in once
   on load. Reduced-motion users get everything immediately (see globals.css). */
const delay = (ms: number) => ({ animationDelay: `${ms}ms` });

function SampleConversation() {
  return (
    <div
      className="panel overflow-hidden shadow-sm"
      role="img"
      aria-label="Sample conversation: a customer asks about refunds and gets an answer with a source document. A second question that is not covered is flagged for the support team."
    >
      <div className="flex items-center justify-between border-b border-stone-200 px-5 py-3">
        <span className="text-sm font-semibold">Sample conversation</span>
        <span className="text-xs text-stone-500">Example documents</span>
      </div>

      <div className="space-y-4 bg-paper p-5 md:p-6">
        <div
          className="animate-fade-in-up ml-auto max-w-[85%] rounded-2xl rounded-br-sm bg-ink px-4 py-2.5 text-sm text-white"
          style={delay(0)}
        >
          Where can I find your refund policy?
        </div>

        <div
          className="animate-fade-in-up max-w-[92%] rounded-2xl rounded-bl-sm border border-stone-200 bg-white px-4 py-3"
          style={delay(500)}
        >
          <p className="text-sm leading-relaxed text-stone-800">
            Refund requests can be made within 14 days of purchase. The full
            policy is under Returns and refunds in our Terms of Service.
          </p>
          <span className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-marigold/25 px-2.5 py-1 text-xs font-medium text-ink">
            <DocumentTextIcon className="h-3.5 w-3.5" />
            Terms-of-Service.pdf, page 4
          </span>
        </div>

        <div
          className="animate-fade-in-up ml-auto max-w-[85%] rounded-2xl rounded-br-sm bg-ink px-4 py-2.5 text-sm text-white"
          style={delay(1200)}
        >
          How do I change my M-Pesa payout number?
        </div>

        <div
          className="animate-fade-in-up max-w-[92%] rounded-2xl rounded-bl-sm border border-stone-200 bg-white px-4 py-3"
          style={delay(1700)}
        >
          <p className="text-sm leading-relaxed text-stone-800">
            I couldn&apos;t find this in your documents, so I&apos;ve passed it
            to your support team.
          </p>
          <span className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-stone-100 px-2.5 py-1 text-xs font-medium text-stone-700">
            <FlagIcon className="h-3.5 w-3.5" />
            Flagged for your support team
          </span>
        </div>
      </div>
    </div>
  );
}