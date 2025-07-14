import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { MessageCircle } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
}

const FAQ_ITEMS: FAQItem[] = [
  {
    question: "Is it any good?",
    answer: "yes",
  },
  {
    question: "What exactly does Potatix do?",
    answer:
      "Potatix is a minimalist platform built specifically for course creators who want to monetize their expertise. We handle payment processing, video hosting, and basic user auth - that's it. No bloat, no BS, just the core features you actually need.",
  },
  {
    question: "How much does it cost?",
    answer:
      "It's completely free. No monthly fees, no revenue sharing, no hidden charges. You keep 100% of what you earn. Only standard payment processing fees (Stripe's 2.9% + 30¢) apply when you sell.",
  },
  {
    question: "Why did you build this?",
    answer:
      "Most platforms are bloated with features nobody uses, charge monthly fees even when you're not selling, and weren't built with creators in mind. We created the minimal solution we wish existed - focused exclusively on course creators who want a simple way to sell their content without the complexity.",
  },
  {
    question: "How long does it take to set up?",
    answer:
      "Under 10 minutes. Upload your videos, set a price, get a payment link. That's it. No need to waste days configuring complex settings or figuring out unnecessary features.",
  },
  {
    question: "What if I have an existing course somewhere else?",
    answer:
      "Just upload your content and start selling. No complicated migration process because there's not much to migrate. We're designed for simplicity - but if you need help moving over, just ask.",
  },
  {
    question: "What's your tech stack?",
    answer:
      "Next.js, Supabase, Stripe, and Vercel. We're built for reliability and performance using modern tech that we trust.",
  },
  {
    question:
      "What about marketing, community features, gamification, AI, etc.?",
    answer:
      "We don't have any of that stuff. Potatix focuses exclusively on the core problem: letting you sell access to your content. For everything else, there are better specialized tools you can use. We believe in doing one thing well rather than many things poorly.",
  },
  {
    question: "What if I want to leave Potatix?",
    answer:
      "Export your content and student data anytime. No lock-in, no hostage-taking. We don't believe in trapping users - if we're not providing value, you should be able to leave easily.",
  },
  {
    question: "Who is this NOT for?",
    answer:
      "If you need fancy marketing tools, complex community features, or elaborate course structures with extensive quizzes and certificates, Potatix isn't for you. We're for creators who want a simple, no-BS way to sell their knowledge without the overhead.",
  },
  {
    question: "Why is it free? What's the catch?",
    answer:
      "There's no catch. We're focused on product-market fit right now. We want to build something creators genuinely love before worrying about monetization. In the future, we may introduce optional premium features, but the core platform will remain free.",
  },
];

function HighlightedAnswer({ text }: { text: string }) {
  // Highlight specific keywords
  const highlightedText = text
    .replaceAll(
      'free.',
      '<span class="text-emerald-600 font-medium">free</span>.',
    )
    .replaceAll(
      'free,',
      '<span class="text-emerald-600 font-medium">free</span>,',
    )
    .replaceAll('100%', '<span class="text-emerald-600 font-medium">100%</span>')
    .replaceAll(
      'no BS',
      '<span class="text-emerald-600 font-medium">no BS</span>',
    )
    .replaceAll(
      '10 minutes',
      '<span class="text-emerald-600 font-medium">10 minutes</span>',
    )
    .replaceAll(
      'Next.js',
      '<span class="text-emerald-600 font-medium">Next.js</span>',
    )
    .replaceAll(
      'Supabase',
      '<span class="text-emerald-600 font-medium">Supabase</span>',
    )
    .replaceAll(
      'Stripe',
      '<span class="text-emerald-600 font-medium">Stripe</span>',
    )
    .replaceAll(
      'Vercel',
      '<span class="text-emerald-600 font-medium">Vercel</span>',
    );

  return <div dangerouslySetInnerHTML={{ __html: highlightedText }} />;
}

function FAQAccordion({ items }: { items: FAQItem[] }) {
  return (
    <Accordion type="single" collapsible className="w-full">
      {items.map((item, index) => (
        <AccordionItem
          key={index}
          value={`item-${index}`}
          className={index === items.length - 1 ? undefined : "border-b border-slate-200"}
        >
          <AccordionTrigger className="text-base lg:text-base font-medium text-slate-800 py-4 px-0 sm:px-2 hover:text-emerald-600 transition-colors data-[state=open]:text-emerald-600">
            {item.question}
          </AccordionTrigger>
          <AccordionContent className="text-xs sm:text-sm leading-relaxed text-slate-600 pb-4 pt-1">
            <HighlightedAnswer text={item.answer} />
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

export default function FAQ() {
  return (
    <section
      id="faq"
      className="relative py-16 md:py-20"
      aria-label="Frequently asked questions"
    >
      <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="text-center md:text-left w-full max-w-xl mx-auto md:mx-0 mb-10 sm:mb-12">
          <div className="inline-flex items-center mb-4 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">
            <MessageCircle className="w-3.5 h-3.5 mr-1.5" />
            Common Questions
          </div>

          <h2 className="font-roboto mt-0 lg:mt-6 mb-5 text-3xl sm:text-3xl lg:text-4xl tracking-tight text-slate-900 leading-tight">
            Straight{" "}
            <span className="bg-gradient-to-r from-emerald-600 to-emerald-500 bg-clip-text text-transparent">
              Answers
            </span>
          </h2>

          <p className="mt-5 text-base md:text-base text-slate-600 max-w-2xl mx-auto lg:mx-0">
            No marketing fluff. Here&apos;s what creators actually want to know.
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-6">
          <FAQAccordion items={FAQ_ITEMS} />
        </div>
      </div>
    </section>
  );
}
