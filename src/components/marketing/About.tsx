"use client";

import { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { BookOpen, Palette, Smartphone, Sparkles, CreditCard, Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

type Feature = {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  benefits: string[];
  image: string;
};

// Features array focused on core product offerings
const features: Feature[] = [
  {
    id: "course-builder",
    title: "Course Builder",
    description: "Easily create, organize, and manage your courses with our intuitive builder.",
    icon: <BookOpen className="h-5 w-5 sm:h-6 sm:w-6" />,
    benefits: [
      "Drag-and-drop interface for course organization",
      "Upload videos, documents, and quizzes",
      "Track student progress and engagement",
      "Schedule course releases and manage access",
    ],
    image: "/course-builder.png",
  },
  {
    id: "payment-system",
    title: "Payment System",
    description: "Accept payments effortlessly with our integrated payment solution.",
    icon: <CreditCard className="h-6 w-6" />,
    benefits: [
      "Multiple payment gateways (Kaspi, Halyk, Forte)",
      "Subscription and one-time payment options",
      "Automated invoicing and receipts",
      "Real-time revenue tracking",
    ],
    image: "/payment-system.png",
  },
  {
    id: "landing-page-creator",
    title: "Landing Page Creator",
    description: "Build beautiful sales pages that convert visitors into students.",
    icon: <Palette className="h-6 w-6" />,
    benefits: [
      "Professional templates designed for high conversion",
      "No coding required - simple visual editor",
      "Mobile-responsive designs",
      "Integrated with payment system",
    ],
    image: "/landing-creator.png",
  },
  {
    id: "mobile-constructor",
    title: "Mobile Constructor",
    description: "Create mobile-first personal information sites with our tap constructor.",
    icon: <Smartphone className="h-6 w-6" />,
    benefits: [
      "Optimize for mobile viewing experience",
      "Build once, works everywhere",
      "Quick loading and smooth navigation",
      "Perfect for on-the-go learning",
    ],
    image: "/mobile-constructor.png",
  },
  {
    id: "ai-assistant",
    title: "AI Assistant",
    description: "Leverage AI to enhance your teaching and content creation.",
    icon: <Sparkles className="h-6 w-6" />,
    benefits: [
      "Get content suggestions and improvements",
      "Automate responses to common student questions",
      "Generate quizzes and learning materials",
      "Analyze student performance patterns",
    ],
    image: "/ai-assistant.png",
  },
];

type FeatureTabProps = {
  feature: Feature;
};

const BenefitItem = ({ benefit }: { benefit: string }) => (
  <li className="flex items-start gap-2">
    <span className="flex-shrink-0 w-4 h-4 bg-[#06A28B]/10 rounded-full flex items-center justify-center">
      <Check className="w-2.5 h-2.5 text-[#06A28B]" />
    </span>
    <span className="text-sm text-gray-700 leading-tight">{benefit}</span>
  </li>
);

const FeatureImage = ({ feature }: { feature: Feature }) => (
  <div className="relative w-full max-w-[280px] xs:max-w-[320px] sm:max-w-[380px] lg:max-w-[440px] mx-auto">
    {/* Main image container */}
    <div className="relative rounded-lg sm:rounded-xl overflow-hidden bg-white border border-gray-200 shadow-md sm:shadow-lg z-10">
      <div className="bg-gray-100 aspect-[3/2] w-full">
        <div className="flex items-center justify-center h-full w-full bg-gray-200">
          <span className="text-xs sm:text-sm text-gray-500 font-medium px-3 text-center">
            {feature.title} Preview
          </span>
        </div>
      </div>
    </div>
    
    {/* Decorative backgrounds */}
    <div 
      className="absolute -top-2 -right-2 w-full h-full rounded-lg sm:rounded-xl transform rotate-2 bg-gradient-to-br from-[#06A28B]/20 to-[#06A28B]/5 z-0" 
      aria-hidden="true"
    />
    <div 
      className="absolute -bottom-2 -left-2 w-full h-full rounded-lg sm:rounded-xl transform -rotate-2 border-2 border-[#06A28B]/30 z-0" 
      aria-hidden="true"
    />
  </div>
);

const FeatureContent = ({ feature }: { feature: Feature }) => (
  <div className="space-y-3 sm:space-y-4">
    <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 flex items-center gap-2 sm:gap-3">
      <span className="p-1.5 sm:p-2 bg-[#06A28B]/10 text-[#06A28B] rounded-lg flex-shrink-0">
        {feature.icon}
      </span>
      <span>{feature.title}</span>
    </h3>
    
    <p className="text-sm sm:text-base lg:text-lg text-gray-600 leading-relaxed">
      {feature.description}
    </p>
    
    <ul className="space-y-2">
      {feature.benefits.map((benefit, index) => (
        <BenefitItem key={index} benefit={benefit} />
      ))}
    </ul>
  </div>
);

const MobileFeatureCard = ({ feature, isActive }: { feature: Feature; isActive: boolean }) => {
  const [showBenefits, setShowBenefits] = useState(false);

  return (
    <div className={cn(
      "w-full bg-white rounded-xl border-2 transition-all duration-300",
      isActive ? "border-[#06A28B] shadow-lg" : "border-gray-200"
    )}>
      {/* Preview Image */}
      <div className="relative w-full aspect-[2/1] rounded-t-xl overflow-hidden bg-gray-100">
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs text-gray-500 font-medium px-3 text-center">
            {feature.title} Preview
          </span>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="p-1.5 bg-[#06A28B]/10 text-[#06A28B] rounded-lg">
            {feature.icon}
          </span>
          <h3 className="text-base font-bold text-gray-900">{feature.title}</h3>
        </div>
        
        <p className="text-sm text-gray-600 mb-3">
          {feature.description}
        </p>
        
        <button
          onClick={() => setShowBenefits(!showBenefits)}
          className="w-full flex items-center justify-between text-sm text-[#06A28B] hover:text-[#058d79] transition-colors py-1"
        >
          <span>{showBenefits ? 'Hide Benefits' : 'Show Benefits'}</span>
          <motion.span
            animate={{ rotate: showBenefits ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-4 h-4" />
          </motion.span>
        </button>
        
        <motion.div
          initial={false}
          animate={{ height: showBenefits ? 'auto' : 0, opacity: showBenefits ? 1 : 0 }}
          transition={{ duration: 0.2 }}
          className="overflow-hidden"
        >
          <ul className="space-y-2 pt-3">
            {feature.benefits.map((benefit, index) => (
              <BenefitItem key={index} benefit={benefit} />
            ))}
          </ul>
        </motion.div>
      </div>
    </div>
  );
};

const DesktopFeatureTab = ({ feature }: FeatureTabProps) => (
  <div className="hidden lg:grid grid-cols-2 gap-12 items-center">
    <div>
      <FeatureContent feature={feature} />
    </div>
    <div>
      <FeatureImage feature={feature} />
    </div>
  </div>
);

const FeatureCard = ({ feature, isActive, onSelect, index }: { 
  feature: Feature, 
  isActive: boolean, 
  onSelect: () => void,
  index: number 
}) => (
  <motion.div
    custom={index}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, margin: "-50px" }}
    variants={{
      hidden: { opacity: 0, y: 20 },
      visible: {
        opacity: 1,
        y: 0,
        transition: { delay: index * 0.1, duration: 0.4 }
      }
    }}
  >
    <button
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect();
        }
      }}
      className={cn(
        "w-full py-2.5 sm:py-3 px-2 sm:px-3 rounded-xl border-2",
        "min-h-[72px] sm:min-h-[80px]",
        "transition-all duration-200 ease-out",
        "focus:outline-none focus:ring-2 focus:ring-[#06A28B] focus:ring-offset-2",
        "active:scale-95 hover:shadow-md",
        isActive 
          ? "border-[#06A28B] bg-[#06A28B]/10 text-[#06A28B] shadow-md" 
          : "border-gray-200 hover:bg-gray-50"
      )}
      aria-label={`View ${feature.title} details`}
      aria-selected={isActive}
      role="tab"
    >
      <div className="flex flex-col items-center justify-center h-full gap-1.5 sm:gap-2">
        <span className={cn(
          "p-1.5 rounded-lg",
          isActive ? "bg-white/90" : "bg-white"
        )}>
          {feature.icon}
        </span>
        <span className="text-xs sm:text-sm font-semibold text-center line-clamp-2">
          {feature.title}
        </span>
      </div>
    </button>
  </motion.div>
);

const About = () => {
  const [activeFeature, setActiveFeature] = useState("course-builder");
  const [swipeIndex, setSwipeIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleFeatureChange = (value: string) => {
    setActiveFeature(value);
    const index = features.findIndex(f => f.id === value);
    setSwipeIndex(index);
  };

  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;
    const scrollLeft = containerRef.current.scrollLeft;
    const cardWidth = containerRef.current.offsetWidth;
    const newIndex = Math.round(scrollLeft / cardWidth);
    if (newIndex !== swipeIndex) {
      setSwipeIndex(newIndex);
      setActiveFeature(features[newIndex].id);
    }
  }, [swipeIndex]);

  return (
    <section className="py-8 sm:py-12 md:py-16 bg-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-6"
        >
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            <span className="block">Powerful Features</span>
            <span className="text-[#06A28B] block">Without the Complexity</span>
          </h2>
          <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto">
            Everything you need to create, sell, and deliver your courses.
          </p>
        </motion.div>

        {/* Mobile Swipeable Cards */}
        <div className="lg:hidden relative">
          <div 
            ref={containerRef}
            className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar -mx-4 px-4"
            onScroll={handleScroll}
          >
            {features.map((feature, index) => (
              <div 
                key={feature.id}
                className="flex-none w-full snap-center pr-4 last:pr-0"
              >
                <MobileFeatureCard 
                  feature={feature}
                  isActive={index === swipeIndex}
                />
              </div>
            ))}
          </div>
          
          {/* Pagination Dots */}
          <div className="flex justify-center mt-4 gap-2">
            {features.map((feature, index) => (
              <button
                key={feature.id}
                onClick={() => {
                  if (containerRef.current) {
                    containerRef.current.scrollTo({
                      left: index * containerRef.current.offsetWidth,
                      behavior: 'smooth'
                    });
                  }
                }}
                className={cn(
                  "w-2 h-2 rounded-full transition-all",
                  index === swipeIndex
                    ? "bg-[#06A28B] w-4"
                    : "bg-gray-300"
                )}
                aria-label={`Go to ${feature.title}`}
              />
            ))}
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden lg:block max-w-7xl mx-auto">
          <nav 
            className="grid grid-cols-5 gap-3 mb-10"
            role="tablist"
          >
            {features.map((feature, index) => (
              <FeatureCard
                key={feature.id}
                feature={feature}
                isActive={activeFeature === feature.id}
                onSelect={() => handleFeatureChange(feature.id)}
                index={index}
              />
            ))}
          </nav>
          
          <div className="relative min-h-[400px]">
            {features.map((feature) => (
              <motion.div
                key={feature.id}
                initial={{ opacity: 0 }}
                animate={{ 
                  opacity: activeFeature === feature.id ? 1 : 0,
                  position: activeFeature === feature.id ? 'relative' : 'absolute',
                  zIndex: activeFeature === feature.id ? 1 : 0,
                  pointerEvents: activeFeature === feature.id ? 'auto' : 'none'
                }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0"
                role="tabpanel"
                aria-labelledby={`tab-${feature.id}`}
                hidden={activeFeature !== feature.id}
              >
                <DesktopFeatureTab feature={feature} />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;