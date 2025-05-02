import { useState, useEffect } from 'react';

interface WaitlistFormData {
  Name: string;
  Mail: string;
  Phone?: string;
  Occupation?: string;
  'Use-case'?: string;
}

interface UseWaitlistReturn {
  isSubmitted: boolean;
  isSubmitting: boolean;
  error: string;
  formData: WaitlistFormData;
  updateFormData: (field: keyof WaitlistFormData, value: string) => void;
  handleSubmit: (e: React.FormEvent) => void;
  setTurnstileToken: (token: string) => void;
}

/**
 * A custom hook to handle waitlist functionality with NocoDB
 */
export function useWaitlist(): UseWaitlistReturn {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");
  const [formData, setFormData] = useState<WaitlistFormData>({
    Name: '',
    Mail: '',
    Phone: '',
    Occupation: '',
    'Use-case': ''
  });

  const updateFormData = (field: keyof WaitlistFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.Mail) {
      setError("Email is required");
      return;
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.Mail)) {
      setError("Please enter a valid email address");
      return;
    }

    // Skip Turnstile check in development
    if (process.env.NODE_ENV !== 'development') {
      if (!turnstileToken) {
        setError("Please complete the security check");
        return;
      }
    }
    
    setIsSubmitting(true);
    setError("");
    
    try {
      const payload = {
        ...formData,
        turnstileToken: process.env.NODE_ENV === 'development' ? undefined : turnstileToken
      };
      
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to join waitlist');
      }
      
      setIsSubmitted(true);
      setTurnstileToken(''); // Reset token after successful submission
      
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitted,
    isSubmitting,
    error,
    formData,
    updateFormData,
    handleSubmit,
    setTurnstileToken
  };
} 