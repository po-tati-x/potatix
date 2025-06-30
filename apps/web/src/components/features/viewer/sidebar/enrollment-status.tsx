"use client";

import { useState } from "react";
import { Button } from "@/components/ui/new-button";
import { X } from "lucide-react";
import { toast } from "sonner";
import { useCourseContext } from "@/lib/client/context/course-context";
import { memo } from "react";

interface EnrollmentStatusProps {
  coursePrice?: number;
  courseProgress?: number;
  onEnroll?: () => Promise<void>;
}

function EnrollmentStatus({
  coursePrice = 0,
  courseProgress = 0,
  onEnroll,
}: EnrollmentStatusProps) {
  const [loading, setIsLoading] = useState(false);
  
  // Get enrollment state from context
  const {
    isEnrolled,
    enrollmentStatus,
    isEnrolling,
    isAuthenticated,
    enroll: contextEnroll
  } = useCourseContext();
  
  // Use either passed onEnroll or context enroll function
  const handleEnrollment = onEnroll || contextEnroll;

  // Handle enrollment or auth redirect
  const handleEnroll = async () => {
    if (isEnrolling || !handleEnrollment) return;

    // If user is not authenticated, just trigger parent handler (opens auth modal)
    if (!isAuthenticated) {
      await handleEnrollment();
      return;
    }

    // Authenticated – show loading indicator while actual enrollment happens
    setIsLoading(true);
    try {
      await handleEnrollment();
    } catch (error) {
      console.error("[Enrollment] failed:", error);
      toast.error("Failed to enroll. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Loading state
  if (loading) {
    return renderLoading();
  }

  // Pending enrollment state
  if (isEnrolled && enrollmentStatus === "pending") {
    return renderPendingEnrollment();
  }

  // Rejected enrollment state
  if (isEnrolled && enrollmentStatus === "rejected") {
    return renderRejectedEnrollment();
  }

  // Active enrollment state (with progress)
  if (isEnrolled && enrollmentStatus === "active") {
    return renderActiveEnrollment();
  }

  // Not enrolled state
  return renderNotEnrolled();

  // Status component renderers
  function renderLoading() {
    return (
      <div className="px-4 py-3 border-b border-slate-200">
        <div className="flex items-center justify-center py-2">
          <div className="h-4 w-4 border-2 border-slate-300 border-t-emerald-500 rounded-full animate-spin" />
          <span className="ml-2 text-xs text-slate-500">
            Checking status...
          </span>
        </div>
      </div>
    );
  }

  function renderPendingEnrollment() {
    return (
      <div className="px-4 py-3 border-b border-slate-200">
        <div className="text-center py-2">
          <div className="bg-amber-50 border border-amber-100 rounded-md p-2 mb-2">
            <p className="text-xs text-amber-800">
              Your enrollment is pending approval from the instructor
            </p>
          </div>
        </div>
      </div>
    );
  }

  function renderRejectedEnrollment() {
    return (
      <div className="px-4 py-3 border-b border-slate-200">
        <div className="text-center py-2">
          <div className="bg-red-50 border border-red-100 rounded-md p-2">
            <div className="flex items-center justify-center mb-1">
              <X className="h-3.5 w-3.5 text-red-500 mr-1" />
              <p className="text-xs font-medium text-red-800">
                Enrollment Rejected
              </p>
            </div>
            <p className="text-xs text-red-700">
              Your enrollment request was not approved. Please contact the
              instructor for more information.
            </p>
          </div>
        </div>
      </div>
    );
  }

  function renderActiveEnrollment() {
    return (
      <div className="px-4 py-3 border-b border-slate-200">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-medium text-slate-700">
            Your progress
          </span>
          <span className="text-xs text-slate-500">
            {courseProgress}% complete
          </span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-1.5">
          <div
            className="bg-emerald-500 h-1.5 rounded-full"
            style={{ width: `${courseProgress}%` }}
          />
        </div>
      </div>
    );
  }

  function renderNotEnrolled() {
    // Determine appropriate button text based on authentication and price
    const buttonText = isEnrolling
      ? "Enrolling..."
      : isAuthenticated
        ? coursePrice > 0
          ? "Request Enrollment"
          : "Enroll Now (Free)"
        : "Sign in to continue";

    // Determine description text based on authentication status and course price
    const descriptionText = isAuthenticated
      ? coursePrice > 0
        ? `Enrollment requires approval (${coursePrice > 0 ? `${coursePrice}$` : "Free"})`
        : "You need to enroll to access this course"
      : "Sign in to access this course";

    return (
      <div className="px-4 py-3 border-b border-slate-200">
        <div className="text-center">
          <p className="text-xs text-slate-700 mb-2">{descriptionText}</p>
          <Button
            type="primary"
            size="small"
            className="w-full justify-center"
            onClick={handleEnroll}
            disabled={isEnrolling}
          >
            {buttonText}
          </Button>
        </div>
      </div>
    );
  }
}

// Export memoized component
export default memo(EnrollmentStatus);
