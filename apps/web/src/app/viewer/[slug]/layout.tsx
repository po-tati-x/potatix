"use client";

import { useEffect, useState, use as usePromise, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import LoadingState from "@/components/features/viewer/loading-state";
import ErrorState from "@/components/features/viewer/error-state";
import CourseSidebar from "@/components/features/viewer/sidebar/course-sidebar-container";
import { Menu, X } from "lucide-react";
import Modal from "@/components/ui/Modal";
import LoginScreen from "@/components/features/auth/login-screen";
import { cn } from "@/lib/shared/utils/cn";
import { CourseProvider, useCourseContext } from "@/lib/client/context/course-context";

interface CourseLayoutProps {
  children: React.ReactNode;
  params: Promise<{
    slug: string;
  }>;
}

// Inner component that uses the context
function CourseLayoutInner({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  
  // Get all state from context
  const {
    course,
    isLoading,
    error: courseError,
    isAuthenticated,
    isEnrolled,
    isViewerMode,
    isMobileSidebarOpen,
    toggleMobileSidebar,
  } = useCourseContext();
  
  // Auth modal state (kept local as it's UI specific)
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  // Refs for focus management
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Close auth modal automatically when authentication succeeds
  useEffect(() => {
    if (isAuthenticated) {
      setShowAuthModal(false);
    }
  }, [isAuthenticated]);

  // If user is not enrolled and trying to access a restricted page (like a lesson), redirect
  useEffect(() => {
    // Redirect only if:
    // 1. User is not enrolled OR enrollment status is pending/rejected
    // 2. Not on auth page
    // 3. Trying to access a lesson page
    // 4. Course data has loaded and enrollment status has been checked
    if (
      !isEnrolled &&
      !pathname.includes("/auth") &&
      pathname.includes("/lesson/") &&
      !isLoading
    ) {
      // Redirect to the ROOT URL of the subdomain, not the internal viewer path
      router.replace("/");
    }
  }, [isEnrolled, pathname, isLoading, router]);
  
  // Handle keyboard navigation and focus trap for mobile sidebar
  useEffect(() => {
    // Save previous focus when opening sidebar
    if (isMobileSidebarOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      // Focus the close button when sidebar opens
      setTimeout(() => {
        closeButtonRef.current?.focus();
      }, 100);
    } else {
      // Restore focus when closing sidebar
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    }
    
    // Handle escape key to close sidebar
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileSidebarOpen) {
        toggleMobileSidebar();
      }
    };
    
    // Create focus trap for mobile sidebar
    const handleTabKey = (e: KeyboardEvent) => {
      if (!isMobileSidebarOpen || !sidebarRef.current) return;
      
      if (e.key === 'Tab') {
        // Get all focusable elements in the sidebar
        const focusableElements = sidebarRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
        
        // If shift+tab on first element, move to last element
        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        } 
        // If tab on last element, move to first element
        else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };
    
    // Add event listeners
    document.addEventListener('keydown', handleEscape);
    document.addEventListener('keydown', handleTabKey);
    
    // Clean up event listeners
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('keydown', handleTabKey);
    };
  }, [isMobileSidebarOpen, toggleMobileSidebar]);

  // Loading state
  if (isLoading) {
    return <LoadingState message="Loading course..." />;
  }

  // Error state
  if (courseError || !course) {
    return (
      <ErrorState
        title="Course Not Found"
        message="This course does not exist or is currently unavailable."
        buttonText="Back to Homepage"
        buttonAction={() => router.push("/")}
      />
    );
  }

  // Success state - layout with sidebar and content
  return (
    <div
      className={cn(
        "flex flex-col lg:flex-row bg-slate-50",
        isViewerMode && "h-screen overflow-hidden",
      )}
    >
      {/* Mobile header with menu toggle */}
      <div className="lg:hidden p-4 border-b border-slate-200 bg-white flex items-center justify-between">
        <h1 className="text-lg font-medium text-slate-900 truncate">
          {course.title}
        </h1>
        <button
          ref={menuButtonRef}
          onClick={toggleMobileSidebar}
          className="p-2 text-slate-600 hover:text-emerald-600"
          aria-label={isMobileSidebarOpen ? "Close sidebar" : "Open sidebar"}
          aria-expanded={isMobileSidebarOpen}
          aria-controls="mobile-sidebar"
        >
          {isMobileSidebarOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Layout container with sidebar and content */}
      <div
        className={cn(
          "flex flex-1",
          isViewerMode && "h-full overflow-hidden",
        )}
      >
        {/* Sidebar container */}
        <div className="relative flex flex-col lg:flex-row">
          {/* Sidebar component */}
          <div
            ref={sidebarRef}
            id="mobile-sidebar"
            className={cn(
              // Mobile overlay – visible only when toggled
              isMobileSidebarOpen && "fixed inset-0 z-10 w-full h-screen bg-white",

              // Base visibility – hidden on mobile when sidebar closed, block on desktop
              (!isMobileSidebarOpen && "hidden") || "",
              "lg:block lg:sticky lg:top-0 lg:z-0 lg:h-screen lg:bg-white lg:border-r lg:border-slate-200 transition-all duration-300 ease-in-out",
            )}
          >
            {/* Mobile close button - only visible on mobile */}
            {isMobileSidebarOpen && (
              <button
                ref={closeButtonRef}
                onClick={toggleMobileSidebar}
                className="lg:hidden absolute top-4 right-4 p-2 text-slate-600 hover:text-emerald-600 z-20"
                aria-label="Close sidebar"
              >
                <X className="h-5 w-5" />
              </button>
            )}
            
            {/* We only need to pass the course now, everything else comes from context */}
            <CourseSidebar
              course={course}
              completedLessons={[]}
            />
          </div>
        </div>

        {/* Main content */}
        <div
          className={cn(
            "flex-1 w-full min-w-0",
            isViewerMode && "h-full overflow-y-auto",
          )}
        >
          {children}
        </div>
      </div>

      {showAuthModal && (
        <Modal size="md" onClose={() => setShowAuthModal(false)}>
          <div className="p-6">
            <LoginScreen defaultCallbackUrl={pathname} />
          </div>
        </Modal>
      )}
    </div>
  );
}

// Main layout component that sets up the context
export default function CourseLayout({ children, params }: CourseLayoutProps) {
  const { slug: courseSlug } = usePromise(params);
  const pathname = usePathname();
  const currentLessonId = (pathname.split("/lesson/")[1] ?? "") as string;
  
  return (
    <CourseProvider 
      courseSlug={courseSlug}
      currentLessonId={currentLessonId}
    >
      <CourseLayoutInner>
        {children}
      </CourseLayoutInner>
    </CourseProvider>
  );
}
