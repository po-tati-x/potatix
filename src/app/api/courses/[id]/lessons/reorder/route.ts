import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { courseSchema } from '@/db';
import { auth } from '@/lib/auth/auth';
import { z } from 'zod';
import { eq, and } from 'drizzle-orm';

// Lesson reordering validation schema
const reorderSchema = z.object({
  lessons: z.array(z.object({
    id: z.string().min(1, 'Lesson ID is required'),
    order: z.number().int().nonnegative('Order must be a non-negative number')
  }))
});

// Helper function to check course ownership
async function checkCourseOwnership(request: NextRequest, courseId: string): Promise<boolean> {
  try {
    // Authenticate the user first
    const session = await auth.api.getSession({
      headers: request.headers
    });
    
    if (!session || !session.user) {
      return false;
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
      return false;
    }
    
    // Check if the user is the owner of this course
    return courses[0].userId === session.user.id;
  } catch (error) {
    console.error('Error checking course ownership:', error);
    return false;
  }
}

// PATCH handler to reorder lessons
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: courseId } = await params;
  
  console.log(`[DEBUG] PATCH /api/courses/${courseId}/lessons/reorder - Starting...`);
  
  if (!courseId) {
    console.log('[DEBUG] Course ID is missing');
    return NextResponse.json(
      { error: 'Course ID is required' },
      { status: 400 }
    );
  }
  
  // Check ownership
  const isOwner = await checkCourseOwnership(request, courseId);
  console.log(`[DEBUG] Course ownership check result: ${isOwner}`);
  
  if (!isOwner) {
    console.log('[DEBUG] Authentication failed');
    return NextResponse.json(
      { error: 'Authentication required or access denied' },
      { status: 401 }
    );
  }
  
  try {
    // Parse request body
    const body = await request.json();
    console.log(`[DEBUG] Request body:`, body);
    
    // Validate the data
    const validationResult = reorderSchema.safeParse(body);
    if (!validationResult.success) {
      const errors = validationResult.error.format();
      console.error('[DEBUG] Validation failed:', errors);
      return NextResponse.json(
        { error: 'Invalid lesson order data', details: errors },
        { status: 400 }
      );
    }
    
    const { lessons } = validationResult.data;
    console.log(`[DEBUG] Processing ${lessons.length} lessons for reordering:`, lessons);
    
    // Verify lessons exist in database
    const existingLessons = await db.select({
      id: courseSchema.lesson.id,
      oldOrder: courseSchema.lesson.order,
    })
    .from(courseSchema.lesson)
    .where(
      and(
        eq(courseSchema.lesson.courseId, courseId),
        // TODO: Fix this, in doesn't work directly with eq
        // in_(courseSchema.lesson.id, lessonIds)
      )
    );
    
    console.log(`[DEBUG] Found ${existingLessons.length} lessons in database:`, existingLessons);
    
    // Update each lesson's order in a transaction
    await db.transaction(async (tx) => {
      for (const lesson of lessons) {
        console.log(`[DEBUG] Updating lesson ${lesson.id} to order ${lesson.order}`);
        const result = await tx.update(courseSchema.lesson)
          .set({ 
            order: lesson.order,
            updatedAt: new Date()
          })
          .where(
            and(
              eq(courseSchema.lesson.id, lesson.id),
              eq(courseSchema.lesson.courseId, courseId)
            )
          );
        console.log(`[DEBUG] Update result:`, result);
      }
      
      // Update course updatedAt time
      const courseResult = await tx.update(courseSchema.course)
        .set({ updatedAt: new Date() })
        .where(eq(courseSchema.course.id, courseId));
      
      console.log(`[DEBUG] Course update result:`, courseResult);
    });
    
    console.log('[DEBUG] Reordering completed successfully');
    
    return NextResponse.json({
      success: true,
      message: 'Lessons reordered successfully'
    });
  } catch (error) {
    console.error('[DEBUG] Failed to reorder lessons:', error);
    const message = error instanceof Error ? error.message : 'Failed to reorder lessons';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
} 