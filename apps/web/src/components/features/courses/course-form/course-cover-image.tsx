"use client";

import Image from "next/image";
import { X, Camera } from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

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
          <div className="relative aspect-video overflow-hidden rounded-md group">
            {/* Cover image */}
            <Image
              src={preview}
              alt="Course cover preview"
              fill
              sizes="(max-width: 768px) 100vw, 300px"
              className="object-cover transition-transform duration-300 ease-out group-hover:scale-105"
              priority
            />

            {/* Blur + spinner while uploading */}
            {uploading && (
              <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-white/30 border-t-white" />
              </div>
            )}

            {/* Change cover overlay */}
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
              className="absolute inset-0 z-10 flex flex-col items-center justify-center cursor-pointer bg-black/40 opacity-0 backdrop-blur-sm transition-opacity duration-200 group-hover:opacity-100"
            >
              <Camera className="h-8 w-8 text-white mb-2 drop-shadow-sm" />
              <span className="text-xs font-medium text-white">Change cover</span>
            </label>

            {/* Delete button */}
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={onImageRemove}
                  className="absolute top-2 right-2 z-20 rounded-full bg-black/60 p-1 text-white opacity-0 transition-all duration-200 hover:bg-black/80 focus:outline-none focus:ring-2 focus:ring-emerald-400 group-hover:opacity-100"
                  aria-label="Remove image"
                  disabled={uploading}
                >
                  <X className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Remove image</p>
              </TooltipContent>
            </Tooltip>
          </div>
        ) : (
          <div className="border-2 border-dashed border-neutral-300 rounded-lg p-6 text-center hover:border-emerald-500/70 hover:bg-emerald-50/20 transition-colors duration-200">
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
              className="flex flex-col items-center justify-center cursor-pointer hover:scale-105 transition-transform duration-200"
              role="button"
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