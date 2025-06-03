"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, Info, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils/cn";

type Category = "core" | "pricing" | "usability" | "data";

type ComparisonFeature = {
  feature: string;
  description?: string;
  potatix: boolean;
  competitors: boolean;
  highlight?: boolean;
  category?: Category;
};

type CategoryInfo = {
  title: string;
  description: string;
};

const CATEGORIES: Record<Category, CategoryInfo> = {
  core: { 
    title: "Core Features", 
    description: "What makes Potatix different at its foundation" 
  },
  pricing: { 
    title: "Pricing Model", 
    description: "How our pricing aligns with your success" 
  },
  usability: { 
    title: "User Experience", 
    description: "Designed to get out of your way" 
  },
  data: { 
    title: "Data Ownership", 
    description: "Your content, your students, your business" 
  },
};

const COMPARISON_FEATURES: ComparisonFeature[] = [
  {
    feature: "Focused on dev course creators only",
    description: "Built specifically for software developers who want to sell technical courses",
    potatix: true,
    competitors: false,
    highlight: true,
    category: "core",
  },
  {
    feature: "Minimal needed features only",
    description: "Just payment processing, video hosting, and basic user auth - nothing more",
    potatix: true,
    competitors: false,
    highlight: true,
    category: "core",
  },
  {
    feature: "Pay only when you sell",
    description: "No monthly fees, just 10% of revenue when you actually make money",
    potatix: true,
    competitors: false,
    highlight: true,
    category: "pricing",
  },
  {
    feature: "No barrier to entry",
    description: "$0 fixed monthly fee - perfect for creators just starting out",
    potatix: true,
    competitors: false,
    category: "pricing",
  },
  {
    feature: "Aligned incentives",
    description: "We only make money when you make money",
    potatix: true,
    competitors: false,
    category: "pricing",
  },
  {
    feature: "No hidden costs",
    description: "Transparent, simple pricing with no surprise fees",
    potatix: true,
    competitors: false,
    category: "pricing",
  },
  {
    feature: "Fast setup (under 10 minutes)",
    description: "Upload videos, set price, get payment link - that's it",
    potatix: true,
    competitors: false,
    highlight: true,
    category: "usability",
  },
  {
    feature: "No BS UX",
    description: "Clean, simple interface built for developers, by developers",
    potatix: true,
    competitors: false,
    highlight: true,
    category: "usability",
  },
  {
    feature: "Own your data completely",
    description: "Your course content, student emails, analytics - all exportable anytime",
    potatix: true,
    competitors: false,
    category: "data",
  },
  {
    feature: "Zero lock-in",
    description: "Export everything and leave whenever you want",
    potatix: true,
    competitors: false,
    category: "data",
  },
];

type FeatureRowProps = {
  feature: ComparisonFeature;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
};

const FeatureRow = ({ feature, index, isExpanded, onToggle }: FeatureRowProps) => {
  if (!feature) return null;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onToggle();
    }
  };

  const isExpandable = !!feature.description;

  return (
    <div className="group">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.3, delay: index * 0.05 }}
        className={cn(
          "grid grid-cols-12 border-b border-gray-200",
          "transition-colors duration-200",
          {
            "bg-white": index % 2 === 0,
            "bg-gray-50/70": index % 2 !== 0,
            "hover:bg-gray-50 cursor-pointer": isExpandable,
            "font-medium": feature.highlight
          }
        )}
        onClick={isExpandable ? onToggle : undefined}
        onKeyDown={isExpandable ? handleKeyDown : undefined}
        tabIndex={isExpandable ? 0 : undefined}
        role={isExpandable ? "button" : undefined}
        aria-expanded={isExpandable ? isExpanded : undefined}
      >
        <div className="flex items-center gap-2 p-4 col-span-6">
          {isExpandable && (
            <motion.span 
              animate={{ rotate: isExpanded ? 180 : 0 }}
              className="text-gray-400 flex-shrink-0"
            >
              <ChevronDown className="h-4 w-4" />
            </motion.span>
          )}
          <span className={cn("text-gray-800", {
            "text-[#06A28B]": feature.highlight
          })}>
            {feature.feature}
          </span>
          {feature.highlight && !isExpandable && (
            <span className="ml-2 text-xs py-0.5 px-2 bg-[#06A28B]/10 text-[#06A28B] rounded-full">
              Core Benefit
            </span>
          )}
        </div>

        <div className="flex justify-center items-center p-4 col-span-3 bg-[#06A28B]/5">
          {feature.potatix ? (
            <CheckCircle2 className="h-5 w-5 text-green-500" />
          ) : (
            <XCircle className="h-5 w-5 text-red-500" />
          )}
        </div>

        <div className="flex justify-center items-center p-4 col-span-3 bg-gray-100/50">
          {feature.competitors ? (
            <CheckCircle2 className="h-5 w-5 text-green-500" />
          ) : (
            <XCircle className="h-5 w-5 text-red-500" />
          )}
        </div>
      </motion.div>
      
      {isExpandable && (
        <motion.div 
          initial={false}
          animate={{ 
            height: isExpanded ? "auto" : 0,
            opacity: isExpanded ? 1 : 0
          }}
          transition={{ duration: 0.2 }}
          className="overflow-hidden bg-gray-50/50 border-b border-gray-200"
        >
          <div className="p-4 pl-10 grid grid-cols-12">
            <div className="col-span-12 flex items-start gap-2">
              <Info className="h-4 w-4 text-[#06A28B] mt-0.5 flex-shrink-0" />
              <p className="text-sm text-gray-600">{feature.description}</p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

type CategorySectionProps = {
  title: string;
  description: string;
  features: ComparisonFeature[];
};

const CategorySection = ({ title, description, features }: CategorySectionProps) => {
  const [expandedFeatures, setExpandedFeatures] = useState<Set<string>>(new Set());

  const handleToggle = (feature: string) => {
    setExpandedFeatures(prev => {
      const next = new Set(prev);
      if (next.has(feature)) {
        next.delete(feature);
      } else {
        next.add(feature);
      }
      return next;
    });
  };

  return (
    <div className="mb-10">
      <div className="mb-4">
        <h3 className="text-xl font-bold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-600">{description}</p>
      </div>

      <div className="overflow-hidden rounded-xl shadow-md border border-gray-200">
        <div className="grid grid-cols-12 bg-white">
          <div className="p-4 col-span-6 border-b border-r border-gray-200">
            <h4 className="font-bold text-gray-900">Feature</h4>
          </div>
          <div className="p-4 col-span-3 border-b border-r border-gray-200 bg-[#06A28B]/10">
            <h4 className="font-bold text-[#06A28B] text-center">Potatix</h4>
          </div>
          <div className="p-4 col-span-3 border-b border-gray-200 bg-gray-100">
            <h4 className="font-bold text-gray-700 text-center">Others</h4>
          </div>
        </div>

        <div>
          {features.map((feature, index) => (
            <FeatureRow 
              key={`${feature.category}-${index}`}
              feature={feature} 
              index={index}
              isExpanded={expandedFeatures.has(feature.feature)}
              onToggle={() => handleToggle(feature.feature)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

const ComparisonSection = () => {
  const groupedFeatures = COMPARISON_FEATURES.reduce<Record<Category, ComparisonFeature[]>>(
    (acc, feature) => {
      const category = feature.category || "core";
      if (!acc[category]) acc[category] = [];
      acc[category].push(feature);
      return acc;
    }, 
    {} as Record<Category, ComparisonFeature[]>
  );

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            No BS Comparison
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            We don&apos;t try to be everything for everyone. We focus on what dev course creators actually need.
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          {Object.entries(groupedFeatures).map(([category, features]) => (
            <CategorySection 
              key={category}
              title={CATEGORIES[category as Category].title}
              description={CATEGORIES[category as Category].description}
              features={features}
            />
          ))}
        </div>

        <div className="mt-12 max-w-3xl mx-auto text-center bg-gray-100 p-6 rounded-xl border border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Why Choose Potatix?
          </h3>
          <p className="text-gray-700">
            &quot;We&apos;ll move faster and focus exclusively on creators while bigger platforms try to please everyone.
            No grand vision. No revolution. Just solving a specific problem better than others for a small group of people who will pay us.&quot;
          </p>
          <div className="mt-4 text-sm text-gray-500">
            — From our actual business plan
          </div>
        </div>
      </div>
    </section>
  );
};

export default ComparisonSection; 