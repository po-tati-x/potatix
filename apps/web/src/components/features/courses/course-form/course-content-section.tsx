import { Plus } from "lucide-react";
import { Button } from "@/components/ui/new-button";
import { useCreateModule, useReorderModules } from "@/lib/client/hooks/use-courses";
import type { Module, CreateModuleData } from "@/lib/shared/types/courses";
import { CourseModuleEditor } from "@/components/features/courses/lessons/module-editor";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

interface CourseContentSectionProps {
  courseId: string;
  modules: Module[];
  expandedModules?: Record<string, boolean>;
  expandedLessons?: Record<string, boolean>;
  onToggleModule?: (moduleId: string) => void;
  onToggleLesson?: (lessonId: string) => void;
}

export function CourseContentSection({
  courseId,
  modules,
  expandedModules = {},
  expandedLessons = {},
  onToggleModule,
  onToggleLesson,
}: CourseContentSectionProps) {
  const queryClient = useQueryClient();

  const [localModules, setLocalModules] = useState<Module[] | undefined>();

  const uiModules = localModules ?? modules;

  // Mutations
  const { mutate: createModule } = useCreateModule();
  const { mutate: reorderModules } = useReorderModules();

  // Add a module function
  const addModule = () => {
    if (!courseId) return;

    // Create module data with required fields
    const moduleData: CreateModuleData = {
      title: "New Module",
      description: "",
      order: uiModules.length, // Add at the end
      courseId, // Required field
    };

    createModule({
      courseId,
      title: moduleData.title
    });
  };

  const moveModule = (index: number, direction: "up" | "down"): void => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= uiModules.length) return;

    const reordered = [...uiModules];
    const [item] = reordered.splice(index, 1);
    if (!item) return;
    reordered.splice(newIndex, 0, item);
    setLocalModules(reordered);

    reorderModules(
      {
        courseId,
        orderedIds: reordered.map((m) => m.id),
      },
      {
        onSuccess: () => {
          setLocalModules(undefined); // Sync with server
          void queryClient.invalidateQueries({ queryKey: ["courses", courseId] });
        },
      },
    );
  };

  // Handle module toggle if no external handler provided
  const handleToggleModule = (moduleId: string) => {
    if (onToggleModule) {
      onToggleModule(moduleId);
    }
  };

  // Handle lesson toggle if no external handler provided
  const handleToggleLesson = (lessonId: string) => {
    if (onToggleLesson) {
      onToggleLesson(lessonId);
    }
  };

  // Render an individual module with drag handle
  const renderModule = (module: Module, idx: number) => (
    <CourseModuleEditor
      key={module.id}
      courseId={courseId}
      module={module}
      index={idx}
      onMoveUp={() => moveModule(idx, "up")}
      onMoveDown={() => moveModule(idx, "down")}
      onToggleModule={handleToggleModule}
      isExpanded={expandedModules[module.id] || false}
      expandedLessons={expandedLessons}
      onToggleLesson={handleToggleLesson}
    />
  );

  // Empty state for when there are no modules
  const emptyState = (
    <div className="text-center py-8 space-y-1 border border-dashed border-slate-300 rounded-md">
      <p className="text-sm text-slate-600">No modules yet</p>
      <p className="text-xs text-slate-500">Click &quot;Add Module&quot; to start structuring your course</p>
    </div>
  );

  return (
    <div className="border border-slate-200 rounded-md overflow-hidden bg-white">
      <div className="border-b border-slate-200 px-4 py-2.5 bg-slate-50 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-medium text-slate-900">Course Content</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Add modules and lessons to organize your course
          </p>
        </div>
        <Button
          type="primary"
          size="small"
          iconLeft={<Plus className="h-3.5 w-3.5" />}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            addModule();
          }}
        >
          Add Module
        </Button>
      </div>

      <div className="p-4 space-y-4">
        {uiModules.length === 0 ? (
          emptyState
        ) : (
          uiModules.map((m, i) => renderModule(m, i))
        )}
      </div>
    </div>
  );
}
