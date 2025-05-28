"use client";

import { useState } from "react";
import { CourseImageUploader } from "./CourseImageUploader";

interface CourseFormProps {
  title: string;
  description: string;
  price: string;
  imageUrl: string | null;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onPriceChange: (value: string) => void;
  onImageUploaded: (url: string) => void;
  onImageRemoved: () => void;
}

export function CourseForm({
  title,
  description,
  price,
  imageUrl,
  onTitleChange,
  onDescriptionChange,
  onPriceChange,
  onImageUploaded,
  onImageRemoved,
}: CourseFormProps) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-white overflow-hidden">
      <div className="border-b border-neutral-200 px-6 py-4">
        <h3 className="text-md font-medium text-neutral-900">Course Details</h3>
      </div>
      <div className="p-6 space-y-6">
        <div className="space-y-6">
          {/* Course Image Upload */}
          <CourseImageUploader
            initialUrl={imageUrl || undefined}
            onImageUploaded={onImageUploaded}
            onImageRemoved={onImageRemoved}
          />

          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-neutral-700 mb-1"
            >
              Course Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              placeholder="e.g. Advanced TypeScript for React Developers"
              className="w-full px-3 py-2 border border-neutral-300 rounded-md"
              required
            />
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-neutral-700 mb-1"
            >
              Description (Optional)123
            </label>
            <textarea
              id="description"
              name="description"
              value={description}
              onChange={(e) => onDescriptionChange(e.target.value)}
              rows={3}
              placeholder="Briefly describe what students will learn"
              className="w-full px-3 py-2 border border-neutral-300 rounded-md"
            />
          </div>

          <div>
            <label
              htmlFor="price"
              className="block text-sm font-medium text-neutral-700 mb-1"
            >
              Price ($)
            </label>
            <input
              type="number"
              id="price"
              name="price"
              value={price}
              onChange={(e) => onPriceChange(e.target.value)}
              min="0"
              step="0.01"
              placeholder="49.99"
              className="w-40 px-3 py-2 border border-neutral-300 rounded-md"
              required
            />
            <p className="mt-1 text-xs text-neutral-500">
              You'll receive 95% of the revenue (Potatix fee: 5%)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
