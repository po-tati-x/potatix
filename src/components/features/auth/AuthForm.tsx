'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/shadcn/form';
import { Input } from '@/components/ui/shadcn/input';
import { EyeIcon, EyeOffIcon, Loader2 } from 'lucide-react';
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from 'sonner';
import { signIn, signUp } from '@/lib/auth/auth-client';

// Form validation schema that matches backend requirements
const authSchema = z.object({
  name: z.string().optional(),
  email: z.string().email({
    message: "Invalid email address",
  }),
  password: z.string()
    // 8 chars min to match Better Auth default config
    .min(8, { message: "Password must be at least 8 characters" })
});

interface AuthFormProps {
  isLoginMode?: boolean;
  callbackUrl?: string;
}

export default function AuthForm({ isLoginMode = false, callbackUrl = '/dashboard' }: AuthFormProps) {
  const [isSignUp, setIsSignUp] = useState(!isLoginMode);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [debugError, setDebugError] = useState<string | null>(null);
  const [logMessages, setLogMessages] = useState<string[]>([]);
  const router = useRouter();

  // Debug logger
  const logDebug = (message: string) => {
    console.log(`[AuthForm] ${message}`);
    setLogMessages(prev => [...prev, `${new Date().toISOString().slice(11, 19)} - ${message}`]);
  };

  // Add a useEffect to check if the auth client is even loaded
  useEffect(() => {
    logDebug(`Auth form mounted. isLoginMode=${isLoginMode}, signIn=${!!signIn}, signUp=${!!signUp}`);
    // Check if auth client is properly loaded
    if (!signIn || !signUp) {
      setDebugError("Auth client not properly loaded! Check imports and configuration.");
    }
  }, [isLoginMode]);

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
    mode: "onBlur",
  });

  const onSubmit = async (values: z.infer<typeof authSchema>) => {
    logDebug(`Form submitted! Values: ${JSON.stringify({
      email: values.email,
      password: values.password ? '****' : undefined,
      name: values.name,
      isSignUp
    })}`);
    
    if (isLoading) {
      logDebug('Submission blocked: Already loading');
      return;
    }
    
    // Visually indicate we're processing
    toast.info(isSignUp ? "Creating account..." : "Signing in...");
    setIsLoading(true);
    setDebugError(null);
    
    try {
      if (isSignUp) {
        // Handle sign up
        logDebug(`Calling signUp.email with ${values.email}`);
        
        try {
          const response = await signUp.email({
            name: values.name || values.email.split('@')[0],
            email: values.email,
            password: values.password,
            callbackURL: callbackUrl,
          }, {
            onError: (ctx) => {
              logDebug(`signUp onError callback: ${ctx.error.message}`);
              throw new Error(ctx.error.message || "Failed to create account");
            }
          });
          
          logDebug(`signUp.email response: ${JSON.stringify(response)}`);
          
          // Check for errors in response (belt and suspenders)
          if (response.error) {
            throw new Error(response.error.message || "Failed to create account");
          }

          toast.success("Account created successfully");
          logDebug(`Signup successful, redirecting to ${callbackUrl}`);
          
          // Use timeout to ensure toast is seen before redirect
          setTimeout(() => {
            router.push(callbackUrl);
            router.refresh(); // Force refresh the Next.js router
            logDebug("Router navigation triggered");
          }, 300);
        } catch (err) {
          logDebug(`Inner signUp.email error: ${err instanceof Error ? err.message : String(err)}`);
          throw err;
        }
      } else {
        // Handle sign in
        logDebug(`Calling signIn.email with ${values.email}`);
        
        try {
          const response = await signIn.email({
            email: values.email,
            password: values.password,
            callbackURL: callbackUrl,
            rememberMe: true,
          }, {
            onError: (ctx) => {
              logDebug(`signIn onError callback: ${ctx.error.message}`);
              throw new Error(ctx.error.message || "Login failed");
            },
            onSuccess: () => {
              logDebug(`signIn onSuccess callback triggered!`);
            }
          });
          
          logDebug(`signIn.email response: ${JSON.stringify(response)}`);
          
          // Double check for errors
          if (response.error) {
            throw new Error(response.error.message || "Authentication failed");
          }
          
          toast.success("Login successful");
          logDebug(`Login successful, redirecting to ${callbackUrl}`);
          
          // Use both methods to ensure navigation works
          setTimeout(() => {
            logDebug("Attempting hard navigation");
            // Try window location change first
            window.location.href = callbackUrl;
          }, 300);
        } catch (err) {
          logDebug(`Inner signIn.email error: ${err instanceof Error ? err.message : String(err)}`);
          throw err;
        }
      }
    } catch (error: unknown) {
      // Enhanced error logging
      logDebug(`Auth error caught: ${error instanceof Error ? error.message : String(error)}`);
      console.error("Auth error:", error);
      
      let errorMessage = "Authentication failed";
      
      if (typeof error === 'string') {
        errorMessage = error;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      } else if (error && typeof error === 'object') {
        try {
          const stringified = JSON.stringify(error, null, 2);
          setDebugError(stringified);
          
          // Use a type guard for accessing message property
          const errorObj = error as { message?: string };
          errorMessage = errorObj.message || stringified.substring(0, 100);
        } catch {
          errorMessage = "Unknown error format";
        }
      }
      
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
      logDebug("Form submission process completed");
    }
  };

  // Manual form submission for fallback
  const handleManualSubmit = () => {
    logDebug("Manual form submission triggered");
    form.handleSubmit(onSubmit)();
  };

  return (
    <div className="w-full">
      <div className="mb-5 flex flex-col items-center justify-center">
        <Image 
          src="/potatix-logo.svg" 
          alt="Potatix Logo" 
          width={130} 
          height={36} 
          className="h-9 w-auto mb-4"
          priority
        />
        <h2 className="text-xl font-medium text-center text-slate-900">
          {isSignUp ? "Create your account" : "Welcome back"}
        </h2>
        <p className="text-sm text-center text-slate-600 mt-1">
          {isSignUp 
            ? "Fill out the form below to get started" 
            : "Enter your credentials to access your account"}
        </p>
      </div>
      
      <Form {...form}>
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            logDebug("Form onSubmit event triggered");
            form.handleSubmit(onSubmit)(e);
          }} 
          className="space-y-4"
        >
          {isSignUp && (
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-slate-700">
                    Name
                  </FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      type="text" 
                      placeholder="Your name" 
                      className="h-10 bg-white border border-slate-300 shadow-sm focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 rounded-md"
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
                <FormLabel className="text-sm font-medium text-slate-700">
                  Email
                </FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    type="email" 
                    placeholder="you@example.com" 
                    className="h-10 bg-white border border-slate-300 shadow-sm focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 rounded-md"
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
                  <FormLabel className="text-sm font-medium text-slate-700">
                    Password
                  </FormLabel>
                  {!isSignUp && (
                    <a 
                      href="/forgot-password" 
                      className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
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
                      className="h-10 bg-white border border-slate-300 shadow-sm focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 rounded-md pr-10" 
                    />
                  </FormControl>
                  <button
                    type="button"
                    tabIndex={-1}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
                  </button>
                </div>
                {isSignUp && (
                  <div className="text-xs text-slate-500 mt-1">
                    Password must be at least 8 characters.
                  </div>
                )}
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
          
          <div className="pt-2 space-y-2">
            <button 
              type="submit"
              disabled={isLoading}
              className="w-full h-10 px-4 py-2 bg-emerald-600 text-white font-medium rounded-md hover:bg-emerald-700 transition-colors flex items-center justify-center space-x-2"
            >
              {isLoading && <Loader2 className="animate-spin h-4 w-4 mr-2" />}
              {isLoading ? "Processing..." : (isSignUp ? "Create Account" : "Sign In")}
            </button>
            
            {/* Fallback manual submission button */}
            <button
              type="button"
              onClick={handleManualSubmit}
              className="text-xs text-center w-full text-slate-500 hover:text-slate-700"
            >
              Having trouble? Try manual submission
            </button>
          </div>
          
          {debugError && (
            <div className="mt-4 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700 overflow-auto max-h-32">
              <details>
                <summary className="font-medium cursor-pointer">Debug Error</summary>
                <pre className="mt-2 whitespace-pre-wrap">{debugError}</pre>
              </details>
            </div>
          )}
          
          {logMessages.length > 0 && (
            <div className="mt-4 p-2 bg-slate-50 border border-slate-200 rounded text-xs text-slate-700 overflow-auto max-h-40">
              <details>
                <summary className="font-medium cursor-pointer">Debug Log ({logMessages.length})</summary>
                <pre className="mt-2 whitespace-pre-wrap text-xs">
                  {logMessages.map((msg, i) => (
                    <div key={i} className="py-1 border-b border-slate-100">{msg}</div>
                  ))}
                </pre>
              </details>
            </div>
          )}
        </form>
      </Form>
      
      <div className="mt-5 text-center">
        <button
          type="button"
          onClick={() => {
            setIsSignUp(!isSignUp);
            setDebugError(null);
            form.reset();
          }}
          className="text-sm text-emerald-600 hover:text-emerald-700 font-medium transition-colors cursor-pointer"
        >
          {isSignUp 
            ? "Already have an account? Sign in" 
            : "Need an account? Sign up"}
        </button>
      </div>
    </div>
  );
} 