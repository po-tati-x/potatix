"use client";

import { cn } from "@/lib/shared/utils/cn";
import React from "react";

interface BentoGridProps {
  className?: string;
  children?: React.ReactNode;
}

interface BentoGridItemProps {
  className?: string;
  title?: string | React.ReactNode;
  description?: string | React.ReactNode;
  header?: React.ReactNode;
  icon?: React.ReactNode;
  image?: React.ReactNode;
  variant?: "default" | "compact";
}

export const BentoGrid = ({
  className,
  children,
}: BentoGridProps) => {
  return (
    <div
      className={cn(
        "grid w-full auto-rows-[minmax(180px,auto)] grid-cols-1 gap-4 md:grid-cols-3",
        className,
      )}
    >
      {children}
    </div>
  );
};

export const BentoGridItem = ({
  className,
  title,
  description,
  header,
  icon,
  image,
  variant = "default",
}: BentoGridItemProps) => {
  return (
    <div
      className={cn(
        "group relative row-span-1 flex flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white transition-all duration-200 hover:shadow-lg dark:border-white/[0.2] dark:bg-black",
        className,
      )}
    >
      {/* Image or Header Content */}
      {image && (
        <div className="relative w-full overflow-hidden">
          {image}
        </div>
      )}
      
      {header && <div className="w-full">{header}</div>}
      
      {/* Text Content */}
      <div className={cn(
        "flex flex-col justify-between p-4",
        variant === "compact" ? "gap-2" : "gap-4",
      )}>
        <div>
          {icon && (
            <div className="mb-3 flex items-center">
              {icon}
            </div>
          )}
          
          {title && (
            <h3 className={cn(
              "font-medium text-neutral-700 dark:text-neutral-200",
              variant === "compact" ? "text-sm" : "text-base"
            )}>
              {title}
            </h3>
          )}
          
          {description && (
            <div className={cn(
              "mt-1 text-neutral-600 dark:text-neutral-300",
              variant === "compact" ? "text-xs" : "text-sm"
            )}>
              {description}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};