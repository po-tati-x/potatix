"use client";

import { useState, useEffect } from "react";
import MuxUploader from "@mux/mux-uploader-react";
import { AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/potatix/Button";

// Video uploader component
interface VideoUploaderProps {
  lessonId: string;
  onDirectUploadComplete?: (lessonId: string) => void;
  onFileChange?: (e: React.ChangeEvent<HTMLInputElement>, lessonId: string) => void;
}

export function VideoUploader({ 
  lessonId, 
  onDirectUploadComplete,
  onFileChange 
}: VideoUploaderProps) {
  const [uploadUrl, setUploadUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize the uploader on component mount
  useEffect(() => {
    // Define getUploadUrl inside useEffect to avoid dependency issues
    async function getUploadUrl() {
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
      } catch (err) {
        console.error("Error getting upload URL:", err);
        setError("Failed to initialize uploader. Try again later.");
      } finally {
        setIsLoading(false);
      }
    }

    // Call the function
    getUploadUrl();
  }, [lessonId]); // Only re-run if lessonId changes

  // Define a type for the Mux upload success event
  const handleUploadSuccess = (evt: CustomEvent) => {
    console.log("Upload success:", evt.detail);
    
    // Mark lesson as processing in the parent component
    if (onDirectUploadComplete) {
      onDirectUploadComplete(lessonId);
    }
  };

  // Function to retry upload URL fetch when needed
  const retryGetUploadUrl = async () => {
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
    } catch (err) {
      console.error("Error getting upload URL:", err);
      setError("Failed to initialize uploader. Try again later.");
    } finally {
      setIsLoading(false);
    }
  };

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
          onClick={retryGetUploadUrl}
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

  // Mux Uploader (always shown when ready)
  if (uploadUrl) {
    return (
      <div className="border border-slate-200 rounded-md overflow-hidden">
        <div className="bg-slate-50 border-b border-slate-200 px-4 py-2">
          <h4 className="text-xs font-medium text-slate-700">
            Upload Video
          </h4>
        </div>
        <div className="p-4">
          <MuxUploader
            endpoint={uploadUrl}
            onSuccess={handleUploadSuccess}
            className="mux-uploader"
          />
          <div className="mt-3">
            <p className="text-xs text-slate-500">
              Drag and drop or click to upload. Your video will be processed automatically after upload.
            </p>
            <div className="mt-2 flex items-center gap-1">
              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
              <p className="text-xs text-emerald-700 font-medium">
                English captions will be automatically generated
              </p>
            </div>
            
            {onFileChange && (
              <div className="mt-4 pt-4 border-t border-slate-100">
                <p className="text-xs font-medium text-slate-700 mb-2">Or select a file from your device:</p>
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => onFileChange(e, lessonId)}
                  className="text-xs w-full"
                />
              </div>
            )}
          </div>
        </div>

        <style jsx global>{`
          .mux-uploader {
            --mux-uploader-background: #ffffff;
            --mux-uploader-drag-background: #f8fafc;
            --mux-uploader-border: 1px dashed #d1d5db;
            --mux-uploader-border-radius: 0.375rem;
            --mux-uploader-primary-color: #10b981;
            width: 100%;
            min-height: 150px;
          }
        `}</style>
      </div>
    );
  }

  // Fallback in case uploadUrl is null but no error/loading
  return (
    <div className="border border-slate-200 rounded-md p-6 text-center">
      <AlertCircle className="h-6 w-6 text-slate-400 mx-auto mb-3" />
      <p className="text-xs text-slate-600">Something went wrong. Please try again.</p>
      <Button
        type="outline"
        size="small"
        onClick={retryGetUploadUrl}
        className="mt-3"
      >
        Retry
      </Button>
      
      {onFileChange && (
        <div className="mt-4 pt-4 border-t border-slate-200 text-left">
          <p className="text-xs font-medium text-slate-700 mb-2">Or select a file from your device:</p>
          <input
            type="file"
            accept="video/*"
            onChange={(e) => onFileChange(e, lessonId)}
            className="text-xs w-full"
          />
        </div>
      )}
    </div>
  );
}