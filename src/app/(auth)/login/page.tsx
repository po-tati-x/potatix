'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import AuthForm from '@/components/features/auth/AuthForm';
import SocialLogin from '@/components/features/auth/SocialLogin';

export default function LoginPage() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';
  
  return (
    <div className="w-full">
      <AuthForm isLoginMode={true} callbackUrl={callbackUrl} />
      
      <SocialLogin callbackUrl={callbackUrl} />
      
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="text-center text-sm text-gray-600">
          <span>Don't have an account?</span>
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