"use client";

import { useEffect, useState, use as usePromise, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import LoadingState from "@/components/features/viewer/loading-state";
import { Ghost } from "lucide-react";
import { Button } from "@/components/ui/new-button";
import CourseSidebar from "@/components/features/viewer/sidebar/course-sidebar-container";
import { Menu, X } from "lucide-react";
import Modal from "@/components/ui/modal";
import LoginScreen from "@/components/features/auth/login-screen";
import { cn } from "@/lib/shared/utils/cn";
import { CourseProvider, useCourseContext } from "@/lib/client/context/course-context";
import { clientEnv } from "@/env.client";

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
    isMobileSidebarOpen,
    toggleMobileSidebar,
    enroll,
    currentLessonId,
  } = useCourseContext();
  
  // Auth modal state (kept local as it's UI specific)
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  // Refs for focus management
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Modal auto-closes simply by not rendering when authenticated.

  // If user is not enrolled and trying to access a restricted page (like a lesson), redirect
  useEffect(() => {
    const isLessonRoute = pathname.includes("/lesson/");

    if (
      !isEnrolled && // user not enrolled
      !pathname.includes("/auth") && // not on auth route
      isLessonRoute &&
      !isLoading && // data loaded
      course?.lessons?.length // we have lessons to inspect
    ) {
      const lesson = course.lessons.find((l) => l.id === currentLessonId);

      // Redirect ONLY when lesson exists and it ISN'T marked public
      if (lesson && lesson.visibility !== "public") {
        router.replace("/");
      }
    }
  }, [
    isEnrolled,
    pathname,
    isLoading,
    router,
    course?.lessons,
    currentLessonId,
  ]);
  
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
        
        const focusableArray = [...focusableElements];
        const firstElement = focusableArray[0] as HTMLElement;
        const lastElement = (focusableArray.at(-1) ?? firstElement) as HTMLElement;
        
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

  // Enrollment handler – opens auth modal when unauthenticated, otherwise delegates to context
  const handleEnroll = async () => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }

    try {
      await enroll();
    } catch (error) {
      console.error("[Enrollment] failed:", error);
    }
  };

  // Loading state
  if (isLoading) {
    return <LoadingState message="Loading course..." />;
  }

  // Error state
  if (courseError || !course) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-50 px-4 text-center">
        <Ghost className="h-12 w-12 text-slate-400 mb-6" />
        <h1 className="text-2xl font-semibold text-slate-800 mb-2">Course Not Found</h1>
        <p className="text-sm text-slate-600 max-w-sm">
          The course you&rsquo;re looking for doesn&rsquo;t exist or is currently unavailable.
        </p>
        <p className="text-xs text-slate-500 mt-3 mb-6 max-w-sm">
          If you&rsquo;re the course creator and attempting to preview it, ensure the course state is switched from <span className="font-medium">Draft</span> to <span className="font-medium">Published</span> first.
        </p>
        <Button
          type="primary"
          size="small"
          onClick={() => {
            const target = clientEnv.NEXT_PUBLIC_APP_URL || "/";
            // Use full reload to ensure correct host
            globalThis.window.location.href = target;
          }}
        >
          Back to Home
        </Button>
      </div>
    );
  }

  // Success state - layout with sidebar and content
  return (
    <div
      className={cn(
        "flex flex-col lg:flex-row bg-slate-50 h-screen overflow-hidden",
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
          "flex flex-1 h-full overflow-hidden",
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
              onEnroll={handleEnroll}
            />
          </div>
        </div>

        {/* Main content */}
        <div
          className={cn(
            "flex-1 w-full min-w-0 h-full overflow-y-auto",
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
  const currentLessonId = pathname.split("/lesson/")[1] ?? "";
  
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
