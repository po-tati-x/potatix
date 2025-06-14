"use client";

import Link from "next/link";
import { BookOpen, Gift, Users, Sparkles, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/new-button";
import { useEffect, useState, useRef } from "react";
import { useSession } from "@/lib/auth/auth";
import { Skeleton } from "@/components/ui/skeleton";

// Proper TypeScript interfaces
interface StatProps {
  icon: React.ReactNode;
  value: string;
  label: string;
}

// Extracted standalone components
const Stat = ({ icon, value, label }: StatProps) => (
  <div className="bg-white/50 backdrop-blur-sm rounded-md p-2.5 sm:p-3 border border-slate-100">
    <div className="flex items-center mb-1 text-emerald-600">{icon}</div>
    <div className="font-bold text-slate-900 text-xs sm:text-sm md:text-base">
      {value}
    </div>
    <div className="text-[10px] sm:text-xs text-slate-500 line-clamp-2">
      {label}
    </div>
  </div>
);

const DemoVideo = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Ensure video plays when it's loaded
    if (videoRef.current) {
      videoRef.current.play().catch((error) => {
        console.error("Video autoplay failed:", error);
      });
    }
  }, []);

  const handleVideoLoaded = () => {
    setIsLoading(false);
  };

  return (
    <div className="hidden md:block relative">
      <div className="relative w-full max-w-md aspect-video mx-auto">
        <div className="relative rounded-md overflow-hidden border border-slate-200 shadow-lg">
          {isLoading && (
            <div className="absolute inset-0 z-10">
              <Skeleton className="w-full h-full bg-slate-200/70">
                <div className="h-full w-full flex items-center justify-center">
                  <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                </div>
              </Skeleton>
            </div>
          )}
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            autoPlay
            loop
            muted
            playsInline
            disablePictureInPicture
            disableRemotePlayback
            onLoadedData={handleVideoLoaded}
            src="https://storage.potatix.com/potatix/demo.mp4"
          />
        </div>
      </div>
    </div>
  );
};

export default function Hero() {
  const { data: session } = useSession();
  const isLoggedIn = !!session;

  const stats = [
    {
      label: "Avg Revenue Per Course",
      value: "$2,400",
      icon: <Gift className="w-4 h-4" />,
    },
    {
      label: "Setup Time",
      value: "< 10 min",
      icon: <BookOpen className="w-4 h-4" />,
    },
    { label: "Platform Fee", value: "$0", icon: <Users className="w-4 h-4" /> },
  ];

  return (
    <section
      id="hero"
      aria-label="Hero section"
      className="relative pt-24 md:pt-30 lg:pt-36 pb-6 md:pb-8 lg:min-h-[80vh] overflow-x-hidden"
    >
      <div className="relative mx-auto w-full max-w-5xl px-6 sm:px-8 lg:px-10">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <div className="text-left w-full max-w-lg mx-auto lg:mx-0 animate-fade-in-up">
            <div className="inline-flex items-center mb-3 px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">
              <BookOpen className="w-3.5 h-3.5 mr-1.5" /> For Course Creators
            </div>

            <h1 className="font-roboto text-xl sm:text-2xl md:text-3xl lg:text-4xl text-slate-900 leading-tight mb-3 sm:mb-4">
              <span className="block">Sell online courses.</span>
              <span className="text-emerald-600">Without the BS.</span>
            </h1>

            <p className="text-xs sm:text-sm md:text-base text-slate-600 mb-5 sm:mb-6">
              Potatix is a dead-simple platform built specifically for creators
              who want to monetize their expertise. No subscriptions. No fees.
              Just upload, price, and sell.
            </p>

            <div className="mb-5 sm:mb-6 w-full">
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {stats.map((stat, index) => (
                  <Stat key={index} {...stat} />
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:flex sm:flex-row gap-2 sm:gap-4">
              {isLoggedIn ? (
                <Link href="/dashboard" className="col-span-1">
                  <Button
                    type="primary"
                    size="small"
                    iconLeft={<LayoutDashboard className="h-3.5 w-3.5" />}
                    className="w-full"
                    aria-label="Go to your dashboard"
                  >
                    Dashboard
                  </Button>
                </Link>
              ) : (
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
              )}
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
            <DemoVideo />
          </div>
        </div>
      </div>
    </section>
  );
}
