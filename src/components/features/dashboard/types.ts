// Dashboard types

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