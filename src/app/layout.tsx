import { ReactNode } from 'react';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from "sonner";

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
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
