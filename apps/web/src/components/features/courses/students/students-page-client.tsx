"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Check, X, Search, ArrowLeft, Users, AlertCircle, ChevronDown, Filter,
  RefreshCcw, ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/new-button";
import { useCourse } from "@/lib/client/hooks/use-courses";
import { useStudents, useUpdateEnrollment } from "@/lib/client/hooks/use-enrollments";
import type { Enrollment } from "@/lib/client/api/enrollments";
import { toast } from "sonner";

interface Props { courseId: string; }

type EnrollmentStatus = Enrollment["status"];

export default function StudentsPageClient({ courseId }: Props) {
  const router = useRouter();
  const { data: course } = useCourse(courseId);
  const { data: students = [], isLoading, error, refetch } = useStudents(courseId);
  const updateMutation = useUpdateEnrollment(courseId);

  const [filter, setFilter] = useState<EnrollmentStatus | "all">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const processingIds = updateMutation.isPending ? new Set<string>() : new Set();

  const filtered = students.filter((s) => {
    if (filter !== "all" && s.status !== filter) return false;
    if (searchTerm && s.user) {
      const q = searchTerm.toLowerCase();
      return (
        (s.user.name ?? "").toLowerCase().includes(q) ||
        (s.user.email ?? "").toLowerCase().includes(q)
      );
    }
    return true;
  });

  const counts = {
    pending: students.filter((s) => s.status === "pending").length,
    active: students.filter((s) => s.status === "active").length,
    rejected: students.filter((s) => s.status === "rejected").length,
  };

  const updateStatus = (id: string, status: EnrollmentStatus) => {
    updateMutation.mutate({ enrollmentId: id, status }, {
      onSuccess: () => toast.success(
        "Status updated"),
      onError: () => toast.error("Failed to update status"),
    });
  };

  const [refreshing, setRefreshing] = useState(false);
  const refreshData = () => {
    setRefreshing(true);
    refetch().finally(() => setRefreshing(false));
  };

  const formatDate = (iso: string) => new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });

  const StatusBadge = ({ status }: { status: EnrollmentStatus }) => {
    const map = {
      active: { bg: "bg-emerald-50 border-emerald-200", txt: "text-emerald-700", icon: <Check className="h-3 w-3"/> },
      pending: { bg: "bg-amber-50 border-amber-200", txt: "text-amber-700", icon: <ChevronRight className="h-3 w-3"/> },
      rejected: { bg: "bg-red-50 border-red-200", txt: "text-red-600", icon: <X className="h-3 w-3"/> },
    } as const;
    const { bg, txt, icon } = map[status];
    return <div className={`px-2 py-1 text-xs font-medium rounded-md inline-flex items-center gap-1 ${bg} border ${txt}`}>{icon}<span className="capitalize">{status}</span></div>;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 text-slate-500">
        <div className="h-10 w-10 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
        <p className="text-sm font-medium">Loading enrollment data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <AlertCircle className="h-6 w-6 text-red-500 mx-auto mb-4" />
        <p className="text-sm text-red-600">{error.message}</p>
        <Button type="primary" size="small" onClick={() => refetch()}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {/* Back */}
      <div className="mb-6">
        <Button type="text" size="tiny" icon={<ArrowLeft className="h-3 w-3"/>} onClick={()=>{
          if (course?.slug) {
            router.push(`/courses/${course.slug}`);
          } else {
            router.push("/courses");
          }
        }}>Back to course</Button>
      </div>

      {/* Header */}
      <header className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
          <div>
            <h1 className="text-xl font-medium text-slate-900">Manage Students</h1>
            <p className="text-sm text-slate-500 mt-1">{course?.title ? `For course: ${course.title}` : "View and manage your enrolled students"}</p>
          </div>
          <Button type="outline" size="small" icon={<RefreshCcw className={`h-3.5 w-3.5 ${refreshing?"animate-spin":""}`}/>} onClick={refreshData} disabled={refreshing}>Refresh</Button>
        </div>

        {/* stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
          <StatsCard label="Total Students" value={students.length} iconBg="bg-slate-100" Icon={Users}/>
          <StatsCard label="Pending Approval" value={counts.pending} iconBg="bg-amber-50" textColor="text-amber-600" Icon={ChevronRight}/>
          <StatsCard label="Active Students" value={counts.active} iconBg="bg-emerald-50" textColor="text-emerald-600" Icon={Check}/>
        </div>
        <div className="border-b border-slate-200 pb-5" />
      </header>

      {/* Filters & search */}
      <div className="bg-white border border-slate-200 rounded-t-md overflow-hidden">
        <div className="sm:p-4 p-3 flex flex-col sm:flex-row justify-between gap-4 border-b border-slate-200">
          {/* Desktop filters */}
          <div className="hidden sm:flex flex-wrap gap-2">
            {(["all","pending","active","rejected"] as const).map((key)=>{
              const isActive = filter===key;
              const label = key.charAt(0).toUpperCase()+key.slice(1);
              return (
                <Button key={key} type={isActive?"primary":"text"} size="tiny" onClick={()=>setFilter(key)}>
                  {label}{key==="pending"?` (${counts.pending})`:""}
                </Button>
              );
            })}
          </div>

          {/* Mobile filter dropdown simplified */}
          <div className="sm:hidden relative w-full">
            <Button type="outline" size="small" className="w-full justify-between" icon={<Filter className="h-3.5 w-3.5"/>} iconRight={<ChevronDown className="h-3.5 w-3.5"/>} onClick={()=>setIsFilterOpen(!isFilterOpen)}>
              {filter==="all"?"All Students":`${filter.charAt(0).toUpperCase()+filter.slice(1)} Students`}
            </Button>
            {isFilterOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-md shadow-lg z-10">
                {(["all","pending","active","rejected"] as const).map(k=>(
                  <button key={k} className={`w-full text-left px-4 py-2 text-sm ${filter===k?"bg-slate-50 text-emerald-600":"text-slate-700 hover:bg-slate-50"}`} onClick={()=>{setFilter(k);setIsFilterOpen(false);}}>
                    {k.charAt(0).toUpperCase()+k.slice(1)} ({k==="all"?students.length:counts[k as keyof typeof counts]})
                  </button>
                ))}
              </div>) }
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-auto">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Search className="h-3.5 w-3.5 text-slate-400"/></div>
            <input type="text" placeholder="Search by name or email" className="pl-9 pr-4 py-2 w-full text-sm border border-slate-200 rounded-md bg-slate-50 focus:outline-none focus:ring-1 focus:ring-emerald-500" value={searchTerm} onChange={e=>setSearchTerm(e.target.value)}/>
            {searchTerm && <button className="absolute inset-y-0 right-0 pr-3 flex items-center" onClick={()=>setSearchTerm("")}> <X className="h-3.5 w-3.5 text-slate-400 hover:text-slate-600"/> </button>}
          </div>
        </div>

        {/* Students table */}
        {filtered.length===0? (
          <div className="p-12 text-center"><Users className="h-6 w-6 text-slate-400 mx-auto mb-4"/><p className="text-sm text-slate-500">No students match current filters.</p></div>
        ):(
          <div className="overflow-x-auto">
            <table className="w-full text-sm"><thead className="bg-slate-50 text-xs uppercase border-b border-slate-200"><tr><th className="px-6 py-3 text-left text-slate-500">Student</th><th className="px-6 py-3 text-left text-slate-500">Status</th><th className="px-6 py-3 text-left text-slate-500">Enrolled On</th><th className="px-6 py-3 text-right text-slate-500">Actions</th></tr></thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(st=>(
                <tr key={st.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4"><div className="flex items-center gap-3"><div className="flex-shrink-0 h-9 w-9 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-medium">{st.user?.name?.[0] ?? "?"}</div><div><div className="font-medium text-slate-900 mb-0.5">{st.user?.name || "Unnamed"}</div><div className="text-xs text-slate-500">{st.user?.email||"No email"}</div></div></div></td>
                  <td className="px-6 py-4"><StatusBadge status={st.status}/></td>
                  <td className="px-6 py-4 text-slate-700">{formatDate(st.enrolledAt)}</td>
                  <td className="px-6 py-4"><div className="flex justify-end gap-2">
                    {st.status==="pending" && (<><Button type="primary" size="tiny" icon={<Check className="h-3 w-3"/>} onClick={()=>updateStatus(st.id,"active")} disabled={processingIds.has(st.id)}>Approve</Button><Button type="danger" size="tiny" icon={<X className="h-3 w-3"/>} onClick={()=>updateStatus(st.id,"rejected")} disabled={processingIds.has(st.id)}>Reject</Button></>)}
                    {st.status==="active" && (<Button type="danger" size="tiny" onClick={()=>updateStatus(st.id,"rejected")} disabled={processingIds.has(st.id)}>Revoke</Button>)}
                    {st.status==="rejected" && (<Button type="primary" size="tiny" onClick={()=>updateStatus(st.id,"active")} disabled={processingIds.has(st.id)}>Approve</Button>)}
                  </div></td>
                </tr>))}
            </tbody></table></div>
        )}
      </div>
    </div>
  );
}

function StatsCard({label, value, iconBg, textColor="text-slate-900", Icon}:{label:string; value:number; iconBg:string; textColor?:string; Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;}){
  return (
    <div className="bg-white border border-slate-200 rounded-md p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500 mb-1">{label}</p>
          <p className={`text-2xl font-semibold ${textColor}`}>{value}</p>
        </div>
        <div className={`h-10 w-10 rounded-full ${iconBg} flex items-center justify-center`}>
          <Icon className="h-5 w-5 text-slate-500"/>
        </div>
      </div>
    </div>
  );
} 