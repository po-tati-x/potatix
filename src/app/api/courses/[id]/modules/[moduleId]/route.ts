import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { courseSchema } from '@/db';
import { auth } from '@/lib/auth/auth';
import { eq, asc } from 'drizzle-orm';
import { getMuxAssetId, deleteMuxAsset } from '@/lib/utils/mux';

// Define module update data type
interface ModuleUpdateData {
  title?: string;
  description?: string;
  order?: number;
}

// Helper function to authenticate user and get module by ID
async function getModuleWithAuth(request: NextRequest, courseId: string, moduleId: string) {
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
    
    // Check if user is the owner
    if (courses[0].userId !== session.user.id) {
      return { error: 'Access denied', status: 403 };
    }
    
    // Get the module
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
    .where(eq(courseSchema.courseModule.id, moduleId))
    .limit(1);
    
    if (!modules.length) {
      return { error: 'Module not found', status: 404 };
    }
    
    // Get lessons for this module
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
    .where(eq(courseSchema.lesson.moduleId, moduleId))
    .orderBy(asc(courseSchema.lesson.order));
    
    return { 
      module: { 
        ...modules[0],
        lessons
      },
      userId: session.user.id 
    };
  } catch (error) {
    console.error('Error in module auth:', error);
    const message = error instanceof Error ? error.message : 'Authentication failed';
    return { error: message, status: 500 };
  }
}

// GET handler to get a single module
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string, moduleId: string }> }
) {
  // Get params
  const { id: courseId, moduleId } = await params;
  
  if (!courseId || !moduleId) {
    return NextResponse.json(
      { error: 'Course ID and Module ID are required' },
      { status: 400 }
    );
  }
  
  const result = await getModuleWithAuth(request, courseId, moduleId);
  
  if ('error' in result) {
    return NextResponse.json(
      { error: result.error },
      { status: result.status || 500 }
    );
  }
  
  return NextResponse.json({ module: result.module });
}

// PATCH handler to update a module
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string, moduleId: string }> }
) {
  // Get params
  const { id: courseId, moduleId } = await params;
  
  if (!courseId || !moduleId) {
    return NextResponse.json(
      { error: 'Course ID and Module ID are required' },
      { status: 400 }
    );
  }
  
  // First authenticate and get the module
  const moduleCheck = await getModuleWithAuth(request, courseId, moduleId);
  
  if ('error' in moduleCheck) {
    return NextResponse.json(
      { error: moduleCheck.error },
      { status: moduleCheck.status || 500 }
    );
  }
  
  try {
    // Parse request body
    const body: ModuleUpdateData = await request.json();
    
    // Update the module
    await db.update(courseSchema.courseModule)
      .set({
        title: body.title !== undefined ? body.title : undefined,
        description: body.description !== undefined ? body.description : undefined,
        order: body.order !== undefined ? body.order : undefined,
        updatedAt: new Date()
      })
      .where(eq(courseSchema.courseModule.id, moduleId));
    
    // Get updated data
    const updatedResult = await getModuleWithAuth(request, courseId, moduleId);
    
    if ('error' in updatedResult) {
      return NextResponse.json(
        { error: updatedResult.error },
        { status: updatedResult.status || 500 }
      );
    }
    
    return NextResponse.json({ module: updatedResult.module, success: true });
  } catch (error) {
    console.error('Failed to update module:', error);
    const message = error instanceof Error ? error.message : 'Failed to update module';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

// DELETE handler to delete a module
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string, moduleId: string }> }
) {
  // Get params
  const { id: courseId, moduleId } = await params;
  
  if (!courseId || !moduleId) {
    return NextResponse.json(
      { error: 'Course ID and Module ID are required' },
      { status: 400 }
    );
  }
  
  // First authenticate and get the module
  const moduleCheck = await getModuleWithAuth(request, courseId, moduleId);
  
  if ('error' in moduleCheck) {
    return NextResponse.json(
      { error: moduleCheck.error },
      { status: moduleCheck.status || 500 }
    );
  }
  
  try {
    // Get all lessons with videos first
    const lessonsWithVideos = await db
      .select({
        id: courseSchema.lesson.id,
        videoId: courseSchema.lesson.videoId
      })
      .from(courseSchema.lesson)
      .where(eq(courseSchema.lesson.moduleId, moduleId));
      
    console.log(`[API:DELETE:Module] Found ${lessonsWithVideos.length} lessons with potential videos to clean up`);
    
    // Process videos deletion
    const videoResults = [];
    for (const lesson of lessonsWithVideos) {
      if (lesson.videoId) {
        console.log(`[API:DELETE:Module] Cleaning up Mux asset for lesson ${lesson.id} with playback ID ${lesson.videoId}`);
        
        // Get asset ID from playback ID
        const assetId = await getMuxAssetId(lesson.videoId);
        
        if (assetId) {
          // Delete the Mux asset
          const deleted = await deleteMuxAsset(assetId);
          videoResults.push({
            lessonId: lesson.id,
            assetId,
            deleted
          });
          console.log(`[API:DELETE:Module] Mux asset deletion for ${assetId}: ${deleted ? 'Success' : 'Failed'}`);
        }
      }
    }
    
    // Delete lessons first (foreign key constraint)
    await db.delete(courseSchema.lesson)
      .where(eq(courseSchema.lesson.moduleId, moduleId));
    
    // Then delete the module
    await db.delete(courseSchema.courseModule)
      .where(eq(courseSchema.courseModule.id, moduleId));
    
    return NextResponse.json({ 
      success: true,
      videoCleanup: {
        total: lessonsWithVideos.filter(l => l.videoId).length,
        deleted: videoResults.filter(r => r.deleted).length,
        failed: videoResults.filter(r => !r.deleted).length
      }
    });
  } catch (error) {
    console.error('Failed to delete module:', error);
    const message = error instanceof Error ? error.message : 'Failed to delete module';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
} 