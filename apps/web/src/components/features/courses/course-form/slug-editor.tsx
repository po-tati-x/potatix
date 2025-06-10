"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/potatix/Button";
import { FormField } from "@/components/ui/potatix/form-field";
import { Check, X, Edit, RefreshCcw, AlertCircle, Globe } from "lucide-react";
import { uniqueNamesGenerator, colors, animals, Config } from 'unique-names-generator';

interface SlugEditorProps {
  currentSlug: string;
  onUpdateSlug: (slug: string) => void;
}

export function SlugEditor({
  currentSlug,
  onUpdateSlug
}: SlugEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [slugValue, setSlugValue] = useState(currentSlug || "");
  const [originalSlug, setOriginalSlug] = useState(currentSlug || "");
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // When title or currentSlug changes, update the state
  useEffect(() => {
    if (currentSlug) {
      setOriginalSlug(currentSlug);
      setSlugValue(currentSlug);
    }
  }, [currentSlug]);
  
  // Focus input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);
  
  const handleEditStart = () => {
    setIsEditing(true);
    setError(null);
  };
  
  const handleCancel = () => {
    setIsEditing(false);
    setSlugValue(originalSlug);
    setError(null);
  };
  
  const handleSave = async () => {
    if (!slugValue.trim()) {
      setError("Slug cannot be empty");
      return;
    }
    
    // Basic validation for slug format
    if (!/^[a-z0-9-]+$/.test(slugValue)) {
      setError("Slug can only contain lowercase letters, numbers, and hyphens");
      return;
    }
    
    if (slugValue === originalSlug) {
      setIsEditing(false);
      return;
    }
    
    // We'll let the parent component handle the actual API call and duplication check
    try {
      await onUpdateSlug(slugValue);
      setIsEditing(false);
      setError(null);
    } catch (error) {
      setError("Failed to update slug");
      console.error("Slug update error:", error);
    }
  };
  
  const generateNewSlug = () => {
    // Configuration for unique name generator
    const nameConfig: Config = {
      dictionaries: [colors, animals],
      separator: '-',
      length: 2,
      style: 'lowerCase'
    };

    // Generate a new random slug using color-animal format
    const randomSlug = uniqueNamesGenerator(nameConfig);
    
    setSlugValue(randomSlug);
    setError(null);
  };

  return (
    <div className="border border-slate-200 rounded-md overflow-hidden bg-white">
      <div className="border-b border-slate-200 px-4 py-3 bg-slate-50 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Globe className="h-4 w-4 text-slate-600" />
          <h3 className="text-sm font-medium text-slate-900">Public URL</h3>
        </div>
        {!isEditing && (
          <Button 
            type="outline"
            size="small"
            iconLeft={<Edit className="h-3.5 w-3.5" />}
            onClick={handleEditStart}
          >
            Edit URL
          </Button>
        )}
      </div>

      <div className="p-4">
        {isEditing ? (
          <div className="space-y-4">
            <div className="flex flex-col space-y-1.5 w-full">
              <div className="flex items-center justify-between w-full">
                <div className="w-full">
                  <FormField label="Course Subdomain">
                    <div className="w-full relative">
                      <input
                        ref={inputRef}
                        type="text"
                        value={slugValue}
                        onChange={(e) => setSlugValue(e.target.value.toLowerCase())}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm pr-[110px] font-mono ${
                          error ? "border-red-300" : "border-slate-300"
                        }`}
                        placeholder="my-course-name"
                      />
                      <div className="absolute right-0 top-0 bottom-0 flex items-center px-3 text-slate-500 text-sm whitespace-nowrap pointer-events-none border-l border-slate-200 bg-slate-50 rounded-r-md">
                        .potatix.com
                      </div>
                    </div>
                  </FormField>
                </div>
              </div>
              
              {error && (
                <div className="flex items-center gap-1.5 text-red-600 text-xs">
                  <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-3 flex-wrap">
              <Button
                type="primary"
                size="small"
                iconLeft={<Check className="h-3.5 w-3.5" />}
                onClick={handleSave}
              >
                Save
              </Button>
              
              <Button
                type="outline"
                size="small"
                iconLeft={<X className="h-3.5 w-3.5" />}
                onClick={handleCancel}
              >
                Cancel
              </Button>
              
              <Button
                type="outline"
                size="small"
                iconLeft={<RefreshCcw className="h-3.5 w-3.5" />}
                onClick={generateNewSlug}
                title="Generate color-animal combination"
              >
                Generate
              </Button>
            </div>
            
            <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-md">
              <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0" />
              <p className="text-xs text-amber-700">
                Changing this URL will break any existing links to your course.
              </p>
            </div>
          </div>
        ) : (
          currentSlug ? (
            <div className="bg-slate-50 border border-slate-200 rounded-md px-3 py-2.5 flex items-center gap-2 overflow-hidden">
              <div className="flex-grow min-w-0">
                <div className="flex items-center gap-0">
                  <span className="text-sm text-emerald-600 font-medium font-mono truncate">{currentSlug}</span>
                  <span className="text-sm text-slate-500 whitespace-nowrap">.potatix.com</span>
                </div>
                <div className="text-xs text-slate-500 mt-0.5">Your public course URL</div>
              </div>
              <a 
                href={`https://${currentSlug}.potatix.com`} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-emerald-600 hover:text-emerald-700 p-1 rounded-md hover:bg-emerald-50 transition-colors"
                title="Visit site"
              >
                <Globe className="h-4 w-4" />
              </a>
            </div>
          ) : (
            <div className="bg-slate-50 border border-slate-200 border-dashed rounded-md px-3 py-3 text-center">
              <div className="text-slate-500 text-sm mb-1">No custom URL set</div>
              <div className="text-xs text-slate-400">Click &quot;Edit URL&quot; to create one</div>
            </div>
          )
        )}
      </div>
    </div>
  );
} 