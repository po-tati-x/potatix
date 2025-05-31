'use client';

import { authClient, signOut } from '@/lib/auth/auth-client';
import { 
  ChevronRight, 
  BookOpen, 
  User, 
  LogOut, 
  DollarSign, 
  Users,
  Play,
  Plus,
  ArrowUp,
  ArrowDown,
  CalendarDays,
  LineChart,
  CheckCircle2
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/potatix/Button';
import Image from 'next/image';

interface UserData {
  name?: string;
  email?: string;
  [key: string]: unknown;
}

// Mock data for the dashboard
const mockCourses = [
  {
    id: '1',
    title: 'Advanced TypeScript Development',
    progress: 100,
    students: 284,
    revenue: 14200,
    image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=300&h=170',
    status: 'published'
  },
  {
    id: '2',
    title: 'React Masterclass: Build Production Apps',
    progress: 85,
    students: 128,
    revenue: 6400,
    image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&q=80&w=300&h=170',
    status: 'published'
  },
  {
    id: '3',
    title: 'UX Design Fundamentals',
    progress: 60,
    students: 0,
    revenue: 0,
    image: '',
    status: 'draft'
  }
];

const mockActivity = [
  { 
    id: '1', 
    type: 'sale', 
    icon: <DollarSign className="h-3.5 w-3.5 text-emerald-600" />, 
    title: 'New course sale', 
    description: 'Someone purchased "Advanced TypeScript Development"',
    time: '5 minutes ago'
  },
  { 
    id: '2', 
    type: 'enrollment', 
    icon: <Users className="h-3.5 w-3.5 text-blue-600" />, 
    title: 'New student enrolled', 
    description: 'Alex Johnson enrolled in "React Masterclass"',
    time: '2 hours ago'
  },
  { 
    id: '3', 
    type: 'completion', 
    icon: <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />, 
    title: 'Course completed', 
    description: 'Sara Wilson completed "Advanced TypeScript Development"',
    time: '1 day ago'
  },
  { 
    id: '4', 
    type: 'update', 
    icon: <BookOpen className="h-3.5 w-3.5 text-slate-600" />, 
    title: 'Course published', 
    description: 'You published "React Masterclass: Build Production Apps"',
    time: '3 days ago'
  }
];

const mockStats = {
  totalStudents: 412,
  totalRevenue: 8700,
  totalCourses: 3,
  enrollmentsThisMonth: 45,
  revenueChange: 18.5,
  enrollmentChange: 24.3
};

export default function DashboardPage() {
  const router = useRouter();
  // State to store session data
  const [session, setSession] = useState<{ user: UserData } | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch session data on component mount
  useEffect(() => {
    const fetchSession = async () => {
      try {
        const { data } = await authClient.getSession();
        setSession(data);
      } catch (error) {
        console.error('Failed to fetch session:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, []);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 text-slate-500">
        <div className="h-5 w-5 border-2 border-slate-300 border-t-emerald-500 rounded-full animate-spin" />
        <p className="text-sm">Loading dashboard...</p>
      </div>
    );
  }

  // Handle not authenticated state
  if (!session) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="text-center py-16 space-y-4">
          <h2 className="text-xl font-medium text-slate-900">Not Authenticated</h2>
          <p className="text-slate-500">Please sign in to access your dashboard.</p>
          <Button 
            type="primary"
            size="small"
            onClick={() => router.push('/auth/sign-in')}
          >
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  // Extract user info safely with proper type checks
  const userInfo: UserData = session?.user || {}; 
  const userName = typeof userInfo.name === 'string' ? userInfo.name : 'User';
  const userEmail = typeof userInfo.email === 'string' ? userInfo.email : '';

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {/* Header */}
      <header className="mb-6 border-b border-slate-200 pb-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-medium text-slate-900">Dashboard</h1>
            <p className="mt-1 text-sm text-slate-600">
              Welcome back, {userName.split(' ')[0]}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              type="outline"
              size="small"
              icon={<BookOpen className="h-3.5 w-3.5" />}
              onClick={() => router.push('/courses')}
            >
              My Courses
            </Button>
            <Button
              type="primary"
              size="small"
              icon={<Plus className="h-3.5 w-3.5" />}
              onClick={() => router.push('/courses/new')}
            >
              New Course
            </Button>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stats row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200 rounded-md p-4 flex flex-col">
              <p className="text-xs text-slate-500 mb-1">Total Students</p>
              <div className="flex items-center justify-between mt-1">
                <p className="text-xl font-medium text-slate-900">{mockStats.totalStudents}</p>
                <div className={`flex items-center text-xs ${mockStats.enrollmentChange > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                  {mockStats.enrollmentChange > 0 ? <ArrowUp className="h-3 w-3 mr-0.5" /> : <ArrowDown className="h-3 w-3 mr-0.5" />}
                  {Math.abs(mockStats.enrollmentChange)}%
                </div>
              </div>
            </div>
            
            <div className="bg-white border border-slate-200 rounded-md p-4 flex flex-col">
              <p className="text-xs text-slate-500 mb-1">Revenue</p>
              <div className="flex items-center justify-between mt-1">
                <p className="text-xl font-medium text-slate-900">${mockStats.totalRevenue}</p>
                <div className={`flex items-center text-xs ${mockStats.revenueChange > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                  {mockStats.revenueChange > 0 ? <ArrowUp className="h-3 w-3 mr-0.5" /> : <ArrowDown className="h-3 w-3 mr-0.5" />}
                  {Math.abs(mockStats.revenueChange)}%
                </div>
              </div>
            </div>
            
            <div className="bg-white border border-slate-200 rounded-md p-4 flex flex-col">
              <p className="text-xs text-slate-500 mb-1">Total Courses</p>
              <p className="text-xl font-medium text-slate-900 mt-1">{mockStats.totalCourses}</p>
            </div>
            
            <div className="bg-white border border-slate-200 rounded-md p-4 flex flex-col">
              <p className="text-xs text-slate-500 mb-1">New Enrollments</p>
              <p className="text-xl font-medium text-slate-900 mt-1">{mockStats.enrollmentsThisMonth}</p>
            </div>
          </div>
          
          {/* Courses section */}
          <div className="border border-slate-200 rounded-md overflow-hidden bg-white">
            <div className="border-b border-slate-200 px-4 py-2.5 bg-slate-50">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-medium text-slate-900">Your Courses</h2>
                <Button
                  type="text"
                  size="tiny"
                  onClick={() => router.push('/courses')}
                  className="text-slate-600 hover:text-slate-900"
                >
                  View all
                  <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
                </Button>
              </div>
            </div>
            
            <div className="divide-y divide-slate-100">
              {mockCourses.map(course => (
                <div key={course.id} className="p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-16 h-10 bg-slate-100 rounded overflow-hidden">
                      {course.image ? (
                        <Image 
                          src={course.image} 
                          alt={course.title} 
                          width={64}
                          height={40}
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <BookOpen className="h-4 w-4 text-slate-400" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-medium text-slate-900 truncate">{course.title}</h3>
                        <span className={`inline-flex text-xs px-2 py-0.5 rounded-full capitalize ${
                          course.status === 'published' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {course.status}
                        </span>
                      </div>
                      
                      <div className="mt-2 flex items-center justify-between">
                        <div className="flex items-center gap-6">
                          <div className="flex items-center gap-1.5">
                            <Users className="h-3.5 w-3.5 text-slate-400" />
                            <span className="text-xs text-slate-600">{course.students}</span>
                          </div>
                          
                          {course.status === 'published' && (
                            <div className="flex items-center gap-1.5">
                              <DollarSign className="h-3.5 w-3.5 text-slate-400" />
                              <span className="text-xs text-slate-600">${course.revenue}</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-1">
                          {course.status === 'published' ? (
                            <Button
                              type="outline"
                              size="tiny"
                              icon={<LineChart className="h-3 w-3" />}
                              onClick={() => router.push(`/courses/${course.id}/analytics`)}
                              className="border-slate-200 text-slate-600"
                            >
                              Stats
                            </Button>
                          ) : (
                            <Button
                              type="outline"
                              size="tiny"
                              icon={<Play className="h-3 w-3" />}
                              onClick={() => router.push(`/courses/${course.id}/edit`)}
                              className="border-slate-200 text-slate-600"
                            >
                              Continue
                            </Button>
                          )}
                          
                          <Button
                            type="text"
                            size="tiny"
                            onClick={() => router.push(`/courses/${course.id}`)}
                          >
                            <ChevronRight className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Activity Feed */}
          <div className="border border-slate-200 rounded-md overflow-hidden bg-white">
            <div className="border-b border-slate-200 px-4 py-2.5 bg-slate-50">
              <h2 className="text-sm font-medium text-slate-900">Recent Activity</h2>
            </div>
            
            <div className="divide-y divide-slate-100">
              {mockActivity.map(activity => (
                <div key={activity.id} className="p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center">
                      {activity.icon}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-slate-900">{activity.title}</h3>
                        <span className="text-xs text-slate-500">{activity.time}</span>
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5">{activity.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Sidebar */}
        <div className="space-y-6">
          {/* User card */}
          <div className="border border-slate-200 rounded-md overflow-hidden bg-white">
            <div className="border-b border-slate-200 px-4 py-2.5 bg-slate-50">
              <h2 className="text-sm font-medium text-slate-900">Account Details</h2>
            </div>
            
            <div className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-white font-medium">
                  {userName.charAt(0)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-slate-900 truncate">{userName}</h3>
                  <p className="text-xs text-slate-500 truncate">{userEmail}</p>
                </div>
              </div>
              
              <div className="mt-4 grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                <div>
                  <p className="text-xs text-slate-500">Account Type</p>
                  <p className="text-sm font-medium text-slate-900 mt-0.5">Premium</p>
                </div>
                
                <div>
                  <p className="text-xs text-slate-500">Member Since</p>
                  <p className="text-sm font-medium text-slate-900 mt-0.5">May 2023</p>
                </div>
              </div>
              
              <div className="mt-4 flex flex-col gap-2">
                <Button
                  type="outline"
                  size="small"
                  icon={<User className="h-3.5 w-3.5" />}
                  onClick={() => router.push('/settings')}
                  className="w-full justify-center"
                >
                  Edit Profile
                </Button>
                
                <Button
                  type="text"
                  size="small"
                  icon={<LogOut className="h-3.5 w-3.5" />}
                  onClick={async () => {
                    await signOut();
                    router.push('/');
                  }}
                  className="w-full justify-center text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
          
          {/* Calendar card */}
          <div className="border border-slate-200 rounded-md overflow-hidden bg-white">
            <div className="border-b border-slate-200 px-4 py-2.5 bg-slate-50">
              <h2 className="text-sm font-medium text-slate-900">Upcoming</h2>
            </div>
            
            <div className="p-4 space-y-3">
              <div className="flex items-start gap-3 p-3 rounded-md bg-blue-50 border border-blue-100">
                <div className="flex-shrink-0 mt-0.5">
                  <CalendarDays className="h-4 w-4 text-blue-600" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-medium text-slate-900">Course Launch</h3>
                    <span className="text-xs font-medium text-blue-600">Tomorrow</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">UX Design Fundamentals is scheduled to launch</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 rounded-md bg-slate-50 border border-slate-100">
                <div className="flex-shrink-0 mt-0.5">
                  <Users className="h-4 w-4 text-slate-600" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-medium text-slate-900">Student Milestone</h3>
                    <span className="text-xs font-medium text-slate-600">Next week</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">You&apos;re about to reach 500 students!</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 rounded-md bg-emerald-50 border border-emerald-100">
                <div className="flex-shrink-0 mt-0.5">
                  <DollarSign className="h-4 w-4 text-emerald-600" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-medium text-slate-900">Revenue Goal</h3>
                    <span className="text-xs font-medium text-emerald-600">80%</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">$24,000 / $30,000 monthly target</p>
                  <div className="mt-2 w-full bg-emerald-200 rounded-full h-1">
                    <div className="bg-emerald-600 h-1 rounded-full" style={{ width: '80%' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 