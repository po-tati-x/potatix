import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { courseSchema } from '@/db';
import { eq } from 'drizzle-orm';

// GET /api/courses/slug-check?slug=example-slug
// Endpoint to check if a slug exists
export async function GET(request: NextRequest) {
  // Get slug from query params
  const url = new URL(request.url);
  const slug = url.searchParams.get('slug');
  
  if (!slug) {
    return NextResponse.json(
      { error: 'Slug parameter is required' },
      { status: 400 }
    );
  }
  
  try {
    // Find the course by slug
    const courses = await db
      .select({
        id: courseSchema.course.id
      })
      .from(courseSchema.course)
      .where(eq(courseSchema.course.slug, slug));
    
    // Return whether the slug exists and if it does, which course ID it belongs to
    const exists = courses.length > 0;
    const courseId = exists ? courses[0].id : null;
    
    return NextResponse.json({ 
      exists,
      courseId
    });
  } catch (error) {
    console.error('Error checking slug:', error);
    return NextResponse.json(
      { error: 'Failed to check slug' },
      { status: 500 }
    );
  }
} 