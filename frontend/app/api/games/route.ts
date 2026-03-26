import { NextRequest, NextResponse } from 'next/server';
import { createGame, listGames } from '../../../../backend/services/game.service';

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
    const { hostAddress, buyInAmount, maxParticipants, resolutionTime, rules, categories, events } = body;

    // Accept either categories (new system) or events (legacy)
    if (!hostAddress || !buyInAmount || !resolutionTime) {
      return NextResponse.json(
        { error: 'Missing required fields: hostAddress, buyInAmount, resolutionTime' },
        { status: 400 }
      );
    }

    if (!categories?.length && !events?.length) {
      return NextResponse.json(
        { error: 'At least one category or event is required' },
        { status: 400 }
      );
    }

    const game = await createGame({
      hostAddress,
      buyInAmount,
      maxParticipants,
      resolutionTime,
      rules,
      categories: categories || [],
      events: events || [],
    });

    return NextResponse.json(game, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create game' },
      { status: 500 }
    );
  }
}
