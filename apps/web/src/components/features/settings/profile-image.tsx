'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { Camera, Loader2, X, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

export interface ProfileImageProps {
  image?: string | null;
  uploading?: boolean;
  onImageChange?: (file: File) => void;
  onImageRemove?: () => void;
}

export function ProfileImage({ image, uploading = false, onImageChange = () => {}, onImageRemove = () => {} }: ProfileImageProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [loadError, setLoadError] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  function resetInput() {
    if (inputRef.current) inputRef.current.value = '';
  }

  function handleFile(file: File) {
    try {
      if (file.size > 5 * 1024 * 1024) throw new Error('File too large (max 5 MB)');
      if (!file.type.startsWith('image/')) throw new Error('Only image files allowed');

      onImageChange(file);
      setLocalError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to upload image';
      toast.error(message);
      setLocalError(message);
    } finally {
      resetInput();
    }
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  function handleImageError() {
    setLoadError(true);
    toast.error('Failed to load profile image');
  }

  return (
    <div className="flex flex-col items-center justify-center mb-6">
      <div className="relative size-24">
        <div className="relative group size-full overflow-hidden rounded-full">
          {/* Upload spinner overlay */}
          {uploading && (
            <div className="absolute inset-0 z-30 flex items-center justify-center rounded-full bg-black/60 backdrop-blur-sm">
              <Loader2 className="h-8 w-8 animate-spin text-white" />
            </div>
          )}

          {/* Avatar or placeholder */}
          {image && !loadError ? (
            <Image
              src={image}
              alt="Profile image"
              fill
              sizes="(max-width: 768px) 100vw, 96px"
              className="rounded-full object-cover transition-transform duration-300 ease-out group-hover:scale-105"
              priority
              onError={handleImageError}
            />
          ) : (
            <label
              htmlFor="profile-image-input"
              className="flex items-center justify-center size-full rounded-full border-2 border-dashed border-neutral-300 text-neutral-400 cursor-pointer hover:border-emerald-500/70 hover:bg-emerald-50/20 transition-colors duration-200"
            >
              {loadError ? (
                <AlertCircle className="h-10 w-10 text-red-400" />
              ) : (
                <Camera className="h-8 w-8" />
              )}
            </label>
          )}

          {/* Hidden input */}
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleInputChange}
            disabled={uploading}
            id="profile-image-input"
          />

          {/* Overlay to change photo when image present */}
          {image && !loadError && (
            <label
              htmlFor="profile-image-input"
              className="absolute inset-0 z-10 flex flex-col items-center justify-center cursor-pointer rounded-full bg-black/40 opacity-0 backdrop-blur-sm transition-opacity duration-200 group-hover:opacity-100"
            >
              <Camera className="h-6 w-6 text-white mb-0.5" />
              <span className="text-[10px] font-medium text-white">Change</span>
            </label>
          )}
        </div>

        {/* Delete button when image present */}
        {image && !uploading && (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={onImageRemove}
                className="absolute top-1 right-1 z-20 rounded-full bg-black/70 p-1 text-white transition-colors duration-200 hover:bg-black/90 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                aria-label="Remove image"
              >
                <X className="h-4 w-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Remove image</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>

      {(!image || loadError) && (
        <p className="mt-2 text-xs text-neutral-500 text-center">JPEG, PNG, or WebP (max 5MB)</p>
      )}

      {localError && <p className="mt-2 text-xs text-red-500 text-center">{localError}</p>}
    </div>
  );
} 