"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { FeatureProps } from "./features";

interface Props {
  features: FeatureProps[];
}

export default function MobileFeatureCarousel({ features }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const touchStartX = useRef<number | undefined>(undefined);

  function handleTouchStart(e: React.TouchEvent<HTMLDivElement>) {
    const touch = e.touches[0];
    if (!touch) return;
    touchStartX.current = touch.clientX;
  }

  function handleTouchEnd(e: React.TouchEvent<HTMLDivElement>) {
    const startX = touchStartX.current;
    if (startX === undefined) return;
    const touch = e.changedTouches[0];
    if (!touch) return;
    const deltaX = touch.clientX - startX;

    const swipeThreshold = 40;
    if (Math.abs(deltaX) > swipeThreshold) {
      if (deltaX < 0 && currentIndex < features.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else if (deltaX > 0 && currentIndex > 0) {
        setCurrentIndex(currentIndex - 1);
      }
    }

    touchStartX.current = undefined;
  }

  return (
    <div className="lg:hidden select-none">
      <div
        className="relative overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
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
            onClick={() => setCurrentIndex(index)}
            className={`h-1.5 rounded-full transition-all ${
              currentIndex === index
                ? "w-6 bg-emerald-600"
                : "w-1.5 bg-slate-300 hover:bg-slate-400"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

function FeatureCard({ feature }: { feature: FeatureProps }) {
  return (
    <div className="group relative flex h-full flex-col overflow-hidden rounded-md border border-slate-200 bg-white transition-all duration-200 hover:border-emerald-500">
      <div
        className={`absolute inset-x-0 top-0 h-1 w-full ${feature.accentColor} transition-all duration-300 group-hover:h-1.5`}
      />

      {feature.imagePath && (
        <div className="relative w-full h-36">
          <Image
            src={feature.imagePath}
            alt={feature.title}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw"
          />
        </div>
      )}

      <div className="p-5 flex flex-col flex-1">
        <div className="mb-4 flex items-center justify-between">
          <div
            className={`rounded p-2 ${feature.accentColor} text-white transition-transform duration-300 group-hover:scale-110`}
          >
            {feature.icon}
          </div>

          {feature.badge && (
            <span className="text-xs font-medium text-slate-600">
              {feature.badge}
            </span>
          )}
        </div>

        <h3 className="mb-2 text-lg font-semibold text-slate-900 transition-colors group-hover:text-emerald-600">
          {feature.title}
        </h3>

        <p className="text-base leading-relaxed text-slate-600">
          {feature.description}
        </p>
      </div>
    </div>
  );
} 