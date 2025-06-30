"use client";

import Image from "next/image";
import { Users, CheckCircle, UserRound, ExternalLink } from "lucide-react";
import { Section } from "@/components/ui/section";
import { Skeleton } from "@/components/ui/skeleton";
import { useCourseInstructors } from "@/lib/client/hooks/use-instructors";
import { cn } from "@/lib/shared/utils/cn";
import type { Instructor } from "@/lib/shared/types/courses";

// Extended instructor type with social links
interface ExtendedInstructor extends Instructor {
  twitter?: string;
  github?: string;
  linkedin?: string;
  website?: string;
}

// Social link type
interface SocialLink {
  url: string;
  label: string;
  className: string;
}

interface InstructorSpotlightProps {
  courseId: string;
}

function InstructorSkeleton() {
  return (
    <div className="grid gap-12 lg:grid-cols-[340px_1fr] items-start">
      <div className="flex justify-center lg:justify-end lg:sticky lg:top-32">
        <Skeleton className="aspect-square w-56 sm:w-64 rounded-lg" />
      </div>
      <div className="space-y-6">
        <Skeleton className="h-8 w-60" />
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/6" />
        <div className="space-y-2 pt-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-1/2" />
          ))}
        </div>
      </div>
    </div>
  );
}

export function InstructorSpotlight({ courseId }: InstructorSpotlightProps) {
  const { data: pivots } = useCourseInstructors(courseId);

  if (!pivots || pivots.length === 0) {
    return (
      <Section bg="slate" className="py-24">
        <InstructorSkeleton /> 
      </Section>
    );
  }

  return (
    <Section bg="slate" className="py-24">
      <div className="space-y-32">
        {pivots.map((pivot) => {
          const ins = pivot.instructor as ExtendedInstructor;
          const hasCredentials = ins.credentials && ins.credentials.length > 0;
          const hasSocial = ins.twitter || ins.github || ins.linkedin || ins.website;
          
          return (
            <div 
              key={pivot.id}
              className="w-full"
            >
              <div className="grid gap-12 md:gap-16 lg:gap-20 lg:grid-cols-[1fr_2fr] items-start">
                {/* Avatar column */}
                <div className="flex flex-col items-center lg:items-start space-y-4 lg:sticky lg:top-32">
                  {/* Avatar with subtle shadow */}
                  <div className="relative">
                    {ins.avatarUrl ? (
                      <Image
                        src={ins.avatarUrl}
                        alt={ins.name}
                        width={256}
                        height={256}
                        className="aspect-square w-56 sm:w-64 rounded-lg object-cover shadow-sm ring-1 ring-slate-200/80"
                        priority
                      />
                    ) : (
                      <div className="flex items-center justify-center aspect-square w-56 sm:w-64 rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 shadow-sm ring-1 ring-slate-200/80">
                        <UserRound className="h-16 w-16 text-slate-400" />
                      </div>
                    )}
                    
                    {/* Student count badge */}
                    <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1 bg-white rounded-full shadow-sm text-xs font-medium text-slate-700 ring-1 ring-slate-100">
                      <Users className="h-3.5 w-3.5 text-slate-500" />
                      <span>{(ins.totalStudents ?? 0).toLocaleString()} students</span>
                    </div>
                  </div>
                  
                  {/* Social links - mobile only */}
                  {hasSocial && (
                    <div className="flex gap-3 lg:hidden">
                      {renderSocialLinks(ins)}
                    </div>
                  )}
                </div>

                {/* Content column */}
                <div className="space-y-8">
                  <header className="space-y-5">
                    <h2 className="text-sm uppercase tracking-wider font-semibold text-emerald-600">Meet your instructor</h2>
                    <div>
                      <h3 className="text-2xl font-semibold text-slate-800">{ins.name}</h3>
                      {ins.title && <p className="mt-1 text-base text-slate-600">{ins.title}</p>}
                    </div>
                    
                    {/* Social links - desktop only */}
                    {hasSocial && (
                      <div className="hidden lg:flex gap-3">
                        {renderSocialLinks(ins)}
                      </div>
                    )}
                    
                    {ins.bio && (
                      <div className="prose prose-slate prose-sm max-w-none">
                        <p className="text-base leading-relaxed text-slate-700">{ins.bio}</p>
                      </div>
                    )}
                  </header>

                  {hasCredentials && (
                    <div className="space-y-4 pt-2">
                      <h4 className="text-sm font-medium text-slate-800">Expertise & Credentials</h4>
                      <ul role="list" className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2">
                        {ins.credentials?.map((cred) => (
                          <li key={cred} className="flex gap-2.5 text-sm text-slate-700">
                            <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-500" />
                            <span>{cred}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Section>
  );
}

function renderSocialLinks(instructor: ExtendedInstructor) {
  const links: SocialLink[] = [];
  
  if (instructor.twitter) {
    links.push({
      url: `https://twitter.com/${instructor.twitter}`,
      label: "Twitter",
      className: "bg-blue-50 text-blue-600 hover:bg-blue-100"
    });
  }
  
  if (instructor.github) {
    links.push({
      url: `https://github.com/${instructor.github}`,
      label: "GitHub",
      className: "bg-slate-50 text-slate-600 hover:bg-slate-100"
    });
  }
  
  if (instructor.linkedin) {
    links.push({
      url: instructor.linkedin,
      label: "LinkedIn",
      className: "bg-blue-50 text-blue-700 hover:bg-blue-100"
    });
  }
  
  if (instructor.website) {
    links.push({
      url: instructor.website,
      label: "Website",
      className: "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
    });
  }

  return links.map(link => (
    <a
      key={link.label}
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
        link.className
      )}
    >
      {link.label}
      <ExternalLink className="h-3 w-3" />
    </a>
  ));
}
