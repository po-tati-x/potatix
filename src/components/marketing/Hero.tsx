"use client";

import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, Check, Code, DollarSign, Users, Sparkles } from "lucide-react";

type StatProps = {
  icon: React.ReactNode;
  value: string;
  label: string;
};

type BenefitProps = {
  text: string;
};

const Stat = ({ icon, value, label }: StatProps) => (
  <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-lg p-2.5 sm:p-3 border border-gray-100 dark:border-gray-700">
    <div className="flex items-center mb-1 text-[#06A28B]">{icon}</div>
    <div className="font-bold text-gray-900 dark:text-white text-xs sm:text-sm md:text-base">{value}</div>
    <div className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 line-clamp-2">{label}</div>
  </div>
);

const Benefit = ({ text }: BenefitProps) => (
  <li className="flex items-start text-xs sm:text-sm md:text-base text-gray-700 dark:text-gray-300">
    <span className="flex-shrink-0 w-4 sm:w-5 h-4 sm:h-5 bg-[#06A28B]/10 dark:bg-[#06A28B]/20 rounded-full flex items-center justify-center mr-2 mt-0.5">
      <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#06A28B]" />
    </span>
    <span className="leading-tight">{text}</span>
  </li>
);

const CourseCard = ({ icon, color, title, price, students, revenue }: any) => (
  <div className="flex items-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
    <div className={`w-8 h-8 bg-${color}-100 dark:bg-${color}-900/30 rounded flex items-center justify-center text-${color}-600 dark:text-${color}-400`}>
      {icon}
    </div>
    <div className="ml-2 flex-1 min-w-0">
      <div className="font-medium text-xs text-gray-900 dark:text-white truncate">{title}</div>
      <div className="text-[10px] text-gray-500 dark:text-gray-400">${price} • {students} students</div>
    </div>
    <div className="text-xs font-semibold text-[#06A28B] ml-2">${revenue}</div>
  </div>
);

const DashboardMockup = () => (
  <div className="hidden md:flex justify-center relative">
    <div className="relative w-full max-w-md aspect-[4/3]">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-4 -right-4 w-full h-full bg-gradient-to-br from-[#06A28B]/20 to-[#06A28B]/5 rounded-xl transform rotate-2 dark:from-[#06A28B]/10 dark:to-transparent" style={{ maxWidth: 'calc(100% + 2rem)' }} />
        <div className="absolute -bottom-4 -left-4 w-full h-full border-2 border-[#06A28B]/30 rounded-xl transform -rotate-2" style={{ maxWidth: 'calc(100% + 2rem)' }} />
      </div>
      
      <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden">
        <div className="bg-gray-100 dark:bg-gray-700 px-3 py-2 flex items-center gap-1.5 border-b border-gray-200 dark:border-gray-600">
          <div className="flex items-center space-x-1">
            <div className="w-2.5 h-2.5 bg-red-500 rounded-full"></div>
            <div className="w-2.5 h-2.5 bg-yellow-500 rounded-full"></div>
            <div className="w-2.5 h-2.5 bg-green-500 rounded-full"></div>
          </div>
          <div className="ml-3 flex-1">
            <div className="bg-white dark:bg-gray-600 h-5 w-full max-w-[200px] mx-auto rounded-full flex items-center justify-center text-[10px] text-gray-500 dark:text-gray-300 px-2">
              app.potatix.com/dashboard
            </div>
          </div>
        </div>
        
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="w-7 h-7 bg-[#06A28B] rounded-md flex items-center justify-center text-white font-bold text-xs">
                <Code className="w-3.5 h-3.5" />
              </div>
              <div className="ml-2 font-semibold text-gray-900 dark:text-white text-sm">Dev Dashboard</div>
            </div>
            <div className="w-7 h-7 bg-gray-100 dark:bg-gray-700 rounded-full"></div>
          </div>
          
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold text-gray-900 dark:text-white text-xs">Last 30 Days</h3>
              <div className="text-[10px] text-[#06A28B]">+18% from last month</div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-gray-50 dark:bg-gray-700/50 p-2 rounded-lg">
                <div className="text-[10px] text-gray-500 dark:text-gray-400">Revenue</div>
                <div className="text-sm font-bold text-gray-900 dark:text-white">$3,842</div>
                <div className="text-[10px] text-green-600 dark:text-green-400">+24.5%</div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 p-2 rounded-lg">
                <div className="text-[10px] text-gray-500 dark:text-gray-400">Students</div>
                <div className="text-sm font-bold text-gray-900 dark:text-white">56</div>
                <div className="text-[10px] text-green-600 dark:text-green-400">+12.3%</div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 p-2 rounded-lg">
                <div className="text-[10px] text-gray-500 dark:text-gray-400">Conversion</div>
                <div className="text-sm font-bold text-gray-900 dark:text-white">9.1%</div>
                <div className="text-[10px] text-green-600 dark:text-green-400">+2.1%</div>
              </div>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold text-gray-900 dark:text-white text-xs">My Courses</h3>
              <div className="p-1 bg-[#06A28B] rounded text-white text-[10px] font-medium">+ New</div>
            </div>
            <div className="space-y-2">
              <CourseCard 
                icon={<Code className="w-4 h-4" />}
                color="blue"
                title="Advanced TypeScript"
                price={79}
                students={37}
                revenue="2,923"
              />
              <CourseCard 
                icon={
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 4.75V19.25M18.25 10L5.75 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                  </svg>
                }
                color="purple"
                title="React Performance"
                price={49}
                students={19}
                revenue="931"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const Hero = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  const benefits = [
    "No monthly fees - we only make money when you do",
    "Built for devs, by devs - no marketing BS",
    "10-minute setup to your first sale",
  ];

  const stats = [
    { label: "Avg Revenue Per Dev", value: "$2,400", icon: <DollarSign className="w-4 h-4" /> },
    { label: "Technical Setup Time", value: "< 10 min", icon: <Code className="w-4 h-4" /> },
    { label: "Platform Fee", value: "Just 10%", icon: <Users className="w-4 h-4" /> },
  ];

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, ease: "easeOut" }
  };

  return (
    <section 
      ref={containerRef}
      id="hero"
      aria-label="Hero section"
      className="relative pt-24 md:pt-30 lg:pt-36 pb-12 md:pb-16 lg:min-h-[85vh] bg-white overflow-x-hidden"
    >
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-4 -right-4 w-60 md:w-80 h-60 md:h-80 bg-[#06A28B]/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-40 md:w-60 h-40 md:h-60 bg-[#06A28B]/10 rounded-full blur-3xl" />
      </div>

      <div className="relative mx-auto w-full max-w-5xl px-6 sm:px-8 lg:px-10">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <motion.div {...fadeIn} className="text-left w-full max-w-lg mx-auto lg:mx-0">
            <div className="inline-flex items-center mb-3 px-2.5 py-1 bg-[#06A28B]/10 text-[#06A28B] dark:bg-[#06A28B]/20 rounded-full text-xs font-medium">
              <Code className="w-3.5 h-3.5 mr-1.5" /> For Software Developers Only
            </div>
            
            <motion.h1 
              className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white leading-tight mb-3 sm:mb-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <span className="block">Sell dev courses.</span> 
              <span className="text-[#06A28B]">Without the BS.</span>
            </motion.h1>
            
            <motion.p 
              className="text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-300 mb-5 sm:mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Potatix is a dead-simple platform built specifically for developers who want to monetize their expertise. No subscriptions. No lock-in. Just upload, price, and sell.
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.25 }}
              className="mb-5 sm:mb-6 w-full"
            >
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {stats.map((stat, index) => (
                  <Stat key={index} {...stat} />
                ))}
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mb-5 sm:mb-6"
            >
              <ul className="space-y-2">
                {benefits.map((benefit, index) => (
                  <Benefit key={index} text={benefit} />
                ))}
              </ul>
            </motion.div>
            
            <motion.div 
              className="grid grid-cols-2 sm:flex sm:flex-row gap-2 sm:gap-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Link href="/waitlist" className="col-span-1">
                <button 
                  className="w-full px-4 sm:px-5 py-2 sm:py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md font-medium flex items-center justify-center transition-all shadow-sm hover:shadow-md text-xs sm:text-sm"
                  aria-label="Join the waitlist"
                >
                  Join Waitlist
                  <Sparkles className="ml-1.5 sm:ml-2 h-3.5 w-3.5" />
                </button>
              </Link>
              <Link href="#features" className="col-span-1">
                <button 
                  className="w-full px-4 sm:px-5 py-2 sm:py-2.5 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md font-medium transition-colors text-xs sm:text-sm"
                  aria-label="See features"
                >
                  See Features
                </button>
              </Link>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <DashboardMockup />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero; 