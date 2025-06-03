import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { db } from '@/db';
import { course, courseEnrollment } from '@/db/schemas/course';
import { user } from '@/db/schemas/users';
import { eq, and } from 'drizzle-orm';

// GET /api/courses/[id]/students
// Fetch all students enrolled in a course
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await the params promise
    const { id: courseId } = await params;
    
    // Get the session using Better Auth's API
    const sessionResult = await auth.api.getSession({
      headers: request.headers
    });
    
    if (!sessionResult || !sessionResult.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    const userId = sessionResult.user.id;
    
    // Check if the user is the owner of the course
    const courses = await db
      .select()
      .from(course)
      .where(
        and(
          eq(course.id, courseId),
          eq(course.userId, userId)
        )
      );
    
    if (courses.length === 0) {
      return NextResponse.json(
        { error: 'Course not found or you do not have permission to manage it' },
        { status: 403 }
      );
    }
    
    // Fetch all enrollments for this course
    const enrollments = await db
      .select({
        id: courseEnrollment.id,
        userId: courseEnrollment.userId,
        courseId: courseEnrollment.courseId,
        status: courseEnrollment.status,
        enrolledAt: courseEnrollment.enrolledAt,
        userName: user.name,
        userEmail: user.email,
        userImage: user.image
      })
      .from(courseEnrollment)
      .leftJoin(
        user, 
        eq(courseEnrollment.userId, user.id)
      )
      .where(eq(courseEnrollment.courseId, courseId));
    
    // Transform data into the expected structure
    const students = enrollments.map(enrollment => ({
      id: enrollment.id,
      userId: enrollment.userId,
      courseId: enrollment.courseId,
      status: enrollment.status,
      enrolledAt: enrollment.enrolledAt,
      user: {
        name: enrollment.userName,
        email: enrollment.userEmail,
        image: enrollment.userImage
      }
    }));
    
    // Log for debugging
    console.log(`[API:GET:CourseStudents] Found ${students.length} enrollments for course ${courseId}`);
    
    return NextResponse.json({ students });
  } catch (error) {
    console.error('Error fetching course students:', error);
    return NextResponse.json(
      { error: 'Failed to fetch students' },
      { status: 500 }
    );
  }
}