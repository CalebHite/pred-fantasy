import { NextRequest, NextResponse } from 'next/server';
import { getEventsForCategory } from '../../../../../../backend/services/category.service';

/**
 * GET /api/categories/[categoryKey]/events
 * Returns active Gemini events that match the category criteria
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ categoryKey: string }> }
) {
  try {
    const { categoryKey } = await params;

    const events = await getEventsForCategory(categoryKey);

    return NextResponse.json({ events });
  } catch (error) {
    console.error(`Error fetching events for category:`, error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch events for category' },
      { status: 500 }
    );
  }
}
