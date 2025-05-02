'use client';

import { useState, useMemo } from 'react';
import { CourseType, SortField, SortDirection } from './types';
import { CourseRow } from './course-row';
import { ChevronUp, ChevronDown, Search } from 'lucide-react';

// Helper to format dates consistently
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(date);
};

interface CourseTableProps {
  courses: CourseType[];
  searchTerm: string;
  statusFilter: 'all' | 'published' | 'draft';
}

export function CourseTable({ courses, searchTerm, statusFilter }: CourseTableProps) {
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>('updatedAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const handleToggleSelection = (id: string) => {
    setSelectedRowId(selectedRowId === id ? null : id);
  };

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const filteredAndSortedCourses = useMemo(() => {
    // First apply search filter
    let filtered = courses.filter(course => 
      course.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    // Then apply status filter
    if (statusFilter === 'published') {
      filtered = filtered.filter(course => course.published);
    } else if (statusFilter === 'draft') {
      filtered = filtered.filter(course => !course.published);
    }
    
    // Then sort
    return filtered.sort((a, b) => {
      let compareA = a[sortField];
      let compareB = b[sortField];
      
      // Special case for title field - case insensitive string comparison
      if (sortField === 'title') {
        compareA = (compareA as string).toLowerCase();
        compareB = (compareB as string).toLowerCase();
      }
      
      // For numerical fields, compare as numbers
      if (typeof compareA === 'number' && typeof compareB === 'number') {
        return sortDirection === 'asc' 
          ? compareA - compareB 
          : compareB - compareA;
      }
      
      // For date fields, convert to Date objects and compare
      if (sortField === 'createdAt' || sortField === 'updatedAt') {
        const dateA = new Date(compareA as string).getTime();
        const dateB = new Date(compareB as string).getTime();
        return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
      }
      
      // For string fields
      return sortDirection === 'asc'
        ? (compareA as string).localeCompare(compareB as string)
        : (compareB as string).localeCompare(compareA as string);
    });
  }, [courses, searchTerm, statusFilter, sortField, sortDirection]);

  // Render a sort indicator based on current sort state
  const SortIndicator = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' 
      ? <ChevronUp size={14} className="text-blue-500 ml-1" />
      : <ChevronDown size={14} className="text-blue-500 ml-1" />;
  };

  return (
    <div className="bg-white rounded-md overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        {filteredAndSortedCourses.length === 0 ? (
          <div className="py-12 px-4 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-4">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <p className="text-sm font-medium text-gray-700">
              {searchTerm ? 'No courses match your search' : 'No courses found'}
            </p>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm ? 'Try different search terms or filters' : 'Create your first course to get started'}
            </p>
          </div>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-50">
                <th className="w-10 p-4"></th>
                <th 
                  className="p-4 text-left text-xs font-semibold text-gray-600 tracking-wider cursor-pointer" 
                  onClick={() => handleSort('title')}
                >
                  <div className="flex items-center">
                    <span>Course</span>
                    <SortIndicator field="title" />
                  </div>
                </th>
                <th 
                  className="p-4 text-left text-xs font-semibold text-gray-600 tracking-wider cursor-pointer" 
                  onClick={() => handleSort('category')}
                >
                  <div className="flex items-center">
                    <span>Category</span>
                    <SortIndicator field="category" />
                  </div>
                </th>
                <th 
                  className="p-4 text-left text-xs font-semibold text-gray-600 tracking-wider cursor-pointer" 
                  onClick={() => handleSort('level')}
                >
                  <div className="flex items-center">
                    <span>Level</span>
                    <SortIndicator field="level" />
                  </div>
                </th>
                <th 
                  className="p-4 text-left text-xs font-semibold text-gray-600 tracking-wider cursor-pointer" 
                  onClick={() => handleSort('published')}
                >
                  <div className="flex items-center">
                    <span>Status</span>
                    <SortIndicator field="published" />
                  </div>
                </th>
                <th 
                  className="p-4 text-left text-xs font-semibold text-gray-600 tracking-wider cursor-pointer" 
                  onClick={() => handleSort('students')}
                >
                  <div className="flex items-center">
                    <span>Students</span>
                    <SortIndicator field="students" />
                  </div>
                </th>
                <th 
                  className="p-4 text-left text-xs font-semibold text-gray-600 tracking-wider cursor-pointer" 
                  onClick={() => handleSort('rating')}
                >
                  <div className="flex items-center">
                    <span>Rating</span>
                    <SortIndicator field="rating" />
                  </div>
                </th>
                <th 
                  className="p-4 text-left text-xs font-semibold text-gray-600 tracking-wider cursor-pointer" 
                  onClick={() => handleSort('price')}
                >
                  <div className="flex items-center">
                    <span>Price</span>
                    <SortIndicator field="price" />
                  </div>
                </th>
                <th 
                  className="p-4 text-left text-xs font-semibold text-gray-600 tracking-wider cursor-pointer" 
                  onClick={() => handleSort('updatedAt')}
                >
                  <div className="flex items-center">
                    <span>Updated</span>
                    <SortIndicator field="updatedAt" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredAndSortedCourses.map(course => (
                <CourseRow
                  key={course.id}
                  course={course}
                  isSelected={selectedRowId === course.id}
                  onSelect={handleToggleSelection}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
} 