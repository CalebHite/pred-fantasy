import { NextRequest, NextResponse } from 'next/server';
import { submitPredictions, getGamePredictions } from '../../../../../../../backend/services/game.service';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ gameId: string }> }
) {
  try {
    const { gameId } = await params;
    const walletAddress = request.nextUrl.searchParams.get('walletAddress') || undefined;
    const data = await getGamePredictions(gameId, walletAddress);
    return NextResponse.json({ predictions: data });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch predictions' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ gameId: string }> }
) {
  try {
    const { gameId } = await params;
    const body = await request.json();
    const { walletAddress, picks } = body;

    if (!walletAddress || !picks?.length) {
      return NextResponse.json(
        { error: 'Missing required fields: walletAddress, picks' },
        { status: 400 }
      );
    }

    const data = await submitPredictions(gameId, { walletAddress, picks });
    return NextResponse.json({ predictions: data }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to submit predictions';
    const status = message.includes('not found') || message.includes('Not a participant') ? 404 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
