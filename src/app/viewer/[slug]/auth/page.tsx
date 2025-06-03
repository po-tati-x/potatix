'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import AuthForm from '@/components/features/auth/auth-form';
import SocialLogin from '@/components/features/auth/social-login';
import { authClient } from '@/lib/auth/auth-client';

export default function CourseAuthPage() {
  const params = useParams();
  const router = useRouter();
  const courseSlug = params.slug as string;
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Move handleEnrollment to useCallback to properly use it in dependencies
  const handleEnrollment = useCallback(async () => {
    if (isEnrolling) return;
    
    try {
      setIsEnrolling(true);
      await axios.post('/api/courses/enrollment', { courseSlug });
      router.push(`/viewer/${courseSlug}`);
    } catch (err) {
      console.error('Enrollment failed:', err);
      setError('Failed to enroll in course. Please try again.');
      router.push(`/viewer/${courseSlug}`);
    } finally {
      setIsEnrolling(false);
    }
  }, [courseSlug, isEnrolling, router, setError, setIsEnrolling]);

  useEffect(() => {
    // Check if already authenticated
    async function checkAuthAndEnroll() {
      try {
        const { data: session } = await authClient.getSession();
        
        // If authenticated, try to enroll and redirect
        if (session?.user) {
          await handleEnrollment();
        }
      } catch (err) {
        // Silent fail - will just show the auth form
        console.error('Auth check failed:', err);
      }
    }
    
    checkAuthAndEnroll();
  }, [handleEnrollment]);

  useEffect(() => {
    // Listen for auth completion events
    const handleAuthComplete = async () => {
      await handleEnrollment();
    };

    window.addEventListener('auth-complete', handleAuthComplete);
    return () => {
      window.removeEventListener('auth-complete', handleAuthComplete);
    };
  }, [handleEnrollment]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md space-y-8 rounded-xl bg-white p-8 shadow-sm">
        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-800">
            {error}
          </div>
        )}
        
        <AuthForm 
          customTitle="Access this course" 
          customDescription="Sign up or sign in to continue learning" 
        />
        
        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-slate-500">Or continue with</span>
          </div>
        </div>
        
        <SocialLogin />
      </div>
    </div>
  );
} 