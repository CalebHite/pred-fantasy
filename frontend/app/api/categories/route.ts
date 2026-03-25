import { NextRequest, NextResponse } from 'next/server';
import { listCategories } from '../../../../backend/services/gemini/markets';
import { GeminiApiError } from '../../../../backend/services/gemini/client';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.getAll('status');

    const data = await listCategories(status.length > 0 ? status : undefined);
    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof GeminiApiError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}
