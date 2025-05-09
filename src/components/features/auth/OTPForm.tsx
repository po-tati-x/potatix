'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/shadcn/form';
import { Button } from '@/components/ui/shadcn/button';
import { Input } from '@/components/ui/shadcn/input';
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from 'sonner';
import { authClient } from '@/lib/auth/auth-client';

// OTP verification schema
const otpSchema = z.object({
  otp: z.string().min(6, {
    message: "Verification code must be at least 6 characters",
  }),
});

export type OTPType = 'email-verification' | 'sign-in' | 'forget-password';

interface OTPFormProps {
  prefillEmail?: string;
  otpType: OTPType;
  hideHeader?: boolean;
  callbackUrl?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function OTPForm({ 
  prefillEmail = '', 
  otpType = 'email-verification', 
  hideHeader = false,
  callbackUrl = '/dashboard',
  onSuccess,
  onCancel
}: OTPFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState(prefillEmail);
  const router = useRouter();

  // Initialize the form for email input if not provided
  const emailForm = useForm<{ email: string }>({
    resolver: zodResolver(z.object({ email: z.string().email() })),
    defaultValues: {
      email: prefillEmail,
    },
  });

  // Initialize the OTP verification form
  const otpForm = useForm<z.infer<typeof otpSchema>>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: "",
    },
  });

  // When an email is provided, we're in verification mode
  // Otherwise, we show the email form first
  const [verificationMode, setVerificationMode] = useState(!!prefillEmail);

  // Handle email submission
  const onSendOTP = async (values: { email: string }) => {
    setIsLoading(true);
    
    try {
      const response = await authClient.emailOtp.sendVerificationOtp({
        email: values.email,
        type: otpType
      });
      
      if (response.error) {
        throw new Error(response.error.message || "Failed to send verification code");
      }
      
      // Log the response for debugging
      if (process.env.NODE_ENV === 'development') {
        console.log('OTP Send Response:', response);
      }
      
      setEmail(values.email);
      setVerificationMode(true);
      toast.success("Verification code sent", {
        description: "Please check your email or dev console"
      });
    } catch (error: any) {
      console.error('OTP Send Error:', error);
      toast.error(error.message || "Failed to send verification code");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle OTP verification
  const onVerifyOTP = async (values: z.infer<typeof otpSchema>) => {
    setIsLoading(true);
    
    try {
      // Debugging
      if (process.env.NODE_ENV === 'development') {
        console.log(`Verifying OTP: ${values.otp} for email: ${email} (type: ${otpType})`);
      }
      
      let response;
      
      switch (otpType) {
        case 'email-verification':
          // For email verification, use the verifyEmail method
          response = await authClient.emailOtp.verifyEmail({
            email: email,
            otp: values.otp,
          });
          break;
        case 'sign-in':
          // For sign-in, use the sign-in method
          response = await authClient.signIn.emailOtp({
            email: email,
            otp: values.otp,
          });
          break;
        case 'forget-password':
          // Reset password flow would redirect to password reset page
          router.push(`/reset-password?email=${encodeURIComponent(email)}&otp=${encodeURIComponent(values.otp)}`);
          return;
      }
      
      // Debug the response
      if (process.env.NODE_ENV === 'development') {
        console.log('OTP Verification Response:', JSON.stringify(response, null, 2));
      }
      
      if (response?.error) {
        // Handle specific error codes
        const errorMsg = response.error.message ||
          response.error.code === "invalid_otp" ? "Invalid verification code" : 
          response.error.code === "expired_otp" ? "Verification code has expired" :
          "Verification failed";
        throw new Error(errorMsg);
      }
      
      toast.success("Verification successful");
      
      // Call the success callback or redirect
      if (onSuccess) {
        onSuccess();
      } else {
        router.push(callbackUrl);
      }
    } catch (error: any) {
      // Enhanced error logging
      console.error('OTP Verification Error:', error);
      
      // Try to extract more useful error information
      if (error instanceof Error) {
        console.error('Error details:', {
          message: error.message,
          name: error.name,
          stack: error.stack
        });
      } else if (typeof error === 'object' && error !== null) {
        console.error('Error object:', Object.keys(error));
      }
      
      // Display user-friendly error message
      toast.error(error.message || "Verification failed");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle resending OTP
  const resendOTP = async () => {
    if (!email) return;
    
    setIsLoading(true);
    try {
      const response = await authClient.emailOtp.sendVerificationOtp({
        email: email,
        type: otpType
      });
      
      if (response.error) throw new Error(response.error.message || "Failed to resend code");
      
      toast.success("Verification code resent");
    } catch (error: any) {
      console.error('Resend OTP Error:', error);
      toast.error(error.message || "Failed to resend code");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      {!hideHeader && (
        <div className="mb-6 flex flex-col items-center justify-center">
          <Image 
            src="/potatix-logo.svg" 
            alt="Potatix Logo" 
            width={130} 
            height={36} 
            className="h-9 w-auto mb-4"
            priority
          />
          <h2 className="text-2xl font-bold text-center text-gray-900">
            {verificationMode ? "Enter verification code" : "Email verification"}
          </h2>
          {verificationMode && (
            <p className="text-sm text-center text-gray-600 mt-1">
              We've sent a verification code to <span className="font-semibold">{email}</span>
            </p>
          )}
        </div>
      )}

      {!verificationMode && (
        <Form {...emailForm}>
          <form onSubmit={emailForm.handleSubmit(onSendOTP)} className="space-y-4">
            <FormField
              control={emailForm.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    Email
                  </FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      type="email" 
                      placeholder="you@example.com" 
                      className="h-10 bg-white border border-gray-300 shadow-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 rounded-md"
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
            
            <div className="pt-2">
              <Button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-md transition-colors h-10"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending...
                  </span>
                ) : "Send verification code"}
              </Button>
            </div>
          </form>
        </Form>
      )}

      {verificationMode && (
        <>
          <form onSubmit={otpForm.handleSubmit(onVerifyOTP)} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="otp-input" className="text-sm font-medium text-gray-700 block">
                Verification Code
              </label>
              <input
                id="otp-input"
                name="verification-code" 
                type="text"
                value={otpForm.watch("otp")}
                onChange={(e) => otpForm.setValue("otp", e.target.value)}
                placeholder="Enter 6-digit code"
                maxLength={6}
                autoComplete="one-time-code"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
                className="h-10 w-full bg-white border border-gray-300 shadow-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 rounded-md text-center tracking-wider font-mono text-lg"
              />
              {otpForm.formState.errors.otp && (
                <p className="text-xs text-red-500">{otpForm.formState.errors.otp.message}</p>
              )}
            </div>
            
            <div className="pt-2">
              <Button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-md transition-colors h-10"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Verifying...
                  </span>
                ) : "Verify Email"}
              </Button>
            </div>
          </form>
          
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={resendOTP}
              disabled={isLoading}
              className="text-sm text-emerald-600 hover:text-emerald-800 font-medium transition-colors"
            >
              Didn't receive a code? Send again
            </button>
          </div>
        </>
      )}
      
      {onCancel && (
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={onCancel}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            Go back
          </button>
        </div>
      )}
    </div>
  );
}
