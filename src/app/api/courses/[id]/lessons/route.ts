import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { courseSchema, authSchema } from '@/db';
import { auth } from '@/lib/auth/auth';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { sql } from 'drizzle-orm';
import { nanoid } from 'nanoid';

// Lesson input validation schema
const lessonSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional().nullable(),
  videoId: z.string().optional().nullable(),
  order: z.number().int().positive('Order must be a positive number')
});

// Type for the structured API response
type ApiResponse<T = any> = {
  id?: string;
  lesson?: T;
  error?: string;
  status?: number;
};

// Helper function to authenticate user and check course ownership
async function checkCourseOwnership(request: NextRequest, courseId: string): Promise<ApiResponse> {
  try {
    // Authenticate the user first
    const session = await auth.api.getSession({
      headers: request.headers
    });
    
    if (!session || !session.user) {
      console.log('No valid session found for lesson request');
      return { error: 'Authentication required', status: 401 };
    }
    
    // Check if the course exists and belongs to the user
    const courses = await db.select({
      id: courseSchema.course.id,
      userId: courseSchema.course.userId,
    })
    .from(courseSchema.course)
    .where(eq(courseSchema.course.id, courseId))
    .limit(1);
    
    if (!courses.length) {
      return { error: 'Course not found', status: 404 };
    }
    
    const course = courses[0];
    
    // Check if the user is the owner of this course
    if (course.userId !== session.user.id) {
      return { error: 'Access denied', status: 403 };
    }
    
    // Return the course ID if owner is valid
    return { id: course.id };
  } catch (error) {
    console.error('Error checking course ownership:', error);
    const message = error instanceof Error ? error.message : 'Failed to validate course access';
    return { error: message, status: 500 };
  }
}

// POST handler to create a new lesson
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const courseId = params.id;
  
  if (!courseId) {
    return NextResponse.json(
      { error: 'Course ID is required' },
      { status: 400 }
    );
  }
  
  // Check course ownership
  const ownershipCheck = await checkCourseOwnership(request, courseId);
  
  if (ownershipCheck.error) {
    return NextResponse.json(
      { error: ownershipCheck.error },
      { status: ownershipCheck.status || 500 }
    );
  }
  
  try {
    // Parse request body
    const body = await request.json();
    
    // Validate lesson data
    const validationResult = lessonSchema.safeParse(body);
    
    if (!validationResult.success) {
      const errors = validationResult.error.format();
      return NextResponse.json(
        { error: 'Invalid lesson data', details: errors },
        { status: 400 }
      );
    }
    
    const lessonData = validationResult.data;
    
    // Generate a unique ID for the lesson
    const lessonId = nanoid();
    
    // Insert the lesson
    const newLesson = await db.insert(courseSchema.lesson)
      .values({
        id: lessonId,
        title: lessonData.title,
        description: lessonData.description,
        videoId: lessonData.videoId,
        order: lessonData.order,
        courseId: courseId,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();
    
    // Update lesson count in course using a separate query
    await db.execute(sql`
      UPDATE course 
      SET "updatedAt" = NOW()
      WHERE id = ${courseId}
    `);
    
    return NextResponse.json({
      id: newLesson[0].id,
      message: 'Lesson created successfully'
    });
  } catch (error) {
    console.error('Failed to create lesson:', error);
    const message = error instanceof Error ? error.message : 'Failed to create lesson';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
} 