"use client";

import Link from "next/link";
import { Check, BookOpen, Gift, Users, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/potatix/Button";

// Proper TypeScript interfaces
interface StatProps {
  icon: React.ReactNode;
  value: string;
  label: string;
}

interface BenefitProps {
  text: string;
}

interface CourseCardProps {
  icon: React.ReactNode;
  title: string;
  price: number;
  students: number;
  revenue: string;
  colorClass: string;
}

// Extracted standalone components
const Stat = ({ icon, value, label }: StatProps) => (
  <div className="bg-white/50 backdrop-blur-sm rounded-md p-2.5 sm:p-3 border border-slate-100">
    <div className="flex items-center mb-1 text-emerald-600">{icon}</div>
    <div className="font-bold text-slate-900 text-xs sm:text-sm md:text-base">{value}</div>
    <div className="text-[10px] sm:text-xs text-slate-500 line-clamp-2">{label}</div>
  </div>
);

const Benefit = ({ text }: BenefitProps) => (
  <li className="flex items-start text-xs sm:text-sm md:text-base text-slate-700">
    <span className="flex-shrink-0 w-4 sm:w-5 h-4 sm:h-5 bg-emerald-100 rounded-full flex items-center justify-center mr-2 mt-0.5">
      <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-emerald-600" />
    </span>
    <span className="leading-tight">{text}</span>
  </li>
);

const CourseCard = ({ icon, title, price, students, revenue, colorClass }: CourseCardProps) => (
  <div className="flex items-center p-2 bg-slate-50 rounded-md">
    <div className={`w-8 h-8 ${colorClass} rounded flex items-center justify-center`}>
      {icon}
    </div>
    <div className="ml-2 flex-1 min-w-0">
      <div className="font-medium text-xs text-slate-900 truncate">{title}</div>
      <div className="text-[10px] text-slate-500">${price} • {students} students</div>
    </div>
    <div className="text-xs font-semibold text-emerald-600 ml-2">${revenue}</div>
  </div>
);

const DashboardMockup = () => (
  <div className="hidden md:flex justify-center relative">
    <div className="relative w-full max-w-md aspect-[4/3]">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-4 -right-4 w-full h-full bg-gradient-to-br from-emerald-100 to-emerald-50 rounded-md transform rotate-2" style={{ maxWidth: 'calc(100% + 2rem)' }} />
        <div className="absolute -bottom-4 -left-4 w-full h-full border-2 border-emerald-200 rounded-md transform -rotate-2" style={{ maxWidth: 'calc(100% + 2rem)' }} />
      </div>
      
      <div className="relative bg-white rounded-md border border-slate-200 overflow-hidden">
        <div className="bg-slate-50 px-3 py-2 flex items-center gap-1.5 border-b border-slate-200">
          <div className="flex items-center space-x-1">
            <div className="w-2.5 h-2.5 bg-red-500 rounded-full"></div>
            <div className="w-2.5 h-2.5 bg-yellow-500 rounded-full"></div>
            <div className="w-2.5 h-2.5 bg-green-500 rounded-full"></div>
          </div>
          <div className="ml-3 flex-1">
            <div className="bg-white h-5 w-full max-w-[200px] mx-auto rounded-full flex items-center justify-center text-[10px] text-slate-500 px-2">
              app.potatix.com/dashboard
            </div>
          </div>
        </div>
        
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="w-7 h-7 bg-emerald-600 rounded-md flex items-center justify-center text-white font-bold text-xs">
                <BookOpen className="w-3.5 h-3.5" />
              </div>
              <div className="ml-2 font-semibold text-slate-900 text-sm">Creator Dashboard</div>
            </div>
            <div className="w-7 h-7 bg-slate-100 rounded-full"></div>
          </div>
          
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold text-slate-900 text-xs">Last 30 Days</h3>
              <div className="text-[10px] text-emerald-600">+18% from last month</div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-slate-50 p-2 rounded-md">
                <div className="text-[10px] text-slate-500">Revenue</div>
                <div className="text-sm font-bold text-slate-900">$3,842</div>
                <div className="text-[10px] text-emerald-600">+24.5%</div>
              </div>
              <div className="bg-slate-50 p-2 rounded-md">
                <div className="text-[10px] text-slate-500">Students</div>
                <div className="text-sm font-bold text-slate-900">56</div>
                <div className="text-[10px] text-emerald-600">+12.3%</div>
              </div>
              <div className="bg-slate-50 p-2 rounded-md">
                <div className="text-[10px] text-slate-500">Conversion</div>
                <div className="text-sm font-bold text-slate-900">9.1%</div>
                <div className="text-[10px] text-emerald-600">+2.1%</div>
              </div>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold text-slate-900 text-xs">My Courses</h3>
              <div className="p-1 bg-emerald-600 rounded-md text-white text-[10px] font-medium">+ New</div>
            </div>
            <div className="space-y-2">
              <CourseCard 
                icon={<BookOpen className="w-4 h-4" />}
                colorClass="bg-blue-100 text-blue-600"
                title="Design Fundamentals"
                price={79}
                students={37}
                revenue="2,923"
              />
              <CourseCard 
                icon={<BookOpen className="w-4 h-4" />}
                colorClass="bg-purple-100 text-purple-600"
                title="Content Creation Mastery"
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

export default function Hero() {
  const benefits = [
    "Completely free platform - no revenue share, no fees",
    "Built for creators, by creators - no marketing BS",
    "10-minute setup to your first sale",
  ];

  const stats = [
    { label: "Avg Revenue Per Course", value: "$2,400", icon: <Gift className="w-4 h-4" /> },
    { label: "Setup Time", value: "< 10 min", icon: <BookOpen className="w-4 h-4" /> },
    { label: "Platform Fee", value: "$0", icon: <Users className="w-4 h-4" /> },
  ];

  return (
    <section 
      id="hero"
      aria-label="Hero section"
      className="relative pt-24 md:pt-30 lg:pt-36 pb-12 md:pb-16 lg:min-h-[85vh] overflow-x-hidden"
    >
      <div className="relative mx-auto w-full max-w-5xl px-6 sm:px-8 lg:px-10">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <div className="text-left w-full max-w-lg mx-auto lg:mx-0 animate-fade-in-up">
            <div className="inline-flex items-center mb-3 px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">
              <BookOpen className="w-3.5 h-3.5 mr-1.5" /> For Course Creators
            </div>
            
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-slate-900 leading-tight mb-3 sm:mb-4">
              <span className="block">Sell online courses.</span> 
              <span className="text-emerald-600">Without the BS.</span>
            </h1>
            
            <p className="text-xs sm:text-sm md:text-base text-slate-600 mb-5 sm:mb-6">
              Potatix is a dead-simple platform built specifically for creators who want to monetize their expertise. No subscriptions. No fees. Just upload, price, and sell.
            </p>

            <div className="mb-5 sm:mb-6 w-full">
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {stats.map((stat, index) => (
                  <Stat key={index} {...stat} />
                ))}
              </div>
            </div>
            
            <div className="mb-5 sm:mb-6">
              <ul className="space-y-2">
                {benefits.map((benefit, index) => (
                  <Benefit key={index} text={benefit} />
                ))}
              </ul>
            </div>
            
            <div className="grid grid-cols-2 sm:flex sm:flex-row gap-2 sm:gap-4">
              <Link href="/login" className="col-span-1">
                <Button 
                  type="primary"
                  size="small"
                  iconRight={<Sparkles className="h-3.5 w-3.5" />}
                  className="w-full"
                  aria-label="Login to your account"
                >
                  Login
                </Button>
              </Link>
              <Link href="#features" className="col-span-1">
                <Button 
                  type="outline"
                  size="small"
                  className="w-full"
                  aria-label="See features"
                >
                  See Features
                </Button>
              </Link>
            </div>
          </div>

          <div className="animate-fade-in">
            <DashboardMockup />
          </div>
        </div>
      </div>
    </section>
  );
} 