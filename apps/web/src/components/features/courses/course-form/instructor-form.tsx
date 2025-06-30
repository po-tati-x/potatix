"use client";

import Image from "next/image";
import { Camera, Check, X } from "lucide-react";
import { Button } from "@/components/ui/new-button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { Dispatch, SetStateAction } from "react";

export interface InstructorFormState {
  name: string;
  title: string;
  bio: string;
  credentialsInput: string;
  preview: string | null;
  file: File | null;
  /** optional field when editing existing instructor */
  titleOverride?: string;
}

interface InstructorFormProps {
  form: InstructorFormState;
  setForm: Dispatch<SetStateAction<InstructorFormState>>;
  onSubmit: () => void;
  onCancel: () => void;
  isSaving?: boolean;
}

export function InstructorForm({ form, setForm, onSubmit, onCancel, isSaving }: InstructorFormProps) {
  return (
    <div className="space-y-4 border border-dashed border-emerald-300 rounded-md p-4">
      <div className="flex items-start gap-4 flex-wrap sm:flex-nowrap sm:flex-row-reverse">
        {/* Avatar */}
        <div className="relative flex-shrink-0 group">
          {form.preview ? (
            <>
              <Image src={form.preview} alt="Avatar preview" width={96} height={96} className="h-24 w-24 rounded-md object-cover transition-transform duration-300 ease-out group-hover:scale-105" />
              <input
                type="file"
                id="instructor-avatar"
                className="hidden"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const url = URL.createObjectURL(file);
                    setForm((prev) => ({ ...prev, preview: url, file }));
                  }
                }}
              />
              <label htmlFor="instructor-avatar" className="absolute inset-0 z-10 flex flex-col items-center justify-center cursor-pointer bg-black/40 opacity-0 backdrop-blur-sm transition-opacity duration-200 group-hover:opacity-100 rounded-md">
                <Camera className="h-6 w-6 text-white mb-1" />
                <span className="text-xs text-white">Change</span>
              </label>
              <button
                type="button"
                onClick={() => setForm((prev) => ({ ...prev, preview: null, file: null }))}
                className="absolute -right-2 -top-2 bg-red-500 text-white rounded-full h-5 w-5 flex items-center justify-center focus:outline-none"
              >
                <X className="h-3 w-3" />
              </button>
            </>
          ) : (
            <label htmlFor="instructor-avatar" className="flex items-center justify-center h-24 w-24 rounded-md bg-slate-50 border-2 border-dashed border-slate-300 cursor-pointer hover:border-emerald-500/70 hover:bg-emerald-50/20 transition-colors duration-200">
              <Camera className="h-8 w-8 text-slate-400" />
            </label>
          )}
        </div>

        {/* Fields */}
        <div className="flex-grow min-w-0 space-y-3">
          <FormField label="Name" required>
            <Input
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Instructor name"
              required
            />
          </FormField>

          <FormField label="Title" required>
            <Input
              value={form.title}
              onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="Senior Developer, PhD, etc."
              required
            />
          </FormField>

          <FormField label="Short Bio">
            <textarea
              value={form.bio}
              onChange={(e) => setForm((prev) => ({ ...prev, bio: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm resize-none"
            />
          </FormField>

          <FormField label="Credentials (comma-separated)">
            <Input
              value={form.credentialsInput}
              onChange={(e) => setForm((prev) => ({ ...prev, credentialsInput: e.target.value }))}
              placeholder="GDE, AWS SA, Published Author"
            />
          </FormField>

          {form.titleOverride !== undefined && (
            <FormField label="Role / Title Override">
              <Input
                value={form.titleOverride}
                onChange={(e) => setForm((prev) => ({ ...prev, titleOverride: e.target.value }))}
                placeholder="Lead Instructor"
              />
            </FormField>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <Button type="primary" size="small" iconLeft={<Check className="h-3.5 w-3.5" />} loading={isSaving} onClick={onSubmit}>
          Save
        </Button>
        <Button type="outline" size="small" iconLeft={<X className="h-3.5 w-3.5" />} onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
} 