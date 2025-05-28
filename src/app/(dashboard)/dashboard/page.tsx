'use client';

import { authClient, signOut } from '@/lib/auth/auth-client';
import { ChevronRight, Clock, GraduationCap, BarChart2, User, LogOut } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface UserData {
  name?: string;
  email?: string;
  [key: string]: any;
}

export default function DashboardPage() {
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
    return <div className="min-h-full w-full py-6 px-6 flex items-center justify-center">
      <div className="animate-pulse text-neutral-500">Loading...</div>
    </div>;
  }

  // Handle not authenticated state
  if (!session) {
    return <div className="min-h-full w-full py-6 px-6 flex items-center justify-center">
      <div className="text-center space-y-4">
        <h2 className="text-xl font-semibold text-neutral-900">Not Authenticated</h2>
        <p className="text-neutral-500">Please sign in to access your dashboard.</p>
        <Link href="/auth/sign-in" className="inline-block px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700">
          Sign In
        </Link>
      </div>
    </div>;
  }

  // Extract user info safely with proper type checks
  const userInfo: UserData = session?.user || {}; 
  const userName = typeof userInfo.name === 'string' ? userInfo.name : 'User';
  const userEmail = typeof userInfo.email === 'string' ? userInfo.email : '';
  const userFirstLetter = userName.charAt(0) || 'U';

  return (
    <div className="min-h-full w-full py-6 px-6">
      <div className="space-y-8">
        {/* Header section */}
        <div className="flex flex-col space-y-1">
          <h1 className="text-2xl font-semibold text-neutral-900">Dashboard</h1>
          <p className="text-sm text-neutral-500">
            Welcome back, {userName.split(' ')[0]}
          </p>
        </div>

        {/* User profile card */}
        <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
          <div className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-neutral-900 text-xl font-medium text-white">
                {userFirstLetter}
              </div>
              <div className="space-y-1">
                <h2 className="text-lg font-medium text-neutral-900">{userName}</h2>
                <p className="text-sm text-neutral-500">{userEmail}</p>
              </div>
            </div>
            <div className="mt-6 grid grid-cols-3 gap-6 border-t border-neutral-200 pt-6">
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase text-neutral-500">Account Type</p>
                <p className="font-medium text-neutral-900">Free</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase text-neutral-500">Member Since</p>
                <p className="font-medium text-neutral-900">May 2023</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase text-neutral-500">Last Login</p>
                <p className="font-medium text-neutral-900">Today</p>
              </div>
            </div>
          </div>
          <div className="border-t border-neutral-200 bg-neutral-50 px-6 py-3">
            <div className="flex items-center justify-between">
              <button 
                onClick={async () => {
                  await signOut();
                  window.location.href = '/auth/sign-in';
                }}
                className="flex items-center gap-1 text-sm text-red-600 hover:text-red-800"
              >
                <LogOut className="size-4" />
                <span>Logout</span>
              </button>
              <Link 
                href="/settings" 
                className="flex items-center gap-1 text-sm text-neutral-600 hover:text-neutral-900"
              >
                <span>View Settings</span>
                <ChevronRight className="size-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="group overflow-hidden rounded-lg border border-neutral-200 bg-white transition-all hover:shadow-sm">
            <div className="p-6">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-medium text-neutral-500">Account Status</h3>
                <div className="rounded-full bg-emerald-100 p-1.5">
                  <User className="size-4 text-emerald-600" />
                </div>
              </div>
              <div className="flex items-end justify-between">
                <p className="text-2xl font-semibold text-neutral-900">Active</p>
                <div className="flex h-10 items-end">
                  <div className="h-5 w-2 rounded-sm bg-emerald-200 mx-[2px] group-hover:h-7 transition-all duration-300"></div>
                  <div className="h-6 w-2 rounded-sm bg-emerald-300 mx-[2px] group-hover:h-8 transition-all duration-300"></div>
                  <div className="h-10 w-2 rounded-sm bg-emerald-500 mx-[2px] group-hover:h-10 transition-all duration-300"></div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="group overflow-hidden rounded-lg border border-neutral-200 bg-white transition-all hover:shadow-sm">
            <div className="p-6">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-medium text-neutral-500">Courses</h3>
                <div className="rounded-full bg-blue-100 p-1.5">
                  <GraduationCap className="size-4 text-blue-600" />
                </div>
              </div>
              <div className="flex items-end justify-between">
                <p className="text-2xl font-semibold text-neutral-900">0</p>
                <div className="flex h-10 items-end">
                  <div className="h-3 w-2 rounded-sm bg-blue-200 mx-[2px] group-hover:h-7 transition-all duration-300"></div>
                  <div className="h-2 w-2 rounded-sm bg-blue-300 mx-[2px] group-hover:h-5 transition-all duration-300"></div>
                  <div className="h-4 w-2 rounded-sm bg-blue-500 mx-[2px] group-hover:h-9 transition-all duration-300"></div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="group overflow-hidden rounded-lg border border-neutral-200 bg-white transition-all hover:shadow-sm">
            <div className="p-6">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-medium text-neutral-500">Progress</h3>
                <div className="rounded-full bg-amber-100 p-1.5">
                  <Clock className="size-4 text-amber-600" />
                </div>
              </div>
              <div className="flex items-end justify-between">
                <p className="text-2xl font-semibold text-neutral-900">0%</p>
                <div className="flex h-10 items-end">
                  <div className="h-2 w-2 rounded-sm bg-amber-200 mx-[2px] group-hover:h-5 transition-all duration-300"></div>
                  <div className="h-4 w-2 rounded-sm bg-amber-300 mx-[2px] group-hover:h-7 transition-all duration-300"></div>
                  <div className="h-3 w-2 rounded-sm bg-amber-500 mx-[2px] group-hover:h-6 transition-all duration-300"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent activity */}
        <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
          <div className="border-b border-neutral-200 px-6 py-4">
            <h3 className="text-md font-medium text-neutral-900">Recent Activity</h3>
          </div>
          <div className="p-0">
            <div className="flex flex-col divide-y divide-neutral-200">
              <div className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-neutral-100 p-2">
                    <User className="size-4 text-neutral-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-neutral-900">Account created</p>
                    <p className="text-xs text-neutral-500">You created your account</p>
                  </div>
                </div>
                <p className="text-xs text-neutral-500">Today</p>
              </div>
              
              <div className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-neutral-100 p-2">
                    <BarChart2 className="size-4 text-neutral-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-neutral-900">First login</p>
                    <p className="text-xs text-neutral-500">You logged in for the first time</p>
                  </div>
                </div>
                <p className="text-xs text-neutral-500">Today</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 