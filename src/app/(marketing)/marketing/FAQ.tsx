"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/shadcn/accordion";
import { MessageCircle } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
}

const FAQ_ITEMS: FAQItem[] = [
  {
    question: "Is it any good?",
    answer: "yes"
  },
  {
    question: "What exactly does Potatix do?",
    answer: "Potatix is a minimalist platform built specifically for software developers who want to sell technical courses. We handle payment processing, video hosting, and basic user auth - that's it. No bloat, no BS, just the core features you actually need."
  },
  {
    question: "How much does it cost?",
    answer: "Just 10% of your revenue. Zero monthly fees, no setup costs, no hidden charges. You only pay when you actually make money. Standard payment processing fees (Stripe's 2.9% + 30¢) apply separately."
  },
  {
    question: "Why did you build this?",
    answer: "Most platforms are bloated with features nobody uses, charge monthly fees even when you're not selling, and weren't built for developers. We created the minimal solution we wish existed - focused exclusively on dev course creators who want a simple way to sell their technical content."
  },
  {
    question: "How long does it take to set up?",
    answer: "Under 10 minutes. Upload your videos, set a price, get a payment link. That's it. No need to waste days configuring complex settings or figuring out unnecessary features."
  },
  {
    question: "What if I have an existing course somewhere else?",
    answer: "Just upload your videos and start selling. No complicated migration process because there's not much to migrate. We're designed for simplicity - but if you need help moving over, just ask."
  },
  {
    question: "What's your tech stack?",
    answer: "Next.js, Supabase, Stripe, and Vercel. We're built by developers, for developers, using modern tech that we trust."
  },
  {
    question: "What about marketing, community features, gamification, AI, etc.?",
    answer: "We don't have any of that stuff. Potatix focuses exclusively on the core problem: letting you sell access to your videos. For everything else, there are better specialized tools you can use. We believe in doing one thing well rather than many things poorly."
  },
  {
    question: "What if I want to leave Potatix?",
    answer: "Export your content and student data anytime. No lock-in, no hostage-taking. We don't believe in trapping users - if we're not providing value, you should be able to leave easily."
  },
  {
    question: "Who is this NOT for?",
    answer: "If you need fancy marketing tools, community features, or complex course structures with quizzes and certificates, Potatix isn't for you. We're for developers who want a simple, no-BS way to sell their technical knowledge without the overhead."
  },
];

function FAQAccordion({ items }: { items: FAQItem[] }) {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
      <Accordion type="single" collapsible className="w-full">
        {items.map((item, index) => (
          <AccordionItem 
            key={index}
            value={`item-${index}`} 
            className={`${index === items.length - 1 ? "" : "border-b border-gray-200"} group transition-all`}
          >
            <AccordionTrigger 
              className="text-sm lg:text-base font-medium text-gray-900 py-3 px-4 hover:text-emerald-600 transition-colors data-[state=open]:text-emerald-600"
            >
              {item.question}
            </AccordionTrigger>
            <AccordionContent className="text-xs sm:text-sm text-gray-600 px-4 pb-4">
              {item.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}

function ContactInfo() {
  return (
    <div className="mt-6 sm:mt-8 text-center">
      <p className="text-xs sm:text-sm text-gray-600">
        Still have questions?{" "}
        <a 
          href="mailto:hi@potatix.com" 
          className="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
        >
          Ask us directly
          <MessageCircle className="w-3.5 h-3.5" />
        </a>
      </p>
      <p className="mt-1 text-xs text-gray-500">
        We reply within 24 hours at hi@potatix.com
      </p>
    </div>
  );
}

export default function FAQ() {
  return (
    <section 
      id="faq" 
      className="relative py-20"
      aria-label="Frequently asked questions"
    >
      <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="text-left w-full max-w-xl mb-6 sm:mb-8">
          <div className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-600">
            <MessageCircle className="w-3.5 h-3.5 mr-1.5" /> 
            Common Questions
          </div>
          
          <h2 className="mt-6 text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-neutral-900 leading-tight">
            Straight Answers
          </h2>
          
          <p className="mt-4 text-sm md:text-base text-neutral-600 max-w-2xl">
            No marketing fluff. Here&apos;s what developers actually want to know.
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <FAQAccordion items={FAQ_ITEMS} />
          <ContactInfo />
        </div>
      </div>
    </section>
  );
} 