"use client";

import { useState } from "react";
import { DollarSign, Lock, BarChart, Database, Clock, Globe, Palette, Code } from "lucide-react";

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  accentColor: string;
  badge?: string;
}

const FEATURES: FeatureCardProps[] = [
  {
    title: "No monthly fees",
    description: "Pay only when you sell. 10% cut on actual sales. Zero up-front costs or subscriptions.",
    icon: <DollarSign className="h-4 w-4" />,
    accentColor: "bg-emerald-500",
    badge: "10% revenue share",
  },
  {
    title: "Custom domain",
    description: "Use your own domain or get a free yourname.potatix.com subdomain. Complete brand control.",
    icon: <Globe className="h-4 w-4" />,
    accentColor: "bg-indigo-500",
    badge: "Free SSL included",
  },
  {
    title: "Your own landing pages",
    description: "Design your own sales pages or use our templates. Seamless connection to our backend.",
    icon: <Palette className="h-4 w-4" />,
    accentColor: "bg-violet-500",
    badge: "Full customization",
  },
  {
    title: "100% data ownership",
    description: "Your content, your students, your analytics. All exportable at any time.",
    icon: <Database className="h-4 w-4" />,
    accentColor: "bg-blue-500",
    badge: "No lock-in",
  },
  {
    title: "Developer-first",
    description: "Built for devs by devs. Technical focus and clean API. No marketing fluff.",
    icon: <Code className="h-4 w-4" />,
    accentColor: "bg-neutral-800",
    badge: "Technical focus",
  },
  {
    title: "10-minute setup",
    description: "Upload content, set price, grab payment link. Start selling immediately.",
    icon: <Clock className="h-4 w-4" />,
    accentColor: "bg-amber-500",
    badge: "Instant deployment",
  },
  {
    title: "Actionable metrics",
    description: "Conversion data, engagement stats, revenue tracking. No vanity metrics.",
    icon: <BarChart className="h-4 w-4" />,
    accentColor: "bg-emerald-500",
    badge: "Real insights",
  },
  {
    title: "Zero lock-in",
    description: "Cancel anytime, export everything. We earn your business every month.",
    icon: <Lock className="h-4 w-4" />,
    accentColor: "bg-rose-500",
    badge: "Full portability",
  },
];

function FeatureCard({ feature }: { feature: FeatureCardProps }) {
  return (
    <div className="group relative flex h-full flex-col overflow-hidden rounded-md border border-neutral-200 bg-white p-5 transition-all duration-200 hover:border-emerald-500 hover:shadow-md">
      <div className={`absolute inset-x-0 top-0 h-1 w-full ${feature.accentColor} transition-all duration-300 group-hover:h-1.5`} />
      
      <div className="mb-4 flex items-center justify-between">
        <div className={`rounded p-2 ${feature.accentColor} text-white transition-transform duration-300 group-hover:scale-110`}>
          {feature.icon}
        </div>
        
        {feature.badge && (
          <span className="text-xs font-medium text-neutral-600">
            {feature.badge}
          </span>
        )}
      </div>
      
      <h3 className="mb-2 text-base font-semibold text-neutral-900 transition-colors group-hover:text-emerald-600">
        {feature.title}
      </h3>
      
      <p className="text-sm leading-relaxed text-neutral-600">
        {feature.description}
        
      </p>
    </div>
  );
}

function MobileFeatures({ features }: { features: FeatureCardProps[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const handleDotClick = (index: number) => {
    setCurrentIndex(index);
  };
  
  return (
    <div className="lg:hidden">
      <div className="relative overflow-hidden">
        <div 
          className="flex transition-transform duration-300 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {features.map((feature, index) => (
            <div key={index} className="w-full flex-shrink-0 px-1">
              <FeatureCard feature={feature} />
            </div>
          ))}
        </div>
      </div>
      
      <div className="mt-6 flex justify-center space-x-2">
        {features.map((_, index) => (
          <button
            key={index}
            onClick={() => handleDotClick(index)}
            className={`h-1.5 rounded-full transition-all ${
              currentIndex === index 
                ? "w-6 bg-emerald-500" 
                : "w-1.5 bg-neutral-300 hover:bg-neutral-400"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

export default function Features() {
  return (
    <section 
      id="features" 
      className="relative py-20"
    >
      <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="text-left w-full max-w-xl">
          <div className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-600">
            10x faster than competitors
          </div>
          
          <h2 className="mt-6 text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-neutral-900 leading-tight">
            Built for developers, <span className="text-emerald-600">by developers</span>
          </h2>
          
          <p className="mt-4 text-sm md:text-base text-neutral-600 max-w-2xl">
            No marketing BS. No confusing pricing. Just the tools you need to sell your expertise.
          </p>
        </div>
        
        <div className="mt-16">
          {/* Mobile features slider */}
          <MobileFeatures features={FEATURES} />
          
          {/* Desktop feature grid */}
          <div className="hidden grid-cols-2 gap-5 lg:grid xl:grid-cols-4">
            {FEATURES.map((feature, index) => (
              <FeatureCard key={index} feature={feature} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
} 