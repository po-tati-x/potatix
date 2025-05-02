'use client';

// Import the main content components
import Hero from "@/components/marketing/Hero";
import Features from "@/components/marketing/Features";
import Pricing from "@/components/marketing/Pricing";   
import FAQ from "@/components/marketing/FAQ";
import Waitlist from "@/components/marketing/Waitlist";
import WaitlistFloating from "@/components/marketing/WaitlistFloating";

export default function LandingPage() {
  return (
    <>
      <Hero />
      <Features />
      <Pricing />
      <FAQ />
      <Waitlist />
      <WaitlistFloating scrollThreshold={1000} />
    </>
  );
}