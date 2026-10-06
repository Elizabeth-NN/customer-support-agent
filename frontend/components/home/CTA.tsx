export default function CTA() {
  return (
    <section className="w-full px-8 py-32">
      <div className="relative mx-auto max-w-5xl overflow-hidden rounded-[32px] bg-black p-12 text-center md:p-20">
        <div className="absolute right-0 top-0 h-64 w-64 translate-x-1/2 -translate-y-1/2 rounded-full bg-white/5 blur-3xl" />

        <div className="absolute bottom-0 left-0 h-64 w-64 -translate-x-1/2 translate-y-1/2 rounded-full bg-white/5 blur-3xl" />

        <div className="relative">
          <h2 className="mb-6 text-4xl font-bold tracking-tight text-white md:text-5xl">
            Ready to scale your
            <br />
            support effortlessly?
          </h2>

          <p className="mx-auto mb-10 max-w-xl text-lg text-stone-400">
            Join 500+ modern companies building better relationships with
            their customers through intelligent automation.
          </p>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <button
              type="button"
              className="rounded-[12px] bg-white px-8 py-4 text-lg font-bold text-black transition-colors hover:bg-stone-100"
            >
              Start your 14-day free trial
            </button>

            <button
              type="button"
              className="rounded-[12px] border border-white/20 px-8 py-4 text-lg font-bold text-white transition-colors hover:bg-white/5"
            >
              Talk to sales
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
