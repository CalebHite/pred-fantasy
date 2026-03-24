import { NextResponse } from 'next/server';
import { getEvent } from '@/lib/gemini/markets';
import { GeminiApiError } from '@/lib/gemini/client';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ ticker: string }> }
) {
  try {
    const { ticker } = await params;
    const data = await getEvent(ticker);
    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof GeminiApiError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    return NextResponse.json({ error: 'Failed to fetch event' }, { status: 500 });
  }
}
