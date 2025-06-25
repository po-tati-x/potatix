import { getDb } from "@potatix/db";
import { sql } from "drizzle-orm";
import { CourseProgressData } from '@/components/features/dashboard/types';

/**
 * Service for dashboard course progress metrics
 */
export const dashboardProgressService = {
  /**
   * Get course progress metrics
   */
  async getCourseProgress(userId: string): Promise<CourseProgressData[]> {
    const db = getDb();

    type ProgressRow = {
      id: string;
      title: string;
      active_students: number;
      completion_rate: number;
      avg_engagement: number;
      bottleneck_lesson: string | null;
      dropoff_rate: number;
    };

    const result = await db.execute(sql<ProgressRow>`
      WITH lessons_per_course AS (
        SELECT course_id, COUNT(*) AS lesson_count
        FROM lesson
        GROUP BY course_id
      ),
      student_enrollments AS (
        SELECT course_id,
               COUNT(DISTINCT user_id) FILTER (WHERE status = 'active') AS active_students
        FROM course_enrollment
        GROUP BY course_id
      ),
      completion_stats AS (
        SELECT lp.course_id,
               SUM(CASE WHEN lp.completed IS NOT NULL THEN 1 ELSE 0 END) AS completed_lessons,
               COUNT(DISTINCT lp.user_id)                           AS progress_users
        FROM lesson_progress lp
        GROUP BY lp.course_id
      ),
      engagement_stats AS (
        SELECT lp.course_id,
               SUM(lp.watch_time_seconds) AS watch_time,
               SUM(l.duration)           AS total_duration
        FROM lesson_progress lp
        JOIN lesson l ON l.id = lp.lesson_id
        GROUP BY lp.course_id
      ),
      bottleneck AS (
        SELECT lp.course_id,
               lp.lesson_id,
               COUNT(*) FILTER (WHERE lp.completed IS NOT NULL)::float / COUNT(DISTINCT lp.user_id) AS completion_rate
        FROM lesson_progress lp
        GROUP BY lp.course_id, lp.lesson_id
      ),
      bottleneck_ranked AS (
        SELECT DISTINCT ON (course_id)
               course_id,
               lesson_id
        FROM bottleneck
        ORDER BY course_id, completion_rate ASC
      )
      SELECT
        c.id,
        c.title,
        COALESCE(se.active_students, 0)                                           AS active_students,
        CASE 
          WHEN se.active_students = 0 OR lpc.lesson_count = 0 THEN 0
          ELSE ROUND(
            (cs.completed_lessons::float / (se.active_students * lpc.lesson_count)) * 100
          )
        END                                                                      AS completion_rate,
        CASE 
          WHEN es.total_duration = 0 THEN 0
          ELSE ROUND((es.watch_time::float / es.total_duration) * 100)
        END                                                                      AS avg_engagement,
        bl_l.title                                                               AS bottleneck_lesson,
        CASE 
          WHEN se.active_students = 0 THEN 0
          ELSE ROUND(((se.active_students - cs.progress_users)::float / se.active_students) * 100)
        END                                                                      AS dropoff_rate
      FROM course c
      LEFT JOIN lessons_per_course lpc ON lpc.course_id = c.id
      LEFT JOIN student_enrollments se ON se.course_id = c.id
      LEFT JOIN completion_stats cs ON cs.course_id = c.id
      LEFT JOIN engagement_stats es ON es.course_id = c.id
      LEFT JOIN bottleneck_ranked bl ON bl.course_id = c.id
      LEFT JOIN lesson bl_l ON bl_l.id = bl.lesson_id
      WHERE c.user_id = ${userId};
    `);

    const rows = result.rows as ProgressRow[];

    return rows.map((r) => ({
      id: r.id,
      title: r.title,
      activeStudents: r.active_students ?? 0,
      completionRate: r.completion_rate ?? 0,
      avgEngagement: r.avg_engagement ?? 0,
      bottleneckLesson: r.bottleneck_lesson ?? 'N/A',
      dropoffRate: r.dropoff_rate ?? 0,
    }));
  }
}; 