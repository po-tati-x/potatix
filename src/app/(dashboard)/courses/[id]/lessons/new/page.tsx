'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { coursesApi } from '@/lib/utils/api-client';

export default function NewLessonPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = Array.isArray(params.id) ? params.id[0] : params.id;
  
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    videoId: '',
    order: 1,
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: name === 'order' ? parseInt(value) || 1 : value 
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!courseId) return;
    
    setSaving(true);
    setError('');
    
    try {
      await coursesApi.lessons.create(courseId, formData);
      router.push(`/courses/${courseId}`);
    } catch (err) {
      console.error('Failed to create lesson:', err);
      setError(err instanceof Error ? err.message : 'Failed to create lesson');
      setSaving(false);
    }
  };
  
  return (
    <div className="min-h-full w-full py-6 px-6">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link href={`/courses/${courseId}`} className="text-neutral-500 hover:text-neutral-700">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-2xl font-semibold text-neutral-900">Add New Lesson</h1>
          </div>
        </div>
        
        {/* Error message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}
        
        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6 bg-white border border-neutral-200 rounded-lg p-6">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-neutral-700 mb-1">
              Lesson Title
            </label>
            <input
              id="title"
              name="title"
              type="text"
              required
              value={formData.title}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Enter lesson title"
            />
          </div>
          
          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-neutral-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              value={formData.description}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Describe what students will learn in this lesson"
            ></textarea>
          </div>
          
          {/* Video ID */}
          <div>
            <label htmlFor="videoId" className="block text-sm font-medium text-neutral-700 mb-1">
              Video ID (optional)
            </label>
            <div className="relative">
              <input
                id="videoId"
                name="videoId"
                type="text"
                value={formData.videoId}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Enter video ID"
              />
              <div className="mt-1 text-xs text-neutral-500">
                You can add a video later or use the Mux integration
              </div>
            </div>
          </div>
          
          {/* Order */}
          <div>
            <label htmlFor="order" className="block text-sm font-medium text-neutral-700 mb-1">
              Order
            </label>
            <input
              id="order"
              name="order"
              type="number"
              min="1"
              required
              value={formData.order}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="1"
            />
            <div className="mt-1 text-xs text-neutral-500">
              The order in which this lesson appears in the course
            </div>
          </div>
          
          {/* Submit button */}
          <div className="flex justify-end pt-4">
            <Link href={`/courses/${courseId}`}>
              <button 
                type="button" 
                className="px-4 py-2 border border-neutral-300 text-neutral-700 rounded-md hover:bg-neutral-50 mr-3"
                disabled={saving}
              >
                Cancel
              </button>
            </Link>
            <button
              type="submit"
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={saving}
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Create Lesson</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 