import { NextResponse } from 'next/server';
import { db, courseSchema } from '@/db';
import { auth } from '@/lib/auth/auth';
import { eq, and } from 'drizzle-orm';

// GET /api/courses/slug/[slug]
// Public endpoint - doesn't require auth
export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  // Await params to fix NextJS warning
  const { slug } = await Promise.resolve(params);
  
  if (!slug) {
    return NextResponse.json(
      { error: 'Course slug is required' },
      { status: 400 }
    );
  }
  
  try {
    console.log(`[API] Fetching course with slug: ${slug}`);
    
    // Find the course by slug, only return published courses
    const courses = await db
      .select()
      .from(courseSchema.course)
      .where(
        and(
          eq(courseSchema.course.slug, slug),
          eq(courseSchema.course.status, 'published')
        )
      );
    
    const course = courses[0];
    
    if (!course) {
      console.log(`[API] Course with slug "${slug}" not found or not published`);
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }
    
    // Fetch associated lessons
    const lessons = await db
      .select()
      .from(courseSchema.lesson)
      .where(eq(courseSchema.lesson.courseId, course.id))
      .orderBy(courseSchema.lesson.order);
    
    // Combine course with lessons
    const courseWithLessons = {
      ...course,
      lessons
    };
    
    console.log(`[API] Found course: ${course.title}`);
    return NextResponse.json({ course: courseWithLessons });
  } catch (error) {
    console.error('Error fetching course by slug:', error);
    return NextResponse.json(
      { error: 'Failed to fetch course' },
      { status: 500 }
    );
  }
} 