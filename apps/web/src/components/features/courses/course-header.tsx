import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/new-button";
import { StatusBadge } from "@/components/features/courses/status-badge";
import { useCourse } from "@/lib/client/hooks/use-courses";
import { ReactNode } from "react";

interface CourseHeaderProps {
  // Make courseId optional to support simple navigation
  courseId?: string;
  // If caller already knows course title, provide it to skip extra fetch
  courseTitle?: string;
  backHref?: string;
  title?: string;
  status?: string;
  // Status change handler remains optional
  onStatusChange?: (status: "draft" | "published" | "archived") => void;
  action?: ReactNode;
}

export function CourseHeader({
  courseId,
  backHref = "/courses",
  title = "Edit Course",
  status,
  onStatusChange,
  action,
  courseTitle,
}: CourseHeaderProps) {
  const router = useRouter();

  // Fetch only when we genuinely need it
  const { data: course } = useCourse(courseId || "", {
    enabled: !!courseId && !courseTitle,
  });

  const resolvedTitle = courseTitle ?? course?.title;

  // Determine back button text
  const backButtonText = courseId && resolvedTitle ? `Back to ${resolvedTitle}` : "Back to courses";

  return (
    <>
      {/* Back button */}
      <div className="mb-6">
        <Button
          type="text"
          size="tiny"
          iconLeft={
            <span className="transition-transform duration-200 group-hover:-translate-x-0.5">
              <ArrowLeft className="h-3 w-3" />
            </span>
          }
          className="text-slate-500 hover:text-slate-900 group"
          onClick={() => router.push(backHref)}
        >
          {backButtonText}
        </Button>
      </div>

      {/* Header with status and optional actions */}
      <header className="mb-6 border-b border-slate-200 pb-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-medium text-slate-900">{title}</h1>
            {status && onStatusChange && (
              <StatusBadge
                status={status as "draft" | "published" | "archived"}
                onChange={onStatusChange}
              />
            )}
            {status && !onStatusChange && (
              <div className="px-3 py-1 text-xs font-medium rounded-md inline-flex items-center text-slate-700 bg-slate-100 border border-slate-200">
                {status}
              </div>
            )}
          </div>

          {action && <div className="shrink-0">{action}</div>}
        </div>
      </header>
    </>
  );
}
