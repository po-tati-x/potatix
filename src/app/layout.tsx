import { ReactNode } from 'react';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from "sonner";
import { QueryProvider } from '@/lib/providers/query-provider';
import { PostHogProvider } from '@/lib/providers/posthog';

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
        <QueryProvider>
        <PostHogProvider>
          {children}
          <Toaster richColors position="top-right" />
          </PostHogProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
