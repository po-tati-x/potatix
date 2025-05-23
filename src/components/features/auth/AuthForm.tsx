'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/shadcn/form';
import { Button } from '@/components/ui/shadcn/button';
import { Input } from '@/components/ui/shadcn/input';
import { EyeIcon, EyeOffIcon } from 'lucide-react';
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from 'sonner';
import { authClient } from '@/lib/auth/auth-client';
import { OTPForm } from './OTPForm';

// Password regex patterns
const CONTAINS_NUMBER = /.*[0-9].*/;
const CONTAINS_UPPERCASE = /.*[A-Z].*/;
const CONTAINS_LOWERCASE = /.*[a-z].*/;
const CONTAINS_SPECIAL = /.*[^A-Za-z0-9].*/;

// Form validation schema - updated to match backend requirements
const authSchema = z.object({
  name: z.string().optional(),
  email: z.string().email({
    message: "Invalid email address",
  }),
  password: z.string()
    .min(12, { message: "Password must be at least 12 characters" })
    .regex(CONTAINS_NUMBER, { message: "Password must contain at least one number" })
    .regex(CONTAINS_UPPERCASE, { message: "Password must contain at least one uppercase letter" })
    .regex(CONTAINS_LOWERCASE, { message: "Password must contain at least one lowercase letter" })
    .regex(CONTAINS_SPECIAL, { message: "Password must contain at least one special character" }),
});

interface AuthFormProps {
  isLoginMode?: boolean;
  callbackUrl?: string;
}

export default function AuthForm({ isLoginMode = false, callbackUrl = '/dashboard' }: AuthFormProps) {
  const [isSignUp, setIsSignUp] = useState(!isLoginMode);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const router = useRouter();

  // Initialize the auth form with conditional schema based on login/signup mode
  const form = useForm<z.infer<typeof authSchema>>({
    resolver: zodResolver(
      // Only validate password complexity on signup
      isSignUp 
        ? authSchema 
        : authSchema.omit({ password: true }).extend({
            password: z.string().min(1, { message: "Password is required" })
          })
    ),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
    mode: "onBlur", // Validate on blur for better UX
  });

  const onSubmit = async (values: z.infer<typeof authSchema>) => {
    setIsLoading(true);
    
    try {
      if (isSignUp) {
        // Handle sign up
        const response = await authClient.signUp.email({
          name: values.name || values.email.split('@')[0],
          email: values.email,
          password: values.password,
        });
        
        if (response.error) {
          // Better detailed error handling
          const errorMsg = response.error.message || 
            response.error.code === "email_exists" ? "Email already in use" :
            response.error.code === "invalid_credentials" ? "Invalid email or password" :
            response.error.code === "password_too_weak" ? "Password doesn't meet security requirements" :
            "Failed to create account";
          
          throw new Error(errorMsg);
        }

        // Store email for verification
        setUserEmail(values.email);
        setNeedsVerification(true);
      } else {
        // Handle sign in
        const response = await authClient.signIn.email({
          email: values.email,
          password: values.password,
          callbackURL: callbackUrl,
        });
        
        if (response.error) {
          const errorMsg = response.error.message ||
            response.error.code === "invalid_credentials" ? "Invalid email or password" :
            response.error.code === "not_verified" ? "Email not verified" :
            response.error.code === "rate_limited" ? "Too many attempts, please try again later" :
            response.error.code === "account_locked" ? "Account temporarily locked for security" :
            "Failed to sign in";
            
          throw new Error(errorMsg);
        }
        
        // Successful login
        router.push(callbackUrl);
      }
    } catch (error: any) {
      // Enhanced error logging and user feedback
      const errorMessage = error.message || "Authentication failed";
      console.error("Auth error:", JSON.stringify(error, null, 2));
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // When verification is needed, show OTP verification UI
  if (needsVerification) {
    return (
      <div className="w-full">
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
            Verify your email
          </h2>
          <p className="text-sm text-center text-gray-600 mt-1">
            Complete verification to activate your account
          </p>
        </div>
        
        <OTPForm 
          prefillEmail={userEmail}
          otpType="email-verification"
          hideHeader={true}
          callbackUrl={callbackUrl}
          onSuccess={() => {
            toast.success("Account created successfully!");
            router.push(callbackUrl);
          }}
          onCancel={() => {
            setNeedsVerification(false);
            setIsSignUp(false);
            form.reset();
          }}
        />
      </div>
    );
  }

  return (
    <div className="w-full">
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
          {isSignUp ? "Create your account" : "Welcome back"}
        </h2>
        <p className="text-sm text-center text-gray-600 mt-1">
          {isSignUp 
            ? "Fill out the form below to get started" 
            : "Enter your credentials to access your account"}
        </p>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {isSignUp && (
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    Name
                  </FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      type="text" 
                      placeholder="Your name" 
                      className="h-10 bg-white border border-gray-300 shadow-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 rounded-md"
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
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
          
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <div className="flex justify-between items-center">
                  <FormLabel className="text-sm font-medium text-gray-700">
                    Password
                  </FormLabel>
                  {!isSignUp && (
                    <a 
                      href="/forgot-password" 
                      className="text-xs text-emerald-600 hover:text-emerald-800 font-medium"
                    >
                      Forgot password?
                    </a>
                  )}
                </div>
                <div className="relative">
                  <FormControl>
                    <Input 
                      {...field} 
                      type={showPassword ? "text" : "password"} 
                      className="h-10 bg-white border border-gray-300 shadow-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 rounded-md pr-10" 
                    />
                  </FormControl>
                  <button
                    type="button"
                    tabIndex={-1}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
                  </button>
                </div>
                {isSignUp && (
                  <div className="text-xs text-gray-500 mt-1">
                    Password must be at least 12 characters and include uppercase, lowercase, numbers, and special characters.
                  </div>
                )}
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
                  Processing...
                </span>
              ) : isSignUp ? "Create Account" : "Sign In"}
            </Button>
          </div>
        </form>
      </Form>
      
      <div className="mt-6 text-center">
        <button
          type="button"
          onClick={() => {
            setIsSignUp(!isSignUp);
            form.reset();
          }}
          className="text-sm text-emerald-600 hover:text-emerald-800 font-medium transition-colors"
        >
          {isSignUp 
            ? "Already have an account? Sign in" 
            : "Need an account? Sign up"}
        </button>
      </div>
    </div>
  );
} 