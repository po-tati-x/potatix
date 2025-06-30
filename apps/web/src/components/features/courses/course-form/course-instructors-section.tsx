"use client";

// New component for managing course instructors (UI-only mockup)
import { useState } from "react";
import Image from "next/image";
import { Plus, X, UserRound } from "lucide-react";

import { Button } from "@/components/ui/new-button";
import { useCourseInstructors, useAddCourseInstructor, useUpdateCourseInstructor, useDeleteCourseInstructor } from "@/lib/client/hooks/use-instructors";
import { instructorApi } from "@/lib/client/api/instructors";
import { InstructorForm, InstructorFormState } from "@/components/features/courses/course-form/instructor-form";

interface CourseInstructorsSectionProps {
  courseId: string;
}

export function CourseInstructorsSection({ courseId }: CourseInstructorsSectionProps) {
  const { data: instructors = [], isLoading } = useCourseInstructors(courseId);
  const addInstructorMutation = useAddCourseInstructor(courseId);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<InstructorFormState>({
    name: "",
    title: "",
    bio: "",
    credentialsInput: "",
    preview: null,
    file: null,
  });

  const [editingId, setEditingId] = useState<string | null>(null);
  const updateMutation = useUpdateCourseInstructor(courseId, editingId || "");
  const deleteMutation = useDeleteCourseInstructor(courseId);

  // Separate state for editing existing instructor
  const [editForm, setEditForm] = useState<InstructorFormState & { titleOverride: string }>({
    name: "",
    title: "",
    bio: "",
    credentialsInput: "",
    titleOverride: "",
    preview: null,
    file: null,
  });

  const resetForm = () =>
    setForm({
      name: "",
      title: "",
      bio: "",
      credentialsInput: "",
      preview: null,
      file: null,
    });

  const addInstructor = async () => {
    if (!form.name.trim()) return;

    const credentialsArr = form.credentialsInput
      .split(',')
      .map((c) => c.trim())
      .filter(Boolean);

    // Create instructor + pivot
    addInstructorMutation.mutate(
      {
        name: form.name.trim(),
        title: form.title.trim(),
        bio: form.bio.trim(),
        credentials: credentialsArr,
      },
      {
        onSuccess: async (pivot) => {
          if (form.file) {
            const fd = new FormData();
            fd.append("file", form.file);
            await instructorApi.uploadInstructorAvatar(pivot.instructorId, fd);
          }
          resetForm();
          setShowForm(false);
        },
      },
    );
  };

  const removeInstructor = (pivotId: string, instructorId: string) => {
    if (!confirm('Remove instructor?')) return;
    deleteMutation.mutate(instructorId);
  };

  const handleEditStart = (ins: typeof instructors[number]) => {
    setEditingId(ins.instructorId);
    setEditForm({
      name: ins.instructor.name,
      title: ins.instructor.title ?? "",
      bio: ins.instructor.bio ?? "",
      credentialsInput: (ins.instructor.credentials ?? []).join(', '),
      titleOverride: ins.titleOverride ?? "",
      preview: ins.instructor.avatarUrl ?? null,
      file: null,
    });
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditForm({
      name: "",
      title: "",
      bio: "",
      credentialsInput: "",
      titleOverride: "",
      preview: null,
      file: null,
    });
  };

  const handleEditSave = async () => {
    if (!editingId) return;
    const credentialsArr = editForm.credentialsInput.split(',').map(c=>c.trim()).filter(Boolean);

    updateMutation.mutate(
      {
        titleOverride: editForm.titleOverride,
        name: editForm.name.trim(),
        title: editForm.title.trim(),
        bio: editForm.bio.trim(),
        credentials: credentialsArr,
      },
      {
        onSuccess: async () => {
          if (editForm.file) {
            const fd = new FormData();
            fd.append("file", editForm.file);
            await instructorApi.uploadInstructorAvatar(editingId, fd);
          }
          setEditingId(null);
          setEditForm({ name:"",title:"",bio:"",credentialsInput:"",titleOverride:"",preview:null,file:null });
        },
      },
    );
  };

  return (
    <div className="border border-slate-200 rounded-md overflow-hidden bg-white">
      {/* Header */}
      <div className="border-b border-slate-200 px-4 py-2.5 bg-slate-50 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-medium text-slate-900">Course Instructors</h2>
          <p className="text-xs text-slate-500 mt-0.5">Introduce the experts students will learn from</p>
        </div>
        <Button
          type="primary"
          size="small"
          iconLeft={<Plus className="h-3.5 w-3.5" />}
          onClick={() => setShowForm((v) => !v)}
        >
          Add Instructor
        </Button>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Empty state */}
        {isLoading ? (
          <p className="text-sm text-slate-500">Loading…</p>
        ) : instructors.length === 0 && !showForm ? (
          <div className="text-center py-8 space-y-1 border border-dashed border-slate-300 rounded-md">
            <p className="text-sm text-slate-600">No instructors yet</p>
            <p className="text-xs text-slate-500">Click &#34;Add Instructor&#34; to invite someone</p>
          </div>
        ) : null}

        {/* Instructor list */}
        {instructors.map((ins) => (
          editingId === ins.instructorId ? (
            <InstructorForm key={ins.id} form={editForm as any} setForm={setEditForm as any} onSubmit={handleEditSave} onCancel={handleEditCancel} isSaving={updateMutation.isPending} />
          ) : (
            <div key={ins.id} className="flex items-center gap-3 border border-slate-200 rounded-md p-3">
              {ins.instructor.avatarUrl ? (
                <Image src={ins.instructor.avatarUrl} alt={ins.instructor.name} width={48} height={48} className="h-12 w-12 rounded-md object-cover" />
              ) : (
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-slate-200"><UserRound className="h-6 w-6 text-slate-500" /></div>
              )}

              <div className="flex-grow min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">{ins.instructor.name}</p>
                <p className="text-xs text-slate-500 truncate">{ins.titleOverride ?? ins.instructor.title}</p>
              </div>

              <div className="flex gap-2">
                <Button type="outline" size="tiny" onClick={()=>handleEditStart(ins)}>Edit</Button>
                <Button type="outline" size="tiny" iconLeft={<X className="h-3 w-3" />} onClick={()=>removeInstructor(ins.id, ins.instructorId)} loading={deleteMutation.isPending}>Del</Button>
              </div>
            </div>
          )
        ))}

        {/* Add form */}
        {showForm && (
          <InstructorForm form={form as any} setForm={setForm as any} onSubmit={addInstructor} onCancel={()=>{resetForm();setShowForm(false);}} isSaving={addInstructorMutation.isPending} />
        )}
      </div>
    </div>
  );
} 