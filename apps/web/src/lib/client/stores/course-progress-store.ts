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
  currentCourseId: string | undefined;
  currentLessonId: string | undefined;

  // Progress data
  courseProgress: Map<string, CourseProgress>;
  learningStreak: LearningStreak | undefined;
  learningStats: LearningStatistics | undefined;

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
  getCurrentCourseProgress: () => CourseProgress | undefined;
  getCurrentLessonProgress: () => LessonProgress | undefined;
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
      currentCourseId: undefined,
      currentLessonId: undefined,
      courseProgress: new Map(),
      learningStreak: undefined,
      learningStats: undefined,
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
        // Ensure function contains await (eslint require-await)
        await Promise.resolve();
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
        const completedCount = [...courseProgress.lessonProgress.values()].filter(
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
        await Promise.resolve();
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
        await Promise.resolve();
        const noteId = `note-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
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
        await Promise.resolve();
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
        await Promise.resolve();
        const newNotes = new Map(get().notes);
        newNotes.delete(noteId);
        set({ notes: newNotes });

        // TODO: Sync with backend
        // await api.deleteNote(noteId);
      },

      saveResource: async (resourceId, lessonId) => {
        await Promise.resolve();
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
        await Promise.resolve();
        const newResources = new Map(get().savedResources);
        newResources.delete(resourceId);
        set({ savedResources: newResources });

        // TODO: Sync with backend
        // await api.unsaveResource(resourceId);
      },

      markQuizComplete: async (quizId, attempt) => {
        await Promise.resolve();
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
        await Promise.resolve();
        // TODO: Implement achievement checking logic
        // This would check various conditions and unlock achievements
        const newAchievements: Achievement[] = [];

        // Example: First lesson achievement
        const { courseProgress, achievements } = get();
        const hasCompletedFirstLesson = [...courseProgress.values()].some(cp =>
          [...cp.lessonProgress.values()].some(lp => lp.status === 'completed'),
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
        await Promise.resolve();
        // TODO: Implement streak calculation
        // This would check if user has learned today and update streak accordingly
      },

      refreshCourseProgress: async courseId => {
        await Promise.resolve();
        void courseId; // parameter currently unused
        // TODO: Fetch fresh data from backend
      },

      syncWithBackend: async () => {
        await Promise.resolve();
        // TODO: Implement full sync with backend
        // This would send all local changes and fetch latest data
      },

      // Computed getters
      getCurrentCourseProgress: () => {
        const { currentCourseId, courseProgress } = get();
        return currentCourseId ? courseProgress.get(currentCourseId) : void 0;
      },

      getCurrentLessonProgress: () => {
        const { currentCourseId, currentLessonId, courseProgress } = get();
        if (!currentCourseId || !currentLessonId) return;

        const course = courseProgress.get(currentCourseId);
        return course?.lessonProgress.get(currentLessonId);
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
        return [...get().notes.values()].filter(note => note.courseId === courseId);
      },

      getCourseSavedResources: courseId => {
        return [...get().savedResources.values()].filter(
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
      merge: (persistedState: unknown, currentState: CourseProgressState): CourseProgressState => {
        type SerializedLessonProgressEntry = [string, LessonProgress];
        type SerializedCourseProgressEntry = [
          string,
          {
            lessonProgress: SerializedLessonProgressEntry[];
          } & Omit<CourseProgress, 'lessonProgress'>
        ];

        const p = persistedState as Partial<CourseProgressState>;

        // Rehydrate nested Maps
        if (Array.isArray(p.courseProgress)) {
          p.courseProgress = new Map(
            (p.courseProgress as SerializedCourseProgressEntry[]).map(([cid, cp]) => [
              cid,
              {
                ...cp,
                lessonProgress: new Map(cp.lessonProgress),
              } as CourseProgress,
            ]),
          );
        }

        if (Array.isArray(p.notes)) p.notes = new Map(p.notes as [string, UserNote][]);
        if (Array.isArray(p.savedResources)) p.savedResources = new Map(p.savedResources as [string, ResourceInteraction][]);
        if (Array.isArray(p.achievements)) p.achievements = new Map(p.achievements as [string, Achievement][]);
        if (Array.isArray(p.quizProgress)) p.quizProgress = new Map(p.quizProgress as [string, QuizProgress][]);

        return { ...currentState, ...(p as CourseProgressState) };
      },

      partialize: (state: CourseProgressState) => ({
        courseProgress: [...state.courseProgress.entries()].map(([cid, cp]) => [
          cid,
          {
            ...cp,
            lessonProgress: [...cp.lessonProgress.entries()],
          },
        ]),
        learningStreak: state.learningStreak,
        learningStats: state.learningStats,
        notes: [...state.notes.entries()],
        savedResources: [...state.savedResources.entries()],
        achievements: [...state.achievements.entries()],
        quizProgress: [...state.quizProgress.entries()],
      }),
    },
  ),
);
