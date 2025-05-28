import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { courseSchema, authSchema } from '@/db';
import { auth } from '@/lib/auth/auth';
import { eq, asc } from 'drizzle-orm';

// Type for the structured API response
type ApiResponse<T = any> = {
  course?: T;
  error?: string;
  status?: number;
};

// Helper function to authenticate user and get course by ID
async function getCourseWithAuth(request: NextRequest, courseId: string): Promise<ApiResponse> {
  try {
    // Authenticate the user first
    const session = await auth.api.getSession({
      headers: request.headers
    });
    
    if (!session || !session.user) {
      console.log('No valid session found for course request');
      return { error: 'Authentication required', status: 401 };
    }
    
    // Get the course with lessons
    const courses = await db.select({
      id: courseSchema.course.id,
      title: courseSchema.course.title,
      description: courseSchema.course.description,
      price: courseSchema.course.price,
      status: courseSchema.course.status, 
      imageUrl: courseSchema.course.imageUrl,
      userId: courseSchema.course.userId,
      createdAt: courseSchema.course.createdAt,
      updatedAt: courseSchema.course.updatedAt,
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
    
    // Get lessons for this course
    const lessons = await db.select({
      id: courseSchema.lesson.id,
      title: courseSchema.lesson.title,
      description: courseSchema.lesson.description,
      videoId: courseSchema.lesson.videoId,
      order: courseSchema.lesson.order,
    })
    .from(courseSchema.lesson)
    .where(eq(courseSchema.lesson.courseId, courseId))
    .orderBy(asc(courseSchema.lesson.order));
    
    // Return the course with lessons
    return { course: { ...course, lessons } };
  } catch (error) {
    console.error('Error getting course:', error);
    const message = error instanceof Error ? error.message : 'Failed to get course';
    return { error: message, status: 500 };
  }
}

// GET handler to retrieve a single course
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Await params to fix NextJS warning
  const { id: courseId } = await Promise.resolve(params);
  
  if (!courseId) {
    return NextResponse.json(
      { error: 'Course ID is required' },
      { status: 400 }
    );
  }
  
  const result = await getCourseWithAuth(request, courseId);
  
  if (result.error && result.error) {
    return NextResponse.json(
      { error: result.error },
      { status: result.status || 500 }
    );
  }
  
  return NextResponse.json(result);
}

// PATCH handler to update a course
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Await params to fix NextJS warning
  const { id: courseId } = await Promise.resolve(params);
  
  if (!courseId) {
    return NextResponse.json(
      { error: 'Course ID is required' },
      { status: 400 }
    );
  }
  
  // First authenticate and get the course
  const courseCheck = await getCourseWithAuth(request, courseId);
  
  if (courseCheck.error && courseCheck.error) {
    return NextResponse.json(
      { error: courseCheck.error },
      { status: courseCheck.status || 500 }
    );
  }
  
  try {
    // Parse request body
    const body = await request.json();
    
    // Update the course
    await db.update(courseSchema.course)
      .set({
        title: body.title !== undefined ? body.title : undefined,
        description: body.description !== undefined ? body.description : undefined,
        price: body.price !== undefined ? body.price : undefined,
        status: body.status !== undefined ? body.status : undefined,
        imageUrl: body.imageUrl !== undefined ? body.imageUrl : undefined,
        updatedAt: new Date(),
      })
      .where(eq(courseSchema.course.id, courseId));
    
    // Get the updated course
    const updatedResult = await getCourseWithAuth(request, courseId);
    
    if (updatedResult.error && updatedResult.error) {
      return NextResponse.json(
        { error: updatedResult.error },
        { status: updatedResult.status || 500 }
      );
    }
    
    return NextResponse.json(updatedResult);
  } catch (error) {
    console.error('Failed to update course:', error);
    const message = error instanceof Error ? error.message : 'Failed to update course';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

// DELETE handler to delete a course
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Await params to fix NextJS warning
  const { id: courseId } = await Promise.resolve(params);
  
  if (!courseId) {
    return NextResponse.json(
      { error: 'Course ID is required' },
      { status: 400 }
    );
  }
  
  // First authenticate and get the course
  const courseCheck = await getCourseWithAuth(request, courseId);
  
  if (courseCheck.error && courseCheck.error) {
    return NextResponse.json(
      { error: courseCheck.error },
      { status: courseCheck.status || 500 }
    );
  }
  
  try {
    // Delete lessons first (foreign key constraint)
    await db.delete(courseSchema.lesson)
      .where(eq(courseSchema.lesson.courseId, courseId));
    
    // Then delete the course
    await db.delete(courseSchema.course)
      .where(eq(courseSchema.course.id, courseId));
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete course:', error);
    const message = error instanceof Error ? error.message : 'Failed to delete course';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
} 