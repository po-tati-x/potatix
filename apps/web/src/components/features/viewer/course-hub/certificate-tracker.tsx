'use client';

import { Award, CheckCircle, Clock, FileCheck, GraduationCap, Star } from 'lucide-react';
import { cn } from '@/lib/shared/utils/cn';
import type { CertificateRequirement } from './types';

interface CertificateTrackerProps {
  requirements: CertificateRequirement[];
  onViewCertificate?: () => void;
}

const requirementIcons = {
  lessons: GraduationCap,
  quizzes: FileCheck,
  project: Award,
  time: Clock,
  score: Star,
};

const requirementLabels = {
  lessons: 'Complete Lessons',
  quizzes: 'Pass Quizzes',
  project: 'Submit Project',
  time: 'Learning Time',
  score: 'Minimum Score',
};

interface RequirementItemProps {
  requirement: CertificateRequirement;
}

function RequirementItem({ requirement }: RequirementItemProps) {
  const Icon = requirementIcons[requirement.type];
  const label = requirementLabels[requirement.type];
  const progress = Math.min((requirement.current / requirement.required) * 100, 100);
  const isCompleted = requirement.completed;

  return (
    <div
      className={cn(
        'rounded-lg border bg-white p-3 transition-all',
        isCompleted ? 'border-emerald-200 bg-emerald-50/30' : 'border-slate-200',
      )}
    >
      <div className="flex items-center gap-3">
        <div
          className={cn(
            'flex h-8 w-8 items-center justify-center rounded-lg border',
            isCompleted
              ? 'border-emerald-200 bg-emerald-100 text-emerald-600'
              : 'border-slate-200 bg-slate-50 text-slate-500',
          )}
        >
          {isCompleted ? <CheckCircle className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
        </div>

        <div className="flex-grow">
          <div className="flex items-center justify-between">
            <p
              className={cn(
                'text-sm font-medium',
                isCompleted ? 'text-emerald-700' : 'text-slate-700',
              )}
            >
              {label}
            </p>
            <span
              className={cn(
                'text-sm font-medium',
                isCompleted ? 'text-emerald-600' : 'text-slate-600',
              )}
            >
              {requirement.current}/{requirement.required}
            </span>
          </div>

          {/* Progress bar */}
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-200">
            <div
              className={cn(
                'h-full transition-all duration-500',
                isCompleted ? 'bg-emerald-500' : 'bg-slate-400',
              )}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export function CertificateTracker({ requirements, onViewCertificate }: CertificateTrackerProps) {
  const completedCount = requirements.filter(r => r.completed).length;
  const totalCount = requirements.length;
  // Avoid NaN when there are no requirements yet – treat as 0% progress
  const overallProgress = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);
  const isEligible = completedCount === totalCount;

  // Calculate the progress ring
  const radius = 35;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (overallProgress / 100) * circumference;

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium uppercase text-slate-500">Certificate Progress</h3>

      {/* Overall progress */}
      <div
        className={cn(
          'rounded-lg border bg-white p-4',
          isEligible ? 'border-emerald-200 bg-emerald-50/30' : 'border-slate-200',
        )}
      >
        <div className="flex items-center gap-4">
          {/* Progress ring */}
          <div className="relative h-20 w-20">
            <svg className="h-20 w-20 -rotate-90 transform">
              <circle
                cx="40"
                cy="40"
                r={radius}
                fill="none"
                stroke="currentColor"
                strokeWidth="5"
                className="text-slate-200"
              />
              <circle
                cx="40"
                cy="40"
                r={radius}
                fill="none"
                stroke="currentColor"
                strokeWidth="5"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                className={cn(
                  'transition-all duration-500',
                  isEligible ? 'text-emerald-500' : 'text-slate-400',
                )}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-bold text-slate-900">{overallProgress}%</span>
            </div>
          </div>

          {/* Certificate status */}
          <div className="flex-grow">
            <h4 className="font-medium text-slate-900">
              {isEligible ? 'Certificate Ready!' : 'Course Certificate'}
            </h4>
            <p className="mt-0.5 text-sm text-slate-600">
              {isEligible
                ? 'Congratulations! You can now claim your certificate.'
                : `Complete ${totalCount - completedCount} more requirement${
                    totalCount - completedCount === 1 ? '' : 's'
                  }`}
            </p>
          </div>
        </div>

        {isEligible && (
          <button
            onClick={onViewCertificate}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-emerald-700"
          >
            <Award className="h-4 w-4" />
            View Certificate
          </button>
        )}
      </div>

      {/* Requirements list */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-slate-500">Requirements</p>
        {requirements.map(requirement => (
          <RequirementItem key={requirement.id} requirement={requirement} />
        ))}
      </div>

      {/* Additional info */}
      {!isEligible && (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
          <div className="flex items-start gap-2">
            <Award className="mt-0.5 h-4 w-4 flex-shrink-0 text-slate-500" />
            <div className="text-xs text-slate-600">
              <p className="font-medium">Earn your certificate</p>
              <p className="mt-0.5">
                Complete all requirements to receive a verifiable certificate of completion.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
