'use client';

import { useState, useMemo, useCallback } from 'react';
import { Search, Download, Bookmark, FileText, Code, Video, Link, FileIcon } from 'lucide-react';
import { cn } from '@/lib/shared/utils/cn';
import type { Resource } from './types';

interface ResourceCenterProps {
  resources: Resource[];
  onResourceSave: (resourceId: string) => void;
}

const resourceTypeConfig = {
  pdf: { icon: FileText, label: 'PDF', color: 'text-red-600 bg-red-50 border-red-200' },
  code: { icon: Code, label: 'Code', color: 'text-blue-600 bg-blue-50 border-blue-200' },
  cheatsheet: {
    icon: FileText,
    label: 'Cheatsheet',
    color: 'text-purple-600 bg-purple-50 border-purple-200',
  },
  video: {
    icon: Video,
    label: 'Video',
    color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
  },
  link: { icon: Link, label: 'Link', color: 'text-slate-600 bg-slate-50 border-slate-200' },
};

function formatFileSize(bytes?: number): string {
  if (!bytes) return '';
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
}

interface ResourceCardProps {
  resource: Resource;
  onSave: () => void;
}

function ResourceCard({ resource, onSave }: ResourceCardProps) {
  const config = resourceTypeConfig[resource.type];
  const Icon = config?.icon || FileIcon;

  return (
    <div className="group relative overflow-hidden rounded-lg border border-slate-200 bg-white p-4 transition-all hover:border-slate-300">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div
            className={cn('rounded-lg border p-2', config?.color || 'bg-slate-50 text-slate-600')}
          >
            <Icon className="h-5 w-5" />
          </div>
          <div className="flex-grow">
            <h4 className="line-clamp-1 font-medium text-slate-900">{resource.title}</h4>
            {resource.lessonTitle && (
              <p className="mt-0.5 text-xs text-slate-500">From: {resource.lessonTitle}</p>
            )}
            <div className="mt-1 flex items-center gap-3 text-xs text-slate-500">
              {typeof resource.size === 'number' && resource.size > 0 && (
                <span>{formatFileSize(resource.size)}</span>
              )}
              {resource.downloadedAt && (
                <>
                  <span className="text-slate-300">•</span>
                  <span className="flex items-center gap-1">
                    <Download className="h-3 w-3" />
                    Downloaded
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        <button
          onClick={e => {
            e.preventDefault();
            onSave();
          }}
          className={cn(
            'rounded-md p-1.5 transition-all',
            resource.savedForLater
              ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
              : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600',
          )}
          aria-label={resource.savedForLater ? 'Remove from saved' : 'Save for later'}
        >
          <Bookmark className={cn('h-4 w-4', resource.savedForLater && 'fill-current')} />
        </button>
      </div>

      <div className="mt-3 flex gap-2">
        <a
          href={resource.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 rounded-md border border-slate-200 bg-slate-50 px-3 py-1.5 text-center text-sm font-medium text-slate-700 transition-all hover:border-slate-300 hover:bg-slate-100"
        >
          {resource.type === 'video' ? 'Watch' : (resource.type === 'link' ? 'Visit' : 'Open')}
        </a>
        {resource.type !== 'link' && resource.type !== 'video' && (
          <a
            href={resource.url}
            download
            className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-700 transition-all hover:border-emerald-300 hover:bg-emerald-100"
          >
            Download
          </a>
        )}
      </div>
    </div>
  );
}

export function ResourceCenter({ resources, onResourceSave }: ResourceCenterProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<Set<Resource['type']>>(new Set());

  const toggleType = useCallback((type: Resource['type']) => {
    setSelectedTypes(prev => {
      const next = new Set(prev);
      if (next.has(type)) {
        next.delete(type);
      } else {
        next.add(type);
      }
      return next;
    });
  }, []);

  const filteredResources = useMemo(() => {
    return resources.filter(resource => {
      const matchesSearch =
        !searchQuery ||
        resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        resource.lessonTitle?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesType = selectedTypes.size === 0 || selectedTypes.has(resource.type);

      return matchesSearch && matchesType;
    });
  }, [resources, searchQuery, selectedTypes]);

  const savedCount = resources.filter(r => r.savedForLater).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium uppercase text-slate-500">Resources</h3>
        {savedCount > 0 && <span className="text-sm text-slate-600">{savedCount} saved</span>}
      </div>

      {/* Search and filters */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search resources..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full rounded-md border border-slate-200 bg-white px-9 py-2 text-sm placeholder-slate-400 transition-all focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        {/* Type filters */}
        <div className="flex flex-wrap gap-2">
          {Object.entries(resourceTypeConfig).map(([type, config]) => {
            const Icon = config.icon;
            const isSelected = selectedTypes.has(type as Resource['type']);

            return (
              <button
                key={type}
                onClick={() => toggleType(type as Resource['type'])}
                className={cn(
                  'flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-all',
                  isSelected
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300',
                )}
              >
                <Icon className="h-3 w-3" />
                {config.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Resources grid */}
      {filteredResources.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
          {filteredResources.map(resource => (
            <ResourceCard
              key={resource.id}
              resource={resource}
              onSave={() => onResourceSave(resource.id)}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50/50 p-8 text-center">
          <FileIcon className="mx-auto h-8 w-8 text-slate-400" />
          <p className="mt-2 text-sm text-slate-600">
            {searchQuery || selectedTypes.size > 0
              ? 'No resources match your filters'
              : 'No resources available yet'}
          </p>
          {(searchQuery || selectedTypes.size > 0) && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedTypes(new Set());
              }}
              className="mt-2 text-xs text-emerald-600 hover:text-emerald-700"
            >
              Clear filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}
