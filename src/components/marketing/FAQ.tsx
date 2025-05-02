"use client";

import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/shadcn/accordion";
import { MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type FAQItem = {
  question: string;
  answer: string;
};

const faqItems: FAQItem[] = [
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

const FAQAccordion = ({ items }: { items: FAQItem[] }) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
    <Accordion type="single" collapsible className="w-full">
      {items.map((item, index) => (
        <AccordionItem 
          key={index}
          value={`item-${index}`} 
          className={cn(
            index === items.length - 1 ? "" : "border-b border-gray-200 dark:border-gray-700",
            "group transition-all duration-200"
          )}
        >
          <AccordionTrigger 
            className="text-sm lg:text-base font-medium text-gray-900 dark:text-white py-3 px-4 hover:text-[#06A28B] dark:hover:text-[#06A28B] transition-colors data-[state=open]:text-[#06A28B]"
          >
            {item.question}
          </AccordionTrigger>
          <AccordionContent className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 px-4 pb-4">
            {item.answer}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  </div>
);

const ContactInfo = () => (
  <div className="mt-6 sm:mt-8 text-center">
    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
      Still have questions?{" "}
      <a 
        href="mailto:hi@potatix.com" 
        className="inline-flex items-center gap-1 text-[#06A28B] hover:text-[#058d79] font-medium transition-colors"
      >
        Ask us directly
        <MessageCircle className="w-3.5 h-3.5" />
      </a>
    </p>
    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
      We reply within 24 hours at hi@potatix.com
    </p>
  </div>
);

const FAQ = () => {
  return (
    <section id="faq" className="py-10 sm:py-12 md:py-16">
      <div className="mx-auto px-6 sm:px-8 lg:px-10 max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-6 sm:mb-8"
        >
          <span className="inline-flex items-center gap-1.5 bg-[#06A28B]/10 text-[#06A28B] text-xs font-medium px-2.5 py-1 rounded-full mb-2">
            <MessageCircle className="w-3.5 h-3.5" />
            Common Questions
          </span>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Straight Answers
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            No marketing fluff. Here's what developers actually want to know.
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="max-w-3xl mx-auto"
        >
          <FAQAccordion items={faqItems} />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <ContactInfo />
        </motion.div>
      </div>
    </section>
  );
};

export default FAQ; 