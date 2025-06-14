"use client";

import { CreditCard, CheckCircle, Sparkles } from "lucide-react";
import { SectionWrapper } from "./section-wrapper";
import { Button } from "@/components/ui/new-button";

type BillingSectionProps = {
  plan: "free" | "pro" | "enterprise";
  onUpgrade: () => void;
};

const PLAN_DETAILS = {
  free: {
    name: "Free Plan",
    features: ["Basic features", "5 projects", "1GB storage"],
  },
  pro: {
    name: "Pro Plan",
    features: [
      "All Free features",
      "Unlimited projects",
      "10GB storage",
      "Priority support",
    ],
  },
  enterprise: {
    name: "Enterprise Plan",
    features: [
      "All Pro features",
      "Unlimited storage",
      "24/7 support",
      "Custom integrations",
    ],
  },
};

export function BillingSection({ plan, onUpgrade }: BillingSectionProps) {
  const planData = PLAN_DETAILS[plan];

  return (
    <SectionWrapper title="Billing" icon={CreditCard}>
      {/* Plan card */}
      <div
        className={`p-4 rounded-md border relative ${
          plan === "pro" ? "border-emerald-500 bg-emerald-50" : "border-slate-200 bg-slate-50"
        }`}
      >
        {plan === "pro" && (
          <span className="absolute -top-2 -right-2 bg-emerald-500 text-white text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
            <Sparkles className="h-3 w-3" /> PRO
          </span>
        )}

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

      {plan === "free" && (
        <Button
          type="primary"
          size="small"
          block
          onClick={onUpgrade}
          className="mt-3"
        >
          Upgrade to Pro
        </Button>
      )}

      {plan === "pro" && (
        <Button
          type="secondary"
          size="small"
          block
          className="mt-3 cursor-not-allowed opacity-60"
          disabled
        >
          You&apos;re on Pro – thanks!
        </Button>
      )}
    </SectionWrapper>
  );
}
