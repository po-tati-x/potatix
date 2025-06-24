import type { ReactNode } from 'react';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from "sonner";
import { PostHogProvider } from '@/lib/client/providers/posthog';
import { AppProviders } from '@/lib/client/providers/app-providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Potatix',
  description: 'Potatix is a platform for creating and sharing educational content',
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en">
      <head><meta name="apple-mobile-web-app-title" content="Potatix" />
      </head>
      <body className={inter.className}>
        <PostHogProvider>
          <AppProviders>
            {children}
          </AppProviders>
          <Toaster richColors position="top-right" />
        </PostHogProvider>
      </body>
    </html>
  );
}
