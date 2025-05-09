import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Authentication | Potatix',
  description: 'Sign in or create an account on Potatix, the platform for developers to sell technical courses with no monthly fees.',
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-white flex flex-col items-center justify-center px-4 py-10">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-4 -right-4 w-60 md:w-80 h-60 md:h-80 bg-[#06A28B]/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-40 md:w-60 h-40 md:h-60 bg-[#06A28B]/10 rounded-full blur-3xl" />
      </div>
      
      <div className="relative max-w-md w-full mx-auto">
        <div className="bg-white shadow-xl rounded-xl overflow-hidden border border-gray-200">
          <div className="p-6 sm:p-8">
            {children}
          </div>
        </div>
      </div>
      
      <div className="mt-8 text-center text-xs text-gray-500">
        <Link href="/" className="hover:text-[#06A28B] transition-colors">
          &larr; Back to Home
        </Link>
      </div>
    </div>
  );
} 