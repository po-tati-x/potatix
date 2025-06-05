'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/shadcn/form';
import { Input } from '@/components/ui/shadcn/input';
import { EyeIcon, EyeOffIcon } from 'lucide-react';
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from 'sonner';
import { signIn, signUp } from '@/lib/auth/auth-client';
import { Button } from '@/components/ui/potatix/Button';

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

const customInputStyles = "h-10 bg-white border border-slate-200 rounded-md focus:border-emerald-500 focus:ring-1 focus:ring-emerald-200 focus-visible:ring-1 focus-visible:ring-emerald-200 focus-visible:border-emerald-500";

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
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900">
          {customTitle || (isSignUp ? "Create account" : "Welcome back")}
        </h2>
        <p className="text-sm text-slate-600 mt-1">
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
                      className={customInputStyles}
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
                    className={customInputStyles}
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
                      className={`${customInputStyles} pr-10`} 
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
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
          
          <div className="pt-2">
            <Button 
              type="primary"
              size="medium"
              block
              disabled={isLoading}
              loading={isLoading}
              htmlType="submit"
            >
              {isSignUp ? "Create Account" : "Sign In"}
            </Button>
          </div>
        </form>
      </Form>
      
      <div className="mt-4 text-center">
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