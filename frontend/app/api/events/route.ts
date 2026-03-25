import { NextRequest, NextResponse } from 'next/server';
import { listEvents } from '../../../../../backend/services/gemini/markets';
import { GeminiApiError } from '../../../../../backend/services/gemini/client';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.getAll('status');
    const category = searchParams.getAll('category');
    const search = searchParams.get('search') || undefined;
    const limit = searchParams.get('limit');
    const offset = searchParams.get('offset');

    const data = await listEvents({
      status: status.length > 0 ? status : undefined,
      category: category.length > 0 ? category : undefined,
      search,
      limit: limit ? parseInt(limit) : undefined,
      offset: offset ? parseInt(offset) : undefined,
    });

    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof GeminiApiError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
  }
}
