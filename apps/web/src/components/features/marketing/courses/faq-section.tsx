'use client';

import { ChevronDown, HelpCircle, MessageCircle } from 'lucide-react';
import { Section } from '@/components/ui/section';

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
  // Temporary static data – replace with fetch when backend ready.
  const faqs: FAQItem[] = [
    {
      id: '1',
      question: 'How long do I have access to the course?',
      answer:
        'You get lifetime access. Watch videos whenever you want, forever. All future updates included.',
      category: 'general',
    },
    {
      id: '2',
      question: 'What if I get stuck or have questions?',
      answer:
        'Get help via Q&A, community forum, and docs. Most questions answered within 24 hours.',
      category: 'support',
    },
    {
      id: '3',
      question: 'Do I need any prior experience?',
      answer:
        'The course starts with fundamentals and scales to advanced topics. Beginners welcome.',
      category: 'technical',
    },
    {
      id: '4',
      question: 'Is there a money-back guarantee?',
      answer: '30-day money-back guarantee. Not satisfied? Get a full refund – no questions asked.',
      category: 'payment',
    },
    {
      id: '5',
      question: 'Will I receive a certificate?',
      answer:
        'Yes. Complete the course to receive a verified certificate you can share on LinkedIn.',
      category: 'general',
    },
    {
      id: '6',
      question: 'Can I download the videos?',
      answer:
        'Videos stream online for the best experience, but resources and code can be downloaded.',
      category: 'technical',
    },
    {
      id: '7',
      question: 'What makes this course different from free tutorials?',
      answer:
        'Structured curriculum, production-quality videos, hands-on projects, instructor support, certificate.',
      category: 'general',
    },
    {
      id: '8',
      question: 'How often is the course updated?',
      answer:
        'Content reviewed quarterly. Enrolled students automatically receive new lessons and bonuses.',
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
        <ul role="list" className="space-y-3">
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
          <a
            href="#contact-support"
            className="inline-flex items-center justify-center gap-2 rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-emerald-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
          >
            Contact support
          </a>
        </div>
      </div>
    </Section>
  );
}
