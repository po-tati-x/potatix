"use client";

import { Check, AlertCircle, XCircle, Zap } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/potatix/Button";

interface ComparisonItem {
  feature: string;
  description?: string;
  potatix: boolean;
  competitors: boolean;
}

// Pricing comparison data
const COMPARISON_FEATURES: ComparisonItem[] = [
  {
    feature: "100% Free Forever",
    description: "No fees, no revenue share, completely free to use",
    potatix: true,
    competitors: false,
  },
  {
    feature: "No upfront fees",
    description: "Create and launch your course without spending a dime",
    potatix: true,
    competitors: false,
  },
  {
    feature: "Creator-first approach",
    description: "Built for creators with your needs in mind",
    potatix: true,
    competitors: false,
  },
  {
    feature: "No hidden costs",
    description: "No surprise fees or charges when you scale",
    potatix: true,
    competitors: false,
  },
  {
    feature: "Unlimited courses & students",
    description: "No artificial caps on how many courses you create or students you teach",
    potatix: true,
    competitors: false,
  },
  {
    feature: "No complex pricing tiers",
    description: "One simple plan for everyone - completely free",
    potatix: true,
    competitors: false,
  },
  {
    feature: "No revenue sharing",
    description: "Keep 100% of what you earn - we don't take any cut",
    potatix: true,
    competitors: false,
  }
];

// Benefits list for the pricing card
const BENEFITS = [
  "No upfront investment required",
  "Keep 100% of your revenue",
  "No penalty for experimentation",
  "Scale without additional costs",
  "No credit card required to start"
];

function FeatureComparison({ item }: { item: ComparisonItem }) {
  return (
    <div className="flex flex-col rounded-md border border-slate-200 overflow-hidden hover:border-emerald-300 transition-all duration-300">
      <div className="p-3 bg-white">
        <div className="flex justify-between items-center gap-4">
          <span className="font-medium text-xs sm:text-sm text-slate-800 transition-colors">
            {item.feature}
          </span>
          <div className="flex gap-6 flex-shrink-0">
            {/* Potatix column */}
            <div className="flex items-center justify-center w-6">
              <span className="sr-only">Potatix</span>
              {item.potatix ? (
                <div className="bg-emerald-100 rounded-full p-0.5">
                  <Check className="h-4 w-4 text-emerald-600" aria-label="Yes" />
                </div>
              ) : (
                <div className="bg-red-100 rounded-full p-0.5">
                  <XCircle className="h-4 w-4 text-red-500" aria-label="No" />
                </div>
              )}
            </div>
            
            {/* Competitors column */}
            <div className="flex items-center justify-center w-6">
              <span className="sr-only">Others</span>
              {item.competitors ? (
                <div className="bg-emerald-100 rounded-full p-0.5">
                  <Check className="h-4 w-4 text-emerald-600" aria-label="Yes" />
                </div>
              ) : (
                <div className="bg-red-100 rounded-full p-0.5">
                  <XCircle className="h-4 w-4 text-red-500" aria-label="No" />
                </div>
              )}
            </div>
          </div>
        </div>
        {item.description && (
          <p className="text-xs text-slate-600 mt-1.5">
            {item.description}
          </p>
        )}
      </div>
    </div>
  );
}

function BenefitItem({ text }: { text: string }) {
  return (
    <li className="flex items-start gap-2">
      <div className="bg-emerald-100 rounded-full p-0.5 mt-0.5 flex-shrink-0">
        <Check className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" />
      </div>
      <span className="text-xs sm:text-sm text-slate-700">{text}</span>
    </li>
  );
}

function PricingCard() {
  return (
    <div className="bg-white rounded-md border border-slate-200 h-full hover:border-slate-300 transition-all duration-300">
      
      <div className="h-1 w-full bg-emerald-600" />
      
      <div className="p-6 sm:p-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">
              Completely Free
            </h3>
            <div className="flex items-center gap-2.5 mb-1">
              <div className="flex items-center justify-center bg-emerald-600 w-10 h-10 rounded-md">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <span className="text-3xl sm:text-4xl font-bold text-emerald-600">
                $0
              </span>
              <span className="text-base font-medium text-slate-700">
                forever
              </span>
            </div>
            <div className="flex items-baseline gap-1 pl-1 mt-1">
              <span className="text-sm font-medium text-slate-700">
                No fees. No revenue share.
              </span>
            </div>
          </div>
        </div>
        
        <Button 
          type="primary"
          size="large"
          asChild
          className="w-full justify-center" 
        >
          <Link href="/login">Get Started Now</Link>
        </Button>
      </div>
      
      <div className="p-6 sm:p-8 pt-2">
        <h4 className="font-medium text-slate-900 mb-4 text-sm">
          What&apos;s included:
        </h4>
        <ul className="space-y-3">
          {BENEFITS.map((benefit, idx) => (
            <BenefitItem key={idx} text={benefit} />
          ))}
        </ul>
        
        <div className="mt-6 p-4 bg-blue-50 rounded-md border border-blue-200">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-500 flex-shrink-0" aria-hidden="true" />
            <p className="text-xs text-blue-800">
              Only standard payment processing fees (Stripe&apos;s 2.9% + 30¢) apply when you sell. We don&apos;t add any fees on top.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ComparisonTable() {
  return (
    <div className="bg-white rounded-md border border-slate-200 h-full">
      <div className="h-1 w-full bg-slate-400" />
      
      <div className="p-6 sm:p-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg sm:text-xl font-bold text-slate-900">
            Platform Comparison
          </h3>
          <div className="flex gap-6 text-xs font-medium">
            <div className="flex items-center">
              <div className="bg-emerald-100 rounded-full p-1 mr-2">
                <Check className="h-3 w-3 text-emerald-600" />
              </div>
              <span className="text-emerald-600">Potatix</span>
            </div>
            <div className="flex items-center">
              <div className="bg-slate-100 rounded-full p-1 mr-2">
                <XCircle className="h-3 w-3 text-slate-400" />
              </div>
              <span className="text-slate-500">Others</span>
            </div>
          </div>
        </div>
        
        <div className="space-y-2.5">
          {COMPARISON_FEATURES.map((item, idx) => (
            <FeatureComparison key={idx} item={item} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Pricing() {
  return (
    <section 
      id="pricing" 
      className="relative py-20"
      aria-label="Pricing plans"
    >
      <div className="relative mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
        <div className="text-left w-full max-w-xl">
          <div className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">
            100% Free Platform
          </div>
          
          <h2 className="mt-6 text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-slate-900 leading-tight">
            No Costs, <span className="text-emerald-600">No Catch</span>
          </h2>
          
          <p className="mt-4 text-sm md:text-base text-slate-600 max-w-2xl">
            No monthly fees, no revenue share, no hidden costs. Create and sell courses completely free.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          <PricingCard />
          <ComparisonTable />
        </div>

        <div className="w-full mt-16 bg-white p-5 rounded-md text-center border border-slate-200">
          <blockquote className="text-sm text-slate-700 italic">
            &quot;We believe in empowering creators without taking a cut of their success.&quot;
          </blockquote>
          <p className="mt-2 text-xs text-slate-500">
            — The Potatix Team
          </p>
        </div>
      </div>
    </section>
  );
} 