"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import WaitlistWidget from "./Waitlist";
import { cn } from "@/lib/utils";

interface FloatingWaitlistWidgetProps {
  scrollThreshold?: number;
  dismissible?: boolean;
  position?: "bottom-right" | "bottom-left" | "bottom-center";
  className?: string;
  showExtendedFields?: boolean;
}

export default function FloatingWaitlistWidget({
  scrollThreshold = 600,
  dismissible = true,
  position = "bottom-right",
  className,
  showExtendedFields = false
}: FloatingWaitlistWidgetProps) {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  
  // Check if widget has been dismissed in the past 24 hours
  useEffect(() => {
    const lastDismissed = localStorage.getItem("waitlistWidgetDismissed");
    if (lastDismissed) {
      const dismissedTime = parseInt(lastDismissed, 10);
      const twentyFourHoursAgo = Date.now() - (24 * 60 * 60 * 1000);
      
      if (dismissedTime > twentyFourHoursAgo) {
        setDismissed(true);
      } else {
        // Clear expired dismissal
        localStorage.removeItem("waitlistWidgetDismissed");
      }
    }
  }, []);
  
  // Handle scroll to show widget
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > scrollThreshold && !dismissed) {
        setVisible(true);
      }
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [scrollThreshold, dismissed]);
  
  // Handle dismiss
  const handleDismiss = () => {
    setVisible(false);
    setDismissed(true);
    localStorage.setItem("waitlistWidgetDismissed", Date.now().toString());
  };
  
  // Position classes
  const positionClasses = {
    "bottom-right": "bottom-4 right-4 sm:bottom-8 sm:right-8",
    "bottom-left": "bottom-4 left-4 sm:bottom-8 sm:left-8",
    "bottom-center": "bottom-4 left-1/2 -translate-x-1/2 sm:bottom-8"
  };
  
  return (
    <AnimatePresence>
      {visible && !dismissed && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.9 }}
          transition={{ duration: 0.3 }}
          className={cn(
            "fixed z-50 w-full max-w-sm shadow-lg",
            positionClasses[position],
            className
          )}
        >
          <div className="relative">
            {dismissible && (
              <button
                onClick={handleDismiss}
                className="absolute top-2 right-2 p-1 rounded-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 z-10 transition-colors"
                aria-label="Dismiss waitlist widget"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            
            <WaitlistWidget variant="card" showExtendedFields={showExtendedFields} />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 