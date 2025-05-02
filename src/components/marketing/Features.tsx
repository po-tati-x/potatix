"use client";

import { useRef, useState, useCallback, memo } from "react";
import { motion } from "framer-motion";
import { DollarSign, Lock, BarChart, Database, Clock, Globe, Palette, Check } from "lucide-react";

type ValueCardProps = {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  highlight?: string;
};

const VALUE_CARDS: ValueCardProps[] = [
  {
    title: "Pay Only When You Sell",
    description: "No monthly fees. No setup costs. Just a simple 10% cut when you actually make money. $0 until your first sale.",
    icon: <DollarSign className="h-5 w-5" />,
    color: "from-emerald-500 to-emerald-600",
    highlight: "10% revenue share",
  },
  {
    title: "Your Own Domain",
    description: "Use your own custom domain or get a free [name].potatix.com subdomain. Complete brand control from day one.",
    icon: <Globe className="h-5 w-5" />,
    color: "from-indigo-500 to-indigo-600",
    highlight: "Free subdomain",
  },
  {
    title: "Custom Landing Pages",
    description: "Use your own landing page design to sell courses. Connect any website to our payment and delivery engine.",
    icon: <Palette className="h-5 w-5" />,
    color: "from-fuchsia-500 to-fuchsia-600",
    highlight: "Your design, our engine",
  },
  {
    title: "Own Your Data",
    description: "Your course content, your student emails, your analytics - all exportable. Never get locked in like other platforms.",
    icon: <Database className="h-5 w-5" />,
    color: "from-blue-500 to-blue-600",
    highlight: "Full data portability",
  },
  {
    title: "Dev-First Experience",
    description: "Built by developers for developers. No marketing BS. Just the tools you need to share technical knowledge effectively.",
    icon: <Clock className="h-5 w-5" />,
    color: "from-purple-500 to-purple-600",
    highlight: "Made for teaching code",
  },
  {
    title: "Setup in Minutes",
    description: "No complex onboarding. Upload videos, set price, get payment link. Start selling in under 10 minutes.",
    icon: <Clock className="h-5 w-5" />,
    color: "from-amber-500 to-amber-600",
    highlight: "<10 min setup",
  },
  {
    title: "Real Analytics",
    description: "Conversion data, student engagement, revenue tracking. The metrics you actually care about, not vanity stats.",
    icon: <BarChart className="h-5 w-5" />,
    color: "from-emerald-500 to-emerald-600",
    highlight: "Data-driven insights",
  },
  {
    title: "Zero Lock-in",
    description: "Cancel anytime, export everything. We succeed only if we keep providing actual value to you.",
    icon: <Lock className="h-5 w-5" />,
    color: "from-red-500 to-red-600",
    highlight: "No commitments",
  },
];

const Card = memo(({ card, isActive }: { card: ValueCardProps; isActive: boolean }) => (
  <motion.div 
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    className={`relative bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 h-full group ${
      isActive 
        ? "shadow-md ring-1 ring-emerald-500" 
        : "hover:border-emerald-100 dark:hover:border-emerald-900"
    }`}
  >
    <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-white dark:from-gray-800 dark:to-gray-850 pointer-events-none" />
    <div className="absolute h-1 top-0 left-0 right-0 bg-gradient-to-r bg-gradient-to-br" style={{
      backgroundImage: `linear-gradient(to right, var(--tw-gradient-stops))`,
      '--tw-gradient-from': card.color.split(' ')[0].replace('from-', ''),
      '--tw-gradient-to': card.color.split(' ')[1].replace('to-', '')
    }} />
    
    <div className="p-5 relative z-10">
      <div className="flex justify-between items-start mb-4">
        <div className={`bg-gradient-to-br ${card.color} p-2.5 rounded-lg shadow-sm text-white`}>
          {card.icon}
        </div>
        {card.highlight && (
          <div className="inline-flex items-center bg-slate-100 dark:bg-gray-700 px-2.5 py-1 rounded-full text-xs font-medium">
            <Check className="h-3 w-3 mr-1 text-emerald-500" />
            <span className="text-gray-700 dark:text-gray-300">{card.highlight}</span>
          </div>
        )}
      </div>
      
      <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
        {card.title}
      </h3>
      
      <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
        {card.description}
      </p>
    </div>
  </motion.div>
));
Card.displayName = 'Card';

const PaginationDot = memo(({ index, isActive, onClick }: { index: number; isActive: boolean; onClick: () => void }) => (
  <button
    onClick={onClick}
    className={`relative transition-all duration-200 h-2 rounded-full ${
      isActive ? "w-8 bg-emerald-500" : "w-2 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400"
    }`}
    aria-label={`Go to slide ${index + 1}`}
  >
    {isActive && (
      <motion.div 
        layoutId="activeDot"
        className="absolute inset-0 bg-emerald-500 rounded-full"
      />
    )}
  </button>
));
PaginationDot.displayName = 'PaginationDot';

const MobileCardSwiper = memo(({ cards, activeIndex, setActiveIndex }: { 
  cards: ValueCardProps[]; 
  activeIndex: number; 
  setActiveIndex: (index: number) => void;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;
    const scrollLeft = containerRef.current.scrollLeft;
    const cardWidth = containerRef.current.offsetWidth;
    const newIndex = Math.round(scrollLeft / cardWidth);
    if (newIndex !== activeIndex) {
      setActiveIndex(newIndex);
    }
  }, [activeIndex, setActiveIndex]);

  return (
    <div className="lg:hidden relative">
      <div 
        ref={containerRef}
        className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar -mx-4 px-4"
        onScroll={handleScroll}
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {cards.map((card, index) => (
          <div 
            key={index}
            className="flex-none w-full snap-center pr-4 last:pr-0"
          >
            <Card card={card} isActive={index === activeIndex} />
          </div>
        ))}
      </div>
      
      <div className="flex justify-center mt-6 gap-2">
        {cards.map((_, index) => (
          <PaginationDot
            key={index}
            index={index}
            isActive={index === activeIndex}
            onClick={() => {
              if (containerRef.current) {
                containerRef.current.scrollTo({
                  left: index * containerRef.current.offsetWidth,
                  behavior: 'smooth'
                });
              }
            }}
          />
        ))}
      </div>
    </div>
  );
});
MobileCardSwiper.displayName = 'MobileCardSwiper';

const DesktopCardGrid = memo(({ cards }: { cards: ValueCardProps[] }) => (
  <div className="hidden lg:grid grid-cols-4 gap-5">
    {cards.map((card, index) => (
      <motion.div
        key={index}
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
        <Card card={card} isActive={false} />
      </motion.div>
    ))}
  </div>
));
DesktopCardGrid.displayName = 'DesktopCardGrid';

const Features = () => {
  const [swipeIndex, setSwipeIndex] = useState(0);

  return (
    <section 
      id="features" 
      className="py-16 sm:py-20 lg:py-24 relative overflow-hidden bg-gradient-to-b from-white to-slate-50 dark:from-gray-900 dark:to-gray-800"
      aria-label="Feature highlights"
    >
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#0EA57720_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,black,transparent)]" />
      
      <div className="relative mx-auto px-6 sm:px-8 lg:px-10 max-w-5xl">
        <div className="flex items-center gap-2 mb-2">
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-1.5 rounded-md shadow-sm">
            <BarChart className="h-4 w-4 text-white" aria-hidden="true" />
          </div>
          <span className="text-sm font-medium text-emerald-600 uppercase tracking-wider">Features</span>
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="mb-10 sm:mb-12 lg:mb-16 relative z-10"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3 leading-tight tracking-tight">
            Everything you need to <span className="text-emerald-600 dark:text-emerald-400">sell courses</span>
          </h2>
          <p className="text-sm md:text-base text-gray-600 dark:text-gray-300 max-w-2xl leading-relaxed">
            Potatix is built with a single goal: help you monetize your expertise without the typical platform BS.
          </p>
        </motion.div>

        <MobileCardSwiper 
          cards={VALUE_CARDS} 
          activeIndex={swipeIndex} 
          setActiveIndex={setSwipeIndex} 
        />
        <DesktopCardGrid cards={VALUE_CARDS} />
      </div>
    </section>
  );
};

export default Features; 