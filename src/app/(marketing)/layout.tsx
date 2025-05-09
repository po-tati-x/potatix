import Header from '@/components/marketing/layout/Header';
import Footer from '@/components/marketing/layout/Footer';

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 w-full">
        {children}
      </main>
      <footer className="w-full bg-gray-900">
        <Footer />
      </footer>
    </div>
  );
}