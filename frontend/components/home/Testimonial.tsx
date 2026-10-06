import { ChatBubbleLeftRightIcon } from "@heroicons/react/24/outline";

export default function Testimonial() {
  return (
    <section
      id="case-studies"
      className="w-full bg-[#F2F0EB] px-6 py-24 md:px-8 md:py-32"
    >
      <div className="mx-auto max-w-4xl text-center animate-fade-in-up">
        <div className="mx-auto mb-8 flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm">
          <ChatBubbleLeftRightIcon className="h-5 w-5 text-stone-600" />
        </div>

        <h2 className="mb-10 text-3xl font-bold leading-tight md:text-4xl">
          &quot;We reduced our average response time from 4 hours to 1.4
          seconds overnight. Rafiki is the best hire we&apos;ve made this
          year.&quot;
        </h2>

        <div
          className="flex items-center justify-center gap-4 animate-fade-in"
          style={{ animationDelay: "0.25s" }}
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-stone-300">
            <span className="text-sm font-bold text-stone-600">JV</span>
          </div>

          <div className="text-left">
            <div className="font-bold">Julian Voss</div>

            <div className="text-sm text-stone-500">
              VP Support, Acme Corp
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}