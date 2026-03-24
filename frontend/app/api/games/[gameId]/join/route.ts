import { NextRequest, NextResponse } from 'next/server';
import { joinGame } from '@/lib/services/game.service';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ gameId: string }> }
) {
  try {
    const { gameId } = await params;
    const body = await request.json();
    const { walletAddress, nickname } = body;

    if (!walletAddress || !nickname) {
      return NextResponse.json(
        { error: 'Missing required fields: walletAddress, nickname' },
        { status: 400 }
      );
    }

    const game = await joinGame(gameId, { walletAddress, nickname });
    return NextResponse.json(game);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to join game';
    const status = message.includes('not found') ? 404
      : message.includes('full') || message.includes('Already') ? 409
      : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
