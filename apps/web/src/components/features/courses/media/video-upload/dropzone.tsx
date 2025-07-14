"use client";

import { useState, useRef } from "react";
import { Upload, Film as FilmIcon } from "lucide-react";
import { cn } from "@/lib/shared/utils/cn";

interface DropzoneProps {
  selectedFile?: File;
  onSelect: (file: File) => void;
  formatBytes: (bytes: number) => string;
  disabled?: boolean;
}

export function UploadDropzone({ selectedFile, onSelect, formatBytes, disabled = false }: DropzoneProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) onSelect(file);
  };

  const baseStyles = "relative rounded-md border-2 border-dashed p-6 text-center transition-colors max-w-lg mx-auto";
  const interactiveStyles = "cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500";
  const disabledStyles = "opacity-60 cursor-not-allowed pointer-events-none";

  return (
    <div
      className={cn(
        baseStyles,
        disabled ? disabledStyles : interactiveStyles,
        isDragActive
          ? "border-emerald-500 bg-emerald-50/20"
          : (disabled
            ? "border-slate-300 dark:border-slate-600"
            : "border-slate-300 hover:border-emerald-500 dark:border-slate-600 dark:hover:border-emerald-500"),
      )}
      tabIndex={0}
      role="button"
      aria-label="Select video file"
      onKeyDown={(e) => {
        if (disabled) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          fileInputRef.current?.click();
        }
      }}
      onDragOver={(e) => {
        if (disabled) return;
        e.preventDefault();
        setIsDragActive(true);
      }}
      onDragLeave={() => setIsDragActive(false)}
      onDrop={(e) => {
        if (disabled) return;
        handleDrop(e);
      }}
      onClick={() => !disabled && fileInputRef.current?.click()}
      aria-disabled={disabled}
    >
      {selectedFile ? (
        <div className="flex flex-col items-center gap-1">
          <FilmIcon className="h-6 w-6 text-emerald-600" />
          <p className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate max-w-full">
            {selectedFile.name}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {formatBytes(selectedFile.size)}
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-1 text-slate-500 dark:text-slate-400">
          <Upload className="h-6 w-6" />
          <span className="text-xs">Drop file here or click to browse</span>
        </div>
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onSelect(file);
        }}
        disabled={disabled}
      />
    </div>
  );
} 