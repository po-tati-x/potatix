export interface LessonProgress {
  lessonId: string;
  courseId: string;
  userId: string;
  status: 'not_started' | 'in_progress' | 'completed';
  startedAt?: Date;
  completedAt?: Date;
  lastWatchedAt?: Date;
  watchedDuration: number; // Total seconds watched
  totalDuration: number; // Total lesson duration in seconds
  lastPosition: number; // Last watched position in seconds
  completionPercentage: number; // 0-100
  attempts: number; // Number of times started
}

export interface CourseProgress {
  courseId: string;
  userId: string;
  enrolledAt: Date;
  startedAt?: Date;
  lastAccessedAt: Date;
  completedAt?: Date;
  status: 'enrolled' | 'in_progress' | 'completed' | 'expired';

  // Lesson progress
  totalLessons: number;
  completedLessons: number;
  currentLessonId?: string;
  lessonProgress: Map<string, LessonProgress>;

  // Time tracking
  totalWatchTime: number; // Total seconds watched across all lessons
  estimatedTimeRemaining: number; // Estimated seconds to complete

  // Overall progress
  overallPercentage: number; // 0-100
  moduleProgress: ModuleProgress[];

  // Certificate eligibility
  certificateEligible: boolean;
  certificateIssuedAt?: Date;
  certificateId?: string;
}

export interface ModuleProgress {
  moduleId: string;
  moduleTitle: string;
  status: 'locked' | 'available' | 'in_progress' | 'completed';
  unlockedAt?: Date;
  startedAt?: Date;
  completedAt?: Date;
  totalLessons: number;
  completedLessons: number;
  percentageComplete: number; // 0-100
  estimatedDuration: number; // Total estimated duration in seconds
  actualDuration: number; // Actual time spent in seconds
}

export interface LearningStreak {
  userId: string;
  currentStreak: number; // Days
  longestStreak: number; // Days
  lastActiveDate: Date;
  streakStartDate?: Date;
  totalActiveDays: number;
  streakHistory: StreakEntry[];
}

export interface StreakEntry {
  date: Date;
  minutesLearned: number;
  lessonsCompleted: number;
  coursesAccessed: string[]; // Course IDs
}

export interface LearningStatistics {
  userId: string;

  // Time-based stats
  totalLearningTime: number; // Total seconds across all courses
  averageSessionDuration: number; // Average seconds per session
  totalSessions: number;

  // Daily/Weekly/Monthly breakdowns
  dailyStats: DailyLearningStats[];
  weeklyGoal: number; // Target minutes per week
  weeklyProgress: number; // Actual minutes this week
  monthlyProgress: MonthlyProgress[];

  // Course stats
  coursesEnrolled: number;
  coursesCompleted: number;
  coursesInProgress: number;
  averageCompletionTime: number; // Average days to complete a course

  // Performance stats
  quizzesTaken: number;
  averageQuizScore: number; // 0-100
  bestQuizScore: number;
  projectsSubmitted: number;
  certificatesEarned: number;
}

export interface DailyLearningStats {
  date: Date;
  minutesLearned: number;
  lessonsCompleted: number;
  coursesAccessed: string[];
  quizzesTaken: number;
  notesCreated: number;
  resourcesDownloaded: number;
}

export interface MonthlyProgress {
  month: string; // YYYY-MM format
  totalMinutes: number;
  lessonsCompleted: number;
  coursesCompleted: number;
  streakDays: number;
}

export interface QuizProgress {
  quizId: string;
  lessonId: string;
  courseId: string;
  userId: string;
  attempts: QuizAttempt[];
  bestScore: number;
  lastAttemptAt: Date;
  isPassed: boolean;
  passingScore: number;
}

export interface QuizAttempt {
  attemptId: string;
  startedAt: Date;
  completedAt: Date;
  score: number; // 0-100
  totalQuestions: number;
  correctAnswers: number;
  timeSpent: number; // Seconds
  answers: QuizAnswer[];
}

export interface QuizAnswer {
  questionId: string;
  selectedAnswer: string | string[]; // Support multiple choice
  isCorrect: boolean;
  timeSpent: number; // Seconds on this question
}

export interface ResourceInteraction {
  resourceId: string;
  userId: string;
  courseId: string;
  lessonId?: string;
  interactionType: 'viewed' | 'downloaded' | 'saved' | 'shared';
  interactedAt: Date;
  savedForLater: boolean;
  downloadCount: number;
}

export interface UserNote {
  noteId: string;
  userId: string;
  courseId: string;
  lessonId?: string;
  content: string;
  timestamp?: number; // Video timestamp in seconds
  isHighlighted: boolean;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  isPrivate: boolean;
}

export interface Achievement {
  achievementId: string;
  userId: string;
  courseId?: string; // Optional - some achievements are platform-wide
  type: AchievementType;
  title: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockedAt?: Date;
  progress?: number; // For progressive achievements (0-100)
  criteria: AchievementCriteria;
  rewards?: AchievementReward[];
}

export type AchievementType =
  | 'first_lesson'
  | 'course_complete'
  | 'streak_7'
  | 'streak_30'
  | 'quiz_perfect'
  | 'speed_learner'
  | 'night_owl'
  | 'early_bird'
  | 'knowledge_seeker'
  | 'note_taker'
  | 'community_helper'
  | 'milestone_hours';

export interface AchievementCriteria {
  type: string;
  target: number;
  current: number;
}

export interface AchievementReward {
  type: 'badge' | 'certificate' | 'discount' | 'access';
  value: string;
  description: string;
}

export interface CertificateRequirement {
  requirementId: string;
  courseId: string;
  type: 'lessons' | 'quizzes' | 'project' | 'time' | 'score';
  title: string;
  description: string;
  target: number;
  current: number;
  isCompleted: boolean;
  completedAt?: Date;
}

export interface ProgressSnapshot {
  userId: string;
  courseId: string;
  snapshotDate: Date;
  overallProgress: number;
  lessonsCompleted: number;
  totalWatchTime: number;
  quizAverage: number;
  currentStreak: number;
  lastActiveDate: Date;
}
