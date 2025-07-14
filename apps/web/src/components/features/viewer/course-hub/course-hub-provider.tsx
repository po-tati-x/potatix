'use client';

import { createContext, useContext, ReactNode, useCallback } from 'react';
import {
  useCourseData,
  useLearningStats,
  useUpdateLessonProgress,
} from '@/lib/client/hooks/use-course-data';
import { useCourseProgressStore } from '@/lib/client/stores/course-progress-store';
import type {
  CourseProgress,
  LearningStats,
  CourseModule,
  Resource,
  DiscussionThread,
  Achievement,
  UpcomingEvent,
  Note,
  CertificateRequirement,
} from './types';
import type { Course } from '@/lib/shared/types/courses';

interface CourseHubContextValue {
  // Course data
  course: Course | undefined;
  modules: CourseModule[];
  progress: CourseProgress;
  stats: LearningStats;
  resources: Resource[];
  discussions: DiscussionThread[];
  achievements: Achievement[];
  upcomingEvents: UpcomingEvent[];
  notes: Note[];
  certificateRequirements: CertificateRequirement[];

  // Loading states
  isLoading: boolean;
  isLoadingSupplementary: boolean;

  // Error states
  error: Error | undefined;
  hasSupplementaryError: boolean;

  // Actions
  onLessonClick: (lessonId: string) => void;
  onResourceSave: (resourceId: string) => Promise<void>;
  onNoteCreate: (note: Partial<Note>) => Promise<void>;
  onNoteEdit: (noteId: string, content: string) => Promise<void>;
  onNoteDelete: (noteId: string) => Promise<void>;
  onAskAI: (prompt: string) => Promise<void>;
  onThreadClick: (threadId: string) => void;
  onAskCommunity: () => void;
  onAddToCalendar: (event: UpcomingEvent) => void;
  onWatchRecording: (recordingUrl: string) => void;
  onShareAchievement: (achievement: Achievement) => void;
  onViewCertificate: () => void;
  onOpenNotesEditor: () => void;

  // Progress updates
  onUpdateProgress: (lessonId: string, position: number, duration: number) => Promise<void> | void;
  onMarkLessonComplete: (lessonId: string) => Promise<void> | void;

  // Refresh methods
  refetch: () => void;
  refetchProgress: () => void;
}

const CourseHubContext = createContext<CourseHubContextValue | undefined>(undefined);

export function useCourseHub() {
  const context = useContext(CourseHubContext);
  if (!context) {
    throw new Error('useCourseHub must be used within CourseHubProvider');
  }
  return context;
}

interface CourseHubProviderProps {
  courseSlug: string;
  children: ReactNode;
}

export function CourseHubProvider({ courseSlug, children }: CourseHubProviderProps) {
  // Fetch all course data
  const {
    course,
    modules,
    progress,
    resources,
    discussions,
    achievements,
    upcomingEvents,
    notes,
    certificateRequirements,
    isLoading,
    isLoadingSupplementary,
    error,
    hasSupplementaryError,
    refetch,
    refetchProgress,
  } = useCourseData(courseSlug);

  // Fetch learning stats
  const { stats } = useLearningStats();

  // Individual selectors – avoid pulling the entire store (prevents any type leakage)
  const setCurrentLesson = useCourseProgressStore((s) => s.setCurrentLesson);
  const addNote = useCourseProgressStore((s) => s.addNote);
  const updateNote = useCourseProgressStore((s) => s.updateNote);
  const deleteNote = useCourseProgressStore((s) => s.deleteNote);
  const saveResource = useCourseProgressStore((s) => s.saveResource);
  const unsaveResource = useCourseProgressStore((s) => s.unsaveResource);

  // Get update progress hook
  const { updateProgress, markLessonComplete } = useUpdateLessonProgress();

  // Wrap async progress helpers so callers never await (satisfy no-misused-promises)
  const handleUpdateProgress = useCallback(
    (lessonId: string, position: number, duration: number) => {
      void updateProgress(lessonId, position, duration);
    },
    [updateProgress],
  );

  const handleMarkLessonComplete = useCallback(
    (lessonId: string) => {
      void markLessonComplete(lessonId);
    },
    [markLessonComplete],
  );

  // Navigation handlers
  const handleLessonClick = useCallback(
    (lessonId: string) => {
      if (!course) return;
      setCurrentLesson(lessonId);
      // Navigation is handled by the router in course-hub-client
      globalThis.location.href = `/viewer/${courseSlug}/lesson/${lessonId}`;
    },
    [course, courseSlug, setCurrentLesson],
  );

  // Resource handlers
  const handleResourceSave = useCallback(
    async (resourceId: string) => {
      const resource = resources.find(r => r.id === resourceId);
      if (!resource) return;

      await (resource.savedForLater ? unsaveResource(resourceId) : saveResource(resourceId, resource.lessonId));

      // TODO: Show success toast
    },
    [resources, saveResource, unsaveResource],
  );

  // Note handlers
  const handleNoteCreate = useCallback(
    async (noteData: Partial<Note>) => {
      if (!course) return;

      await addNote({
        userId: 'current-user', // TODO: Get from auth
        courseId: course.id,
        content: noteData.content || '',
        lessonId: noteData.lessonId,
        timestamp: noteData.timestamp,
        isHighlighted: noteData.isHighlighted || false,
        tags: [],
        isPrivate: false,
      });

      // TODO: Show success toast
    },
    [course, addNote],
  );

  const handleNoteEdit = useCallback(
    async (noteId: string, content: string) => {
      await updateNote(noteId, content);
      // TODO: Show success toast
    },
    [updateNote],
  );

  const handleNoteDelete = useCallback(
    async (noteId: string) => {
      await deleteNote(noteId);
      // TODO: Show success toast
    },
    [deleteNote],
  );

  // AI handler
  const handleAskAI = useCallback(
    async (prompt: string) => {
      if (!course) return;

      try {
        const response = await fetch('/api/ai/ask', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt,
            courseId: course.id,
            context: {
              currentLesson: progress.currentLessonTitle,
              courseTitle: course.title,
            },
          }),
        });

        if (!response.ok) throw new Error('Failed to get AI response');

        // Handle streaming response
        const reader = response.body?.getReader();
        if (!reader) return;

        // TODO: Implement streaming UI update
        while (true) {
          const { done, value: chunk } = await reader.read();
          if (done) break;
          void chunk;
        }
      } catch (error) {
        console.error('AI request failed:', error);
        // TODO: Show error toast
      }
    },
    [course, progress],
  );

  // Discussion handlers
  const handleThreadClick = useCallback((threadId: string) => {
    // TODO: Navigate to discussion thread
    console.log('Navigate to thread:', threadId);
  }, []);

  const handleAskCommunity = useCallback(() => {
    // TODO: Open discussion composer
    console.log('Open community composer');
  }, []);

  // Event handlers
  const handleAddToCalendar = useCallback((event: UpcomingEvent) => {
    // Generate calendar file or use calendar API
    const calendarUrl = event.calendarLink || generateCalendarLink(event);
    window.open(calendarUrl, '_blank');
  }, []);

  const handleWatchRecording = useCallback((recordingUrl: string) => {
    window.open(recordingUrl, '_blank');
  }, []);

  // Achievement handlers
  const handleShareAchievement = useCallback(
    (achievement: Achievement) => {
      if (achievement.shareUrl) {
        window.open(achievement.shareUrl, '_blank');
      } else {
        // Generate share URL
        const shareText = `I just unlocked "${achievement.title}" in ${course?.title}! 🎉`;
        const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
        window.open(shareUrl, '_blank');
      }
    },
    [course],
  );

  // Certificate handler
  const handleViewCertificate = useCallback(() => {
    if (!course) return;
    // TODO: Navigate to certificate page
    globalThis.location.href = `/courses/${course.id}/certificate`;
  }, [course]);

  // Notes editor handler
  const handleOpenNotesEditor = useCallback(() => {
    if (!course) return;
    // TODO: Open notes editor modal or page
    console.log('Open notes editor');
  }, [course]);

  // Ensure course is undefined instead of null to match context type
  const courseOrUndefined: Course | undefined = course ?? undefined;

  const contextValue: CourseHubContextValue = {
    // Data
    course: courseOrUndefined,
    modules,
    progress,
    stats,
    resources,
    discussions,
    achievements,
    upcomingEvents,
    notes,
    certificateRequirements,

    // States
    isLoading,
    isLoadingSupplementary,
    error,
    hasSupplementaryError,

    // Actions
    onLessonClick: handleLessonClick,
    onResourceSave: handleResourceSave,
    onNoteCreate: handleNoteCreate,
    onNoteEdit: handleNoteEdit,
    onNoteDelete: handleNoteDelete,
    onAskAI: handleAskAI,
    onThreadClick: handleThreadClick,
    onAskCommunity: handleAskCommunity,
    onAddToCalendar: handleAddToCalendar,
    onWatchRecording: handleWatchRecording,
    onShareAchievement: handleShareAchievement,
    onViewCertificate: handleViewCertificate,
    onOpenNotesEditor: handleOpenNotesEditor,

    // Progress actions
    onUpdateProgress: handleUpdateProgress,
    onMarkLessonComplete: handleMarkLessonComplete,

    // Refresh
    refetch,
    refetchProgress,
  };

  return <CourseHubContext.Provider value={contextValue}>{children}</CourseHubContext.Provider>;
}

// Helper to generate calendar links
function generateCalendarLink(event: UpcomingEvent): string {
  const startTime = new Date(event.startTime);
  const endTime = new Date(startTime.getTime() + event.duration * 60_000);

  const formatDate = (date: Date) =>
    date
      .toISOString()
      .replaceAll(/[-:]/g, '')
      .replace(/\.\d{3}/, '');

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${formatDate(startTime)}/${formatDate(endTime)}`,
    details: `${event.type} session with ${event.instructorName}`,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
