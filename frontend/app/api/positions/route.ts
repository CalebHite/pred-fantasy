import { NextResponse } from 'next/server';
import { getPositions } from '../../../../backend/services/gemini/positions';
import { GeminiApiError, isGeminiConfigured } from '../../../../backend/services/gemini/client';

export async function GET() {
  try {
    if (!isGeminiConfigured()) {
      return NextResponse.json(
        { error: 'Gemini API credentials not configured' },
        { status: 503 }
      );
    }

    const positions = await getPositions();
    return NextResponse.json({ positions });
  } catch (error) {
    if (error instanceof GeminiApiError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    return NextResponse.json({ error: 'Failed to fetch positions' }, { status: 500 });
  }
}
