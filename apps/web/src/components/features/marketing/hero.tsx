import { BookOpen, Gift, Users } from "lucide-react";
import { HeroCTAButtons } from "./hero-cta-buttons";

// Proper TypeScript interfaces
interface StatProps {
  icon: React.ReactNode;
  value: string;
  label: string;
}

// Extracted standalone components
const Stat = ({ icon, value, label }: StatProps) => (
  <div className="bg-white/50 backdrop-blur-sm rounded-md p-2.5 sm:p-3 border border-slate-100 text-left">
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
  return (
    <div className="relative w-full">
      <div className="relative w-full max-w-md aspect-video mx-auto">
        <div className="relative rounded-md overflow-hidden border border-slate-200 shadow-lg">
          <video
            className="w-full h-full object-cover"
            autoPlay
            loop
            muted
            playsInline
            disablePictureInPicture
            disableRemotePlayback
            src="https://storage.potatix.com/potatix/demo.mp4"
          />
        </div>
      </div>
    </div>
  );
};

export default function Hero() {
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
          <div className="text-center lg:text-left w-full max-w-lg mx-auto lg:mx-0 animate-fade-in-up">
            <div className="inline-flex items-center mb-4 px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">
              <BookOpen className="w-3.5 h-3.5 mr-1.5" /> For Course Creators
            </div>

            <h1 className="font-roboto text-3xl lg:text-4xl text-slate-900 leading-tight mb-5">
              <span className="block">Sell online courses.</span>
              <span className="text-emerald-600">Without the BS.</span>
            </h1>

            <p className="text-lg md:text-base text-slate-600 mb-8">
              Potatix is a dead-simple platform built specifically for creators
              who want to monetize their expertise. No subscriptions. No fees.
              Just upload, price, and sell.
            </p>

            <div className="mb-6 w-full">
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {stats.map((stat, index) => (
                  <Stat key={index} {...stat} />
                ))}
              </div>
            </div>

            <HeroCTAButtons />
          </div>

          <div className="animate-fade-in">
            <DemoVideo />
          </div>
        </div>
      </div>
    </section>
  );
}
