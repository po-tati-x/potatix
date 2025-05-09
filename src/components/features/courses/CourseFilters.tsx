'use client';

interface CourseFiltersProps {
  currentFilter: string;
  onFilterChange: (filter: string) => void;
}

/**
 * Filter buttons for course list
 */
export function CourseFilters({ currentFilter, onFilterChange }: CourseFiltersProps) {
  const filters = [
    { id: 'all', label: 'All Courses' },
    { id: 'published', label: 'Published' },
    { id: 'draft', label: 'Drafts' }
  ];

  return (
    <div className="flex items-center space-x-2">
      {filters.map(filter => (
        <button
          key={filter.id}
          onClick={() => onFilterChange(filter.id)}
          className={`text-sm px-3 py-1 rounded-md transition-colors ${
            currentFilter === filter.id
              ? 'bg-neutral-100 text-neutral-900 font-medium'
              : 'text-neutral-500 hover:bg-neutral-50'
          }`}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
} 