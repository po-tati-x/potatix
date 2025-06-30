export interface CourseProgress {
  currentLessonId: string;
  currentLessonTitle: string;
  currentLessonThumbnail?: string;
  lastWatchedAt: Date;
  lastWatchedPosition: number; // seconds
  totalDuration: number; // seconds
  completedLessons: string[];
  totalLessons: number;
  percentComplete: number;
}

export interface LearningStats {
  currentStreak: number;
  longestStreak: number;
  totalHoursThisWeek: number;
  totalHoursAllTime: number;
  averageSessionLength: number; // minutes
  bestQuizScore?: number;
  fastestQuizTime?: number; // seconds
  lastActiveDate?: Date;
}

export interface Resource {
  id: string;
  title: string;
  type: 'pdf' | 'code' | 'cheatsheet' | 'video' | 'link';
  url: string;
  size?: number;
  savedForLater: boolean;
  downloadedAt?: Date;
  lessonId?: string;
  lessonTitle?: string;
}

export interface DiscussionThread {
  id: string;
  title: string;
  replyCount: number;
  lastReplyAt: Date;
  lastReplyAuthor: {
    name: string;
    avatar?: string;
  };
  isUnread: boolean;
  isPinned?: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string; // emoji or icon name
  unlockedAt?: Date;
  progress?: number; // 0-100 for progressive achievements
  shareUrl?: string;
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface UpcomingEvent {
  id: string;
  title: string;
  type: 'live' | 'qa' | 'workshop';
  startTime: Date;
  duration: number; // minutes
  instructorName: string;
  instructorAvatar?: string;
  calendarLink: string;
  recordingUrl?: string;
  attendeeCount?: number;
}

export interface Note {
  id: string;
  content: string;
  lessonId: string;
  lessonTitle: string;
  timestamp?: number; // video timestamp in seconds
  createdAt: Date;
  updatedAt: Date;
  isHighlighted?: boolean;
}

export interface CertificateRequirement {
  id: string;
  title: string;
  completed: boolean;
  type: 'lessons' | 'quizzes' | 'project' | 'time' | 'score';
  current: number;
  required: number;
}

export interface CourseModule {
  id: string;
  title: string;
  description?: string;
  lessons: CourseLesson[];
  isCollapsed?: boolean;
  completedCount: number;
  totalCount: number;
}

export interface CourseLesson {
  id: string;
  title: string;
  duration: number; // seconds
  isCompleted: boolean;
  isLocked: boolean;
  isCurrent?: boolean;
  /** 0-100 watched percentage */
  progressPercentage?: number;
  /** Optional thumbnail URL */
  thumbnail?: string;
  moduleId: string;
}

export interface CourseHubProps {
  courseId: string;
  courseSlug: string;
  courseTitle: string;
  progress: CourseProgress;
  stats: LearningStats;
  modules: CourseModule[];
  resources: Resource[];
  discussions: DiscussionThread[];
  achievements: Achievement[];
  upcomingEvents: UpcomingEvent[];
  notes: Note[];
  certificateRequirements: CertificateRequirement[];
  onLessonClick: (lessonId: string) => void;
  onResourceSave: (resourceId: string) => void;
  onNoteCreate: (note: Partial<Note>) => void;
  onAskAI: (prompt: string) => void;
}
