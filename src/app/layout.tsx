import { ReactNode } from 'react';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from "sonner";
import { QueryProvider } from '@/lib/providers/query-provider';

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
      <body className={inter.className}>
        <QueryProvider>
          {children}
          <Toaster richColors position="top-right" />
        </QueryProvider>
      </body>
    </html>
  );
}
