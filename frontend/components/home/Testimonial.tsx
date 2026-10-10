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

        <div className="badge badge-green mb-6">The Rafiki approach</div>

        <h2 className="mb-6 text-3xl font-bold leading-tight md:text-4xl">
          Better support starts with answers grounded in your own knowledge.
        </h2>

        <p className="mx-auto max-w-2xl text-lg leading-relaxed text-stone-500">
          Rafiki is designed to retrieve relevant information from your
          published documents, provide source references when available, and
          flag questions that may need human attention.
        </p>
      </div>
    </section>
  );
}
