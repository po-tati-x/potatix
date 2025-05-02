import type { Metadata } from 'next/types';
import Script from "next/script";
import WaitlistClient from './waitlist-client';

// Export the metadata for the waitlist page
export const metadata: Metadata = {
  title: 'Join the Waitlist | Potatix - Developer Course Platform',
  description: 'Join the waitlist for early access to Potatix - the platform for developers to sell technical courses with no monthly fees.',
  openGraph: {
    title: 'Join the Waitlist | Potatix',
    description: 'Join the waitlist for early access to Potatix - the platform for developers to sell technical courses with no monthly fees.',
    url: 'https://potatix.com/waitlist',
    siteName: 'Potatix',
    images: [
      {
        url: 'https://potatix.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Potatix - Developer Course Platform',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Join the Waitlist | Potatix',
    description: 'Join the waitlist for early access to Potatix - the platform for developers to sell technical courses with no monthly fees.',
    images: ['https://potatix.com/og-image.png'],
  },
};

// Server Component
export default function WaitlistPage() {
  return (
    <>
      <Script
        id="waitlist-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "Join the Potatix Waitlist",
            "description": "Join the waitlist for early access to Potatix - the platform for developers to sell technical courses with no monthly fees.",
            "url": "https://potatix.com/waitlist",
            "mainEntity": {
              "@type": "ContactPage",
              "name": "Potatix Waitlist Registration",
              "description": "Sign up for early access to the Potatix developer course platform"
            },
            "speakable": {
              "@type": "SpeakableSpecification",
              "cssSelector": ["h1", ".waitlist-description"]
            }
          })
        }}
      />
      
      <WaitlistClient />
    </>
  );
} 