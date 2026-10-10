
import Navbar from "@/components/home/Navbar";
import StandaloneWidget from "@/components/demo/StandaloneWidget";

export default function DemoPage() {
  return (
    <>
       <Navbar />
      <main className="min-h-screen bg-[#F2F0EB] px-6 py-16 text-black md:px-10">
        
        <div className="mx-auto max-w-4xl">
          

          <div className="mt-16 max-w-3xl">
            <span className="badge badge-blue">Interactive product demo</span>

            <h1 className="mt-6 text-4xl font-bold leading-tight tracking-tight md:text-6xl">
              Meet your AI support assistant.
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-stone-600">
              Try the standalone chat widget below. Ask a support question and
              explore how an AI assistant can respond using a business&apos;s
              published knowledge and share relevant sources.
            </p>

            <div className="mt-10 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm md:p-8">
              <h2 className="text-xl font-bold">Try the live chat</h2>
              <p className="mt-2 leading-relaxed text-stone-600">
                Open the chat launcher in the bottom-right corner to get started.
                The answers available here depend on the knowledge configured for
                this demo.
              </p>
            </div>

            <div className="mt-8 rounded-2xl border border-stone-200 bg-white p-6 md:p-8">
              <h2 className="text-xl font-bold">Want to see it for your business?</h2>
              <p className="mt-2 text-stone-600">
                We can walk through your support use cases and discuss how the
                widget could fit your website.
              </p>
              <a
                href="https://wa.me/254715099503?text=Hi%2C%20I%27d%20like%20to%20discuss%20a%20Rafiki%20demo%20for%20my%20business."
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary mt-5 inline-flex rounded-xl px-6 py-3 font-bold"
              >
                Book a demo on WhatsApp
              </a>
            </div>
          </div>
        </div>

        <StandaloneWidget />
      </main>

     </>  
  );
}
