import { NextRequest, NextResponse } from 'next/server';
import { createGame, listGames } from '@/lib/services/game.service';

export async function GET(request: NextRequest) {
  try {
    const status = request.nextUrl.searchParams.get('status') || undefined;
    const data = await listGames(status);
    return NextResponse.json({ games: data });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to list games' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { hostAddress, buyInAmount, maxParticipants, resolutionTime, rules, events } = body;

    if (!hostAddress || !buyInAmount || !resolutionTime || !events?.length) {
      return NextResponse.json(
        { error: 'Missing required fields: hostAddress, buyInAmount, resolutionTime, events' },
        { status: 400 }
      );
    }

    const game = await createGame({
      hostAddress,
      buyInAmount,
      maxParticipants,
      resolutionTime,
      rules,
      events,
    });

    return NextResponse.json(game, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create game' },
      { status: 500 }
    );
  }
}
