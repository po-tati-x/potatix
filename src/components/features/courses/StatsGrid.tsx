'use client';

import { Course } from './types';
import { formatCurrency } from './utils';
import { StatCard } from './StatCard';
import { BarChart, Users2, DollarSign, Star } from 'lucide-react';

interface StatsGridProps {
  courses: Course[];
}

/**
 * Grid component for displaying course statistics
 */
export function StatsGrid({ courses }: StatsGridProps) {
  const totalCourses = courses.length;
  const totalStudents = courses.reduce((acc, course) => acc + course.students, 0);
  const totalRevenue = courses.reduce((acc, course) => acc + course.revenue, 0);
  
  let avgRating = 0;
  const coursesWithRatings = courses.filter(course => course.rating > 0);
  
  if (coursesWithRatings.length > 0) {
    const totalRating = coursesWithRatings.reduce((acc, course) => acc + course.rating, 0);
    avgRating = totalRating / coursesWithRatings.length;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard 
        title="Total Courses" 
        value={totalCourses} 
        icon={<BarChart className="h-4 w-4 text-blue-600" />} 
        color="blue" 
      />
      <StatCard 
        title="Total Students" 
        value={totalStudents} 
        icon={<Users2 className="h-4 w-4 text-emerald-600" />} 
        color="emerald" 
      />
      <StatCard 
        title="Total Revenue" 
        value={formatCurrency(totalRevenue)} 
        icon={<DollarSign className="h-4 w-4 text-amber-600" />} 
        color="amber" 
      />
      <StatCard 
        title="Average Rating" 
        value={avgRating.toFixed(1)} 
        icon={<Star className="h-4 w-4 text-purple-600" />} 
        color="purple" 
      />
    </div>
  );
} 