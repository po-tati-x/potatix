'use client';

import { useState, useEffect } from 'react';
import { ResumeTile } from './resume-tile';
import { PersonalStats } from './personal-stats';
import { KnowledgeTimeline } from './knowledge-timeline';
import { ResourceCenter } from './resource-center';
import { DiscussionSnapshot } from './discussion-snapshot';
import { AITutorBox } from './ai-tutor-box';
import { UpcomingEvents } from './upcoming-events';
import { AchievementsPanel } from './achievements-panel';
import { NotesHighlights } from './notes-highlights';
import { CertificateTracker } from './certificate-tracker';
import { MobileResumeBar } from './mobile-resume-bar';
import { useCourseHub } from './course-hub-provider';

export function CourseHub() {
  const {
    course,
    modules,
    progress,
    stats,
    resources,
    discussions,
    achievements,
    upcomingEvents,
    notes,
    certificateRequirements,
    isLoading,
    error,
    onLessonClick,
    onResourceSave,
    onNoteCreate,
    onNoteEdit,
    onAskAI,
    onThreadClick,
    onAskCommunity,
    onAddToCalendar,
    onWatchRecording,
    onShareAchievement,
    onViewCertificate,
    onOpenNotesEditor,
  } = useCourseHub();
  const [showMobileResumeBar, setShowMobileResumeBar] = useState(true);

  // Handle scroll to show/hide mobile resume bar
  useEffect(() => {
    let lastScrollY = window.scrollY;
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;

          // Hide when scrolling down, show when scrolling up
          if (currentScrollY > lastScrollY && currentScrollY > 100) {
            setShowMobileResumeBar(false);
          } else {
            setShowMobileResumeBar(true);
          }

          lastScrollY = currentScrollY;
          ticking = false;
        });

        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleResume = () => {
    if (progress.currentLessonId) {
      onLessonClick(progress.currentLessonId);
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-emerald-600" />
          <p className="mt-4 text-sm text-slate-600">Loading course...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error || !course) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <p className="text-lg font-medium text-slate-900">Failed to load course</p>
          <p className="mt-2 text-sm text-slate-600">{error?.message || 'Course not found'}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-slate-50">
        <div className="container py-6">
          <div className="mx-auto max-w-5xl px-4 py-6">
            {/* Page header – mirrors DashboardHeader */}
            <header className="mb-6 border-b border-slate-200 pb-5">
              <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <div>
                  <h1 className="text-xl font-medium text-slate-900">{course.title}</h1>
                  <p className="mt-1 text-sm text-slate-600">Continue your learning journey</p>
                </div>

                {/* Future: header actions (e.g., share, edit) – keep placeholder for consistency */}
                <div className="flex items-center gap-3" />
              </div>
            </header>

            {/* Main grid layout */}
            <div className="grid gap-6 lg:grid-cols-12">
              {/* Main content area */}
              <div className="space-y-6 lg:col-span-8">
                {/* Resume tile - hero element */}
                <ResumeTile
                  progress={progress}
                  courseSlug={course.slug || ''}
                  onResume={handleResume}
                />

                {/* Stats on mobile */}
                <div className="lg:hidden">
                  <PersonalStats stats={stats} />
                </div>

                {/* Knowledge timeline */}
                <KnowledgeTimeline
                  modules={modules}
                  onLessonClick={onLessonClick}
                  currentLessonId={progress.currentLessonId}
                />

                {/* Resources */}
                <ResourceCenter resources={resources} onResourceSave={onResourceSave} />

                {/* Discussion on tablet/mobile */}
                <div className="lg:hidden">
                  <DiscussionSnapshot
                    discussions={discussions}
                    onThreadClick={onThreadClick}
                    onAskCommunity={onAskCommunity}
                  />
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6 lg:col-span-4">
                {/* Stats on desktop */}
                <div className="hidden lg:block">
                  <PersonalStats stats={stats} />
                </div>

                {/* Certificate tracker */}
                <CertificateTracker
                  requirements={certificateRequirements}
                  onViewCertificate={onViewCertificate}
                />

                {/* AI Tutor */}
                <AITutorBox onAskAI={onAskAI} isStreaming={false} streamingResponse="" />

                {/* Notes & Highlights */}
                <NotesHighlights
                  notes={notes}
                  onNoteCreate={onNoteCreate}
                  onNoteEdit={onNoteEdit}
                  onOpenFullEditor={onOpenNotesEditor}
                />

                {/* Achievements */}
                <AchievementsPanel achievements={achievements} onShare={onShareAchievement} />

                {/* Upcoming events */}
                <UpcomingEvents
                  events={upcomingEvents}
                  onAddToCalendar={onAddToCalendar}
                  onWatchRecording={onWatchRecording}
                />

                {/* Discussion on desktop */}
                <div className="hidden lg:block">
                  <DiscussionSnapshot
                    discussions={discussions}
                    onThreadClick={onThreadClick}
                    onAskCommunity={onAskCommunity}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile resume bar */}
      <MobileResumeBar
        progress={progress}
        isVisible={showMobileResumeBar}
        onResume={handleResume}
        onExpand={() => {
          // Scroll to top to show full resume tile
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />
    </>
  );
}
