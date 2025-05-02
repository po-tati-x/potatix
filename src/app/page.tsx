'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import AuthForm from '@/components/features/auth/AuthForm';
import { useSession } from '@/lib/auth-client';
  
export default function RootPage() {
  const session = useSession();
  const router = useRouter();
  
  // If the user is already logged in, redirect to dashboard
  useEffect(() => {
    if (!session.isPending && session.data) {
      router.push('/dashboard');
    }
  }, [session.data, session.isPending, router]);

  // Only show auth form if user is not authenticated
  if (session.isPending) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <div className="w-full max-w-md p-6">
          <div className="bg-white border border-zinc-200 shadow-sm rounded-lg overflow-hidden p-8">
            <div className="flex flex-col items-center">
              <div className="h-16 w-16 bg-zinc-900 flex items-center justify-center text-white font-medium text-xl rounded-sm mb-6">
                P
              </div>
              
              <h1 className="text-3xl font-semibold text-zinc-900 mb-8 text-center">
                PotatixApp
              </h1>
              
              <div className="w-full flex items-center justify-center space-x-3 px-4 py-3 border border-zinc-200 rounded-md bg-zinc-50 text-zinc-800">
                <svg className="animate-spin h-5 w-5 text-zinc-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="text-zinc-700 text-sm font-medium">Loading...</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
      <div className="w-full max-w-md p-6">
        <div className="bg-white border border-zinc-200 shadow-sm rounded-lg overflow-hidden p-8">
          <div className="flex flex-col items-center">
            <div className="h-16 w-16 bg-zinc-900 flex items-center justify-center text-white font-medium text-xl rounded-sm mb-6">
              P
            </div>
            
            <h1 className="text-3xl font-semibold text-zinc-900 mb-8 text-center">
              PotatixApp
            </h1>
            
            {/* Auth Form */}
            <AuthForm />
          </div>
          
          <div className="mt-8 pt-6 border-t border-zinc-200 text-xs text-center text-zinc-500">
            A sophisticated webapp designed for efficiency and performance
          </div>
        </div>
      </div>
    </div>
  );
}