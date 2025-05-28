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
  { params }: { params: { id: string } }
) {
  const courseId = params.id;
  
  if (!courseId) {
    return NextResponse.json(
      { error: 'Course ID is required' },
      { status: 400 }
    );
  }
  
  // Check ownership
  const isOwner = await checkCourseOwnership(request, courseId);
  if (!isOwner) {
    return NextResponse.json(
      { error: 'Authentication required or access denied' },
      { status: 401 }
    );
  }
  
  try {
    // Parse request body
    const body = await request.json();
    
    // Validate the data
    const validationResult = reorderSchema.safeParse(body);
    if (!validationResult.success) {
      const errors = validationResult.error.format();
      return NextResponse.json(
        { error: 'Invalid lesson order data', details: errors },
        { status: 400 }
      );
    }
    
    const { lessons } = validationResult.data;
    
    // Update each lesson's order in a transaction
    await db.transaction(async (tx) => {
      for (const lesson of lessons) {
        await tx.update(courseSchema.lesson)
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
      }
      
      // Update course updatedAt time
      await tx.update(courseSchema.course)
        .set({ updatedAt: new Date() })
        .where(eq(courseSchema.course.id, courseId));
    });
    
    return NextResponse.json({
      success: true,
      message: 'Lessons reordered successfully'
    });
  } catch (error) {
    console.error('Failed to reorder lessons:', error);
    const message = error instanceof Error ? error.message : 'Failed to reorder lessons';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
} 