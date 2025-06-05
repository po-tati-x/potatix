import Header from '@/components/features/marketing/layout/navbar';
import Footer from '@/components/features/marketing/layout/footer';

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