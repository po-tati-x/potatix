import Header from '@/components/features/marketing/layout/navbar';
import Footer from '@/components/features/marketing/layout/footer';
import { BottomBlur } from '@/components/ui/potatix/bottom-blur';
import { TopBlur } from '@/components/ui/potatix/top-blur';
import { Roboto_Flex } from 'next/font/google';

const roboto = Roboto_Flex({
  subsets: ['latin'],
  weight: ['500'],
  display: 'swap',
  variable: '--font-roboto',
});

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${roboto.variable} flex min-h-screen flex-col`}>
      <TopBlur />
      <Header />
      <main className="flex-1 w-full">
        {children}
      </main>
      <footer className="w-full bg-gray-900">
        <Footer />
      </footer>
      <BottomBlur />
    </div>
  );
}