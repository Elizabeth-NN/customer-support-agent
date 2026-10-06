export default function Hero() {
  return (
    <section
      id="platform"
      className="relative flex w-full flex-col items-center overflow-hidden px-8 pb-32 pt-20 text-center"
    >
      <div className="hero-gradient absolute inset-0 -z-10" />

      <div className="badge badge-blue mb-6">
        Introducing Rafiki v2.4
      </div>

      <h1 className="mb-6 max-w-4xl text-5xl font-bold leading-[1.1] tracking-tight md:text-7xl">
        Support at the speed
        <br className="hidden md:block" /> of human thought.
      </h1>

      <p className="mb-10 max-w-2xl text-lg leading-relaxed text-stone-500 md:text-xl">
        The world&apos;s first AI agent platform that resolves 94% of customer
        queries instantly, seamlessly handing off to your team only when it
        matters.
      </p>

      <div className="mb-20 flex flex-col gap-4 sm:flex-row">
        <button
          type="button"
          className="btn-primary rounded-[12px] px-8 py-4 text-lg font-bold"
        >
          Book a personalized demo
        </button>

        <button
          type="button"
          className="btn-secondary rounded-[12px] px-8 py-4 text-lg font-bold"
        >
          See it in action
        </button>
      </div>

      <DashboardPreview />
    </section>
  );
}

function DashboardPreview() {
  return (
    <div className="relative mx-auto w-full max-w-5xl">
      <div className="card animate-float border border-white/40 bg-stone-100/50 p-4 backdrop-blur-sm">
        <div className="overflow-hidden rounded-[14px] border border-stone-200 bg-white shadow-2xl">
          <div className="flex items-center justify-between border-b border-stone-100 bg-stone-50/50 px-6 py-4">
            <div className="flex gap-2">
              <div className="h-3 w-3 rounded-full bg-stone-300" />
              <div className="h-3 w-3 rounded-full bg-stone-300" />
              <div className="h-3 w-3 rounded-full bg-stone-300" />
            </div>

            <div className="text-xs font-semibold text-stone-400">
              rafikisupport.ai/dashboard
            </div>

            <div className="w-10" />
          </div>

          <div className="grid grid-cols-1 gap-4 bg-[#F2F0EB] p-6 md:grid-cols-3">
            <MetricCard
              label="Resolution Rate"
              value="94.2%"
              detail="+4.1% from last month"
              badgeClass="badge-blue"
            />

            <MetricCard
              label="Avg Response"
              value="1.4s"
              detail="Under peak load"
              badgeClass="badge-green"
            />

            <MetricCard
              label="Handoffs"
              value="18"
              detail="Triggered by complexity"
              badgeClass="badge-amber"
            />

            <div className="rounded-[18px] bg-white p-6 text-left shadow-sm md:col-span-3">
              <div className="mb-4 text-sm font-bold">Live Escalations</div>

              <div className="space-y-4">
                <Escalation
                  title="Refund policy dispute"
                  badge="High Priority"
                  badgeClass="badge-amber"
                  dotClass="bg-amber-500"
                />

                <Escalation
                  title="Account lockout assistance"
                  badge="Technical"
                  badgeClass="badge-blue"
                  dotClass="bg-blue-500"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card absolute -right-10 -top-10 hidden w-48 scale-90 flex-col gap-2 p-5 lg:flex">
        <div className="badge badge-green">Resolved</div>

        <div className="text-xs font-semibold leading-tight">
          &quot;Thanks! That fixed my login issue immediately.&quot;
        </div>

        <div className="text-[10px] text-stone-400">— Sarah K.</div>
      </div>

      <div className="card absolute -bottom-6 -left-12 hidden w-56 flex-col gap-2 p-5 lg:flex">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-red-500" />
          <div className="text-xs font-bold">Knowledge Gap</div>
        </div>

        <div className="text-[11px] text-stone-500">
          Users asking about API v2.4 keys. No matching docs.
        </div>

        <button
          type="button"
          className="mt-1 rounded-md bg-black py-1.5 text-[10px] text-white"
        >
          Fix documentation
        </button>
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  detail,
  badgeClass,
}: {
  label: string;
  value: string;
  detail: string;
  badgeClass: string;
}) {
  return (
    <div className="rounded-[18px] bg-white p-6 text-left shadow-sm">
      <span className={`badge ${badgeClass} mb-4`}>{label}</span>

      <div className="text-3xl font-bold">{value}</div>

      <div className="mt-2 text-xs text-stone-400">{detail}</div>
    </div>
  );
}

function Escalation({
  title,
  badge,
  badgeClass,
  dotClass,
}: {
  title: string;
  badge: string;
  badgeClass: string;
  dotClass: string;
}) {
  return (
    <div className="flex items-center justify-between border-b border-stone-50 pb-3">
      <div className="flex items-center gap-3">
        <div className={`h-2 w-2 rounded-full ${dotClass}`} />

        <div className="text-sm font-medium">{title}</div>
      </div>

      <div className={`badge ${badgeClass}`}>{badge}</div>
    </div>
  );
}
