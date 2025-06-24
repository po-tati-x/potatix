'use client';

import { useState, useRef } from 'react';
import { X, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';
import { useUploadCourseImage } from '@/lib/client/hooks/use-courses';

interface CourseImageUploaderProps {
  initialUrl?: string;
  courseId: string;
  onImageUploaded: (url: string) => void;
  onImageRemoved: () => void;
}

export function CourseImageUploader({
  initialUrl,
  courseId,
  onImageUploaded,
  onImageRemoved,
}: CourseImageUploaderProps) {
  const [imagePreview, setImagePreview] = useState<string | null>(initialUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Use React Query for image uploads
  const { mutate: uploadImage, isPending: imageUploading } = useUploadCourseImage(courseId);

  // Handle image upload
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (JPEG, PNG, WebP)');
      return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
    
    // Create FormData
    const formData = new FormData();
    formData.append('file', file);
    
    // Upload image using React Query mutation
    uploadImage(formData, {
      onSuccess: (result) => {
        onImageUploaded(result.imageUrl);
      },
      onError: (error) => {
        console.error('Failed to upload image:', error);
        alert('Failed to upload image. Please try again.');
        setImagePreview(null);
      }
    });
  };
  
  // Remove image
  const removeImage = () => {
    setImagePreview(null);
    onImageRemoved();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-neutral-700 mb-1">
        Cover Image
      </label>
      {!imagePreview ? (
        <div className="border-2 border-dashed border-neutral-300 rounded-lg p-6 text-center">
          <input
            type="file"
            id="cover-image"
            className="hidden"
            ref={fileInputRef}
            accept="image/*"
            onChange={handleImageChange}
          />
          
          <label
            htmlFor="cover-image"
            className="flex flex-col items-center justify-center cursor-pointer"
          >
            <ImageIcon className="h-10 w-10 text-neutral-400 mb-2" />
            <p className="text-sm font-medium text-neutral-700">
              Upload course cover image
            </p>
            <p className="text-xs text-neutral-500 mt-1">
              JPEG, PNG, or WebP (max 5MB)
            </p>
          </label>
        </div>
      ) : (
        <div className="border border-neutral-200 rounded-lg overflow-hidden">
          <div className="relative aspect-video">
            <Image
              src={imagePreview}
              alt="Course cover preview"
              className="object-cover"
              fill
              sizes="(max-width: 768px) 100vw, 600px"
              priority
            />
            {imageUploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                <div className="animate-spin rounded-full h-10 w-10 border-4 border-white border-opacity-30 border-t-white"></div>
              </div>
            )}
            <button
              type="button"
              onClick={removeImage}
              className="absolute top-2 right-2 p-1 bg-black bg-opacity-60 text-white rounded-full hover:bg-opacity-80"
              disabled={imageUploading}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 