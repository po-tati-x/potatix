'use client';

import { CreditCard, CheckCircle } from 'lucide-react';
import { SectionWrapper } from './section-wrapper';
import { Button } from '@/components/ui/potatix/Button';

type BillingSectionProps = {
  plan: 'free' | 'pro' | 'enterprise';
  onUpgrade: () => void;
};

const PLAN_DETAILS = {
  free: {
    name: 'Free Plan',
    features: ['Basic features', '5 projects', '1GB storage']
  },
  pro: {
    name: 'Pro Plan',
    features: ['All Free features', 'Unlimited projects', '10GB storage', 'Priority support']
  },
  enterprise: {
    name: 'Enterprise Plan',
    features: ['All Pro features', 'Unlimited storage', '24/7 support', 'Custom integrations']
  }
};

export function BillingSection({ plan, onUpgrade }: BillingSectionProps) {
  const planData = PLAN_DETAILS[plan];
  
  return (
    <SectionWrapper title="Billing" icon={CreditCard}>
      <div className="p-3 bg-slate-50 rounded-md border border-slate-200">
        <h3 className="font-medium text-sm text-slate-900">{planData.name}</h3>
        <ul className="mt-2 space-y-1.5">
          {planData.features.map((feature, i) => (
            <li key={i} className="flex items-center text-xs text-slate-600">
              <CheckCircle className="h-3.5 w-3.5 text-emerald-500 mr-2" />
              {feature}
            </li>
          ))}
        </ul>
      </div>
      
      {plan === 'free' && (
        <Button 
          type="primary"
          size="small"
          onClick={onUpgrade}
          className="w-full mt-3"
        >
          Upgrade to Pro
        </Button>
      )}
    </SectionWrapper>
  );
} 