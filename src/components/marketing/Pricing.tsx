"use client";

import { motion } from "framer-motion";
import { Check, AlertCircle, XCircle, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { memo } from "react";

// Simple type for comparison items
type ComparisonItem = {
  feature: string;
  description?: string;
  potatix: boolean;
  competitors: boolean;
};

// Comparison features focused on pricing model benefits
const comparisonFeatures: ComparisonItem[] = [
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

// Benefits of our pricing model
const benefitItems = [
  "Risk-free starting point for new creators",
  "Simple math: make $1000, we take $100",
  "No penalty for experimentation",
  "Predictable costs that scale with success",
  "Cheaper than platforms charging 30-50%"
];

const ComparisonRow = memo(({ item }: { item: ComparisonItem }) => (
  <motion.div 
    initial={{ opacity: 0, y: 10 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.3 }}
    className="group flex flex-col rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:border-emerald-200 dark:hover:border-emerald-800 hover:shadow-sm transition-all duration-300"
  >
    <div className="p-3 bg-white dark:bg-gray-800">
      <div className="flex justify-between items-center gap-4">
        <span className="font-medium text-xs sm:text-sm text-gray-800 dark:text-gray-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
          {item.feature}
        </span>
        <div className="flex gap-6 flex-shrink-0">
          <div className="flex items-center justify-center w-6">
            <span className="sr-only">Potatix</span>
            {item.potatix ? (
              <div className="bg-emerald-100 dark:bg-emerald-900/30 rounded-full p-0.5">
                <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform" aria-label="Yes" />
              </div>
            ) : (
              <div className="bg-red-100 dark:bg-red-900/30 rounded-full p-0.5">
                <XCircle className="h-4 w-4 text-red-500 group-hover:scale-110 transition-transform" aria-label="No" />
              </div>
            )}
          </div>
          <div className="flex items-center justify-center w-6">
            <span className="sr-only">Others</span>
            {item.competitors ? (
              <div className="bg-emerald-100 dark:bg-emerald-900/30 rounded-full p-0.5">
                <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform" aria-label="Yes" />
              </div>
            ) : (
              <div className="bg-red-100 dark:bg-red-900/30 rounded-full p-0.5">
                <XCircle className="h-4 w-4 text-red-500 group-hover:scale-110 transition-transform" aria-label="No" />
              </div>
            )}
          </div>
        </div>
      </div>
      {item.description && (
        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1.5 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">
          {item.description}
        </p>
      )}
    </div>
  </motion.div>
));
ComparisonRow.displayName = 'ComparisonRow';

const BenefitItem = memo(({ text }: { text: string }) => (
  <li className="flex items-start gap-2">
    <div className="bg-emerald-100 dark:bg-emerald-900/30 rounded-full p-0.5 mt-0.5 flex-shrink-0">
      <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
    </div>
    <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">{text}</span>
  </li>
));
BenefitItem.displayName = 'BenefitItem';

const PricingCard = memo(() => (
  <div className="group relative bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg h-full hover:shadow-xl transition-all duration-300">
    <div className="absolute h-1 top-0 left-0 right-0 bg-gradient-to-r from-emerald-500 to-emerald-600" />
    
    <div className="relative bg-gradient-to-br from-slate-50 to-white dark:from-gray-800 dark:to-gray-750 p-6 sm:p-8">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2">
            The Only Plan You Need
          </h3>
          <div className="flex items-baseline gap-2 mb-1">
            <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-2 rounded-lg shadow-sm">
              <DollarSign className="h-5 w-5 text-white" />
            </div>
            <span className="text-3xl sm:text-4xl font-bold text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition-transform duration-500">
              10%
            </span>
            <span className="text-base font-medium text-gray-700 dark:text-gray-300">
              of revenue
            </span>
          </div>
          <div className="flex items-baseline gap-1 pl-1">
            <span className="text-xl font-bold text-gray-900 dark:text-white">$0</span>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              monthly fee
            </span>
          </div>
        </div>
      </div>
      
      <Link 
        href="/waitlist"
        className="block w-full py-3 px-5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white rounded-lg font-medium transition-all duration-300 text-sm text-center shadow-sm hover:shadow-md active:scale-[0.98]"
        tabIndex={0}
        aria-label="Join the waitlist"
      >
        Join Waitlist
      </Link>
    </div>
    
    <div className="p-6 sm:p-8">
      <h4 className="font-medium text-gray-900 dark:text-white mb-4 text-sm">
        What's included:
      </h4>
      <ul className="space-y-3">
        {benefitItems.map((benefit, idx) => (
          <BenefitItem key={idx} text={benefit} />
        ))}
      </ul>
      
      <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-200 dark:border-amber-900/20">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0" aria-hidden="true" />
          <p className="text-xs text-amber-800 dark:text-amber-300">
            Only payment processing fees (Stripe's standard 2.9% + 30¢) will be added on top of our 10% fee.
          </p>
        </div>
      </div>
    </div>
  </div>
));
PricingCard.displayName = 'PricingCard';

const ComparisonTable = memo(() => (
  <div className="relative bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg h-full">
    <div className="absolute h-1 top-0 left-0 right-0 bg-gradient-to-r from-gray-400 to-gray-500" />
    
    <div className="p-6 sm:p-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
          Platform Comparison
        </h3>
        <div className="flex gap-6 text-xs font-medium">
          <div className="flex items-center">
            <div className="bg-emerald-100 dark:bg-emerald-900/30 rounded-full p-1 mr-2">
              <Check className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
            </div>
            <span className="text-emerald-600 dark:text-emerald-400">Potatix</span>
          </div>
          <div className="flex items-center">
            <div className="bg-gray-100 dark:bg-gray-700 rounded-full p-1 mr-2">
              <XCircle className="h-3 w-3 text-gray-400 dark:text-gray-500" />
            </div>
            <span className="text-gray-500 dark:text-gray-400">Others</span>
          </div>
        </div>
      </div>
      
      <div className="space-y-2.5">
        {comparisonFeatures.map((item, idx) => (
          <ComparisonRow key={idx} item={item} />
        ))}
      </div>
    </div>
  </div>
));
ComparisonTable.displayName = 'ComparisonTable';

const Pricing = () => {
  return (
    <section 
      id="pricing" 
      className="py-16 sm:py-20 lg:py-24 relative overflow-hidden bg-gradient-to-b from-white to-slate-50 dark:from-gray-900 dark:to-gray-800"
      aria-label="Pricing plans"
    >
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#0EA57720_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,black,transparent)]" />
      
      <div className="relative mx-auto px-6 sm:px-8 lg:px-10 max-w-5xl">
        <div className="flex items-center gap-2 mb-2">
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-1.5 rounded-md shadow-sm">
            <DollarSign className="h-4 w-4 text-white" aria-hidden="true" />
          </div>
          <span className="text-sm font-medium text-emerald-600 uppercase tracking-wider">Pricing</span>
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="mb-10 sm:mb-12 lg:mb-16 relative z-10"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3 leading-tight tracking-tight">
            One Simple <span className="text-emerald-600 dark:text-emerald-400">Pricing Plan</span>
          </h2>
          <p className="text-sm md:text-base text-gray-600 dark:text-gray-300 max-w-2xl leading-relaxed">
            No monthly fees, no tiers, no upsells. Just a straightforward 10% cut when you make money.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-6 lg:gap-8 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <PricingCard />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <ComparisonTable />
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="max-w-3xl mx-auto mt-10 bg-white dark:bg-gray-800 p-5 rounded-xl text-center border border-gray-200 dark:border-gray-700 shadow-sm"
        >
          <blockquote className="text-sm text-gray-700 dark:text-gray-300 italic">
            "We only make money when creators make money = aligned incentives"
          </blockquote>
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            — From our actual business plan
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default Pricing; 