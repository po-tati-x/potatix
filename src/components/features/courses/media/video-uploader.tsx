"use client";

import { useState } from "react";
import MuxUploader from "@mux/mux-uploader-react";
import { ArrowUpCircle, AlertCircle, Loader2, Upload } from "lucide-react";
import { Button } from "@/components/ui/potatix/Button";

// Video uploader component
interface VideoUploaderProps {
  lessonId: string;
  onFileChange: (
    e: React.ChangeEvent<HTMLInputElement>,
    lessonId: string,
  ) => void;
  onDirectUploadComplete?: (lessonId: string) => void;
}

export function VideoUploader({ 
  lessonId, 
  onFileChange, 
  onDirectUploadComplete 
}: VideoUploaderProps) {
  const [isAdvancedUpload, setIsAdvancedUpload] = useState(false);
  const [uploadUrl, setUploadUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getUploadUrl = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/mux/upload-url", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ lessonId }),
      });

      if (!response.ok) {
        throw new Error("Failed to get upload URL");
      }

      const data = await response.json();
      setUploadUrl(data.url);
      setIsAdvancedUpload(true);
    } catch (err) {
      console.error("Error getting upload URL:", err);
      setError("Failed to initialize uploader. Try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  // Define a type for the Mux upload success event
  const handleUploadSuccess = (evt: CustomEvent) => {
    console.log("Upload success:", evt.detail);
    
    // Mark lesson as processing in the parent component
    if (onDirectUploadComplete) {
      onDirectUploadComplete(lessonId);
    }
  };

  // Advanced uploader
  if (isAdvancedUpload && uploadUrl) {
    return (
      <div className="border border-slate-200 rounded-md overflow-hidden">
        <div className="bg-slate-50 border-b border-slate-200 px-4 py-2">
          <h4 className="text-xs font-medium text-slate-700">
            Direct Upload
          </h4>
        </div>
        <div className="p-4">
          <MuxUploader
            endpoint={uploadUrl}
            onSuccess={handleUploadSuccess}
            className="mux-uploader"
          />
          <div className="mt-3 flex items-center justify-between">
            <p className="text-xs text-slate-500">
              Video will be processed automatically after upload
            </p>
            <button
              onClick={() => setIsAdvancedUpload(false)}
              className="text-xs text-slate-600 hover:text-slate-900 underline"
            >
              Switch to basic uploader
            </button>
          </div>
        </div>

        <style jsx global>{`
          .mux-uploader {
            --mux-uploader-background: #ffffff;
            --mux-uploader-drag-background: #f8fafc;
            --mux-uploader-border: 1px dashed #d1d5db;
            --mux-uploader-border-radius: 0.375rem;
            --mux-uploader-primary-color: #334155;
            width: 100%;
            min-height: 100px;
          }
        `}</style>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="border border-red-200 rounded-md p-4 bg-red-50">
        <div className="flex items-center">
          <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
          <div>
            <p className="text-xs font-medium text-red-700">Upload Error</p>
            <p className="text-xs text-red-600 mt-0.5">{error}</p>
          </div>
        </div>
        <Button
          type="outline"
          size="small"
          icon={<AlertCircle className="h-3.5 w-3.5" />}
          onClick={getUploadUrl}
          className="mt-3 bg-white"
        >
          Try Again
        </Button>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="border border-slate-200 rounded-md p-6 text-center">
        <Loader2 className="h-6 w-6 text-slate-400 animate-spin mx-auto mb-3" />
        <p className="text-xs text-slate-600">Initializing uploader...</p>
      </div>
    );
  }

  // Upload options
  return (
    <div className="space-y-3">
      {/* Direct uploader option */}
      <div className="border border-slate-200 rounded-md p-4 text-center">
        <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 mb-3">
          <ArrowUpCircle className="h-5 w-5 text-slate-600" />
        </div>
        <h4 className="text-sm font-medium text-slate-900 mb-1">
          Direct Upload
        </h4>
        <p className="text-xs text-slate-500 mb-3 max-w-md mx-auto">
          Recommended for large files. Supports resumable uploads.
        </p>
        <Button
          type="primary"
          size="small"
          icon={<ArrowUpCircle className="h-3.5 w-3.5" />}
          onClick={getUploadUrl}
        >
          Initialize Direct Upload
        </Button>
      </div>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="px-2 bg-white text-slate-500">or</span>
        </div>
      </div>

      {/* Basic file input */}
      <div className="border border-dashed border-slate-300 rounded-md p-5 text-center hover:border-slate-400 transition-colors">
        <input
          type="file"
          id={`video-upload-${lessonId}`}
          className="hidden"
          accept="video/*"
          onChange={(e) => onFileChange(e, lessonId)}
        />

        <label
          htmlFor={`video-upload-${lessonId}`}
          className="flex flex-col items-center justify-center cursor-pointer group"
        >
          <div className="h-10 w-10 bg-slate-100 rounded-full flex items-center justify-center mb-3 group-hover:bg-slate-200 transition-colors">
            <Upload className="h-5 w-5 text-slate-600" />
          </div>
          <p className="text-sm font-medium text-slate-700 mb-1">
            Upload video file
          </p>
          <p className="text-xs text-slate-500">MP4, MOV or WebM up to 2GB</p>
        </label>
      </div>
    </div>
  );
} 