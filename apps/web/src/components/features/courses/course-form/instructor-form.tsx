"use client";

import Image from "next/image";
import { Camera, Check, X } from "lucide-react";
import { Button } from "@/components/ui/new-button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { Dispatch, SetStateAction } from "react";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

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
        <div className="relative flex-shrink-0 h-24 w-24 overflow-hidden rounded-md group">
          {form.preview ? (
            <>
              <Image
                src={form.preview}
                alt="Avatar preview"
                fill
                sizes="96px"
                className="object-cover transition-transform duration-300 ease-out group-hover:scale-105"
                priority
              />

              {/* Loading overlay when saving */}
              {isSaving && (
                <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                  <div className="h-6 w-6 animate-spin rounded-full border-4 border-white/30 border-t-white" />
                </div>
              )}

              {/* File input */}
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

              {/* Change overlay */}
              <label
                htmlFor="instructor-avatar"
                className="absolute inset-0 z-10 flex flex-col items-center justify-center cursor-pointer bg-black/40 opacity-0 backdrop-blur-sm transition-opacity duration-200 group-hover:opacity-100"
              >
                <Camera className="h-6 w-6 text-white mb-1 drop-shadow-sm" />
                <span className="text-xs font-medium text-white">Change</span>
              </label>

              {/* Delete button */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, preview: null, file: null }))}
                    className="absolute top-2 right-2 z-20 rounded-full bg-black/60 p-0.5 text-white opacity-0 transition-all duration-200 hover:bg-black/80 focus:outline-none focus:ring-2 focus:ring-emerald-400 group-hover:opacity-100"
                    aria-label="Remove image"
                    disabled={isSaving}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Remove image</p>
                </TooltipContent>
              </Tooltip>
            </>
          ) : (
            <>
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
              <label
                htmlFor="instructor-avatar"
                className="flex h-full w-full cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed border-slate-300 bg-slate-50 transition-colors duration-200 hover:border-emerald-500/70 hover:bg-emerald-50/20"
              >
                <Camera className="h-8 w-8 text-slate-400" />
              </label>
            </>
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