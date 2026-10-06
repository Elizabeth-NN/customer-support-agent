export default function Testimonial() {
  return (
    <section id="case-studies" className="w-full bg-[#F2F0EB] px-8 py-32">
      <div className="mx-auto max-w-4xl text-center">
        <h2 className="mb-10 text-3xl font-bold leading-tight md:text-4xl">
          &quot;We reduced our average response time from 4 hours to 1.4
          seconds overnight. Rafiki is the best hire we&apos;ve made this
          year.&quot;
        </h2>

        <div className="flex items-center justify-center gap-4">
          <div className="h-12 w-12 rounded-full bg-stone-300" />

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
