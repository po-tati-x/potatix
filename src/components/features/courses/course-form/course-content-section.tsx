import { Plus } from "lucide-react";
import { Button } from "@/components/ui/potatix/Button";
import { useCreateModule } from "@/lib/api/courses";
import type { Module, CreateModuleData } from "@/lib/types/api";
import { CourseModuleEditor } from "@/components/features/courses/lessons/module-editor";
import { DraggableModuleList } from "@/components/features/courses/lessons/draggable-module-list";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { UIModule } from "@/lib/stores/courses";
import { DraggableProvidedDragHandleProps } from "@hello-pangea/dnd";

interface CourseContentSectionProps {
  courseId: string;
  modules: Module[];
}

export function CourseContentSection({
  courseId,
  modules
}: CourseContentSectionProps) {
  const queryClient = useQueryClient();
  
  // Local state for optimistic UI updates with module reordering
  const [localModules, setLocalModules] = useState<UIModule[] | null>(null);
  
  // Transform modules to UI modules
  const baseModules = modules.map(module => ({
    ...module,
    expanded: false
  })) || [];
  
  // Use locally reordered modules if available, otherwise use the API data
  const uiModules = localModules || baseModules;
  
  // Use React Query mutation directly
  const { mutate: createModule } = useCreateModule();

  // Add a module function
  const addModule = () => {
    if (!courseId) return;
    
    // Create module data with required fields
    const moduleData: CreateModuleData = {
      title: 'New Module',
      description: '',
      order: uiModules.length, // Add at the end
      courseId // Required field
    };
    
    createModule({ 
      courseId, 
      data: moduleData
    });
  };
  
  // Handle module reordering with immediate UI update
  const handleModulesReordered = (reorderedModules: UIModule[]) => {
    // Update local state immediately to reflect the new order
    setLocalModules(reorderedModules);
    
    // Invalidate queries to ensure data is refreshed on next fetch
    queryClient.invalidateQueries({ queryKey: ['courses', courseId] });
  };
  
  // Render an individual module with drag handle
  const renderModule = (module: UIModule, idx: number, dragHandleProps: DraggableProvidedDragHandleProps | null) => {
    return (
      <CourseModuleEditor
        key={module.id}
        courseId={courseId}
        module={module as Module}
        index={idx}
        dragHandleProps={dragHandleProps}
      />
    );
  };
  
  // Empty state for when there are no modules
  const emptyState = (
    <div className="text-center py-8 space-y-3 border border-dashed border-slate-300 rounded-md">
      <p className="text-slate-600 text-sm">No modules yet</p>
      <Button
        type="primary"
        size="small"
        onClick={addModule}
      >
        Add Module
      </Button>
    </div>
  );

  return (
    <div className="border border-slate-200 rounded-md overflow-hidden bg-white">
      <div className="border-b border-slate-200 px-4 py-2.5 bg-slate-50 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-medium text-slate-900">Course Content</h2>
          <p className="text-xs text-slate-500 mt-0.5">Add modules and lessons to organize your course</p>
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

      <div className="p-4">
        <DraggableModuleList
          courseId={courseId}
          modules={uiModules}
          emptyState={emptyState}
          renderModule={renderModule}
          onReorder={handleModulesReordered}
        />
      </div>
    </div>
  );
} 