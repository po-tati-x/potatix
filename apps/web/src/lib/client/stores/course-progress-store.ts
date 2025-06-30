import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  CourseProgress,
  LessonProgress,
  LearningStreak,
  LearningStatistics,
  UserNote,
  Achievement,
  QuizProgress,
  QuizAttempt,
  ResourceInteraction,
  CertificateRequirement,
} from '@/lib/shared/types/progress';

interface CourseProgressState {
  // Current course context
  currentCourseId: string | null;
  currentLessonId: string | null;

  // Progress data
  courseProgress: Map<string, CourseProgress>;
  learningStreak: LearningStreak | null;
  learningStats: LearningStatistics | null;

  // User generated content
  notes: Map<string, UserNote>;
  savedResources: Map<string, ResourceInteraction>;

  // Achievements & certificates
  achievements: Map<string, Achievement>;
  certificateRequirements: Map<string, CertificateRequirement[]>;

  // Quiz data
  quizProgress: Map<string, QuizProgress>;

  // Actions
  setCurrentCourse: (courseId: string) => void;
  setCurrentLesson: (lessonId: string) => void;

  updateLessonProgress: (lessonProgress: Partial<LessonProgress>) => Promise<void>;
  completeLesson: (lessonId: string) => Promise<void>;

  updateWatchPosition: (lessonId: string, position: number, duration: number) => void;

  addNote: (note: Omit<UserNote, 'noteId' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateNote: (noteId: string, content: string) => Promise<void>;
  deleteNote: (noteId: string) => Promise<void>;

  saveResource: (resourceId: string, lessonId?: string) => Promise<void>;
  unsaveResource: (resourceId: string) => Promise<void>;

  markQuizComplete: (quizId: string, attempt: QuizAttempt) => Promise<void>;

  checkAchievements: () => Promise<Achievement[]>;
  updateStreak: () => Promise<void>;

  refreshCourseProgress: (courseId: string) => Promise<void>;
  syncWithBackend: () => Promise<void>;

  // Computed getters
  getCurrentCourseProgress: () => CourseProgress | null;
  getCurrentLessonProgress: () => LessonProgress | null;
  getCompletionPercentage: (courseId: string) => number;
  getEstimatedTimeRemaining: (courseId: string) => number;
  getCourseNotes: (courseId: string) => UserNote[];
  getCourseSavedResources: (courseId: string) => ResourceInteraction[];
  isLessonCompleted: (lessonId: string) => boolean;
  isLessonAccessible: (lessonId: string, courseId: string) => boolean;
}

export const useCourseProgressStore = create<CourseProgressState>()(
  persist(
    (set, get) => ({
      // Initial state
      currentCourseId: null,
      currentLessonId: null,
      courseProgress: new Map(),
      learningStreak: null,
      learningStats: null,
      notes: new Map(),
      savedResources: new Map(),
      achievements: new Map(),
      certificateRequirements: new Map(),
      quizProgress: new Map(),

      // Actions
      setCurrentCourse: courseId => {
        set({ currentCourseId: courseId });
      },

      setCurrentLesson: lessonId => {
        set({ currentLessonId: lessonId });
      },

      updateLessonProgress: async lessonProgress => {
        const { currentCourseId, courseProgress: progressMap } = get();
        if (!currentCourseId || !lessonProgress.lessonId) return;

        const courseProgress = progressMap.get(currentCourseId);
        if (!courseProgress) return;

        const existingProgress = courseProgress.lessonProgress.get(lessonProgress.lessonId);
        const updatedProgress = {
          ...existingProgress,
          ...lessonProgress,
          lastWatchedAt: new Date(),
        } as LessonProgress;

        courseProgress.lessonProgress.set(lessonProgress.lessonId, updatedProgress);
        courseProgress.lastAccessedAt = new Date();

        // Update overall progress
        const completedCount = Array.from(courseProgress.lessonProgress.values()).filter(
          lp => lp.status === 'completed',
        ).length;
        courseProgress.completedLessons = completedCount;
        courseProgress.overallPercentage = Math.round(
          (completedCount / courseProgress.totalLessons) * 100,
        );

        // Create new Map to trigger re-render
        const newProgressMap = new Map(progressMap);
        newProgressMap.set(currentCourseId, courseProgress);
        set({ courseProgress: newProgressMap });

        // TODO: Sync with backend API
        // await api.updateLessonProgress(lessonProgress);
      },

      completeLesson: async lessonId => {
        const { currentCourseId } = get();
        if (!currentCourseId) return;

        await get().updateLessonProgress({
          lessonId,
          status: 'completed',
          completedAt: new Date(),
          completionPercentage: 100,
        });

        // Check for new achievements
        await get().checkAchievements();
      },

      updateWatchPosition: (lessonId, position, duration) => {
        const { currentCourseId, courseProgress: progressMap } = get();
        if (!currentCourseId) return;

        let courseProgress = progressMap.get(currentCourseId);
        if (!courseProgress) {
          console.debug('Creating new CourseProgress for', currentCourseId);
          courseProgress = {
            courseId: currentCourseId,
            userId: 'current-user',
            enrolledAt: new Date(),
            lastAccessedAt: new Date(),
            status: 'in_progress',
            totalLessons: 0,
            completedLessons: 0,
            lessonProgress: new Map(),
            totalWatchTime: 0,
            estimatedTimeRemaining: 0,
            overallPercentage: 0,
            moduleProgress: [],
            certificateEligible: false,
          } as unknown as CourseProgress;
          progressMap.set(currentCourseId, courseProgress);
        }
        console.debug('updateWatchPosition', { lessonId, position, duration });

        const lessonProgress = courseProgress.lessonProgress.get(lessonId);
        let lp = lessonProgress;
        if (!lp) {
          // Initialise new progress entry
          lp = {
            lessonId,
            courseId: currentCourseId,
            userId: 'current-user', // runtime only; server will overwrite
            status: 'in_progress',
            watchedDuration: 0,
            totalDuration: duration,
            lastPosition: 0,
            completionPercentage: 0,
            attempts: 0,
          } as unknown as LessonProgress;
          courseProgress.lessonProgress.set(lessonId, lp);
        }

        lp.lastPosition = position;
        lp.watchedDuration = Math.max(lp.watchedDuration, position);
        lp.totalDuration = duration;
        lp.completionPercentage = Math.round((position / duration) * 100);

        // Mark this as the current lesson the user is watching
        courseProgress.currentLessonId = lessonId;

        // Recalculate overall completion percentage based on completed lessons count
        if (courseProgress.totalLessons && courseProgress.totalLessons > 0) {
          courseProgress.overallPercentage = Math.round(
            (courseProgress.completedLessons / courseProgress.totalLessons) * 100,
          );
        }

        if (lp.status === 'not_started') {
          lp.status = 'in_progress';
          lp.startedAt = new Date();
        }

        // Auto-complete if watched > 90%
        if (lp.completionPercentage >= 90 && lp.status !== 'completed') {
          lp.status = 'completed';
          lp.completedAt = new Date();
          courseProgress.completedLessons += 1;
        }

        // Create new Map to trigger re-render
        const newProgressMap = new Map(progressMap);
        newProgressMap.set(currentCourseId, courseProgress);
        set({ courseProgress: newProgressMap });
      },

      addNote: async noteData => {
        const noteId = `note-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const note: UserNote = {
          ...noteData,
          noteId,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        const newNotes = new Map(get().notes);
        newNotes.set(noteId, note);
        set({ notes: newNotes });

        // TODO: Sync with backend
        // await api.createNote(note);

        return noteId;
      },

      updateNote: async (noteId, content) => {
        const notes = get().notes;
        const note = notes.get(noteId);
        if (note) {
          note.content = content;
          note.updatedAt = new Date();
          const newNotes = new Map(notes);
          newNotes.set(noteId, note);
          set({ notes: newNotes });
        }

        // TODO: Sync with backend
        // await api.updateNote(noteId, { content });
      },

      deleteNote: async noteId => {
        const newNotes = new Map(get().notes);
        newNotes.delete(noteId);
        set({ notes: newNotes });

        // TODO: Sync with backend
        // await api.deleteNote(noteId);
      },

      saveResource: async (resourceId, lessonId) => {
        const { currentCourseId } = get();
        if (!currentCourseId) return;

        const interaction: ResourceInteraction = {
          resourceId,
          userId: 'current-user', // TODO: Get from auth
          courseId: currentCourseId,
          lessonId,
          interactionType: 'saved',
          interactedAt: new Date(),
          savedForLater: true,
          downloadCount: 0,
        };

        const newResources = new Map(get().savedResources);
        newResources.set(resourceId, interaction);
        set({ savedResources: newResources });

        // TODO: Sync with backend
        // await api.saveResource(resourceId);
      },

      unsaveResource: async resourceId => {
        const newResources = new Map(get().savedResources);
        newResources.delete(resourceId);
        set({ savedResources: newResources });

        // TODO: Sync with backend
        // await api.unsaveResource(resourceId);
      },

      markQuizComplete: async (quizId, attempt) => {
        const quizProgressMap = get().quizProgress;
        const quiz =
          quizProgressMap.get(quizId) ||
          ({
            quizId,
            lessonId: '',
            courseId: '',
            userId: 'current-user',
            attempts: [],
            bestScore: 0,
            lastAttemptAt: new Date(),
            isPassed: false,
            passingScore: 80,
          } as unknown as QuizProgress);

        quiz.attempts.push(attempt);
        quiz.bestScore = Math.max(quiz.bestScore, attempt.score);
        quiz.lastAttemptAt = new Date();
        quiz.isPassed = quiz.bestScore >= quiz.passingScore;

        const newQuizProgress = new Map(quizProgressMap);
        newQuizProgress.set(quizId, quiz);
        set({ quizProgress: newQuizProgress });

        // Check achievements
        await get().checkAchievements();

        // TODO: Sync with backend
        // await api.submitQuizAttempt(quizId, attempt);
      },

      checkAchievements: async () => {
        // TODO: Implement achievement checking logic
        // This would check various conditions and unlock achievements
        const newAchievements: Achievement[] = [];

        // Example: First lesson achievement
        const { courseProgress, achievements } = get();
        const hasCompletedFirstLesson = Array.from(courseProgress.values()).some(cp =>
          Array.from(cp.lessonProgress.values()).some(lp => lp.status === 'completed'),
        );

        if (hasCompletedFirstLesson && !achievements.has('first_lesson')) {
          const achievement: Achievement = {
            achievementId: 'first_lesson',
            userId: 'current-user',
            type: 'first_lesson',
            title: 'First Steps',
            description: 'Complete your first lesson',
            icon: 'trophy',
            rarity: 'common',
            unlockedAt: new Date(),
            criteria: { type: 'lessons_completed', target: 1, current: 1 },
          };
          const newAchievementsMap = new Map(get().achievements);
          newAchievementsMap.set('first_lesson', achievement);
          set({ achievements: newAchievementsMap });
          newAchievements.push(achievement);
        }

        return newAchievements;
      },

      updateStreak: async () => {
        // TODO: Implement streak calculation
        // This would check if user has learned today and update streak accordingly
      },

      refreshCourseProgress: async courseId => {
        void courseId; // parameter currently unused
        // TODO: Fetch fresh data from backend
      },

      syncWithBackend: async () => {
        // TODO: Implement full sync with backend
        // This would send all local changes and fetch latest data
      },

      // Computed getters
      getCurrentCourseProgress: () => {
        const { currentCourseId, courseProgress } = get();
        return currentCourseId ? courseProgress.get(currentCourseId) || null : null;
      },

      getCurrentLessonProgress: () => {
        const { currentCourseId, currentLessonId, courseProgress } = get();
        if (!currentCourseId || !currentLessonId) return null;

        const course = courseProgress.get(currentCourseId);
        return course ? course.lessonProgress.get(currentLessonId) || null : null;
      },

      getCompletionPercentage: courseId => {
        const progress = get().courseProgress.get(courseId);
        return progress ? progress.overallPercentage : 0;
      },

      getEstimatedTimeRemaining: courseId => {
        const progress = get().courseProgress.get(courseId);
        return progress ? progress.estimatedTimeRemaining : 0;
      },

      getCourseNotes: courseId => {
        return Array.from(get().notes.values()).filter(note => note.courseId === courseId);
      },

      getCourseSavedResources: courseId => {
        return Array.from(get().savedResources.values()).filter(
          resource => resource.courseId === courseId,
        );
      },

      isLessonCompleted: lessonId => {
        const { currentCourseId, courseProgress } = get();
        if (!currentCourseId) return false;

        const course = courseProgress.get(currentCourseId);
        const lesson = course?.lessonProgress.get(lessonId);
        return lesson?.status === 'completed' || false;
      },

      isLessonAccessible: (lessonId, courseId) => {
        void lessonId;
        void courseId; // parameters currently unused
        // TODO: Implement lesson access logic based on prerequisites
        return true;
      },
    }),
    {
      name: 'course-progress',
      storage: createJSONStorage(() => localStorage),
      merge: (persisted, current) => {
        const p = persisted as any;
        if (p.courseProgress) {
          p.courseProgress = new Map(
            p.courseProgress.map(([cid, cp]: any) => [
              cid,
              {
                ...cp,
                lessonProgress: new Map(cp.lessonProgress),
              },
            ]),
          );
        }
        if (p.notes) p.notes = new Map(p.notes);
        if (p.savedResources) p.savedResources = new Map(p.savedResources);
        if (p.achievements) p.achievements = new Map(p.achievements);
        if (p.quizProgress) p.quizProgress = new Map(p.quizProgress);
        return { ...current, ...p } as CourseProgressState;
      },
      partialize: (state) => ({
        courseProgress: Array.from(state.courseProgress.entries()).map(([cid, cp]) => [
          cid,
          {
            ...cp,
            lessonProgress: Array.from(cp.lessonProgress.entries()),
          },
        ]),
        learningStreak: state.learningStreak,
        learningStats: state.learningStats,
        notes: Array.from(state.notes.entries()),
        savedResources: Array.from(state.savedResources.entries()),
        achievements: Array.from(state.achievements.entries()),
        quizProgress: Array.from(state.quizProgress.entries()),
      }),
    },
  ),
);
