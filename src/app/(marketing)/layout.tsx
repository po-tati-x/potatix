import '@/app/globals.css'
import Header from '@/components/marketing/layout/Header';
import Footer from '@/components/marketing/layout/Footer';

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className="flex-1 w-full relative">
        {children}
      </main>
      <div className="w-full bg-gray-900">
        <Footer />
      </div>
    </>
  )
}