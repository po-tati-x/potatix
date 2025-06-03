import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { courseSchema } from '@/db';
import { auth } from '@/lib/auth/auth';
import { eq } from 'drizzle-orm';

// Define reorder request body type
interface ModuleOrderData {
  modules: { id: string; order: number }[];
}

// Helper function to authenticate user and verify course ownership
async function authCourseOwner(request: NextRequest, courseId: string) {
  try {
    // Authenticate the user first
    const session = await auth.api.getSession({
      headers: request.headers
    });
    
    if (!session || !session.user) {
      console.log('No valid session found for module reorder request');
      return { error: 'Authentication required', status: 401 };
    }
    
    // Get the course to verify ownership
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
    
    // Check if the user is the owner of this course
    if (courses[0].userId !== session.user.id) {
      return { error: 'Access denied', status: 403 };
    }
    
    return { success: true, userId: session.user.id };
  } catch (error) {
    console.error('Error in authentication:', error);
    const message = error instanceof Error ? error.message : 'Authentication failed';
    return { error: message, status: 500 };
  }
}

// PATCH handler to reorder modules
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Get courseId from params
  const { id: courseId } = await params;
  
  if (!courseId) {
    return NextResponse.json(
      { error: 'Course ID is required' },
      { status: 400 }
    );
  }
  
  // Authenticate and check course ownership
  const authResult = await authCourseOwner(request, courseId);
  if ('error' in authResult) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status || 500 }
    );
  }
  
  try {
    // Parse request body
    const body: ModuleOrderData = await request.json();
    
    // Validate required fields
    if (!body.modules || !Array.isArray(body.modules) || body.modules.length === 0) {
      return NextResponse.json(
        { error: 'Modules array is required' },
        { status: 400 }
      );
    }
    
    // Update each module's order
    const updatePromises = body.modules.map(item => 
      db.update(courseSchema.courseModule)
        .set({
          order: item.order,
          updatedAt: new Date(),
        })
        .where(eq(courseSchema.courseModule.id, item.id))
    );
    
    await Promise.all(updatePromises);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to reorder modules:', error);
    const message = error instanceof Error ? error.message : 'Failed to reorder modules';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
} 