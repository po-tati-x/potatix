import type { Course, Lesson } from '@/lib/shared/types/courses';
import type {
  CourseProgress as BackendCourseProgress,
  LessonProgress,
  UserNote as BackendUserNote,
  Achievement as BackendAchievement,
  LearningStatistics,
  CertificateRequirement as BackendCertificateRequirement,
} from '@/lib/shared/types/progress';
import type {
  CourseProgress,
  CourseModule,
  CourseLesson,
  Achievement,
  Note,
  CertificateRequirement,
  LearningStats,
} from '@/components/features/viewer/course-hub/types';

// Map backend course progress to frontend format
export function mapCourseProgress(
  backendProgress: BackendCourseProgress | null,
  course?: Course
): CourseProgress {
  if (!backendProgress || !course) {
    return createDefaultProgress(course);
  }

  const lessonProgressMap = toMap(backendProgress.lessonProgress);

  const currentLesson = backendProgress.currentLessonId
    ? course.lessons?.find(l => l.id === backendProgress.currentLessonId)
    : course.lessons?.[0];

  // Derive lesson duration
  let lessonDuration = 0;
  if (backendProgress.currentLessonId) {
    const lp = lessonProgressMap.get(backendProgress.currentLessonId);
    if (lp?.totalDuration && lp.totalDuration > 0) {
      lessonDuration = lp.totalDuration;
    }
  }
  if (lessonDuration === 0 && currentLesson) {
    if (currentLesson.duration && currentLesson.duration > 0) {
      lessonDuration = currentLesson.duration;
    } else if (currentLesson.transcriptData?.duration && currentLesson.transcriptData.duration > 0) {
      lessonDuration = currentLesson.transcriptData.duration;
    }
  }

  // Determine per-lesson progress percentage
  let lessonPercent = 0;
  if (backendProgress.currentLessonId && lessonDuration > 0) {
    const lp = lessonProgressMap.get(backendProgress.currentLessonId);
    const lastPos = lp?.lastPosition ?? 0;
    lessonPercent = Math.round((lastPos / lessonDuration) * 100);
  }

  return {
    currentLessonId: backendProgress.currentLessonId || currentLesson?.id || '',
    currentLessonTitle: currentLesson?.title || '',
    currentLessonThumbnail:
      currentLesson?.thumbnailUrl ||
      (currentLesson?.playbackId ? `https://image.mux.com/${currentLesson.playbackId}/thumbnail.jpg` : undefined),
    lastWatchedAt: backendProgress.lastAccessedAt,
    lastWatchedPosition: getCurrentLessonPosition(backendProgress),
    totalDuration: lessonDuration,
    completedLessons: Array.from(lessonProgressMap.values())
      .filter(lp => lp.status === 'completed')
      .map(lp => lp.lessonId),
    totalLessons: backendProgress.totalLessons,
    // Prefer per-lesson percentage; fallback to course overall
    percentComplete: lessonPercent || backendProgress.overallPercentage,
  };
}

// Get current lesson position from backend progress
function getCurrentLessonPosition(progress: BackendCourseProgress): number {
  if (!progress.currentLessonId) return 0;
  const lessonProgress = progress.lessonProgress.get(progress.currentLessonId);
  return lessonProgress?.lastPosition || 0;
}

// Create default progress for new users
export function createDefaultProgress(course?: Course): CourseProgress {
  return {
    currentLessonId: '',
    currentLessonTitle: '',
    currentLessonThumbnail: undefined,
    lastWatchedAt: new Date(),
    lastWatchedPosition: 0,
    totalDuration: 0,
    completedLessons: [],
    totalLessons: course?.lessons?.length || 0,
    percentComplete: 0,
  };
}

// Map backend learning statistics to frontend format
export function mapLearningStats(backendStats: LearningStatistics | null): LearningStats {
  if (!backendStats) {
    return createDefaultStats();
  }

  return {
    currentStreak: backendStats.dailyStats.length, // Simplified - should calculate properly
    longestStreak: 0, // TODO: Calculate from streak history
    totalHoursThisWeek: backendStats.weeklyProgress / 60,
    totalHoursAllTime: backendStats.totalLearningTime / 3600,
    averageSessionLength: backendStats.averageSessionDuration / 60,
    bestQuizScore: backendStats.bestQuizScore || undefined,
    fastestQuizTime: undefined, // Not tracked in backend yet
    lastActiveDate: new Date(),
  };
}

// Create default stats for new users
export function createDefaultStats(): LearningStats {
  return {
    currentStreak: 0,
    longestStreak: 0,
    totalHoursThisWeek: 0,
    totalHoursAllTime: 0,
    averageSessionLength: 0,
    bestQuizScore: undefined,
    fastestQuizTime: undefined,
    lastActiveDate: new Date(),
  };
}

// Map backend user note to frontend format
export function mapUserNote(backendNote: BackendUserNote): Note {
  return {
    id: backendNote.noteId,
    content: backendNote.content,
    lessonId: backendNote.lessonId || '',
    lessonTitle: '', // TODO: Need to fetch from lesson data
    timestamp: backendNote.timestamp,
    createdAt: backendNote.createdAt,
    updatedAt: backendNote.updatedAt,
    isHighlighted: backendNote.isHighlighted || false,
  };
}

// Map backend achievement to frontend format
export function mapAchievement(backendAchievement: BackendAchievement): Achievement {
  return {
    id: backendAchievement.achievementId,
    title: backendAchievement.title,
    description: backendAchievement.description,
    icon: backendAchievement.icon,
    unlockedAt: backendAchievement.unlockedAt,
    progress: backendAchievement.progress,
    shareUrl: generateShareUrl(backendAchievement),
    rarity: backendAchievement.rarity,
  };
}

// Generate share URL for achievement
function generateShareUrl(achievement: BackendAchievement): string {
  const text = `I just unlocked "${achievement.title}"! 🎉`;
  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
}

// Map backend certificate requirement to frontend format
export function mapCertificateRequirement(
  backendReq: BackendCertificateRequirement
): CertificateRequirement {
  return {
    id: backendReq.requirementId,
    title: backendReq.title,
    completed: backendReq.isCompleted,
    type: backendReq.type,
    current: backendReq.current,
    required: backendReq.target,
  };
}

// Transform course lessons into modules
export function transformCourseToModules(
  course: Course,
  progressMap?: Map<string, LessonProgress>
): CourseModule[] {
  const safeProgress = toMap(progressMap);

  // Helper to transform a single lesson
  function mapLesson(lessonIn: Lesson): CourseLesson {
    const lp = safeProgress.get(lessonIn.id);

    let durationSec = 0;
    if (lessonIn.duration && lessonIn.duration > 0) {
      durationSec = lessonIn.duration;
    } else if (lessonIn.transcriptData?.duration && lessonIn.transcriptData.duration > 0) {
      durationSec = lessonIn.transcriptData.duration;
    } else if (lp?.totalDuration && lp.totalDuration > 0) {
      durationSec = lp.totalDuration;
    }

    // Final fallback – assume 10-minute lesson so UI isn't blank
    if (durationSec === 0) {
      durationSec = 600;
    }

    let progressPercent = 0;
    if (lp) {
      const denom = lp.totalDuration && lp.totalDuration > 0 ? lp.totalDuration : durationSec;
      if (denom > 0) {
        progressPercent = Math.round((lp.lastPosition / denom) * 100);
      }
      if (progressPercent === 0 && lp.completionPercentage) {
        progressPercent = lp.completionPercentage;
      }
    }

    const thumb = lessonIn.thumbnailUrl || (lessonIn.playbackId ? `https://image.mux.com/${lessonIn.playbackId}/thumbnail.jpg` : undefined);

    return {
      id: lessonIn.id,
      title: lessonIn.title,
      duration: durationSec,
      isCompleted: lp?.status === 'completed' || false,
      isLocked: !lessonIn.playbackId,
      isCurrent: false, // caller can overwrite
      moduleId: lessonIn.moduleId,
      progressPercentage: progressPercent,
      thumbnail: thumb,
    };
  }

  // Prefer backend-defined modules
  if (Array.isArray(course.modules) && course.modules.length > 0) {
    return course.modules.map((module) => {
      // Source lessons: module.lessons fallback to course.lessons filter
      const rawLessons = module.lessons && module.lessons.length > 0
        ? module.lessons
        : (course.lessons || []).filter((l) => l.moduleId === module.id);

      const lessons = rawLessons.map(mapLesson);
      const completedCount = lessons.filter((l) => l.isCompleted).length;

      return {
        id: module.id,
        title: module.title,
        description: module.description,
        lessons,
        completedCount,
        totalCount: lessons.length,
      };
    });
  }

  // Fallback for legacy courses without modules – bundle everything into one
  const lessons = (course.lessons || []).map(mapLesson);
  return [
    {
      id: 'default-module',
      title: 'Course Content',
      description: undefined,
      lessons,
      completedCount: lessons.filter((l) => l.isCompleted).length,
      totalCount: lessons.length,
    },
  ];
}

function toMap<K, V>(value: Map<K, V> | Array<[K, V]> | undefined): Map<K, V> {
  if (!value) return new Map();
  return value instanceof Map ? value : new Map(value);
}
