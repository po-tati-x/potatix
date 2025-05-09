"use client";

import { Check, AlertCircle, XCircle, DollarSign } from "lucide-react";
import Link from "next/link";

interface ComparisonItem {
  feature: string;
  description?: string;
  potatix: boolean;
  competitors: boolean;
}

// Pricing comparison data
const COMPARISON_FEATURES: ComparisonItem[] = [
  {
    feature: "$0 monthly fees",
    description: "Start with zero risk and only pay when you actually make money",
    potatix: true,
    competitors: false,
  },
  {
    feature: "Just 10% of revenue",
    description: "Simple, transparent pricing with no hidden costs or tiers",
    potatix: true,
    competitors: false,
  },
  {
    feature: "No barrier to entry",
    description: "Create and launch your course without spending a dime upfront",
    potatix: true,
    competitors: false,
  },
  {
    feature: "Aligned incentives",
    description: "We only make money when you make money - your success is our success",
    potatix: true,
    competitors: false,
  },
  {
    feature: "No fixed costs when not selling",
    description: "Taking a break? Not actively marketing? You won't pay anything",
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
    description: "No need to calculate ROI or upgrade as you grow - same deal for everyone",
    potatix: true,
    competitors: false,
  }
];

// Benefits list for the pricing card
const BENEFITS = [
  "Risk-free starting point for new creators",
  "Simple math: make $1000, we take $100",
  "No penalty for experimentation",
  "Predictable costs that scale with success",
  "Cheaper than platforms charging 30-50%"
];

function FeatureComparison({ item }: { item: ComparisonItem }) {
  return (
    <div className="flex flex-col rounded-lg border border-gray-200 overflow-hidden hover:border-emerald-200 hover:shadow-sm transition-all duration-300">
      <div className="p-3 bg-white">
        <div className="flex justify-between items-center gap-4">
          <span className="font-medium text-xs sm:text-sm text-gray-800 transition-colors">
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
          <p className="text-xs text-gray-600 mt-1.5">
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
      <span className="text-xs sm:text-sm text-gray-700">{text}</span>
    </li>
  );
}

function PricingCard() {
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-lg border border-gray-100 h-full hover:shadow-xl transition-all duration-300">
      <div className="h-1 w-full bg-emerald-500" />
      
      <div className="p-6 sm:p-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
              The Only Plan You Need
            </h3>
            <div className="flex items-baseline gap-2 mb-1">
              <div className="bg-emerald-500 p-2 rounded-lg">
                <DollarSign className="h-5 w-5 text-white" />
              </div>
              <span className="text-3xl sm:text-4xl font-bold text-emerald-600">
                10%
              </span>
              <span className="text-base font-medium text-gray-700">
                of revenue
              </span>
            </div>
            <div className="flex items-baseline gap-1 pl-1">
              <span className="text-xl font-bold text-gray-900">$0</span>
              <span className="text-sm font-medium text-gray-700">
                monthly fee
              </span>
            </div>
          </div>
        </div>
        
        <Link 
          href="/waitlist"
          className="block w-full py-3 px-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-all text-sm text-center shadow-sm hover:shadow-md"
        >
          Join Waitlist
        </Link>
      </div>
      
      <div className="p-6 sm:p-8 pt-2">
        <h4 className="font-medium text-gray-900 mb-4 text-sm">
          What's included:
        </h4>
        <ul className="space-y-3">
          {BENEFITS.map((benefit, idx) => (
            <BenefitItem key={idx} text={benefit} />
          ))}
        </ul>
        
        <div className="mt-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0" aria-hidden="true" />
            <p className="text-xs text-amber-800">
              Only payment processing fees (Stripe's standard 2.9% + 30¢) will be added on top of our 10% fee.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ComparisonTable() {
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-lg border border-gray-100 h-full">
      <div className="h-1 w-full bg-gray-400" />
      
      <div className="p-6 sm:p-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900">
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
              <div className="bg-gray-100 rounded-full p-1 mr-2">
                <XCircle className="h-3 w-3 text-gray-400" />
              </div>
              <span className="text-gray-500">Others</span>
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
          <div className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-600">
            Simple, transparent pricing
          </div>
          
          <h2 className="mt-6 text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-neutral-900 leading-tight">
            One Simple <span className="text-emerald-600">Pricing Plan</span>
          </h2>
          
          <p className="mt-4 text-sm md:text-base text-neutral-600 max-w-2xl">
            No monthly fees, no tiers, no upsells. Just a straightforward 10% cut when you make money.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          <PricingCard />
          <ComparisonTable />
        </div>

        <div className="w-full mt-16 bg-white p-5 rounded-xl text-center border border-gray-200 shadow-sm">
          <blockquote className="text-sm text-gray-700 italic">
            "We only make money when creators make money = aligned incentives"
          </blockquote>
          <p className="mt-2 text-xs text-gray-500">
            — From our actual business plan
          </p>
        </div>
      </div>
    </section>
  );
} 