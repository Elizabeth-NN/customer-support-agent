import Link from "next/link";
import ChatActionButton from "@/components/home/ChatActionButton";

export default function CTA() {
  return (
    <section className="w-full px-6 py-24 md:px-8 md:py-32">
      <div className="relative mx-auto max-w-5xl overflow-hidden rounded-[32px] bg-black p-10 text-center animate-fade-in-up md:p-20">
        <div className="animate-glow absolute right-0 top-0 h-64 w-64 translate-x-1/2 -translate-y-1/2 rounded-full bg-white/5 blur-3xl" />

        <div className="animate-glow-reverse absolute bottom-0 left-0 h-64 w-64 -translate-x-1/2 translate-y-1/2 rounded-full bg-white/5 blur-3xl" />

        <div className="relative">
          <h2 className="mb-6 text-4xl font-bold tracking-tight text-white md:text-5xl animate-fade-in-up">
            See how Rafiki can
            <br />
            support your team.
          </h2>

          <p
            className="mx-auto mb-10 max-w-xl text-lg text-stone-400 animate-fade-in-up"
            style={{ animationDelay: "0.12s" }}
          >
            Explore the interactive demo and learn how document-based answers
            could fit into your customer-support workflow.
          </p>

          <div
            className="flex flex-col items-center justify-center gap-4 sm:flex-row animate-fade-in-up"
            style={{ animationDelay: "0.24s" }}
          >
            <Link
              href="/demo"
              className="rounded-[12px] bg-white px-8 py-4 text-lg font-bold text-black transition-all duration-200 hover:-translate-y-1 hover:bg-stone-100 hover:shadow-lg active:translate-y-0"
            >
              Explore the demo
            </Link>

            <ChatActionButton className="rounded-[12px] border border-white/20 px-8 py-4 text-lg font-bold text-white transition-all duration-200 hover:-translate-y-1 hover:bg-white/5 hover:shadow-lg active:translate-y-0">
              Ask about early access
            </ChatActionButton>
          </div>
        </div>
      </div>
    </section>
  );
}
