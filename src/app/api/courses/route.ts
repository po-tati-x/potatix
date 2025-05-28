import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { courseSchema, authSchema } from '@/db';
import { nanoid } from 'nanoid';
import { z } from 'zod';
import { auth } from '@/lib/auth/auth';
import { eq, desc, sql } from 'drizzle-orm';

// Define validation schema for request body
const CreateCourseSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  price: z.number().nonnegative(),
  lessons: z.array(z.object({
    title: z.string().min(1, 'Lesson title is required'),
    description: z.string().optional(),
    videoId: z.string().nullable().optional(),
  })).optional(),
});

// Helper function to authenticate user from request
async function authenticateUser(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers
    });
    
    if (!session || !session.user) {
      console.log('No valid session found');
      return null;
    }
    
    console.log('User authenticated:', session.user.id);
    return session.user;
  } catch (error) {
    console.error('Error authenticating user:', error);
    return null;
  }
}

// GET handler to list courses
export async function GET(request: NextRequest) {
  try {
    const user = await authenticateUser(request);
    
    if (!user) {
      console.log('Authentication failed for GET /api/courses');
      return NextResponse.json(
        { error: 'Authentication required' }, 
        { status: 401 }
      );
    }
    
    // Get all courses for this user without the count first
    const coursesWithoutCount = await db
      .select({
        id: courseSchema.course.id,
        title: courseSchema.course.title,
        description: courseSchema.course.description,
        price: courseSchema.course.price,
        status: courseSchema.course.status,
        imageUrl: courseSchema.course.imageUrl,
        createdAt: courseSchema.course.createdAt,
        updatedAt: courseSchema.course.updatedAt,
      })
      .from(courseSchema.course)
      .where(eq(courseSchema.course.userId, user.id))
      .orderBy(desc(courseSchema.course.updatedAt));
    
    // Get lesson counts in a separate query
    const lessonCounts = await db
      .select({
        courseId: courseSchema.lesson.courseId,
        count: sql<number>`count(*)`.mapWith(Number),
      })
      .from(courseSchema.lesson)
      .groupBy(courseSchema.lesson.courseId);
    
    // Create a map of courseId -> count
    const countMap = new Map();
    lessonCounts.forEach(item => {
      countMap.set(item.courseId, item.count);
    });
    
    // Merge the counts with the courses
    const courses = coursesWithoutCount.map(course => ({
      ...course,
      lessonCount: countMap.get(course.id) || 0
    }));
    
    // Debug the final result with actual counts
    console.log('GET /api/courses - Courses found:', courses.length);
    console.log('GET /api/courses - Lesson counts:', JSON.stringify(Array.from(countMap.entries()), null, 2));
    
    return NextResponse.json({ courses });
  } catch (error) {
    console.error('Failed to fetch courses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch courses' }, 
      { status: 500 }
    );
  }
}

// POST handler to create a course
export async function POST(request: NextRequest) {
  try {
    const user = await authenticateUser(request);
    
    if (!user) {
      console.log('Authentication failed for POST /api/courses');
      return NextResponse.json(
        { error: 'Authentication required' }, 
        { status: 401 }
      );
    }
    
    // Parse and validate request body
    const body = await request.json();
    console.log('POST /api/courses - Received data:', JSON.stringify(body, null, 2));
    
    const parseResult = CreateCourseSchema.safeParse(body);
    
    if (!parseResult.success) {
      console.log('Invalid request data:', parseResult.error.format());
      return NextResponse.json(
        { error: 'Invalid request data', details: parseResult.error.format() }, 
        { status: 400 }
      );
    }
    
    const { title, description, price, lessons = [] } = parseResult.data;
    
    // Generate a unique ID for the course
    const courseId = nanoid();
    
    // Begin a transaction to insert course and lessons
    const result = await db.transaction(async (tx) => {
      // Insert the course
      await tx.insert(courseSchema.course).values({
        id: courseId,
        title,
        description: description || null,
        price,
        userId: user.id,
        status: 'draft', // Default status
      });
      
      // Insert lessons if provided
      if (lessons.length > 0) {
        const lessonRecords = lessons.map((lesson, index) => ({
          id: nanoid(),
          title: lesson.title,
          description: lesson.description || null,
          videoId: lesson.videoId || null,
          order: index,
          courseId: courseId,
        }));
        
        await tx.insert(courseSchema.lesson).values(lessonRecords);
      }
      
      // Return the course ID
      return { id: courseId };
    });
    
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Failed to create course:', error);
    return NextResponse.json(
      { error: 'Failed to create course' }, 
      { status: 500 }
    );
  }
} 