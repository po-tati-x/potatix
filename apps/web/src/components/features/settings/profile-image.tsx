'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { Camera, Loader2, Trash2, UserCircle, AlertCircle } from 'lucide-react';
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
  
  const handleClick = () => {
    fileInputRef.current?.click();
  };
  
  const handleImageError = () => {
    console.error('Image failed to load:', image);
    setImgError(true);
    toast.error('Failed to load profile image');
  };

  return (
    <div className="flex flex-col items-center justify-center mb-6">
      <div className="relative group">
        {isUploading ? (
          <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
          </div>
        ) : image && !imgError ? (
          <div 
            className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-slate-200 cursor-pointer"
            onClick={handleClick}
          >
            <Image
              src={image}
              alt="Profile"
              fill
              sizes="(max-width: 768px) 100vw, 96px"
              className="object-cover"
              priority
              onError={handleImageError}
            />
            <div className="absolute inset-0 bg-transparent flex items-center justify-center group-hover:bg-black group-hover:bg-opacity-30 transition-all duration-200">
              <Camera className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            </div>
          </div>
        ) : (
          <div 
            className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center cursor-pointer hover:bg-slate-200 transition-colors duration-200"
            onClick={handleClick}
          >
            {imgError ? (
              <AlertCircle className="h-10 w-10 text-red-400" />
            ) : (
              <UserCircle className="h-16 w-16 text-slate-400" />
            )}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <Camera className="h-6 w-6 text-slate-600" />
            </div>
          </div>
        )}
        
        <input 
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          disabled={isUploading}
        />
        
        {image && !imgError && !isUploading && (
          <button
            type="button"
            onClick={onDelete}
            disabled={isUploading}
            className="absolute -bottom-1 -right-1 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>
      
      {localError && (
        <p className="text-xs text-red-500 mt-2">{localError}</p>
      )}
    </div>
  );
} 