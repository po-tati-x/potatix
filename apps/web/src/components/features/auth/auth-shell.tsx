import Image from 'next/image';
import Link from 'next/link';
import TestimonialCarousel from '@/components/features/auth/testimonial-carousel';

interface AuthShellProps {
  children: React.ReactNode;
}

/**
 * Shared layout wrapper for all auth-related pages (login, signup) both on the
 * root host and on course sub-domains. Keeps branding consistent.
 */
export default function AuthShell({ children }: AuthShellProps) {
  return (
    <div className="min-h-screen flex">
      {/* Left side – auth content */}
      <div className="w-full md:w-[500px] flex flex-col items-center justify-center px-8 py-12 bg-white relative">
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

        <div className="w-full max-w-[400px]">{children}</div>

        <div className="mt-8 text-xs text-slate-500">
          <Link href="/" className="hover:text-emerald-600 transition-colors">
            &larr; Back to Home
          </Link>
        </div>

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

      {/* Right side – testimonials */}
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