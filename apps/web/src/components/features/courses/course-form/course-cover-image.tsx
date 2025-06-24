"use client";

import Image from "next/image";
import { X } from "lucide-react";

interface CourseCoverImageProps {
  preview: string | null;
  uploading: boolean;
  onImageChange: (file: File) => void;
  onImageRemove: () => void;
}

export function CourseCoverImage({
  preview,
  uploading,
  onImageChange,
  onImageRemove,
}: CourseCoverImageProps) {
  return (
    <div className="border border-slate-200 rounded-md overflow-hidden bg-white">
      <div className="border-b border-slate-200 px-4 py-2.5 bg-slate-50">
        <h2 className="text-sm font-medium text-slate-900">Course Cover</h2>
      </div>
      <div className="p-4">
        {preview ? (
          <div className="relative aspect-video rounded-md overflow-hidden">
            <Image
              src={preview}
              alt="Course cover preview"
              className="object-cover"
              fill
              sizes="(max-width: 768px) 100vw, 300px"
              priority
            />
            {uploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                <div className="animate-spin rounded-full h-10 w-10 border-4 border-white border-opacity-30 border-t-white"></div>
              </div>
            )}
            <button
              type="button"
              onClick={onImageRemove}
              className="absolute top-2 right-2 p-1 bg-black bg-opacity-60 text-white rounded-full hover:bg-opacity-80"
              disabled={uploading}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="border-2 border-dashed border-neutral-300 rounded-lg p-6 text-center">
            <input
              type="file"
              id="course-cover-image"
              className="hidden"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  onImageChange(file);
                }
              }}
            />
            
            <label
              htmlFor="course-cover-image"
              className="flex flex-col items-center justify-center cursor-pointer"
            >
              <div className="h-10 w-10 text-neutral-400 mb-2 flex items-center justify-center">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="24" 
                  height="24" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                  <circle cx="9" cy="9" r="2" />
                  <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                </svg>
              </div>
              <p className="text-sm font-medium text-neutral-700">
                Upload course cover image
              </p>
              <p className="text-xs text-neutral-500 mt-1">
                JPEG, PNG, or WebP (max 5MB)
              </p>
            </label>
          </div>
        )}
      </div>
    </div>
  );
} 