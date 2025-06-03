import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import { db } from '@/db';
import { courseSchema } from '@/db';
import { auth } from '@/lib/auth/auth';
import { eq, desc, asc } from 'drizzle-orm';
import { slugify } from '@/lib/utils/courses';

// Define lesson type for creation
interface LessonInput {
  title?: string;
  description?: string | null;
  videoId?: string | null;
}

// GET handler to get all courses for the current user
export async function GET(request: NextRequest) {
  try {
    // Authenticate the user first
    const session = await auth.api.getSession({
      headers: request.headers
    });
    
    // Debug auth session
    console.log('Auth headers:', Object.fromEntries(request.headers.entries()));
    console.log('Session result:', JSON.stringify({
      hasSession: !!session,
      hasUser: !!(session && session.user),
      userId: session?.user?.id
    }));
    
    if (!session || !session.user) {
      console.error('Authentication failed - no valid session');
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Get all courses for this user
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
    .where(eq(courseSchema.course.userId, session.user.id))
    .orderBy(desc(courseSchema.course.updatedAt));
    
    // Get lesson counts for each course
    const courseIds = courses.map(course => course.id);
    
    // If no courses, return empty array
    if (courseIds.length === 0) {
      return NextResponse.json({ courses: [] });
    }
    
    // For each course, get the number of lessons
    const coursesWithCounts = await Promise.all(
      courses.map(async (course) => {
        // Count lessons
        const lessonCount = await db
          .select({
            count: courseSchema.lesson.id,
          })
          .from(courseSchema.lesson)
          .where(eq(courseSchema.lesson.courseId, course.id));
        
        // Count modules  
        const moduleCount = await db
          .select({
            count: courseSchema.courseModule.id,
          })
          .from(courseSchema.courseModule)
          .where(eq(courseSchema.courseModule.courseId, course.id));
          
        return {
          ...course,
          lessonCount: lessonCount.length,
          moduleCount: moduleCount.length,
        };
      })
    );
    
    return NextResponse.json({ courses: coursesWithCounts });
  } catch (error) {
    console.error('Failed to fetch courses:', error);
    const message = error instanceof Error ? error.message : 'Failed to fetch courses';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

// POST handler to create a new course
export async function POST(request: NextRequest) {
  try {
    // Authenticate the user first
    const session = await auth.api.getSession({
      headers: request.headers
    });
    
    if (!session || !session.user) {
      console.log('No session found for course creation');
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Parse the request body
    const body = await request.json();
    
    // Validate required fields
    if (!body.title) {
      return NextResponse.json(
        { error: 'Course title is required' },
        { status: 400 }
      );
    }
    
    // Create a slug for the course
    const slug = `${slugify(body.title)}-${nanoid(6)}`;
    
    // Create a unique course ID
    const courseId = `course-${nanoid()}`;
    
    // Create the new course
    await db.insert(courseSchema.course)
      .values({
        id: courseId,
        title: body.title,
        description: body.description || null,
        price: body.price || 0,
        status: body.status || 'draft',
        imageUrl: body.imageUrl || null,
        userId: session.user.id,
        slug, // Store the slug for public access
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    
    // Create default module if needed
    const defaultModuleId = `module-${nanoid()}`;
    await db.insert(courseSchema.courseModule)
      .values({
        id: defaultModuleId,
        title: 'Module 1',
        description: 'First module',
        order: 0,
        courseId,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      
    // Create lessons if provided
    if (body.lessons && Array.isArray(body.lessons) && body.lessons.length > 0) {
      const lessonValues = body.lessons.map((lesson: LessonInput, index: number) => ({
        id: `lesson-${nanoid()}`,
        title: lesson.title || `Lesson ${index + 1}`,
        description: lesson.description || null,
        videoId: lesson.videoId || null,
        order: index,
        moduleId: defaultModuleId, // Assign to the default module
        courseId,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));
      
      await db.insert(courseSchema.lesson).values(lessonValues);
    }
    
    // Get the created course with modules and lessons
    const createdCourses = await db.select({
      id: courseSchema.course.id,
      title: courseSchema.course.title,
      description: courseSchema.course.description,
      price: courseSchema.course.price,
      status: courseSchema.course.status,
      imageUrl: courseSchema.course.imageUrl,
      userId: courseSchema.course.userId,
      slug: courseSchema.course.slug,
      createdAt: courseSchema.course.createdAt,
      updatedAt: courseSchema.course.updatedAt,
    })
    .from(courseSchema.course)
    .where(eq(courseSchema.course.id, courseId))
    .limit(1);
    
    if (!createdCourses.length) {
      return NextResponse.json(
        { error: 'Failed to retrieve created course' },
        { status: 500 }
      );
    }
    
    const course = createdCourses[0];
    
    // Get modules for this course
    const modules = await db.select({
      id: courseSchema.courseModule.id,
      title: courseSchema.courseModule.title,
      description: courseSchema.courseModule.description,
      order: courseSchema.courseModule.order,
      courseId: courseSchema.courseModule.courseId,
      createdAt: courseSchema.courseModule.createdAt,
      updatedAt: courseSchema.courseModule.updatedAt,
    })
    .from(courseSchema.courseModule)
    .where(eq(courseSchema.courseModule.courseId, courseId))
    .orderBy(asc(courseSchema.courseModule.order));
    
    // Get lessons for this course
    const lessons = await db.select({
      id: courseSchema.lesson.id,
      title: courseSchema.lesson.title,
      description: courseSchema.lesson.description,
      videoId: courseSchema.lesson.videoId,
      order: courseSchema.lesson.order,
      moduleId: courseSchema.lesson.moduleId,
      courseId: courseSchema.lesson.courseId,
      createdAt: courseSchema.lesson.createdAt,
      updatedAt: courseSchema.lesson.updatedAt,
    })
    .from(courseSchema.lesson)
    .where(eq(courseSchema.lesson.courseId, courseId))
    .orderBy(asc(courseSchema.lesson.order));
    
    // Group lessons by module
    const modulesWithLessons = modules.map(module => {
      const moduleLessons = lessons.filter(lesson => lesson.moduleId === module.id);
      
      return {
        ...module,
        lessons: moduleLessons.sort((a, b) => a.order - b.order)
      };
    });
    
    // Return the full course data
    return NextResponse.json({ 
      id: course.id,
      course: {
        ...course,
        modules: modulesWithLessons,
        lessons // Keep flat lesson list for backward compatibility
      }
    });
  } catch (error) {
    console.error('Failed to create course:', error);
    const message = error instanceof Error ? error.message : 'Failed to create course';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
} 