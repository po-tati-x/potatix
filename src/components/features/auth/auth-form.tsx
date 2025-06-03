'use client';

import { useState } from 'react';
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
  customTitle?: string;
  customDescription?: string;
}

export default function AuthForm({ 
  isLoginMode = false, 
  callbackUrl = '/dashboard',
  customTitle,
  customDescription 
}: AuthFormProps) {
  const [isSignUp, setIsSignUp] = useState(!isLoginMode);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
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
    mode: "onBlur",
  });

  const onSubmit = async (values: z.infer<typeof authSchema>) => {
    if (isLoading) return;
    
    setIsLoading(true);
    
    try {
      if (isSignUp) {
        // Handle sign up
        const response = await signUp.email({
          name: values.name || values.email.split('@')[0],
          email: values.email,
          password: values.password,
          callbackURL: callbackUrl,
        });
        
        if (response.error) {
          throw new Error(response.error.message || "Failed to create account");
        }

        toast.success("Account created successfully");
        router.push(callbackUrl);
      } else {
        // Handle sign in
        const response = await signIn.email({
          email: values.email,
          password: values.password,
          callbackURL: callbackUrl,
          rememberMe: true,
        });
        
        if (response.error) {
          throw new Error(response.error.message || "Authentication failed");
        }
        
        toast.success("Login successful");
        router.push(callbackUrl);
      }
    } catch (error: unknown) {
      let errorMessage = "Authentication failed";
      
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-5 flex flex-col items-center justify-center">
        <Image 
          src="https://www.potatix.com/potatix-logo.svg" 
          alt="Potatix Logo" 
          width={130} 
          height={36} 
          className="h-9 w-auto mb-4"
          priority
        />
        <h2 className="text-xl font-medium text-center text-slate-900">
          {customTitle || (isSignUp ? "Create your account" : "Welcome back")}
        </h2>
        <p className="text-sm text-center text-slate-600 mt-1">
          {customDescription || (isSignUp 
            ? "Fill out the form below to get started" 
            : "Enter your credentials to access your account")}
        </p>
      </div>
      
      <Form {...form}>
        <form 
          onSubmit={form.handleSubmit(onSubmit)} 
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
          
          <div className="pt-2">
            <button 
              type="submit"
              disabled={isLoading}
              className="w-full h-10 px-4 py-2 bg-emerald-600 text-white font-medium rounded-md hover:bg-emerald-700 transition-colors flex items-center justify-center space-x-2"
            >
              {isLoading && <Loader2 className="animate-spin h-4 w-4 mr-2" />}
              {isLoading ? "Processing..." : (isSignUp ? "Create Account" : "Sign In")}
            </button>
          </div>
        </form>
      </Form>
      
      <div className="mt-5 text-center">
        <button
          type="button"
          onClick={() => {
            setIsSignUp(!isSignUp);
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