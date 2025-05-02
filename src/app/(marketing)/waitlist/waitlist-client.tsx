"use client";

import Link from "next/link";
import { ArrowLeft, Check, Sparkles, Code } from "lucide-react";
import { motion } from "framer-motion";
import { useWaitlist } from "@/hooks/marketing/useWaitlist";
import { useRef, useEffect, useCallback } from "react";
import type { TurnstileInstance } from '@/types/turnstile';

const InputField = ({ label, id, required, ...props }: any) => (
  <div className="relative">
    <label htmlFor={id} className="block text-[13px] sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-1.5">
      {label} {required && <span className="text-[#06A28B]">*</span>}
    </label>
    <input
      id={id}
      {...props}
      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-[#06A28B] focus:border-[#06A28B] transition-all duration-200 placeholder:text-gray-400 dark:placeholder:text-gray-500 text-[16px] sm:text-base"
      style={{ WebkitTextSizeAdjust: '100%' }}
    />
  </div>
);

// Client component with all interactive parts
export default function WaitlistClient() {
  const {
    isSubmitted,
    isSubmitting,
    error,
    formData,
    updateFormData,
    handleSubmit,
    setTurnstileToken
  } = useWaitlist();

  // Add Turnstile widget reference
  const turnstileRef = useRef<HTMLDivElement>(null);

  // Reset Turnstile after submission
  useEffect(() => {
    const turnstile = (window as any).turnstile as TurnstileInstance | undefined;
    if (isSubmitted && turnstile && turnstileRef.current) {
      turnstile.reset(turnstileRef.current);
    }
  }, [isSubmitted]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      const turnstile = (window as any).turnstile as TurnstileInstance | undefined;
      if (turnstile && turnstileRef.current) {
        turnstile.remove(turnstileRef.current);
      }
    };
  }, []);

  // Handle Turnstile callbacks
  const handleTurnstileSuccess = useCallback((token: string) => {
    setTurnstileToken(token);
  }, [setTurnstileToken]);

  const handleTurnstileError = useCallback(() => {
    console.error('Turnstile failed to load');
    setTurnstileToken('');
  }, [setTurnstileToken]);

  // Initialize Turnstile
  useEffect(() => {
    const render = () => {
      const turnstile = (window as any).turnstile as TurnstileInstance | undefined;
      if (turnstile && turnstileRef.current) {
        turnstile.render(turnstileRef.current, {
          sitekey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!,
          theme: 'auto',
          callback: handleTurnstileSuccess,
          'error-callback': handleTurnstileError
        });
      }
    };

    if (document.readyState === 'complete') {
      render();
    } else {
      window.addEventListener('load', render);
      return () => window.removeEventListener('load', render);
    }
  }, [handleTurnstileSuccess, handleTurnstileError]);

  return (
    <>
      <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pt-16 sm:pt-24">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-4 -right-4 w-60 md:w-80 h-60 md:h-80 bg-[#06A28B]/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-40 md:w-60 h-40 md:h-60 bg-[#06A28B]/10 rounded-full blur-3xl" />
        </div>
        
        <div className="container relative mx-auto px-4 py-8 sm:py-16">
          {!isSubmitted ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-lg mx-auto"
            >
              <div className="text-center mb-6 sm:mb-10">
                <div className="inline-flex items-center gap-1.5 mb-3 px-2.5 py-1 bg-[#06A28B]/10 text-[#06A28B] dark:bg-[#06A28B]/20 rounded-full text-xs sm:text-sm font-medium">
                  <Code className="w-3.5 h-3.5 mr-1" /> For Software Developers Only
                </div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-4">
                  <span className="block bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300">
                    Join the Waitlist
                  </span>
                </h1>
                <p className="text-sm sm:text-base md:text-lg text-gray-600 dark:text-gray-300">
                  Be the first to get access to our dev-focused course platform.
                </p>
                <p className="text-[#06A28B] font-medium mt-1 sm:mt-2 text-sm sm:text-base">
                  No monthly fees. No bullshit. Just 10% of revenue.
                </p>
              </div>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="bg-white dark:bg-gray-800 p-4 sm:p-8 rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700"
              >
                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                  <InputField
                    id="name"
                    label="Your name"
                    type="text"
                    value={formData.Name}
                    onChange={(e: any) => updateFormData('Name', e.target.value)}
                    placeholder="John Doe"
                  />
                  
                  <InputField
                    id="email"
                    label="Email address"
                    type="email"
                    required
                    value={formData.Mail}
                    onChange={(e: any) => updateFormData('Mail', e.target.value)}
                    placeholder="john@example.com"
                  />
                  
                  <InputField
                    id="phone"
                    label="Phone number (optional)"
                    type="tel"
                    value={formData.Phone || ''}
                    onChange={(e: any) => updateFormData('Phone', e.target.value)}
                    placeholder="+1 (555) 123-4567"
                  />
                  
                  <InputField
                    id="occupation"
                    label="Developer role/title (optional)"
                    type="text"
                    value={formData.Occupation || ''}
                    onChange={(e: any) => updateFormData('Occupation', e.target.value)}
                    placeholder="Frontend Developer, Full Stack Engineer, etc."
                  />
                  
                  <div className="relative">
                    <label htmlFor="usecase" className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-1.5">
                      What would you use Potatix for? (optional)
                    </label>
                    <textarea
                      id="usecase"
                      value={formData['Use-case'] || ''}
                      onChange={(e) => updateFormData('Use-case', e.target.value)}
                      rows={3}
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-[#06A28B] focus:border-[#06A28B] transition-all duration-200 placeholder:text-gray-400 dark:placeholder:text-gray-500 resize-none text-sm sm:text-base"
                      placeholder="Tell us a bit about what kind of courses you'd create..."
                    />
                  </div>
                  
                  {error && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-xs sm:text-sm text-red-500 bg-red-50 dark:bg-red-900/20 p-2.5 sm:p-3 rounded-lg border border-red-100 dark:border-red-900/30"
                    >
                      {error}
                    </motion.div>
                  )}
                  
                  <motion.button
                    type="submit"
                    disabled={isSubmitting}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-[#06A28B] hover:bg-[#058d79] text-white font-medium py-2.5 sm:py-3 px-4 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#06A28B] disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-[#06A28B]/20 text-sm sm:text-base"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Submitting...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center">
                        Join Waitlist
                        <Sparkles className="ml-1.5 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      </span>
                    )}
                  </motion.button>
                  
                  <div className="flex justify-center">
                    <div
                      ref={turnstileRef}
                      className="cf-turnstile"
                    />
                    {process.env.NODE_ENV === 'development' && (
                      <div className="text-xs text-amber-600 dark:text-amber-400 mt-2">
                        Note: Turnstile might not appear on localhost. Please test on production domain.
                      </div>
                    )}
                  </div>
                  
                  <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 text-center">
                    By joining, you'll stay updated on our progress. 
                    <br />No spam. Unsubscribe anytime.
                  </p>
                </form>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="max-w-lg mx-auto"
            >
              <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
                <div className="text-center">
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", duration: 0.6, delay: 0.1 }}
                    className="w-12 h-12 sm:w-16 sm:h-16 bg-[#06A28B]/10 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6"
                  >
                    <Check className="w-6 h-6 sm:w-8 sm:h-8 text-[#06A28B]" />
                  </motion.div>
                  <h2 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300">
                    You're on the list!
                  </h2>
                  <p className="text-sm sm:text-lg text-gray-600 dark:text-gray-300">
                    Thanks for joining our waitlist. We'll keep you updated on our progress.
                  </p>
                </div>
              </div>
              
              <div className="text-center mt-6 sm:mt-8">
                <Link
                  href="/"
                  className="inline-flex items-center text-[#06A28B] hover:text-[#058d79] font-medium transition-colors gap-2 hover:gap-3 text-sm sm:text-base"
                >
                  <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  Back to Home
                </Link>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
} 