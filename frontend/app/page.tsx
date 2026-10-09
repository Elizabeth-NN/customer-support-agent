import Navbar from "@/components/home/Navbar";
import Hero from "@/components/home/Hero";
import Pricing from "@/components/home/Pricing";
import Capabilities from "@/components/home/Capabilities";
import Integrations from "@/components/home/Integrations";
import Testimonial from "@/components/home/Testimonial";
import CTA from "@/components/home/CTA";
import Footer from "@/components/home/Footer";
import PublicChatWidget from "@/components/chat/PublicChatWidget";

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero />
      <Pricing />
      <Capabilities />
      <Integrations />
      <Testimonial />
      <CTA />
      <Footer />
      <PublicChatWidget />
    </main>
  );
}