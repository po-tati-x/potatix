import { NextResponse } from 'next/server';
import { db, courseSchema } from '@/db';
import { eq } from 'drizzle-orm';

// Mux webhook handler
export async function POST(request: Request) {
  try {
    // Get the webhook data
    const body = await request.json();
    const { type, data } = body;
    
    console.log(`[Mux Webhook] Received event: ${type}`);
    
    // Handle video.asset.ready event
    if (type === 'video.asset.ready') {
      // Get lesson ID from passthrough data
      const passthrough = data.passthrough ? JSON.parse(data.passthrough) : null;
      const lessonId = passthrough?.lessonId;
      
      if (!lessonId) {
        console.error('[Mux Webhook] No lesson ID in passthrough data');
        return NextResponse.json({ error: 'No lesson ID provided' }, { status: 400 });
      }
      
      // Get playback ID
      const playbackId = data.playback_ids?.[0]?.id;
      
      if (!playbackId) {
        console.error('[Mux Webhook] No playback ID available');
        return NextResponse.json({ error: 'No playback ID available' }, { status: 400 });
      }
      
      // Update lesson with videoId using Drizzle
      await db
        .update(courseSchema.lesson)
        .set({ 
          videoId: playbackId,
          uploadStatus: 'COMPLETED',
          duration: Math.round(data.duration || 0)
        })
        .where(eq(courseSchema.lesson.id, lessonId));
      
      console.log(`[Mux Webhook] Updated lesson ${lessonId} with video ID ${playbackId}`);
    }
    
    // Handle video.upload.cancelled event
    else if (type === 'video.upload.cancelled') {
      // Get lesson ID from passthrough data
      const passthrough = data.new_asset_settings?.passthrough 
        ? JSON.parse(data.new_asset_settings.passthrough) 
        : null;
      const lessonId = passthrough?.lessonId;
      
      if (lessonId) {
        // Update lesson to reset upload status using Drizzle
        await db
          .update(courseSchema.lesson)
          .set({ 
            uploadStatus: 'CANCELLED' 
          })
          .where(eq(courseSchema.lesson.id, lessonId));
        
        console.log(`[Mux Webhook] Marked lesson ${lessonId} upload as cancelled`);
      }
    }
    
    // Return success
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Mux Webhook] Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Failed to process webhook' }, 
      { status: 500 }
    );
  }
} 