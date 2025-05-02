'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/shadcn/form';
import { Button } from '@/components/ui/shadcn/button';
import { Input } from '@/components/ui/shadcn/input';
import { EyeIcon, EyeOffIcon } from 'lucide-react';
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from 'sonner';
import { signIn, signUp } from '@/lib/auth-client';

// Form validation schema
const authSchema = z.object({
  name: z.string().optional(),
  email: z.string().email({
    message: "Invalid email address",
  }),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters",
  }),
});

export default function AuthForm() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Initialize the form
  const form = useForm<z.infer<typeof authSchema>>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof authSchema>) => {
    setIsLoading(true);
    
    try {
      if (isSignUp) {
        // Call signUp.email method directly with all required fields
        const { error } = await signUp.email({
          name: values.name || values.email.split('@')[0], // Use email prefix if no name provided
          email: values.email,
          password: values.password,
          callbackURL: '/dashboard'
        }, {
          onSuccess: () => {
            toast.success("Account created successfully");
            router.push('/dashboard');
          },
          onError: (ctx) => {
            throw new Error(ctx.error.message);
          }
        });
        
        if (error) throw error;
      } else {
        // Call signIn.email method directly
        const { error } = await signIn.email({
          email: values.email,
          password: values.password,
          callbackURL: '/dashboard',
          rememberMe: true
        }, {
          onSuccess: () => {
            router.push('/dashboard');
          },
          onError: (ctx) => {
            throw new Error(ctx.error.message);
          }
        });
        
        if (error) throw error;
      }
    } catch (error: any) {
      const errorMessage = error.message || "Authentication failed";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="space-y-1.5 mb-6">
        <h2 className="text-2xl font-semibold text-zinc-900">
          {isSignUp ? "Create Account" : "Sign In"}
        </h2>
        <p className="text-sm text-zinc-500">
          {isSignUp 
            ? "Fill out the form to create your account" 
            : "Enter your credentials to access your account"}
        </p>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          {isSignUp && (
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="text-sm text-zinc-700 font-medium">
                    Name
                  </FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      type="text" 
                      placeholder="Your name" 
                      className="h-11 bg-white border border-zinc-300 focus:border-zinc-500 focus:ring-zinc-500 rounded-md text-zinc-900 placeholder:text-zinc-400"
                    />
                  </FormControl>
                  <FormMessage className="text-xs text-red-500" />
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel className="text-sm text-zinc-700 font-medium">
                  Email
                </FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    type="email" 
                    placeholder="you@example.com" 
                    className="h-11 bg-white border border-zinc-300 focus:border-zinc-500 focus:ring-zinc-500 rounded-md text-zinc-900 placeholder:text-zinc-400"
                  />
                </FormControl>
                <FormMessage className="text-xs text-red-500" />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <div className="flex justify-between items-center">
                  <FormLabel className="text-sm text-zinc-700 font-medium">
                    Password
                  </FormLabel>
                  {!isSignUp && (
                    <a 
                      href="#" 
                      className="text-xs text-zinc-700 hover:text-zinc-900 font-medium"
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
                      className="h-11 bg-white border border-zinc-300 focus:border-zinc-500 focus:ring-zinc-500 rounded-md text-zinc-900 pr-10" 
                    />
                  </FormControl>
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-700 transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
                  </button>
                </div>
                <FormMessage className="text-xs text-red-500" />
              </FormItem>
            )}
          />
          
          <div className="pt-1">
            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full h-11 bg-zinc-900 hover:bg-zinc-800 text-white font-medium rounded-md transition-colors"
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
      
      <div className="mt-8 text-center">
        <button
          type="button"
          onClick={() => {
            setIsSignUp(!isSignUp);
            form.reset();
          }}
          className="text-sm text-zinc-700 hover:text-zinc-900 font-medium transition-colors"
        >
          {isSignUp 
            ? "Already have an account? Sign in" 
            : "Need an account? Sign up"}
        </button>
      </div>
    </div>
  );
} 