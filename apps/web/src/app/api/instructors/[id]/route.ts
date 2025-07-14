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
      return NextResponse.json({ error: 'Not found', data: undefined } as ApiResponse<undefined>, { status: 404 });
    }
    return NextResponse.json({ data: instructor } as ApiResponse<typeof instructor>);
  } catch (error) {
    console.error('[API] Failed to fetch instructor', error);
    return NextResponse.json({ error: 'Failed to fetch instructor', data: undefined } as ApiResponse<undefined>, { status: 500 });
  }
} 