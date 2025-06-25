// Dashboard types with proper TypeScript interfaces

export interface CourseData {
  id: string;
  title: string;
  progress: number;
  students: number;
  revenue: number;
  image: string;
  status: 'published' | 'draft';
}

export interface ActivityItem {
  id: string;
  type: 'sale' | 'enrollment' | 'completion' | 'update';
  iconType: 'dollar' | 'users' | 'check' | 'book';
  title: string;
  description: string;
  time: string;
}

export interface StatsData {
  totalStudents: number;
  totalRevenue: number;
  totalCourses: number;
  enrollmentsThisMonth: number;
  revenueChange: number;
  enrollmentChange: number;
}

export interface UpcomingEvent {
  id: string;
  type: 'calendar' | 'users' | 'revenue';
  title: string;
  description: string;
  deadline: string;
  progress?: number;
  variant: 'blue' | 'slate' | 'emerald';
}

export interface UserCardProps {
  userName: string;
  userEmail: string;
  accountType: string;
  memberSince: string;
  onEditProfile: () => void;
  onSignOut: () => void;
}

export interface CourseProgressData {
  id: string;
  title: string;
  activeStudents: number;
  completionRate: number;
  avgEngagement: number;
  bottleneckLesson: string;
  dropoffRate: number;
}

export interface RevenueData {
  totalRevenue: number;
  momRevenueChange: number;
  avgRevenuePerStudent: number;
  avgCourseValue: number;
  monthlyRecurringRevenue: number;
  topPerformingCourses: TopPerformingCourse[];
}

export interface TopPerformingCourse {
  id: string;
  title: string;
  revenue: number;
  growth: number;
}

// Top-line hero metrics used in the dashboard header
export interface HeroMetrics {
  revenueToday: number;
  revenueMTD: number;
  revenueAll: number;
  enrollmentsToday: number;
  enrollmentsMTD: number;
  enrollmentsAll: number;
  activeStudents: number;
  avgRating: number | null;
  revenueTrend?: number[];
  enrollmentTrend?: number[];
} 