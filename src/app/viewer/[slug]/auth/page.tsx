'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import AuthForm from '@/components/features/auth/auth-form';
import SocialLogin from '@/components/features/auth/social-login';
import { authClient } from '@/lib/auth/auth-client';

export default function CourseAuthPage() {
  const { slug: courseSlug } = useParams() as { slug: string };
  const router = useRouter();
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEnrollment = useCallback(async () => {
    if (isEnrolling) return;
    
    try {
      setIsEnrolling(true);
      await axios.post('/api/courses/enrollment', { courseSlug });
      router.push(`/viewer/${courseSlug}`);
    } catch (error) {
      console.error(`Enrollment failed for course "${courseSlug}":`, error);
      setError('Failed to enroll in course. Please try again.');
      router.push(`/viewer/${courseSlug}`);
    } finally {
      setIsEnrolling(false);
    }
  }, [courseSlug, isEnrolling, router]);

  useEffect(() => {
    async function checkAuthAndEnroll() {
      try {
        const { data: session } = await authClient.getSession();
        if (session?.user) {
          await handleEnrollment();
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      }
    }
    
    checkAuthAndEnroll();
  }, [handleEnrollment]);

  useEffect(() => {
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
        <SocialLogin />
      </div>
    </div>
  );
} 