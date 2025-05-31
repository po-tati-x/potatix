'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import AuthForm from '@/components/features/auth/AuthForm';
import SocialLogin from '@/components/features/auth/SocialLogin';
import { Suspense } from 'react';

function LoginContent() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';
  
  return (
    <div className="w-full">
      <AuthForm isLoginMode={true} callbackUrl={callbackUrl} />
      
      <SocialLogin callbackUrl={callbackUrl} />
      
      <div className="mt-5 pt-5 border-t border-slate-200">
        <div className="text-center text-sm text-slate-600">
          <span>Don&apos;t have an account?</span>
          <Link 
            href="/signup" 
            className="ml-1.5 font-medium text-emerald-600 hover:text-emerald-700 inline-flex items-center"
          >
            Create account <ArrowRight className="ml-1 w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="w-full flex items-center justify-center py-8">Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
} 