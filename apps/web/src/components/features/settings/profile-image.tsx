'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import {
  Camera,
  Loader2,
  X,
  UserCircle,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';

export type ProfileImageProps = {
  image?: string | null;
  isUploading: boolean;
  onUpload: (file: File) => void;
  onDelete: () => void;
};

export function ProfileImage({ image, isUploading, onUpload, onDelete }: ProfileImageProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const [imgError, setImgError] = useState<boolean>(false);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setLocalError(null);
    setImgError(false);
    
    try {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('File too large. Max size: 5MB');
      }
      
      // Check file type
      if (!file.type.startsWith('image/')) {
        throw new Error('Only image files are allowed');
      }
      
      onUpload(file);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload image';
      setLocalError(errorMessage);
      toast.error(errorMessage);
    } finally {
      // Reset the input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };
  
  const handleImageError = () => {
    console.error('Image failed to load:', image);
    setImgError(true);
    toast.error('Failed to load profile image');
  };

  return (
    <div className="flex flex-col items-center justify-center mb-6">
      <div className="relative group size-24">
        {/* Spinner overlay while uploading */}
        {isUploading && (
          <div className="absolute inset-0 z-30 flex items-center justify-center rounded-full bg-black/60 backdrop-blur-sm">
            <Loader2 className="h-8 w-8 animate-spin text-white" />
          </div>
        )}

        {/* Avatar present */}
        {image && !imgError ? (
          <>
            <Image
              src={image}
              alt="Profile"
              fill
              sizes="(max-width: 768px) 100vw, 96px"
              className="rounded-full object-cover transition-transform duration-300 ease-out group-hover:scale-105"
              priority
              onError={handleImageError}
            />

            {/* Overlay label to change photo */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              disabled={isUploading}
              id="profile-image-input"
            />

            <label
              htmlFor="profile-image-input"
              className="absolute inset-0 z-10 flex flex-col items-center justify-center cursor-pointer rounded-full bg-black/40 opacity-0 backdrop-blur-sm transition-opacity duration-200 group-hover:opacity-100"
            >
              <Camera className="h-6 w-6 text-white mb-0.5" />
              <span className="text-[10px] font-medium text-white">Change</span>
            </label>

            {/* Delete button */}
            <button
              type="button"
              onClick={onDelete}
              disabled={isUploading}
              aria-label="Remove image"
              className="absolute -bottom-1 -right-1 z-20 rounded-full bg-black/60 p-1 text-white opacity-0 transition-all duration-200 hover:bg-black/80 focus:outline-none focus:ring-2 focus:ring-emerald-400 group-hover:opacity-100"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Remove image</span>
            </button>
          </>
        ) : (
          /* Placeholder avatar */
          <>
            <div className="flex size-full items-center justify-center rounded-full bg-slate-100 text-slate-400">
              {imgError ? (
                <AlertCircle className="h-10 w-10 text-red-400" />
              ) : (
                <UserCircle className="h-16 w-16" />
              )}
            </div>

            {/* Upload overlay */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              disabled={isUploading}
              id="profile-image-input"
            />
            <label
              htmlFor="profile-image-input"
              className="absolute inset-0 z-10 flex flex-col items-center justify-center cursor-pointer rounded-full bg-black/0 hover:bg-black/10 transition-colors"
            >
              <Camera className="h-6 w-6 text-slate-600" />
            </label>
          </>
        )}
      </div>

      {localError && <p className="mt-2 text-xs text-red-500">{localError}</p>}
    </div>
  );
} 