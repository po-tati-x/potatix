import { NextRequest, NextResponse } from 'next/server';
import { instructorService } from '@/lib/server/services/instructors';
import type { ApiResponse } from '@/lib/shared/types/api';

/**
 * GET /api/instructors/[id]
 * Public endpoint – returns instructor profile plus aggregated stats.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const instructor = await instructorService.getPublicInstructor(id);
    if (!instructor) {
      return NextResponse.json({ error: 'Not found', data: null } as ApiResponse<null>, { status: 404 });
    }
    return NextResponse.json({ data: instructor, error: null } as ApiResponse<typeof instructor>);
  } catch (err) {
    console.error('[API] Failed to fetch instructor', err);
    return NextResponse.json({ error: 'Failed to fetch instructor', data: null } as ApiResponse<null>, { status: 500 });
  }
} 