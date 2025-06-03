'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Check, X, Search, ArrowLeft, Users, AlertCircle, 
  ChevronDown, Filter, RefreshCcw, ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/potatix/Button';
import { useCourse } from '@/lib/api';
import axios from 'axios';
import { toast } from 'sonner';

type EnrollmentStatus = 'active' | 'pending' | 'rejected';

interface Student {
  id: string;
  userId: string;
  courseId: string;
  enrolledAt: string;
  status: EnrollmentStatus;
  user?: {
    name?: string;
    email?: string;
    image?: string;
  };
}

export default function StudentsPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = typeof params.id === 'string' ? params.id : Array.isArray(params.id) ? params.id[0] : '';
  
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<EnrollmentStatus | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);
  
  const { data: course, isLoading: courseLoading } = useCourse(courseId);
  
  // Fetch students data
  const fetchStudents = useCallback(async () => {
    if (!courseId) return;
    
    try {
      setLoading(true);
      const response = await axios.get(`/api/courses/${courseId}/students`);
      setStudents(response.data.students || []);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch students:', err);
      setError('Failed to load enrollment data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [courseId, setLoading, setStudents, setError, setRefreshing]);
  
  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);
  
  const refreshData = () => {
    setRefreshing(true);
    fetchStudents();
  };
  
  // Handle enrollment status change
  const updateEnrollmentStatus = async (enrollmentId: string, status: EnrollmentStatus) => {
    if (processingIds.has(enrollmentId)) return;
    
    try {
      setProcessingIds(prev => new Set(prev).add(enrollmentId));
      
      await axios.patch(`/api/courses/${courseId}/enrollment/${enrollmentId}`, { status });
      
      // Update local state
      setStudents(prev => prev.map(student => 
        student.id === enrollmentId ? { ...student, status } : student
      ));
      
      toast.success(`Student ${status === 'active' ? 'approved' : 'rejected'} successfully`);
    } catch (err) {
      console.error('Failed to update enrollment:', err);
      toast.error('Failed to update enrollment status');
    } finally {
      setProcessingIds(prev => {
        const updated = new Set(prev);
        updated.delete(enrollmentId);
        return updated;
      });
    }
  };
  
  // Apply filters to student list
  const filteredStudents = students.filter(student => {
    // Apply status filter
    if (filter !== 'all' && student.status !== filter) {
      return false;
    }
    
    // Apply search filter to name or email
    if (searchTerm && student.user) {
      const name = student.user.name || '';
      const email = student.user.email || '';
      
      return name.toLowerCase().includes(searchTerm.toLowerCase()) || 
             email.toLowerCase().includes(searchTerm.toLowerCase());
    }
    
    return true;
  });
  
  // Count students by status
  const pendingCount = students.filter(s => s.status === 'pending').length;
  const activeCount = students.filter(s => s.status === 'active').length;
  const rejectedCount = students.filter(s => s.status === 'rejected').length;
  
  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Status badge component
  const StatusBadge = ({ status }: { status: EnrollmentStatus }) => {
    const statusMap: Record<EnrollmentStatus, { bg: string, text: string, icon: React.ReactNode }> = {
      active: {
        bg: "bg-emerald-50 border-emerald-200", 
        text: "text-emerald-700",
        icon: <Check className="h-3 w-3" />
      },
      pending: {
        bg: "bg-amber-50 border-amber-200", 
        text: "text-amber-700",
        icon: <ChevronRight className="h-3 w-3" />
      }, 
      rejected: {
        bg: "bg-red-50 border-red-200",
        text: "text-red-600",
        icon: <X className="h-3 w-3" />
      }
    };
    
    const { bg, text, icon } = statusMap[status];
    
    return (
      <div className={`px-2 py-1 text-xs font-medium rounded-md inline-flex items-center gap-1 ${bg} border ${text}`}>
        <span className="h-3 w-3">{icon}</span>
        <span className="capitalize">{status}</span>
      </div>
    );
  };
  
  // Loading state
  if (loading || courseLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 text-slate-500">
        <div className="h-10 w-10 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
        <p className="text-sm font-medium">Loading enrollment data...</p>
      </div>
    );
  }
  
  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {/* Back button */}
      <div className="mb-6">
        <Button
          type="text"
          size="tiny"
          icon={
            <span className="transition-transform duration-200 group-hover:-translate-x-0.5">
              <ArrowLeft className="h-3 w-3" />
            </span>
          }
          className="text-slate-500 hover:text-slate-900 group"
          onClick={() => router.push(`/courses/${courseId}`)}
        >
          Back to course
        </Button>
      </div>

      {/* Header with stats */}
      <header className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
          <div>
            <h1 className="text-xl font-medium text-slate-900">Manage Students</h1>
            <p className="text-sm text-slate-500 mt-1">
              {course?.title ? `For course: ${course.title}` : 'View and manage your enrolled students'}
            </p>
          </div>
          
          <div>
            <Button
              type="outline"
              size="small"
              icon={<RefreshCcw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />}
              onClick={refreshData}
              disabled={refreshing}
            >
              Refresh
            </Button>
          </div>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
          <div className="bg-white border border-slate-200 rounded-md p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">Total Students</p>
                <p className="text-2xl font-semibold text-slate-900">{students.length}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center">
                <Users className="h-5 w-5 text-slate-500" />
              </div>
            </div>
          </div>
          
          <div className="bg-white border border-slate-200 rounded-md p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">Pending Approval</p>
                <p className="text-2xl font-semibold text-amber-600">{pendingCount}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-amber-50 flex items-center justify-center">
                <ChevronRight className="h-5 w-5 text-amber-500" />
              </div>
            </div>
          </div>
          
          <div className="bg-white border border-slate-200 rounded-md p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">Active Students</p>
                <p className="text-2xl font-semibold text-emerald-600">{activeCount}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-emerald-50 flex items-center justify-center">
                <Check className="h-5 w-5 text-emerald-500" />
              </div>
            </div>
          </div>
        </div>
        
        <div className="border-b border-slate-200 pb-5"></div>
      </header>
      
      {/* Filter and search */}
      <div className="bg-white border border-slate-200 rounded-t-md overflow-hidden">
        <div className="sm:p-4 p-3 flex flex-col sm:flex-row justify-between gap-4 border-b border-slate-200">
          {/* Desktop filters */}
          <div className="hidden sm:flex flex-wrap gap-2">
            <Button
              type={filter === 'all' ? 'primary' : 'text'}
              size="tiny"
              onClick={() => setFilter('all')}
            >
              All
            </Button>
            <Button
              type={filter === 'pending' ? 'primary' : 'text'}
              size="tiny"
              onClick={() => setFilter('pending')}
              className={pendingCount > 0 ? 'relative' : ''}
            >
              Pending
              {pendingCount > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-amber-500 text-white text-[10px] flex items-center justify-center">
                  {pendingCount}
                </span>
              )}
            </Button>
            <Button
              type={filter === 'active' ? 'primary' : 'text'}
              size="tiny"
              onClick={() => setFilter('active')}
            >
              Active
            </Button>
            <Button
              type={filter === 'rejected' ? 'primary' : 'text'}
              size="tiny"
              onClick={() => setFilter('rejected')}
            >
              Rejected
            </Button>
          </div>
          
          {/* Mobile filter dropdown */}
          <div className="sm:hidden relative">
            <Button
              type="outline"
              size="small"
              className="w-full justify-between"
              icon={<Filter className="h-3.5 w-3.5" />}
              iconRight={<ChevronDown className="h-3.5 w-3.5" />}
              onClick={() => setIsFilterOpen(!isFilterOpen)}
            >
              {filter === 'all' ? 'All Students' : `${filter.charAt(0).toUpperCase() + filter.slice(1)} Students`}
            </Button>
            
            {isFilterOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-md shadow-lg z-10">
                <div className="py-1">
                  <button 
                    className={`w-full text-left px-4 py-2 text-sm ${filter === 'all' ? 'bg-slate-50 text-emerald-600' : 'text-slate-700 hover:bg-slate-50'}`}
                    onClick={() => { setFilter('all'); setIsFilterOpen(false); }}
                  >
                    All Students ({students.length})
                  </button>
                  <button 
                    className={`w-full text-left px-4 py-2 text-sm ${filter === 'pending' ? 'bg-slate-50 text-emerald-600' : 'text-slate-700 hover:bg-slate-50'}`}
                    onClick={() => { setFilter('pending'); setIsFilterOpen(false); }}
                  >
                    Pending ({pendingCount})
                  </button>
                  <button 
                    className={`w-full text-left px-4 py-2 text-sm ${filter === 'active' ? 'bg-slate-50 text-emerald-600' : 'text-slate-700 hover:bg-slate-50'}`}
                    onClick={() => { setFilter('active'); setIsFilterOpen(false); }}
                  >
                    Active ({activeCount})
                  </button>
                  <button 
                    className={`w-full text-left px-4 py-2 text-sm ${filter === 'rejected' ? 'bg-slate-50 text-emerald-600' : 'text-slate-700 hover:bg-slate-50'}`}
                    onClick={() => { setFilter('rejected'); setIsFilterOpen(false); }}
                  >
                    Rejected ({rejectedCount})
                  </button>
                </div>
              </div>
            )}
          </div>
          
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-3.5 w-3.5 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Search by name or email"
              className="pl-9 pr-4 py-2 w-full text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 bg-slate-50"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setSearchTerm('')}
              >
                <X className="h-3.5 w-3.5 text-slate-400 hover:text-slate-600" />
              </button>
            )}
          </div>
        </div>
      
        {/* Students List */}
        <div>
          {error && (
            <div className="p-8 text-center">
              <div className="inline-flex h-14 w-14 rounded-full bg-red-50 items-center justify-center mb-4">
                <AlertCircle className="h-6 w-6 text-red-500" />
              </div>
              <h3 className="text-base font-medium text-slate-900 mb-2">Failed to load data</h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto mb-5">
                {error}. Please check your connection and try again.
              </p>
              <Button
                type="primary"
                size="small"
                icon={<RefreshCcw className="h-3.5 w-3.5" />}
                onClick={() => window.location.reload()}
              >
                Try Again
              </Button>
            </div>
          )}
          
          {!error && filteredStudents.length === 0 && (
            <div className="p-12 text-center">
              <div className="inline-flex h-14 w-14 rounded-full bg-slate-100 items-center justify-center mb-4">
                <Users className="h-6 w-6 text-slate-400" />
              </div>
              <h3 className="text-base font-medium text-slate-900 mb-2">No students found</h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto mb-1">
                {filter !== 'all' 
                  ? `No ${filter} enrollments found. Try a different filter.` 
                  : searchTerm 
                  ? 'No students match your search criteria.' 
                  : 'There are no enrollments for this course yet.'}
              </p>
              {(filter !== 'all' || searchTerm) && (
                <button
                  className="mt-4 text-sm text-emerald-600 hover:text-emerald-700 inline-flex items-center gap-1"
                  onClick={() => { setFilter('all'); setSearchTerm(''); }}
                >
                  <RefreshCcw className="h-3 w-3" /> 
                  Clear all filters
                </button>
              )}
            </div>
          )}
          
          {!error && filteredStudents.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-xs uppercase border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-slate-500">Student</th>
                    <th className="px-6 py-3 text-left text-slate-500">Status</th>
                    <th className="px-6 py-3 text-left text-slate-500">Enrolled On</th>
                    <th className="px-6 py-3 text-right text-slate-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStudents.map((student) => (
                    <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex-shrink-0 h-9 w-9 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-medium">
                            {student.user?.name ? student.user.name.charAt(0).toUpperCase() : '?'}
                          </div>
                          <div>
                            <div className="font-medium text-slate-900 mb-0.5">
                              {student.user?.name || 'Unnamed User'}
                            </div>
                            <div className="text-xs text-slate-500">
                              {student.user?.email || 'No email provided'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={student.status} />
                      </td>
                      <td className="px-6 py-4 text-slate-700">
                        {formatDate(student.enrolledAt)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          {student.status === 'pending' && (
                            <>
                              <Button
                                type="primary"
                                size="tiny"
                                icon={<Check className="h-3 w-3" />}
                                onClick={() => updateEnrollmentStatus(student.id, 'active')}
                                disabled={processingIds.has(student.id)}
                                className="shadow-sm"
                              >
                                Approve
                              </Button>
                              <Button
                                type="danger"
                                size="tiny"
                                icon={<X className="h-3 w-3" />}
                                onClick={() => updateEnrollmentStatus(student.id, 'rejected')}
                                disabled={processingIds.has(student.id)}
                                className="shadow-sm"
                              >
                                Reject
                              </Button>
                            </>
                          )}
                          
                          {student.status === 'active' && (
                            <Button
                              type="danger"
                              size="tiny"
                              onClick={() => updateEnrollmentStatus(student.id, 'rejected')}
                              disabled={processingIds.has(student.id)}
                              className="shadow-sm"
                            >
                              Revoke Access
                            </Button>
                          )}
                          
                          {student.status === 'rejected' && (
                            <Button
                              type="primary"
                              size="tiny"
                              onClick={() => updateEnrollmentStatus(student.id, 'active')}
                              disabled={processingIds.has(student.id)}
                              className="shadow-sm"
                            >
                              Approve
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {filteredStudents.length > 0 && (
                <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex justify-between items-center">
                  <span>Showing {filteredStudents.length} of {students.length} students</span>
                  {(filter !== 'all' || searchTerm) && (
                    <button
                      className="text-emerald-600 hover:text-emerald-700 inline-flex items-center gap-1"
                      onClick={() => { setFilter('all'); setSearchTerm(''); }}
                    >
                      <RefreshCcw className="h-3 w-3" /> 
                      Clear filters
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
