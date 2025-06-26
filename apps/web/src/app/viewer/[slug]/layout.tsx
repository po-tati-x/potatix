"use client";

import { useEffect, useState, use as usePromise } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useCourseBySlug } from "@/lib/client/hooks/use-courses";
import LoadingState from "@/components/features/viewer/loading-state";
import ErrorState from "@/components/features/viewer/error-state";
import CourseSidebar from "@/components/features/viewer/sidebar/course-sidebar-container";
import { Menu, X } from "lucide-react";
import { useSession } from "@/lib/auth/auth";
import axios from "axios";
import Modal from "@/components/ui/Modal";
import LoginScreen from "@/components/features/auth/login-screen";

interface CourseLayoutProps {
  children: React.ReactNode;
  params: Promise<{
    slug: string;
  }>;
}

export default function CourseLayout({ children, params }: CourseLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { slug: courseSlug } = usePromise(params);

  // UI state
  const [isMobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleMobileSidebar = () => setMobileSidebarOpen((s) => !s);
  const toggleSidebarCollapsed = () => setSidebarCollapsed((s) => !s);

  // Auth / enrollment state (derive from session hook so it updates automatically)
  const { data: session } = useSession();
  const isAuthenticated = !!session?.user;
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [enrollmentStatus, setEnrollmentStatus] = useState<"active" | "pending" | "rejected" | null>(null);
  const [isEnrollmentLoading, setEnrollmentLoading] = useState(false);
  const [isEnrolling, setEnrolling] = useState(false);

  const isEnrolled = enrollmentStatus === "active";

  // Load course data
  const {
    data: course,
    isLoading: courseLoading,
    error: courseError,
  } = useCourseBySlug(courseSlug);

  // Check enrollment status when authenticated
  useEffect(() => {
    async function checkEnrollment() {
      if (!isAuthenticated || !courseSlug) {
        setEnrollmentStatus(null);
        setEnrollmentLoading(false);
        return;
      }

      try {
        setEnrollmentLoading(true);
        const response = await axios.get(
          `/api/courses/enrollment?slug=${courseSlug}`,
        );

        if (response.data.isEnrolled && response.data.enrollment) {
          setEnrollmentStatus(response.data.enrollment.status);
        } else {
          setEnrollmentStatus(null);
        }
      } catch (error) {
        console.error("Failed to check enrollment status:", error);
        setEnrollmentStatus(null);
      } finally {
        setEnrollmentLoading(false);
      }
    }

    checkEnrollment();
  }, [isAuthenticated, courseSlug]);

  // Enroll in the course
  const handleEnroll = async () => {
    if (isEnrolling) return;

    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }

    try {
      setEnrolling(true);
      const response = await axios.post("/api/courses/enrollment", {
        courseSlug,
      });

      // Set the enrollment status from the response
      if (response.data.enrollment) {
        setEnrollmentStatus(response.data.enrollment.status);
      }
    } catch (error) {
      console.error("Failed to enroll in course:", error);
    } finally {
      setEnrolling(false);
    }
  };

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
      !courseLoading &&
      !isEnrollmentLoading
    ) {
      // Redirect to the ROOT URL of the subdomain, not the internal viewer path
      window.location.href = "/";
    }
  }, [
    isEnrolled,
    pathname,
    courseLoading,
    isEnrollmentLoading,
  ]);

  // Close auth modal automatically when authentication succeeds
  useEffect(() => {
    if (isAuthenticated) {
      setShowAuthModal(false);
    }
  }, [isAuthenticated]);

  // Loading state
  if (courseLoading || isEnrollmentLoading) {
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
    <div className="flex flex-col lg:flex-row h-screen overflow-hidden bg-slate-50">
      {/* Mobile header with menu toggle */}
      <div className="lg:hidden p-4 border-b border-slate-200 bg-white flex items-center justify-between">
        <h1 className="text-lg font-medium text-slate-900 truncate">
          {course.title}
        </h1>
        <button
          onClick={toggleMobileSidebar}
          className="p-2 text-slate-600 hover:text-emerald-600"
        >
          {isMobileSidebarOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Layout container with sidebar and content */}
      <div className="flex flex-1 h-full overflow-hidden">
        {/* Sidebar container */}
        <div className="relative flex flex-col lg:flex-row">
          {/* Sidebar component */}
          <div
            className={`
            ${isMobileSidebarOpen ? "block" : "hidden"}
            lg:flex
            fixed lg:static
            inset-0 lg:inset-auto
            z-10 lg:z-0
            w-full
            h-screen
            lg:h-full
            bg-white
            lg:border-r lg:border-slate-200
            transition-all duration-300 ease-in-out
            ${isSidebarCollapsed ? "lg:w-16" : "lg:w-80"}
          `}
          >
            <CourseSidebar
              course={course}
              currentLessonId={(pathname.split("/lesson/")[1] ?? "") as string}
              courseSlug={courseSlug}
              isAuthenticated={isAuthenticated}
              isEnrolled={isEnrolled}
              onEnroll={handleEnroll}
              isEnrolling={isEnrolling}
              enrollmentStatus={enrollmentStatus}
              isCollapsed={isSidebarCollapsed}
              onToggleCollapse={toggleSidebarCollapsed}
            />
          </div>
        </div>

        {/* Main content - scrollable independently */}
        <div className="flex-1 h-full overflow-y-auto w-full min-w-0">
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
