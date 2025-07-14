'use client';

import { ChevronDown, HelpCircle, MessageCircle } from 'lucide-react';
import { Section } from '@/components/ui/section';
import { Button } from '@/components/ui/new-button';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category?: 'general' | 'technical' | 'payment' | 'support';
}

interface FAQSectionProps {
  /** Optional courseId if caller wants to pass it for future analytics */
  courseId?: string;
}

export function FAQSection({ courseId }: FAQSectionProps) {
  // Platform-level FAQs only – no course-specific fluff
  const faqs: FAQItem[] = [
    {
      id: 'support',
      question: 'What if I need help or have questions?',
      answer:
        'Ping us via in-app chat, community forum, or email. Average response time: <24h.',
      category: 'support',
    },
    {
      id: 'refund',
      question: 'Is there a money-back guarantee?',
      answer: '30-day no-questions-asked refund on all purchases.',
      category: 'payment',
    },
    {
      id: 'sync',
      question: 'Will my progress sync across devices?',
      answer: 'Yes. Your learning progress is saved to the cloud in real-time.',
      category: 'technical',
    },
  ];

  return (
    <Section bg="slate" className="py-24" aria-labelledby="faq-heading">
      {/* Use courseId for analytics & unique element ids */}
      <div className="space-y-12">
        {/* Header */}
        <header className="space-y-3">
          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600">
            <HelpCircle className="h-4 w-4" /> FAQ
          </span>
          <h2 id="faq-heading" className="text-3xl font-semibold tracking-tight text-slate-800">
            Frequently asked questions
          </h2>
          <p className="max-w-xl text-base text-slate-600">
            Everything you need to know before enrolling
          </p>
        </header>

        {/* FAQ list */}
        <ul className="space-y-3">
          {faqs.map((f) => {
            const elementId = `${courseId ?? 'faq'}-${f.id}`;
            return (
              <li key={elementId}>
                <details
                  id={elementId}
                  data-course-id={courseId}
                  className="group overflow-hidden rounded-md border border-slate-200 bg-white [&_summary::-webkit-details-marker]:hidden"
                >
                  <summary className="flex cursor-pointer items-center justify-between gap-2 p-4 text-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500">
                    <h3 className="text-sm font-medium">{f.question}</h3>
                    <ChevronDown
                      className="h-5 w-5 text-slate-500 transition-transform duration-200 group-open:rotate-180"
                      aria-hidden="true"
                    />
                  </summary>

                  <div className="border-t border-slate-100 p-4 pt-3">
                    <p className="text-sm leading-relaxed text-slate-600">{f.answer}</p>
                  </div>
                </details>
              </li>
            );
          })}
        </ul>

        {/* Support CTA */}
        <div className="mt-16 rounded-md border border-slate-200 bg-slate-50 p-6 text-center">
          <span className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-500 shadow-sm">
            <MessageCircle className="h-5 w-5" />
          </span>
          <h3 className="mb-2 text-base font-medium text-slate-800">Still have questions?</h3>
          <p className="mb-5 text-sm text-slate-600">Can&apos;t find the answer you&apos;re looking for? We&apos;re here to help.</p>
          <Button
            type="primary"
            size="small"
            onClick={() => {
              if (globalThis.window !== undefined) {
                globalThis.location.hash = 'contact-support';
              }
            }}
          >
            Contact support
          </Button>
        </div>
      </div>
    </Section>
  );
}
