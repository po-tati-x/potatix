"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useWaitlist } from "@/hooks/marketing/useWaitlist";

interface WaitlistProps {
  variant?: "inline" | "card";
  showTitle?: boolean;
  className?: string;
  showExtendedFields?: boolean;
}

type FormFieldProps = {
  type: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  required?: boolean;
  rows?: number;
};

const FormField = ({ 
  type, 
  value, 
  onChange, 
  placeholder, 
  required, 
  rows 
}: FormFieldProps) => (
  <div className="w-full">
    {type === 'textarea' ? (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows || 3}
        className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors resize-none"
      />
    ) : (
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
        required={required}
      />
    )}
  </div>
);

const SubmitButton = ({ isSubmitting }: { isSubmitting: boolean }) => (
  <button
    type="submit"
    disabled={isSubmitting}
    className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-4 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-sm whitespace-nowrap"
  >
    <Sparkles className="w-4 h-4 mr-2" />
    {isSubmitting ? "Submitting..." : "Join Waitlist"}
  </button>
);

const SuccessMessage = ({ variant }: { variant: "inline" | "card" }) => (
  <motion.div
    initial={{ opacity: 0, scale: variant === "card" ? 0.95 : 1 }}
    animate={{ opacity: 1, scale: 1 }}
    className={cn("text-center", variant === "card" ? "" : "py-2")}
  >
    {variant === "card" ? (
      <>
        <Sparkles className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
        <h3 className="text-base font-semibold mb-1">You're on the list!</h3>
        <p className="text-gray-600 dark:text-gray-300 text-sm">
          We'll keep you updated on our progress.
        </p>
      </>
    ) : (
      <p className="text-emerald-600 dark:text-emerald-400 font-medium text-sm">
        Thanks for joining! We'll be in touch soon.
      </p>
    )}
  </motion.div>
);

const ExtendedFields = ({ formData, updateFormData }: { 
  formData: any;
  updateFormData: any;
}) => (
  <>
    <FormField
      type="tel"
      value={formData.Phone || ''}
      onChange={(value) => updateFormData('Phone', value)}
      placeholder="Phone number (optional)"
    />
    
    <FormField
      type="text"
      value={formData.Occupation || ''}
      onChange={(value) => updateFormData('Occupation', value)}
      placeholder="Developer role/title (optional)"
    />
    
    <FormField
      type="textarea"
      value={formData['Use-case'] || ''}
      onChange={(value) => updateFormData('Use-case', value)}
      placeholder="What would you use Potatix for? (optional)"
    />
  </>
);

export default function Waitlist({ 
  variant = "inline", 
  showTitle = true,
  className,
  showExtendedFields = false
}: WaitlistProps) {
  const { 
    isSubmitting, 
    isSubmitted, 
    error, 
    formData, 
    updateFormData, 
    handleSubmit 
  } = useWaitlist();

  if (variant === "card") {
    return (
      <section className="py-10 sm:py-16">
        <div className={cn("bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 max-w-md mx-auto", className)}>
          {isSubmitted ? (
            <SuccessMessage variant="card" />
          ) : (
            <>
              {showTitle && (
                <div className="text-center mb-4">
                  <h3 className="text-base font-semibold mb-1">Join the Waitlist</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    Be first to get access when we launch.
                  </p>
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-3">
                <FormField
                  type="text"
                  value={formData.Name}
                  onChange={(value) => updateFormData('Name', value)}
                  placeholder="Your name"
                />
                
                <FormField
                  type="email"
                  value={formData.Mail}
                  onChange={(value) => updateFormData('Mail', value)}
                  placeholder="Your email address *"
                  required
                />
                
                {showExtendedFields && (
                  <ExtendedFields formData={formData} updateFormData={updateFormData} />
                )}
                
                {error && (
                  <div className="text-xs text-red-500">
                    {error}
                  </div>
                )}
                
                <div className="w-full">
                  <SubmitButton isSubmitting={isSubmitting} />
                </div>
              </form>
            </>
          )}
        </div>
      </section>
    );
  }

  // Inline variant
  return (
    <section className="py-10 sm:py-16">
      <div className={cn("max-w-xl mx-auto", className)}>
        {isSubmitted ? (
          <SuccessMessage variant="inline" />
        ) : (
          <>
            {showTitle && (
              <div className="mb-3">
                <h3 className="text-base font-semibold">Join the Waitlist</h3>
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <div className="flex flex-col space-y-3 w-full">
                {showExtendedFields && (
                  <FormField
                    type="text"
                    value={formData.Name}
                    onChange={(value) => updateFormData('Name', value)}
                    placeholder="Your name"
                  />
                )}
                
                <div className="flex flex-col sm:flex-row gap-2 w-full">
                  <div className="flex-1">
                    <FormField
                      type="email"
                      value={formData.Mail}
                      onChange={(value) => updateFormData('Mail', value)}
                      placeholder="Your email address *"
                      required
                    />
                    
                    {error && (
                      <div className="text-xs text-red-500 mt-1">
                        {error}
                      </div>
                    )}
                  </div>
                  
                  <SubmitButton isSubmitting={isSubmitting} />
                </div>
                
                {showExtendedFields && (
                  <ExtendedFields formData={formData} updateFormData={updateFormData} />
                )}
              </div>
            </form>
          </>
        )}
      </div>
    </section>
  );
} 