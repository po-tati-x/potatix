import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import { db } from '@/db';
import { courseSchema } from '@/db';
import { auth } from '@/lib/auth/auth';
import { eq, asc } from 'drizzle-orm';

// Define module creation/update data type
interface ModuleData {
  title: string;
  description?: string;
  order: number;
}

// Helper function to authenticate user and get course by ID
async function authCourseOwner(request: NextRequest, courseId: string) {
  try {
    // Authenticate the user first
    const session = await auth.api.getSession({
      headers: request.headers
    });
    
    if (!session || !session.user) {
      console.log('No valid session found for module request');
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

// GET handler to get all modules for a course
export async function GET(
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
    // Get modules for the course
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
    
    // Get lessons for each module
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
      const moduleLessons = lessons.filter(lesson => 
        lesson.moduleId === module.id
      );
      
      return {
        ...module,
        lessons: moduleLessons
      };
    });
    
    return NextResponse.json({ modules: modulesWithLessons });
  } catch (error) {
    console.error('Failed to get modules:', error);
    const message = error instanceof Error ? error.message : 'Failed to get modules';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

// POST handler to create a new module
export async function POST(
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
    const body: ModuleData = await request.json();
    
    // Validate required fields
    if (!body.title) {
      return NextResponse.json(
        { error: 'Module title is required' },
        { status: 400 }
      );
    }
    
    // Determine order if not provided
    let order = body.order;
    if (order === undefined) {
      const existingModules = await db.select({ count: courseSchema.courseModule.id })
        .from(courseSchema.courseModule)
        .where(eq(courseSchema.courseModule.courseId, courseId));
      
      order = existingModules.length;
    }
    
    // Create module ID
    const moduleId = `module-${nanoid()}`;
    
    // Create the module
    await db.insert(courseSchema.courseModule)
      .values({
        id: moduleId,
        title: body.title,
        description: body.description || null,
        order,
        courseId,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    
    // Get the created module
    const createdModule = await db.select({
      id: courseSchema.courseModule.id,
      title: courseSchema.courseModule.title,
      description: courseSchema.courseModule.description,
      order: courseSchema.courseModule.order,
      courseId: courseSchema.courseModule.courseId,
      createdAt: courseSchema.courseModule.createdAt,
      updatedAt: courseSchema.courseModule.updatedAt,
    })
    .from(courseSchema.courseModule)
    .where(eq(courseSchema.courseModule.id, moduleId))
    .limit(1);
    
    return NextResponse.json({ 
      module: createdModule[0],
      id: moduleId
    });
  } catch (error) {
    console.error('Failed to create module:', error);
    const message = error instanceof Error ? error.message : 'Failed to create module';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
} 