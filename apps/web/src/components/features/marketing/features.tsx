import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid";
import MobileFeatureCarousel from "./mobile-feature-carousel";
import Image from "next/image";
import {
  Gift,
  Lock,
  Database,
  Clock,
  Globe,
  Palette,
  BookOpen,
  Users,
} from "lucide-react";

export interface FeatureProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  accentColor: string;
  badge?: string;
  imagePath?: string;
}

const FEATURES: FeatureProps[] = [
  {
    title: "100% Free Forever",
    description:
      "No fees, no revenue share, no monthly costs. Completely free to use.",
    icon: <Gift className="h-4 w-4" />,
    accentColor: "bg-emerald-600",
    badge: "Free platform",
    imagePath: "https://storage.potatix.com/potatix/images/features/free.jpg",
  },
  {
    title: "Custom domain",
    description:
      "Use your own domain or get a free yourname.potatix.com subdomain.",
    icon: <Globe className="h-4 w-4" />,
    accentColor: "bg-indigo-500",
    badge: "Free SSL included",
    imagePath: "https://storage.potatix.com/potatix/images/features/domain.jpg",
  },
  {
    title: "Beautiful landing pages",
    description: "Design your own sales pages or use our templates.",
    icon: <Palette className="h-4 w-4" />,
    accentColor: "bg-violet-500",
    badge: "Full customization",
    imagePath:
      "https://storage.potatix.com/potatix/images/features/landing.jpg",
  },
  {
    title: "100% data ownership",
    description:
      "Your content, your students, your analytics. All exportable at any time.",
    icon: <Database className="h-4 w-4" />,
    accentColor: "bg-blue-500",
    badge: "No lock-in",
    imagePath:
      "https://storage.potatix.com/potatix/images/features/analytics.jpg",
  },
  {
    title: "Creator-friendly",
    description:
      "Built for creators by creators. Focus on content, not tech. No marketing fluff.",
    icon: <BookOpen className="h-4 w-4" />,
    accentColor: "bg-slate-800",
    badge: "Content focus",
    imagePath:
      "https://storage.potatix.com/potatix/images/features/creator.jpg",
  },
  {
    title: "10-minute setup",
    description:
      "Upload content, set price, grab payment link. Start selling immediately.",
    icon: <Clock className="h-4 w-4" />,
    accentColor: "bg-amber-500",
    badge: "Instant deployment",
    imagePath: "https://storage.potatix.com/potatix/images/features/easy.jpg",
  },
  {
    title: "Student engagement",
    description:
      "Track completion rates, Q&A, and feedback. Build community around your content.",
    icon: <Users className="h-4 w-4" />,
    accentColor: "bg-emerald-600",
    badge: "Community tools",
    imagePath:
      "https://storage.potatix.com/potatix/images/features/engagement.jpg",
  },
  {
    title: "Zero lock-in",
    description:
      "Cancel anytime, export everything. We don&apos;t trap you in our platform.",
    icon: <Lock className="h-4 w-4" />,
    accentColor: "bg-rose-500",
    badge: "Full portability",
    imagePath:
      "https://storage.potatix.com/potatix/images/features/zerolock.jpg",
  },
];

export default function Features() {
  return (
    <section id="features" className="relative py-12 md:py-16">
      <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="text-center md:text-left w-full max-w-xl mx-auto md:mx-0">
          <div className="inline-flex items-center mb-4 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">
            100% Free Platform
          </div>

          <h2 className="font-roboto mt-0 lg:mt-6 mb-5 text-3xl sm:text-3xl lg:text-4xl tracking-tight text-slate-900 leading-tight">
            Built for creators,{" "}
            <span className="text-emerald-600">by creators</span>
          </h2>

          <p className="mt-5 text-lg md:text-base text-slate-600 max-w-2xl mx-auto lg:mx-0">
            No marketing BS. No confusing pricing. Just the tools you need to
            monetize your expertise.
          </p>
        </div>

        <div className="mt-20 lg:mt-16">
          {/* Mobile features carousel */}
          <MobileFeatureCarousel features={FEATURES} />

          {/* Desktop feature grid - using BentoGrid */}
          <div className="hidden lg:block">
            <BentoGrid className="grid-cols-2 xl:grid-cols-4 gap-5">
              {FEATURES.map((feature, index) => (
                <BentoGridItem
                  key={index}
                  title={feature.title}
                  description={feature.description}
                  icon={
                    <div
                      className={`rounded p-2 ${feature.accentColor} text-white`}
                    >
                      {feature.icon}
                    </div>
                  }
                  image={
                    feature.imagePath && (
                      <div className="relative w-full h-36">
                        <Image
                          src={feature.imagePath}
                          alt={feature.title}
                          fill
                          className="object-cover transition-all duration-300 group-hover:scale-105"
                        />
                        {feature.badge && (
                          <div className="absolute top-2 right-2 px-2 py-1 bg-white/80 backdrop-blur-sm rounded text-xs font-medium text-slate-700 shadow-sm">
                            {feature.badge}
                          </div>
                        )}
                      </div>
                    )
                  }
                  className="border-slate-200 hover:border-emerald-400"
                />
              ))}
            </BentoGrid>
          </div>
        </div>
      </div>
    </section>
  );
}
