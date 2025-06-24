import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import TestimonialCarousel from '@/components/features/auth/testimonial-carousel';

export const metadata: Metadata = {
  title: 'Authentication | Potatix',
  description: 'Sign in or create an account on Potatix, the platform for developers to sell technical courses with no monthly fees.',
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Auth form */}
      <div className="w-full md:w-[500px] flex flex-col items-center justify-center px-8 py-12 bg-white relative">
        {/* Logo in top left */}
        <div className="absolute top-6 left-6">
          <Link href="/">
            <Image 
              src="https://storage.potatix.com/potatix/images/potatix-logo.svg" 
              alt="Potatix Logo" 
              width={100} 
              height={28} 
              className="h-7 w-auto"
              priority
            />
          </Link>
        </div>
        
        <div className="w-full max-w-[400px]">
          {children}
        </div>
        
        <div className="mt-8 text-xs text-slate-500">
          <Link href="/" className="hover:text-emerald-600 transition-colors">
            &larr; Back to Home
          </Link>
        </div>

        {/* Terms of service at bottom */}
        <div className="absolute bottom-4 w-full max-w-[400px] text-center text-xs text-slate-500">
          <p>
            By continuing, you agree to Potatix&apos;s{' '}
            <Link href="/terms" className="text-emerald-600 hover:text-emerald-700">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="text-emerald-600 hover:text-emerald-700">
              Privacy Policy
            </Link>
            , and to receive periodic emails with updates.
          </p>
        </div>
      </div>
      
      {/* Right side - Quote section */}
      <div className="hidden md:flex flex-1 relative bg-emerald-900 flex-col items-center justify-center p-12 text-white">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-800 to-emerald-950 opacity-90" />
        
        <div className="relative z-10 w-full max-w-md mx-auto">
          <TestimonialCarousel />
        </div>
        
        <div className="absolute bottom-4 left-4 right-4 text-center text-emerald-400 text-xs">
          © {new Date().getFullYear()} Potatix. All rights reserved.
        </div>
      </div>
    </div>
  );
} 