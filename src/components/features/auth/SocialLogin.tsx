'use client';

import { Button } from '@/components/ui/shadcn/button';
import { signIn } from '@/lib/auth/auth-client';
import { toast } from 'sonner';
import { useState } from 'react';

type SocialProvider = 'github' | 'google';

interface SocialLoginProps {
  callbackUrl?: string;
}

export default function SocialLogin({ callbackUrl = '/dashboard' }: SocialLoginProps) {
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const handleSocialLogin = async (provider: SocialProvider) => {
    setIsLoading(provider);
    try {
      await signIn.social({
        provider,
        callbackURL: callbackUrl,
      }, {
        onError: (ctx: { error: Error }) => {
          toast.error(`Failed to sign in with ${provider}: ${ctx.error.message}`);
        }
      });
    } catch (error: any) {
      toast.error(`Authentication failed: ${error.message || 'Unknown error'}`);
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <div className="w-full mt-6">
      <div className="relative flex items-center justify-center text-xs text-gray-500 mb-4">
        <hr className="w-full border-t border-gray-200" />
        <span className="px-3 bg-white relative z-10 uppercase font-medium whitespace-nowrap">or continue with</span>
        <hr className="w-full border-t border-gray-200" />
      </div>

      <div className="grid gap-3">
        <Button
          type="button"
          variant="outline" 
          className="w-full h-10 font-medium flex items-center justify-center gap-3 border-gray-300 text-gray-700 hover:bg-gray-50 shadow-sm hover:shadow-md transition-all"
          disabled={Boolean(isLoading)}
          onClick={() => handleSocialLogin('github')}
        >
          {isLoading === 'github' ? (
            <svg className="animate-spin h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path fill="currentColor" d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
          )}
          <span>Continue with GitHub</span>
        </Button>

        <Button
          type="button"
          variant="outline" 
          className="w-full h-10 font-medium flex items-center justify-center gap-3 border-gray-300 text-gray-700 hover:bg-gray-50 shadow-sm hover:shadow-md transition-all"
          disabled={Boolean(isLoading)}
          onClick={() => handleSocialLogin('google')}
        >
          {isLoading === 'google' ? (
            <svg className="animate-spin h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path fill="currentColor" d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"/>
            </svg>
          )}
          <span>Continue with Google</span>
        </Button>
      </div>
    </div>
  );
} 