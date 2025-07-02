"use client";

import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { CourseHeader } from "@/components/features/courses/course-header";
import { CourseErrorAlert } from "@/components/features/courses/course-error-alert";
import { CourseInfoSection } from "@/components/features/courses/course-form/course-info-section";
import { CourseContentSection } from "@/components/features/courses/course-form/course-content-section";
import { CourseCoverImage } from "@/components/features/courses/course-form/course-cover-image";
import { CourseStats } from "@/components/features/courses/course-form/course-stats";
import { SlugEditor } from "@/components/features/courses/course-form/slug-editor";
import { CourseInstructorsSection } from "@/components/features/courses/course-form/course-instructors-section";
import { CoursePerksSection } from "@/components/features/courses/course-form/course-perks-section";
import { CourseLearningOutcomesSection } from "@/components/features/courses/course-form/course-learning-outcomes-section";
import { CoursePrerequisitesSection } from "@/components/features/courses/course-form/course-prerequisites-section";
import type { Course, CreateCourseData, CourseModule, Lesson } from "@/lib/shared/types/courses";
import { useCourse, useUpdateCourse, useUploadCourseImage } from "@/lib/client/hooks/use-courses";

interface Props {
  courseId: string;
}

export default function EditCourseClient({ courseId }: Props) {
  const router = useRouter();

  // Get course data from API hooks
  const { data: course, isLoading, error: fetchError } = useCourse(courseId);
  const { mutate: updateCourse, isPending: isSaving } = useUpdateCourse(courseId);
  const { mutate: uploadImage, isPending: isUploading } = useUploadCourseImage(courseId);

  // Local form state
  const [formData, setFormData] = useState<Partial<Course>>({});
  const [error, setError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});
  const [expandedLessons, setExpandedLessons] = useState<Record<string, boolean>>({});

  // Initialize form data from course data
  useEffect(() => {
    if (course) {
      setFormData(course);
      setImagePreview(course.imageUrl || null);

      // Merge existing expanded state with new modules/lessons so we don't collapse everything on refetch
      setExpandedModules((prev) => {
        const next: Record<string, boolean> = { ...prev };
        course.modules?.forEach((module: CourseModule) => {
          if (!(module.id in next)) next[module.id] = false;
        });
        return next;
      });

      setExpandedLessons((prev) => {
        const next: Record<string, boolean> = { ...prev };
        course.modules?.forEach((module: CourseModule) => {
          module.lessons?.forEach((lesson: Lesson) => {
            if (!(lesson.id in next)) next[lesson.id] = false;
          });
        });
        return next;
      });
    }
  }, [course]);

  const updateField = <T extends keyof Course>(field: T, value: Course[T]) => {
    setFormData((prev) => ({
      ...prev,
      [field]: field === "price" ? (value ? Number(value) : 0) : value,
    }));
  };

  // Module & lesson accordion toggles
  const toggleModuleExpanded = (moduleId: string) =>
    setExpandedModules((prev) => ({ ...prev, [moduleId]: !prev[moduleId] }));
  const toggleLessonExpanded = (lessonId: string) =>
    setExpandedLessons((prev) => ({ ...prev, [lessonId]: !prev[lessonId] }));

  const handleCourseImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target?.result as string);
    reader.readAsDataURL(file);

    const fd = new FormData();
    fd.append("file", file);

    uploadImage(fd, {
      onSuccess: (result: { imageUrl: string }) => updateField("imageUrl", result.imageUrl),
      onError: () => {
        setError("Failed to upload image");
        setImagePreview(null);
      },
    });
  };

  const saveCourse = () => {
    if (!course) {
      setError("Course data not loaded");
      return;
    }

    if (!formData.title) {
      setError("Course title is required");
      return;
    }

    const updateData: Partial<CreateCourseData> = {};

    if (formData.title && formData.title !== course.title) updateData.title = formData.title;
    if (formData.description !== course.description) updateData.description = formData.description;
    if (formData.price !== course.price) updateData.price = formData.price;
    if (formData.status && formData.status !== course.status) updateData.status = formData.status;
    if (formData.imageUrl !== course.imageUrl) updateData.imageUrl = formData.imageUrl;
    if (formData.slug && formData.slug !== course.slug) updateData.slug = formData.slug;

    if (Object.keys(updateData).length === 0) {
      setError("No changes to save");
      return;
    }

    updateCourse(updateData, {
      onSuccess: () => router.push(`/courses/${formData.slug}`),
      onError: (err) =>
        setError(err instanceof Error ? err.message : "Failed to save course"),
    });
  };

  const handleUpdateSlug = async (newSlug: string) => {
    try {
      const res = await fetch(
        `/api/courses/validate?type=slug&value=${encodeURIComponent(newSlug)}`,
      );
      const data = await res.json();

      if (!data.valid && data.slug !== formData.slug) {
        setError("This URL is already in use. Please choose a different one.");
        throw new Error("Duplicate slug");
      }

      updateCourse(
        {
          title: formData.title,
          description: formData.description,
          price: formData.price,
          status: formData.status,
          imageUrl: formData.imageUrl,
          slug: newSlug,
        },
        {
          onSuccess: () => {
            setFormData((prev) => ({ ...prev, slug: newSlug }));
            router.replace(`/courses/${newSlug}/edit`);
          },
          onError: () => setError("Failed to update URL. It may already be in use."),
        },
      );
    } catch (err) {
      console.error("Error updating slug:", err);
      throw err;
    }
  };

  const handleStatusChange = (newStatus: "draft" | "published" | "archived") => {
    updateField("status", newStatus);
    updateCourse({ status: newStatus });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 text-slate-500">
        <Loader2 className="h-5 w-5 animate-spin" />
        <p className="text-sm">Loading course data...</p>
      </div>
    );
  }

  if (!course || !course.id) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 text-slate-500">
        <div className="bg-red-50 border border-red-200 rounded-md p-4 max-w-lg">
          <h2 className="text-red-700 text-lg font-medium mb-2">Course Load Error</h2>
          <p className="text-red-600 mb-4">
            {fetchError instanceof Error ? fetchError.message : "Failed to load course data"}
          </p>
          <div className="flex justify-center">
            <button
              onClick={() => router.push("/courses")}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded text-slate-700 transition-colors"
            >
              Return to Courses
            </button>
          </div>
        </div>
      </div>
    );
  }

  const enhancedFormData = {
    ...formData,
    // Inject defaults for marketing fields if absent
    perks:
      formData.perks ?? [
        "52 hours on-demand video",
        "23 coding exercises",
        "Assignments",
        "225 articles",
        "164 downloadable resources",
        "Access on mobile & TV",
        "Certificate of completion",
      ],
    learningOutcomes:
      formData.learningOutcomes ?? [
        "Modern development patterns and best practices",
        "Testing strategies and debugging techniques",
        "Performance optimisation and scalability",
        "Clean code principles and architecture",
        "API design and integration patterns",
      ],
    prerequisites:
      formData.prerequisites ?? [
        "Solid understanding of JavaScript / TypeScript fundamentals",
        "Comfort with modern ES modules and async / await",
        "Basic familiarity with Git and the command-line",
      ],
    modules: formData.modules?.map((module) => ({
      ...module,
      expanded: expandedModules[module.id] || false,
      lessons: module.lessons?.map((lesson) => ({
        ...lesson,
        expanded: expandedLessons[lesson.id] || false,
      })),
    })),
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <CourseHeader
        courseId={courseId}
        backHref={formData.slug ? `/courses/${formData.slug}` : "/courses"}
        title="Edit Course"
        status={formData.status}
        onStatusChange={handleStatusChange}
        onSave={saveCourse}
        loading={isSaving}
        disabled={isUploading || isSaving}
        isPending={isUploading}
      />

      {error && <CourseErrorAlert error={error} />}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="md:col-span-2 space-y-5">
          <CourseInfoSection
            courseId={courseId}
            title={enhancedFormData.title || ""}
            description={enhancedFormData.description || ""}
            price={enhancedFormData.price || 0}
            slug={enhancedFormData.slug || ""}
            onChange={(e) =>
              updateField(e.target.name as keyof Course, e.target.value as string)
            }
          />

          <CourseContentSection
            courseId={courseId}
            modules={enhancedFormData.modules || []}
            expandedModules={expandedModules}
            expandedLessons={expandedLessons}
            onToggleModule={toggleModuleExpanded}
            onToggleLesson={toggleLessonExpanded}
          />

          <CourseInstructorsSection courseId={courseId} />

          {/* Marketing sections */}
          <CoursePerksSection courseId={courseId} perks={enhancedFormData.perks} />

          <CourseLearningOutcomesSection courseId={courseId} outcomes={enhancedFormData.learningOutcomes} />

          <CoursePrerequisitesSection courseId={courseId} prerequisites={enhancedFormData.prerequisites} />

        </div>

        <div className="space-y-5">
          <CourseCoverImage
            preview={imagePreview}
            uploading={isUploading}
            onImageChange={handleCourseImageUpload}
            onImageRemove={() => {
              setImagePreview(null);
              updateField("imageUrl", "");
            }}
          />

          <CourseStats
            moduleCount={formData.modules?.length || 0}
            lessonCount={
              formData.modules?.reduce(
                (total, module) => total + (module.lessons?.length || 0),
                0,
              ) || 0
            }
            status={formData.status || "draft"}
            price={formData.price || 0}
          />

          <SlugEditor currentSlug={formData.slug || ""} onUpdateSlug={handleUpdateSlug} />
        </div>


        
      </div>
    </div>
  );
} 