import FAQ from "@/components/features/marketing/faq";
import Features from "@/components/features/marketing/features";
import Hero from "@/components/features/marketing/hero";
import Pricing from "@/components/features/marketing/pricing";

export default function LandingPage() {
  return (
    <>
      <Hero />
      <Features />
      <Pricing />
      <FAQ />
    </>
  );
}